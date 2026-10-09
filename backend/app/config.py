"""Application settings with strict startup validation (Issue #38).

Per docs/DEPLOYMENT.md (section 5), all environment-specific configuration
is external to source code and must be validated at application startup.
Missing critical configuration (database URL, OIDC provider details,
secrets) raises a ValidationError at import time so the application fails
fast instead of running in a partially configured state.

Values are read from environment variables and, if present, a `.env` file
in the working directory (see `.env.example` at the repository root).
"""

from functools import lru_cache
from typing import Optional

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

VALID_ENVIRONMENTS = ("development", "test", "staging", "production")

# SQLAlchemy-supported URL schemes accepted for DATABASE_URL.
_VALID_DB_SCHEMES = ("postgresql", "postgres", "sqlite")


class Settings(BaseSettings):
    """Typed application configuration.

    Required fields fail fast with a ValidationError when unset. Optional
    development-only values (e.g. S3 credentials) are promoted to
    requirements in production via a model validator.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- Runtime ---
    ENVIRONMENT: str = Field(default="development")
    LOG_LEVEL: str = Field(default="INFO")

    # --- Database (required) & Connection Pooling (Issue #67) ---
    DATABASE_URL: str
    DB_POOL_SIZE: int = Field(default=20, ge=1, description="QueuePool persistent pool size")
    DB_MAX_OVERFLOW: int = Field(default=10, ge=0, description="QueuePool max overflow connections")
    DB_POOL_TIMEOUT: int = Field(default=30, ge=1, description="QueuePool connection checkout timeout in seconds")
    DB_POOL_RECYCLE: int = Field(default=1800, ge=1, description="QueuePool connection recycle timeout in seconds")
    DB_POOL_PRE_PING: bool = Field(default=True, description="Enable connection pre-ping liveness test")

    # --- OIDC identity provider (required) ---
    # auth.py is currently a mock; these settings define the provider
    # contract that the real python-jose based validation will consume.
    OIDC_ISSUER: str
    OIDC_CLIENT_ID: str
    OIDC_AUDIENCE: str
    # Secret used for JWT signing/verification once real OIDC validation
    # replaces the mock in app/auth.py.
    JWT_SECRET_KEY: str = Field(min_length=32)

    # --- Object storage (S3-compatible; required in production) ---
    S3_ENDPOINT_URL: Optional[str] = None  # MinIO / LocalStack in dev
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = Field(default="us-east-1")
    S3_BUCKET_NAME: Optional[str] = None

    @field_validator("ENVIRONMENT")
    @classmethod
    def _validate_environment(cls, value: str) -> str:
        if value not in VALID_ENVIRONMENTS:
            raise ValueError(
                f"ENVIRONMENT must be one of {VALID_ENVIRONMENTS}, got {value!r}"
            )
        return value

    @field_validator("LOG_LEVEL")
    @classmethod
    def _validate_log_level(cls, value: str) -> str:
        level = value.upper()
        if level not in ("DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"):
            raise ValueError(f"LOG_LEVEL must be a valid log level, got {value!r}")
        return level

    @field_validator("DATABASE_URL")
    @classmethod
    def _validate_database_url(cls, value: str) -> str:
        # Strip any driver suffix (e.g. postgresql+psycopg2) before
        # comparing the scheme.
        scheme = value.split("://", 1)[0].split("+", 1)[0]
        if "://" not in value or scheme not in _VALID_DB_SCHEMES:
            raise ValueError(
                "DATABASE_URL must be a SQLAlchemy URL with one of the "
                f"schemes {_VALID_DB_SCHEMES}, got {value!r}"
            )
        return value

    @field_validator("OIDC_ISSUER", "OIDC_AUDIENCE", "S3_ENDPOINT_URL")
    @classmethod
    def _validate_optional_http_url(cls, value: Optional[str]) -> Optional[str]:
        if value is None or value == "":
            return None
        if not value.startswith(("http://", "https://")):
            raise ValueError(f"must be an http(s) URL, got {value!r}")
        return value

    @field_validator("AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "S3_BUCKET_NAME")
    @classmethod
    def _empty_str_to_none(cls, value: Optional[str]) -> Optional[str]:
        # Compose-style environments often pass empty strings for unset
        # optional variables; normalize them to None.
        if value is None or value.strip() == "":
            return None
        return value

    @model_validator(mode="after")
    def _validate_environment_specific_rules(self) -> "Settings":
        if self.ENVIRONMENT == "production":
            missing = [
                name
                for name, value in (
                    ("AWS_ACCESS_KEY_ID", self.AWS_ACCESS_KEY_ID),
                    ("AWS_SECRET_ACCESS_KEY", self.AWS_SECRET_ACCESS_KEY),
                    ("S3_BUCKET_NAME", self.S3_BUCKET_NAME),
                )
                if not value
            ]
            if missing:
                raise ValueError(
                    f"missing required production configuration: {', '.join(missing)}"
                )
            if self.OIDC_ISSUER and not self.OIDC_ISSUER.startswith("https://"):
                raise ValueError("OIDC_ISSUER must use https in production")
        return self


@lru_cache
def get_settings() -> Settings:
    """Return the cached application settings.

    Loading happens at first call - which occurs at application import time
    - so invalid or missing configuration aborts startup immediately.
    """
    return Settings()
