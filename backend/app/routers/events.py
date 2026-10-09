from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import redis.asyncio as redis
import os
import json
import structlog
import asyncio

logger = structlog.get_logger()
router = APIRouter(tags=["events"])

REDIS_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")

@router.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("websocket_connected")
    
    redis_client = redis.from_url(REDIS_URL)
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("job_updates")
    
    try:
        while True:
            # We use a small sleep or get_message loop so we don't block
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if message and message['type'] == 'message':
                data = message['data'].decode('utf-8')
                await websocket.send_text(data)
            
            # Allow cancellation and other async tasks to run
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        logger.info("websocket_disconnected")
    except Exception as e:
        logger.error("websocket_error", error=str(e))
    finally:
        await pubsub.unsubscribe("job_updates")
        await redis_client.aclose()
