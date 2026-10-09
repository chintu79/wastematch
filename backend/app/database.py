"""Database engine, session factory and FastAPI dependency (Issue #38).

This module was referenced by app/main.py, app/auth.py, every router and
alembic/env.py but missing from the repository; it is restored here and
wired to the validated application settings instead of ad-hoc
environment lookups.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from .config import get_settings

settings = get_settings()  # fail fast on invalid configuration at import

engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency yielding a database session."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
