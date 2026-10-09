"""Tests for strict environment configuration validation (Issue #38).

These tests verify the DEPLOYMENT.md (section 5) requirement that missing
or invalid critical configuration fails fast at startup.
"""

import pytest
from pydantic import ValidationError

from app.config import Settings, get_settings

REQUIRED_ENV = {
    "DATABASE_URL": "postgresql+psycopg2://wastematch:password@db:5432/wastematch",
    "OIDC_ISSUER": "https://dev-your-tenant.us.auth0.com/",
    "OIDC_CLIENT_ID": "client-id",
    "OIDC_AUDIENCE": "https://api.wastematch.local",
    "JWT_SECRET_KEY": "x" * 48,
}

OPTIONAL_ENV_KEYS = (
    "ENVIRONMENT",
    "LOG_LEVEL",
    "S3_ENDPOINT_URL",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_REGION",
    "S3_BUCKET_NAME",
    "DB_POOL_SIZE",
    "DB_MAX_OVERFLOW",
    "DB_POOL_TIMEOUT",
    "DB_POOL_RECYCLE",
    "DB_POOL_PRE_PING",
)


@pytest.fixture
def clean_env(monkeypatch):
    """Provide the required environment and clear optional/ambient vars."""
    for key in (*REQUIRED_ENV, *OPTIONAL_ENV_KEYS):
        monkeypatch.delenv(key, raising=False)
    for key, value in REQUIRED_ENV.items():
        monkeypatch.setenv(key, value)
    get_settings.cache_clear()
    yield monkeypatch
    get_settings.cache_clear()


def test_valid_development_config_loads(clean_env):
    settings = Settings()
    assert settings.ENVIRONMENT == "development"
    assert settings.DATABASE_URL == REQUIRED_ENV["DATABASE_URL"]
    assert settings.OIDC_CLIENT_ID == "client-id"
    assert settings.AWS_ACCESS_KEY_ID is None  # optional outside production


def test_missing_database_url_fails_fast(clean_env):
    clean_env.delenv("DATABASE_URL")
    with pytest.raises(ValidationError, match="DATABASE_URL"):
        Settings()


@pytest.mark.parametrize(
    "missing_key",
    ["DATABASE_URL", "OIDC_ISSUER", "OIDC_CLIENT_ID", "OIDC_AUDIENCE", "JWT_SECRET_KEY"],
)
def test_missing_critical_settings_fail_fast(clean_env, missing_key):
    clean_env.delenv(missing_key)
    with pytest.raises(ValidationError):
        Settings()


def test_invalid_database_url_scheme_fails(clean_env):
    clean_env.setenv("DATABASE_URL", "mysql://user:pass@db:3306/wm")
    with pytest.raises(ValidationError, match="DATABASE_URL"):
        Settings()


def test_invalid_environment_fails(clean_env):
    clean_env.setenv("ENVIRONMENT", "qa")
    with pytest.raises(ValidationError, match="ENVIRONMENT"):
        Settings()


def test_short_jwt_secret_fails(clean_env):
    clean_env.setenv("JWT_SECRET_KEY", "short")
    with pytest.raises(ValidationError, match="JWT_SECRET_KEY"):
        Settings()


def test_empty_optional_values_normalize_to_none(clean_env):
    clean_env.setenv("AWS_ACCESS_KEY_ID", "")
    clean_env.setenv("S3_ENDPOINT_URL", "")
    settings = Settings()
    assert settings.AWS_ACCESS_KEY_ID is None
    assert settings.S3_ENDPOINT_URL is None


def test_production_requires_s3_credentials(clean_env):
    clean_env.setenv("ENVIRONMENT", "production")
    with pytest.raises(ValidationError, match="AWS_ACCESS_KEY_ID"):
        Settings()


def test_production_requires_https_oidc_issuer(clean_env):
    clean_env.setenv("ENVIRONMENT", "production")
    clean_env.setenv("AWS_ACCESS_KEY_ID", "ak")
    clean_env.setenv("AWS_SECRET_ACCESS_KEY", "sk")
    clean_env.setenv("S3_BUCKET_NAME", "bucket")
    clean_env.setenv("OIDC_ISSUER", "http://insecure.example.com/")
    with pytest.raises(ValidationError, match="https"):
        Settings()


def test_production_with_full_config_loads(clean_env):
    clean_env.setenv("ENVIRONMENT", "production")
    clean_env.setenv("AWS_ACCESS_KEY_ID", "ak")
    clean_env.setenv("AWS_SECRET_ACCESS_KEY", "sk")
    clean_env.setenv("S3_BUCKET_NAME", "bucket")
    settings = Settings()
    assert settings.ENVIRONMENT == "production"
    assert settings.S3_BUCKET_NAME == "bucket"


def test_opaque_oidc_audience_is_accepted(clean_env):
    # The OIDC `aud` claim need not be a URL (CI uses e.g. 'mock-audience').
    clean_env.setenv("OIDC_AUDIENCE", "mock-audience")
    settings = Settings()
    assert settings.OIDC_AUDIENCE == "mock-audience"


def test_empty_oidc_audience_fails(clean_env):
    clean_env.setenv("OIDC_AUDIENCE", "   ")
    with pytest.raises(ValidationError, match="OIDC_AUDIENCE"):
        Settings()


def test_get_settings_is_cached(clean_env):
    assert get_settings() is get_settings()
