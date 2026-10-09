import os

import structlog
from celery import Celery
from sqlalchemy.orm import Session

from . import models
from .database import SessionLocal

logger = structlog.get_logger()

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

celery_app = Celery(
    "wastematch_worker", broker=CELERY_BROKER_URL, backend=CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "enforce-retention-policies-daily": {
            "task": "enforce_retention_policies",
            "schedule": 86400.0,
        },
        "archive-completed-batches-daily": {
            "task": "archive_completed_batches_to_data_lake",
            "schedule": 86400.0,
        },
        "maintain-database-partitions-weekly": {
            "task": "maintain_database_partitions",
            "schedule": 86400.0 * 7,
        },
    },
)


def evaluate_technical_constraints(db: Session, batch_id: str, spec_id: str):
    batch = (
        db.query(models.MaterialBatch)
        .filter(models.MaterialBatch.id == batch_id)
        .first()
    )
    constraints = (
        db.query(models.SpecificationConstraint)
        .filter(models.SpecificationConstraint.specification_id == spec_id)
        .all()
    )

    properties = batch.properties or {}

    failed_constraints = {}
    missing_fields = {}
    is_compatible = True

    for constraint in constraints:
        # Assuming properties dict maps property_definition_id string to a dict with 'numeric_value'
        prop_id_str = str(constraint.property_definition_id)
        measurement = properties.get(prop_id_str)
        if not measurement:
            if constraint.missing_data_policy == models.MissingDataPolicy.HOLD:
                is_compatible = False
                missing_fields[prop_id_str] = "Missing required measurement"
            continue

        if constraint.constraint_type == models.ConstraintType.HARD_LIMIT:
            val = (
                measurement.get("numeric_value")
                if isinstance(measurement, dict)
                else measurement
            )
            if val is None:
                continue
            try:
                val = float(val)
            except (ValueError, TypeError):
                continue
            if constraint.lower_bound is not None and val < constraint.lower_bound:
                is_compatible = False
                failed_constraints[str(constraint.id)] = (
                    f"Value {val} below lower bound {constraint.lower_bound}"
                )
            if constraint.upper_bound is not None and val > constraint.upper_bound:
                is_compatible = False
                failed_constraints[str(constraint.id)] = (
                    f"Value {val} above upper bound {constraint.upper_bound}"
                )

    status = models.TechnicalStatus.COMPATIBLE
    if not is_compatible:
        status = models.TechnicalStatus.INCOMPATIBLE
    if missing_fields and is_compatible:
        status = models.TechnicalStatus.MISSING_DATA

    return status, failed_constraints, missing_fields


@celery_app.task(name="process_match_evaluation_async", bind=True, max_retries=3)
def process_match_evaluation_async(
    self, evaluation_id: str, batch_id: str, spec_id: str
):
    logger.info(
        "starting_background_evaluation",
        evaluation_id=evaluation_id,
        batch_id=batch_id,
        spec_id=spec_id,
    )

    db = SessionLocal()
    try:
        # Load the pending evaluation record
        db_eval = (
            db.query(models.MatchEvaluation)
            .filter(models.MatchEvaluation.id == evaluation_id)
            .first()
        )
        if not db_eval:
            logger.error("evaluation_record_not_found", evaluation_id=evaluation_id)
            return {"status": "error", "message": "Evaluation record not found"}

        # Run the heavy technical constraints logic
        tech_status, failed, missing = evaluate_technical_constraints(
            db, batch_id, spec_id
        )

        score = (
            100.0
            if tech_status == models.TechnicalStatus.COMPATIBLE
            else (50.0 if tech_status == models.TechnicalStatus.MISSING_DATA else 0.0)
        )

        # Update the record with actual results
        db_eval.technical_status = tech_status
        db_eval.failed_constraints = failed
        db_eval.missing_fields = missing
        db_eval.compatibility_score = score
        db_eval.ranking_score = score
        db_eval.explanation = {"reason": "Background evaluation completed."}

        db.commit()

        # Publish completion event to Redis
        import redis
        import json

        redis_client = redis.from_url(CELERY_BROKER_URL)
        event_data = {
            "type": "evaluation_completed",
            "evaluation_id": evaluation_id,
            "status": tech_status.value,
            "batch_id": batch_id,
            "spec_id": spec_id,
        }
        redis_client.publish("job_updates", json.dumps(event_data))

        logger.info(
            "finished_background_evaluation",
            evaluation_id=evaluation_id,
            status=tech_status.value,
        )
        return {"status": "success", "evaluation_id": evaluation_id}
    except Exception as exc:
        db.rollback()
        logger.error(
            "background_evaluation_failed", evaluation_id=evaluation_id, error=str(exc)
        )
        raise self.retry(exc=exc, countdown=60)
    finally:
        db.close()


