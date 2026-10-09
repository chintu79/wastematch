"""Tests for PgBouncer / SQLAlchemy Connection Pooling configuration (Issue #67).

Verifies QueuePool tuning in database.py, settings validation, and engine configuration.
"""

import pytest
from pydantic import ValidationError
from sqlalchemy.pool import QueuePool

from app.config import Settings
from app.database import SessionLocal, get_engine_options


def test_default_pool_settings(monkeypatch):
    """Verify default QueuePool parameters conform to deployment requirements."""
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg2://user:pass@pgbouncer:6432/wastematch")
    monkeypatch.setenv("OIDC_ISSUER", "https://example.auth0.com/")
    monkeypatch.setenv("OIDC_CLIENT_ID", "client-123")
    monkeypatch.setenv("OIDC_AUDIENCE", "https://api.example.com")
    monkeypatch.setenv("JWT_SECRET_KEY", "a" * 32)

    settings = Settings()
    assert settings.DB_POOL_SIZE == 20
    assert settings.DB_MAX_OVERFLOW == 10
    assert settings.DB_POOL_TIMEOUT == 30
    assert settings.DB_POOL_RECYCLE == 1800
    assert settings.DB_POOL_PRE_PING is True


def test_custom_pool_settings_from_env(monkeypatch):
    """Verify custom pool parameters from environment variables are correctly loaded."""
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg2://user:pass@pgbouncer:6432/wastematch")
    monkeypatch.setenv("OIDC_ISSUER", "https://example.auth0.com/")
    monkeypatch.setenv("OIDC_CLIENT_ID", "client-123")
    monkeypatch.setenv("OIDC_AUDIENCE", "https://api.example.com")
    monkeypatch.setenv("JWT_SECRET_KEY", "a" * 32)
    monkeypatch.setenv("DB_POOL_SIZE", "35")
    monkeypatch.setenv("DB_MAX_OVERFLOW", "15")
    monkeypatch.setenv("DB_POOL_TIMEOUT", "45")
    monkeypatch.setenv("DB_POOL_RECYCLE", "900")
    monkeypatch.setenv("DB_POOL_PRE_PING", "false")

    settings = Settings()
    assert settings.DB_POOL_SIZE == 35
    assert settings.DB_MAX_OVERFLOW == 15
    assert settings.DB_POOL_TIMEOUT == 45
    assert settings.DB_POOL_RECYCLE == 900
    assert settings.DB_POOL_PRE_PING is False


@pytest.mark.parametrize(
    ("field", "bad_value"),
    [
        ("DB_POOL_SIZE", "0"),
        ("DB_POOL_SIZE", "-5"),
        ("DB_MAX_OVERFLOW", "-1"),
        ("DB_POOL_TIMEOUT", "0"),
        ("DB_POOL_RECYCLE", "0"),
    ],
)
def test_invalid_pool_settings_fail_fast(monkeypatch, field, bad_value):
    """Verify non-positive or negative pool parameters fail startup validation."""
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg2://user:pass@pgbouncer:6432/wastematch")
    monkeypatch.setenv("OIDC_ISSUER", "https://example.auth0.com/")
    monkeypatch.setenv("OIDC_CLIENT_ID", "client-123")
    monkeypatch.setenv("OIDC_AUDIENCE", "https://api.example.com")
    monkeypatch.setenv("JWT_SECRET_KEY", "a" * 32)
    monkeypatch.setenv(field, bad_value)

    with pytest.raises(ValidationError):
        Settings()


def test_get_engine_options_for_postgresql():
    """Verify get_engine_options returns QueuePool options for PostgreSQL URLs."""
    pg_url = "postgresql+psycopg2://wastematch:password@pgbouncer:6432/wastematch"
    options = get_engine_options(pg_url)

    assert options["poolclass"] is QueuePool
    assert "pool_size" in options
    assert "max_overflow" in options
    assert "pool_timeout" in options
    assert "pool_recycle" in options
    assert "pool_pre_ping" in options
    assert options["pool_pre_ping"] is True


def test_get_engine_options_for_sqlite():
    """Verify get_engine_options avoids QueuePool arguments for SQLite compatibility."""
    sqlite_url = "sqlite:///./test.db"
    options = get_engine_options(sqlite_url)

    assert "poolclass" not in options
    assert "pool_size" not in options
    assert "max_overflow" not in options
    assert options.get("connect_args") == {"check_same_thread": False}


def test_queue_pool_instantiation():
    """Verify QueuePool is properly configured on an engine."""
    from sqlalchemy import create_engine

    pg_url = "postgresql+psycopg2://wastematch:password@localhost:6432/wastematch"
    options = get_engine_options(pg_url)
    engine = create_engine(pg_url, **options)

    assert isinstance(engine.pool, QueuePool)
    assert engine.pool.size() == options["pool_size"]
    assert engine.pool._max_overflow == options["max_overflow"]
    assert engine.pool._recycle == options["pool_recycle"]
    assert engine.pool._pre_ping is True


def test_session_local_usable():
    """Verify SessionLocal creates and closes sessions without error."""
    session = SessionLocal()
    assert session is not None
    session.close()
