import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, exists, func, not_, or_, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user, get_tenant_db
from ..worker import process_match_evaluation_async
from ..limiter import limiter

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
@limiter.limit("10/minute")
def evaluate_candidate(request: Request, match_request: schemas.MatchRequest, db: Session = Depends(get_tenant_db), current_user: models.User = Depends(get_current_user)):
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

@router.get("/", response_model=schemas.PaginatedResponse[schemas.MatchEvaluationResponse])
def get_matches(db: Session = Depends(get_tenant_db), current_user: models.User = Depends(get_current_user), page: int = 1, size: int = 50):
    query = db.query(models.MatchEvaluation)
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    return schemas.PaginatedResponse(data=items, total=total, page=page, size=size)
@router.get("/{match_id}", response_model=schemas.MatchEvaluationResponse)
def get_match(match_id: UUID, db: Session = Depends(get_tenant_db), current_user: models.User = Depends(get_current_user)):
    db_match = db.query(models.MatchEvaluation).filter(models.MatchEvaluation.id == match_id).first()
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    return db_match

@router.post("/discover")
def discover_candidates(req: schemas.DiscoverRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Find commercially viable material batches by filtering out facilities beyond a geographic radius
    using PostGIS ST_DWithin / ST_DistanceSphere.
    """
    from sqlalchemy import func
    
    spec = db.query(models.BuyerSpecification).filter(models.BuyerSpecification.id == req.buyer_specification_id).first()
    if not spec:
        raise HTTPException(status_code=404, detail="Specification not found")
        
    receiving_facility = db.query(models.Facility).filter(models.Facility.id == spec.receiving_facility_id).first()
    if not receiving_facility or receiving_facility.coordinates is None:
        raise HTTPException(status_code=400, detail="Receiving facility coordinates not set")

    # ST_DistanceSphere returns distance in meters
    max_dist_meters = req.max_distance_km * 1000.0

    # Query matching MaterialBatches
    candidates = db.query(
        models.MaterialBatch.id.label("batch_id"),
        models.MaterialBatch.batch_reference,
        models.Facility.name.label("facility_name"),
        func.ST_DistanceSphere(models.Facility.coordinates, receiving_facility.coordinates).label("distance_meters")
    ).join(
        models.MaterialListing, models.MaterialBatch.listing_id == models.MaterialListing.id
    ).join(
        models.Facility, models.MaterialListing.source_facility_id == models.Facility.id
    ).filter(
        models.MaterialListing.material_category_id == spec.target_category_id,
        models.Facility.coordinates.isnot(None),
        func.ST_DWithin(models.Facility.coordinates, receiving_facility.coordinates, req.max_distance_km / 111.32)
    ).all()

    return {
        "specification_id": spec.id,
        "max_distance_km": req.max_distance_km,
        "viable_candidates": [
            {
                "batch_id": c.batch_id,
                "batch_reference": c.batch_reference,
                "facility_name": c.facility_name,
                "distance_km": round(c.distance_meters / 1000.0, 2)
            }
            for c in candidates
        ]
    }
