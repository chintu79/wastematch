"""WasteMatch API entry point.

Minimal FastAPI application created as part of the local Docker
environment (Issue #2). Business modules described in docs/TECH_SPEC.md
will be layered on top of this later.
"""

import os

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine, text

# Inside Docker Compose this is provided by the `api` service definition
# (hostname `db`). The default allows running locally against the
# PostgreSQL container with its published port.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://wastematch:password@localhost:5432/wastematch",
)

app = FastAPI(title="WasteMatch API", version="0.1.0")

engine = create_engine(DATABASE_URL)


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
