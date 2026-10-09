"""WasteMatch API entry point (root application).

Minimal FastAPI application created as part of the local Docker
environment (Issue #2). The full modular application lives in
backend/app/ (app.main); this root app remains the container entry point
and now shares the validated configuration from Issue #38.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.config import get_settings

# Load and validate configuration at import time so the application fails
# fast on missing or invalid environment variables (Issue #38).
settings = get_settings()

from app.database import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.basicConfig(level=settings.LOG_LEVEL)
    logging.getLogger(__name__).info(
        "Configuration validated (environment=%s, log_level=%s)",
        settings.ENVIRONMENT,
        settings.LOG_LEVEL,
    )
    yield


app = FastAPI(title="WasteMatch API", version="0.1.0", lifespan=lifespan)


@app.get("/")
def read_root():
    return {
        "service": "wastematch-api",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health():
    """Liveness plus dependency health.

    Per docs/DEPLOYMENT.md (11.3), a failing dependency must be reported
    accurately rather than hidden behind a healthy-looking response, so a
    database failure returns HTTP 503.
    """
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception as exc:  # pragma: no cover - depends on runtime state
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": f"unreachable ({type(exc).__name__})",
            },
        )
    return {"status": "ok", "database": "reachable"}
