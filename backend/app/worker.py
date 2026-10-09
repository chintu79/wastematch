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

def evaluate_technical_constraints(db: Session, batch_id: str, spec_id: str):
    measurements = db.query(models.BatchMeasurement).filter(models.BatchMeasurement.batch_id == batch_id).all()
    constraints = db.query(models.SpecificationConstraint).filter(models.SpecificationConstraint.specification_id == spec_id).all()
    
    measurements_by_prop = {m.property_definition_id: m for m in measurements}
    
    failed_constraints = {}
    missing_fields = {}
    is_compatible = True
    
    for constraint in constraints:
        measurement = measurements_by_prop.get(constraint.property_definition_id)
        if not measurement:
            if constraint.missing_data_policy == models.MissingDataPolicy.HOLD:
                is_compatible = False
                missing_fields[str(constraint.property_definition_id)] = "Missing required measurement"
            continue
            
        if constraint.constraint_type == models.ConstraintType.HARD_LIMIT:
            val = measurement.numeric_value
            if val is None:
                continue
            if constraint.lower_bound is not None and val < constraint.lower_bound:
                is_compatible = False
                failed_constraints[str(constraint.id)] = f"Value {val} below lower bound {constraint.lower_bound}"
            if constraint.upper_bound is not None and val > constraint.upper_bound:
                is_compatible = False
                failed_constraints[str(constraint.id)] = f"Value {val} above upper bound {constraint.upper_bound}"
    
    status = models.TechnicalStatus.COMPATIBLE
    if not is_compatible:
        status = models.TechnicalStatus.INCOMPATIBLE
    if missing_fields and is_compatible:
        status = models.TechnicalStatus.MISSING_DATA
        
    return status, failed_constraints, missing_fields

@celery_app.task(name="process_match_evaluation_async", bind=True, max_retries=3)
def process_match_evaluation_async(self, evaluation_id: str, batch_id: str, spec_id: str):
    logger.info("starting_background_evaluation", evaluation_id=evaluation_id, batch_id=batch_id, spec_id=spec_id)
    
    db = SessionLocal()
    try:
        # Load the pending evaluation record
        db_eval = db.query(models.MatchEvaluation).filter(models.MatchEvaluation.id == evaluation_id).first()
        if not db_eval:
            logger.error("evaluation_record_not_found", evaluation_id=evaluation_id)
            return {"status": "error", "message": "Evaluation record not found"}

        # Run the heavy technical constraints logic
        tech_status, failed, missing = evaluate_technical_constraints(db, batch_id, spec_id)
        
        score = 100.0 if tech_status == models.TechnicalStatus.COMPATIBLE else (50.0 if tech_status == models.TechnicalStatus.MISSING_DATA else 0.0)

        # Update the record with actual results
        db_eval.technical_status = tech_status
        db_eval.failed_constraints = failed
        db_eval.missing_fields = missing
        db_eval.compatibility_score = score
        db_eval.ranking_score = score
        db_eval.explanation = {"reason": "Background evaluation completed."}
        
        db.commit()
        
        logger.info("finished_background_evaluation", evaluation_id=evaluation_id, status=tech_status.value)
        return {"status": "success", "evaluation_id": evaluation_id}
    except Exception as exc:
        db.rollback()
        logger.error("background_evaluation_failed", evaluation_id=evaluation_id, error=str(exc))
        raise self.retry(exc=exc, countdown=60)
    finally:
        db.close()
