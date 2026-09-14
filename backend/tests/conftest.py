"""
Shared pytest fixtures: an isolated in-memory SQLite DB per test session,
and a TestClient wired to use it instead of the real careeros.db file.
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.main import app

TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def _create_tables():
    from app.models import db_models  # noqa: F401  (register tables on Base.metadata)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def _override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_get_db


@pytest.fixture()
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture()
def auth_headers(client):
    """Registers a fresh user and returns Authorization headers for it."""
    email = "pytest.user@careeros.test"
    client.post(
        "/api/auth/register",
        json={"full_name": "Pytest User", "email": email, "password": "testpass123"},
    )
    res = client.post("/api/auth/login", json={"email": email, "password": "testpass123"})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
