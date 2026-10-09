import os
from celery import Celery
import structlog
import time

logger = structlog.get_logger()

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

celery_app = Celery(
    "wastematch_worker",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task(name="process_match_evaluation_async", bind=True, max_retries=3)
def process_match_evaluation_async(self, batch_id: str, spec_id: str):
    """
    Background task to process match evaluation asynchronously.
    """
    logger.info("starting_background_evaluation", batch_id=batch_id, spec_id=spec_id)
    try:
        # Simulate heavy processing (candidate discovery, regulatory checking, ML-based matching, etc.)
        time.sleep(5)
        
        # In a real implementation, we would instantiate a DB session here, 
        # call the comparative logic from matching.py, and save the result.
        
        logger.info("finished_background_evaluation", batch_id=batch_id, spec_id=spec_id)
        return {"status": "success", "batch_id": batch_id, "spec_id": spec_id}
    except Exception as exc:
        logger.error("background_evaluation_failed", batch_id=batch_id, spec_id=spec_id, error=str(exc))
        raise self.retry(exc=exc, countdown=60)

@celery_app.task(name="enforce_retention_policies")
def enforce_retention_policies():
    """
    Background task to enforce data retention policies (soft-deletion).
    Soft-deletes abandoned match requests, expired sensitive documents, and unused user accounts.
    """
    logger.info("starting_retention_enforcement")
    try:
        from datetime import datetime, timedelta
        from sqlalchemy.orm import Session
        from sqlalchemy import create_engine
        from app.models import Inquiry, Document, User, InquiryStatus, DocumentStatus
        import os

        DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./wastematch.db")
        engine = create_engine(DATABASE_URL)
        session = Session(engine)

        now = datetime.utcnow()
        thirty_days_ago = now - timedelta(days=30)
        ninety_days_ago = now - timedelta(days=90)
        
        # 1. Soft delete abandoned match requests (Inquiries OPEN for > 30 days)
        abandoned_inquiries = session.query(Inquiry).filter(
            Inquiry.inquiry_status == InquiryStatus.OPEN,
            Inquiry.updated_at < thirty_days_ago,
            Inquiry.is_deleted == False
        ).all()
        for inq in abandoned_inquiries:
            inq.is_deleted = True
            inq.deleted_at = now
            logger.info("soft_deleted_abandoned_inquiry", inquiry_id=str(inq.id))
            
        # 2. Soft delete expired sensitive documents (expired > 30 days ago)
        expired_docs = session.query(Document).filter(
            Document.document_status == DocumentStatus.EXPIRED,
            Document.expires_at < thirty_days_ago,
            Document.is_deleted == False
        ).all()
        for doc in expired_docs:
            doc.is_deleted = True
            doc.deleted_at = now
            logger.info("soft_deleted_expired_document", document_id=str(doc.id))
            
        # 3. Soft delete inactive user accounts (created > 90 days ago, never updated/active)
        # simplified for this task
        inactive_users = session.query(User).filter(
            User.updated_at < ninety_days_ago,
            User.is_deleted == False
        ).all()
        for user in inactive_users:
            user.is_deleted = True
            user.deleted_at = now
            logger.info("soft_deleted_inactive_user", user_id=str(user.id))

        session.commit()
        session.close()
        logger.info("finished_retention_enforcement")
    except Exception as exc:
        logger.error("retention_enforcement_failed", error=str(exc))
        raise exc