@celery_app.task(name="enforce_retention_policies")
def enforce_retention_policies():
    """
    Background task to enforce data retention policies (soft-deletion).
    Soft-deletes abandoned match requests, expired sensitive documents, and unused user accounts.
    """
    logger.info("starting_retention_enforcement")
    try:
        from datetime import datetime, timedelta

        from app.models import Document, DocumentStatus, Inquiry, InquiryStatus, User

        session = SessionLocal()

        now = datetime.utcnow()
        thirty_days_ago = now - timedelta(days=30)
        ninety_days_ago = now - timedelta(days=90)

        # 1. Soft delete abandoned match requests (Inquiries OPEN for > 30 days)
        abandoned_inquiries = (
            session.query(Inquiry)
            .filter(
                Inquiry.inquiry_status == InquiryStatus.OPEN,
                Inquiry.updated_at < thirty_days_ago,
                Inquiry.is_deleted == False,
            )
            .all()
        )
        for inq in abandoned_inquiries:
            inq.is_deleted = True
            inq.deleted_at = now
            logger.info("soft_deleted_abandoned_inquiry", inquiry_id=str(inq.id))

        # 2. Soft delete expired sensitive documents (expired > 30 days ago)
        expired_docs = (
            session.query(Document)
            .filter(
                Document.document_status == DocumentStatus.EXPIRED,
                Document.expires_at < thirty_days_ago,
                Document.is_deleted == False,
            )
            .all()
        )
        for doc in expired_docs:
            doc.is_deleted = True
            doc.deleted_at = now
            logger.info("soft_deleted_expired_document", document_id=str(doc.id))

        # 3. Soft delete inactive user accounts (created > 90 days ago, never updated/active)
        # simplified for this task
        inactive_users = (
            session.query(User)
            .filter(User.updated_at < ninety_days_ago, User.is_deleted == False)
            .all()
        )
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


@celery_app.task(name="archive_completed_batches_to_data_lake")
def archive_completed_batches_to_data_lake(
    cutoff_days: int = 90, dry_run: bool = False
):
    """Celery cron job to offload completed/archived batches to S3 Data Lake Parquet (Issue #68)."""
    from .archival_service import archive_completed_batches

    session = SessionLocal()
    try:
        res = archive_completed_batches(
            session, cutoff_days=cutoff_days, dry_run=dry_run
        )
        logger.info("data_lake_archival_task_completed", result=res)
        return res
    except Exception as exc:
        session.rollback()
        logger.error("data_lake_archival_task_failed", error=str(exc))
        raise exc
    finally:
        session.close()


@celery_app.task(name="maintain_database_partitions")
def maintain_database_partitions():
    """Celery cron job to ensure future PostgreSQL date partitions exist for tracking logs (Issue #68)."""
    from .partition_service import ensure_date_partitions

    session = SessionLocal()
    try:
        partitions = ensure_date_partitions(session, parent_table="waste_tracking_logs")
        logger.info("partition_maintenance_task_completed", partitions=partitions)
        return {"status": "success", "partitions": partitions}
    except Exception as exc:
        session.rollback()
        logger.error("partition_maintenance_task_failed", error=str(exc))
        raise exc
    finally:
        session.close()
