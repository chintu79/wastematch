import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, exists, func, not_, or_, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db
from ..worker import process_match_evaluation_async

router = APIRouter(prefix="/api/v1/matches", tags=["matching"])

def build_candidate_query(spec_id: UUID):
    """Select batches that survive hard-constraint pre-filtering (Issue #53).

    Instead of loading every batch's measurements and the specification's
    constraints into Python and comparing them row by row, the exclusion
    rules are expressed as a single SQL statement so the database discards
    non-candidates *before* any Celery deep-scoring task is dispatched:

    * ``HARD_LIMIT`` ranges are checked with SQL ``BETWEEN`` (inclusive
      bounds), which is exactly the Python engine's
      ``value < lower or value > upper`` test;
    * constraints with a ``HOLD`` missing-data policy exclude batches that
      have no measurement row for the constrained property.

    A batch is returned if and only if
    ``worker.evaluate_technical_constraints`` would not mark it
    ``INCOMPATIBLE`` for that specification. ``NULL`` numeric values never
    exclude (SQL comparisons stay ``NULL``), mirroring the Python loop's
    ``if val is None: continue``.

    The statement is correlated on ``material_batches.id`` so callers can
    count it, apply ``LIMIT``/``ORDER BY``, and run it as one round-trip
    on any backend supporting correlated ``EXISTS`` (PostgreSQL, SQLite).
    """
    batch = models.MaterialBatch
    measurement = models.BatchMeasurement
    constraint = models.SpecificationConstraint
    value = measurement.numeric_value
    lower = constraint.lower_bound
    upper = constraint.upper_bound

    # Batches with a measurement outside a HARD_LIMIT range.
    range_violation = (
        select(measurement.id)
        .join(
            constraint,
            constraint.property_definition_id == measurement.property_definition_id,
        )
        .where(
            constraint.specification_id == spec_id,
            constraint.constraint_type == models.ConstraintType.HARD_LIMIT,
            or_(
                and_(
                    lower.is_not(None),
                    upper.is_not(None),
                    not_(value.between(lower, upper)),
                ),
                and_(lower.is_not(None), upper.is_(None), value < lower),
                and_(lower.is_(None), upper.is_not(None), value > upper),
            ),
            measurement.batch_id == batch.id,
        )
    )

    # Batches missing a measurement for a HOLD-policy constraint. The
    # innermost SELECT references material_batches two levels up, and
    # auto-correlation only inspects the immediate parent, so both
    # enclosing tables are correlated explicitly.
    missing_hold_measurement = (
        select(constraint.id)
        .where(
            constraint.specification_id == spec_id,
            constraint.missing_data_policy == models.MissingDataPolicy.HOLD,
            ~exists(
                select(measurement.id)
                .where(
                    measurement.batch_id == batch.id,
                    measurement.property_definition_id == constraint.property_definition_id,
                )
                .correlate(batch, constraint)
            ),
        )
    )

    return (
        select(batch.id)
        .where(
            ~range_violation.exists(),
            ~missing_hold_measurement.exists(),
        )
        .order_by(batch.created_at, batch.id)
    )

def _queue_evaluation(db: Session, batch_id: UUID, spec_id: UUID) -> models.MatchEvaluation:
    """Create the pending MatchEvaluation skeleton for background scoring."""
    db_eval = models.MatchEvaluation(
        candidate_id=uuid.uuid4(),
        material_batch_id=batch_id,
        buyer_specification_id=spec_id,
        technical_status=models.TechnicalStatus.PENDING,
        explanation={"reason": "Evaluation queued for background processing"},
        matching_algorithm_version="1.1"
    )
    db.add(db_eval)
    return db_eval

@router.post("/evaluate", response_model=schemas.MatchEvaluationResponse, status_code=status.HTTP_202_ACCEPTED)
def evaluate_candidate(match_request: schemas.MatchRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    batch = db.query(models.MaterialBatch).filter(models.MaterialBatch.id == match_request.material_batch_id).first()
    spec = db.query(models.BuyerSpecification).filter(models.BuyerSpecification.id == match_request.buyer_specification_id).first()
    
    if not batch or not spec:
        raise HTTPException(status_code=404, detail="Batch or Specification not found")

    db_eval = _queue_evaluation(db, batch.id, spec.id)
    db.commit()
    db.refresh(db_eval)
    
    # Dispatch to Celery worker
    process_match_evaluation_async.delay(
        str(db_eval.id), 
        str(batch.id), 
        str(spec.id)
    )
    
    return db_eval

@router.post("/discover", response_model=schemas.MatchDiscoveryResponse, status_code=status.HTTP_202_ACCEPTED)
def discover_candidates(request: schemas.MatchDiscoveryRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Pre-filter every batch against a specification's hard constraints in
    SQL and queue Celery deep scoring only for the survivors (Issue #53)."""
    spec = db.query(models.BuyerSpecification).filter(models.BuyerSpecification.id == request.buyer_specification_id).first()
    if not spec:
        raise HTTPException(status_code=404, detail="Specification not found")

    batches_scanned = db.query(func.count(models.MaterialBatch.id)).scalar() or 0

    candidate_query = build_candidate_query(spec.id)
    candidates_found = db.execute(
        select(func.count()).select_from(candidate_query.subquery())
    ).scalar_one()
    queued_batch_ids = list(db.scalars(candidate_query.limit(request.limit)).all())

    evaluations = [
        (_queue_evaluation(db, batch_id, spec.id), batch_id)
        for batch_id in queued_batch_ids
    ]
    # Commit the pending records before dispatching so the worker can load
    # them, then hand the pre-filtered candidates to Celery for the deep
    # compatibility scoring.
    db.commit()
    for db_eval, batch_id in evaluations:
        process_match_evaluation_async.delay(
            str(db_eval.id),
            str(batch_id),
            str(spec.id)
        )

    return schemas.MatchDiscoveryResponse(
        batches_scanned=batches_scanned,
        candidates_found=candidates_found,
        candidates_excluded=batches_scanned - candidates_found,
        evaluations_queued=len(evaluations),
        queued_batch_ids=[batch_id for _, batch_id in evaluations],
    )

@router.get("/", response_model=list[schemas.MatchEvaluationResponse])
def get_matches(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.MatchEvaluation).all()

@router.get("/{match_id}", response_model=schemas.MatchEvaluationResponse)
def get_match(match_id: UUID, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_match = db.query(models.MatchEvaluation).filter(models.MatchEvaluation.id == match_id).first()
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    return db_match
