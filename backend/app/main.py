import time

import structlog
from asgi_correlation_id import CorrelationIdMiddleware, correlation_id
from fastapi import FastAPI, Request

from .routers import (
    catalog,
    documents,
    health,
    identity,
    inquiries,
    matching,
    regulatory,
    specification,
    events,
)

# Configure structlog
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Create tables for now (will be replaced by Alembic later)
# Base.metadata.create_all(bind=engine)  # Commented out due to Alembic transition

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from .limiter import limiter

app = FastAPI(title="WasteMatch API", version="1.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add Middlewares
app.add_middleware(CorrelationIdMiddleware)

@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    req_id = correlation_id.get()
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(request_id=req_id, method=request.method, path=request.url.path)
    
    start_time = time.perf_counter()
    try:
        response = await call_next(request)
        process_time = time.perf_counter() - start_time
        
        logger.info("request_completed", status_code=response.status_code, duration_seconds=round(process_time, 4))
        return response
    except Exception as e:
        process_time = time.perf_counter() - start_time
        logger.error("request_failed", error=str(e), duration_seconds=round(process_time, 4))
        raise

app.include_router(health.router)
app.include_router(identity.router)
app.include_router(catalog.router)
app.include_router(regulatory.router)
app.include_router(specification.router)
app.include_router(matching.router)
app.include_router(inquiries.router)
app.include_router(documents.router)
app.include_router(events.router)

@app.get("/")
def read_root():
    logger.info("root_accessed")
    return {"message": "Welcome to the WasteMatch API"}
