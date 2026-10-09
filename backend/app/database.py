"""Database engine, session factory and FastAPI dependency (Issue #38).

This module was referenced by app/main.py, app/auth.py, every router and
alembic/env.py but missing from the repository; it is restored here and
wired to the validated application settings instead of ad-hoc
environment lookups.
"""

from typing import Any, Optional

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker
from sqlalchemy.pool import QueuePool

from .config import get_settings

settings = get_settings()  # fail fast on invalid configuration at import


def get_engine_options(database_url: Optional[str] = None) -> dict[str, Any]:
    """Return engine keyword arguments tuned for the database scheme (Issue #67)."""
    url = database_url or settings.DATABASE_URL
    if url.startswith("sqlite"):
        return {"connect_args": {"check_same_thread": False}}

    return {
        "poolclass": QueuePool,
        "pool_size": settings.DB_POOL_SIZE,
        "max_overflow": settings.DB_MAX_OVERFLOW,
        "pool_timeout": settings.DB_POOL_TIMEOUT,
        "pool_recycle": settings.DB_POOL_RECYCLE,
        "pool_pre_ping": settings.DB_POOL_PRE_PING,
    }


engine = create_engine(settings.DATABASE_URL, **get_engine_options())

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency yielding a database session."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
