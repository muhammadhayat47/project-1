"""Tests for /api/auth — registration, login, profile."""


def test_register_creates_user_and_returns_token(client):
    res = client.post(
        "/api/auth/register",
        json={"full_name": "Ada Lovelace", "email": "ada@example.com", "password": "s3cret123"},
    )
    assert res.status_code == 201
    body = res.json()
    assert "access_token" in body
    assert body["user"]["email"] == "ada@example.com"
    assert body["user"]["full_name"] == "Ada Lovelace"


def test_register_duplicate_email_is_rejected(client):
    payload = {"full_name": "Grace Hopper", "email": "grace@example.com", "password": "s3cret123"}
    first = client.post("/api/auth/register", json=payload)
    assert first.status_code == 201

    second = client.post("/api/auth/register", json=payload)
    assert second.status_code == 409


def test_login_with_wrong_password_is_rejected(client):
    client.post(
        "/api/auth/register",
        json={"full_name": "Alan Turing", "email": "alan@example.com", "password": "correct-horse"},
    )
    res = client.post("/api/auth/login", json={"email": "alan@example.com", "password": "wrong-password"})
    assert res.status_code == 401


def test_me_requires_authentication(client):
    res = client.get("/api/auth/me")
    assert res.status_code in (401, 403)


def test_me_returns_current_user(client, auth_headers):
    res = client.get("/api/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["email"] == "pytest.user@careeros.test"


def test_update_profile_sets_target_role(client, auth_headers):
    res = client.patch(
        "/api/auth/me",
        params={"target_role": "Machine Learning Engineer", "target_location": "Remote"},
        headers=auth_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["target_role"] == "Machine Learning Engineer"
    assert body["target_location"] == "Remote"
