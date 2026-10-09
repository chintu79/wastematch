from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os

# Use Redis if available, else memory
REDIS_URL = os.getenv("CELERY_BROKER_URL", "memory://")
if REDIS_URL.startswith("redis"):
    storage_uri = REDIS_URL
else:
    storage_uri = "memory://"

limiter = Limiter(key_func=get_remote_address, storage_uri=storage_uri)
