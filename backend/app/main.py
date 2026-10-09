import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from .config import get_settings

# Load and validate configuration at import time so the application fails
# fast on missing or invalid environment variables (Issue #38).
settings = get_settings()

from .database import engine, Base  # noqa: E402  (depends on validated settings)
from .routers import identity, catalog, regulatory, specification, matching, inquiries, documents  # noqa: E402


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.basicConfig(level=settings.LOG_LEVEL)
    logging.getLogger(__name__).info(
        "Configuration validated (environment=%s, log_level=%s)",
        settings.ENVIRONMENT,
        settings.LOG_LEVEL,
    )
    yield


app = FastAPI(title="WasteMatch API", version="1.0", lifespan=lifespan)

app.include_router(identity.router)
app.include_router(catalog.router)
app.include_router(regulatory.router)
app.include_router(specification.router)
app.include_router(matching.router)
app.include_router(inquiries.router)
app.include_router(documents.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the WasteMatch API"}
