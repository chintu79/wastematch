from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from ..database import get_db

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/liveness", status_code=status.HTTP_200_OK)
def liveness_check():
    """
    Checks if the application is running.
    """
    return {"status": "ok", "message": "Application is live"}

@router.get("/readiness", status_code=status.HTTP_200_OK)
def readiness_check(db: Session = Depends(get_db)):
    """
    Checks if the application is ready to accept requests (e.g. database is available).
    """
    try:
        # Simple query to check database connectivity
        db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "not ready", "database": "disconnected", "error": str(e)}
        )
