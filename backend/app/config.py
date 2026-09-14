"""
Central application settings, loaded from environment variables / .env.
Every "optional" key below has a safe, fully-functional fallback elsewhere
in the codebase, so the app runs end-to-end with zero configuration.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Security
    SECRET_KEY: str = "dev-only-insecure-key-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Optional AI provider
    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Optional job data provider
    ADZUNA_APP_ID: str | None = None
    ADZUNA_APP_KEY: str | None = None

    # App
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    DATABASE_URL: str = "sqlite:///./careeros.db"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def ai_enabled(self) -> bool:
        return bool(self.OPENAI_API_KEY)

    @property
    def live_jobs_enabled(self) -> bool:
        return bool(self.ADZUNA_APP_ID and self.ADZUNA_APP_KEY)


@lru_cache
def get_settings() -> Settings:
    return Settings()
