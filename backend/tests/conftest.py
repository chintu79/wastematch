import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

# Provide test defaults so pytest runs cleanly out of the box
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("OIDC_ISSUER", "https://mock-issuer.auth0.com/")
os.environ.setdefault("OIDC_CLIENT_ID", "mock-client-id")
os.environ.setdefault("OIDC_AUDIENCE", "https://mock-audience.com/")
os.environ.setdefault("JWT_SECRET_KEY", "mock-secret-key-that-is-at-least-32-chars-long")

from app.main import app
from app.database import Base, get_db
from app.auth import get_current_user
from app import models

# Use SQLite locally by default, or Postgres if DATABASE_URL is set (e.g. in CI)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )

    @event.listens_for(engine, "connect")
    def _sqlite_spatial_mock(dbapi_connection, connection_record):
        import contextlib
        for fn in [
            "RecoverGeometryColumn",
            "DiscardGeometryColumn",
            "CreateSpatialIndex",
            "DisableSpatialIndex",
            "InitSpatialMetaData",
        ]:
            with contextlib.suppress(Exception):
                dbapi_connection.create_function(fn, -1, lambda *args: 1)
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db_engine():
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db_engine):
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def test_user(db_session):
    user = models.User(
        email="test@example.com",
        full_name="Test User"
        
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def client(db_session, test_user):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    def override_get_current_user():
        return test_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    with TestClient(app) as c:
        yield c
        
    app.dependency_overrides.clear()
