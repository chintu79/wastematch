import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db
from ..worker import process_match_evaluation_async

router = APIRouter(prefix="/api/v1/matches", tags=["matching"])

@router.post("/evaluate", response_model=schemas.MatchEvaluationResponse, status_code=status.HTTP_202_ACCEPTED)
def evaluate_candidate(match_request: schemas.MatchRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    batch = db.query(models.MaterialBatch).filter(models.MaterialBatch.id == match_request.material_batch_id).first()
    spec = db.query(models.BuyerSpecification).filter(models.BuyerSpecification.id == match_request.buyer_specification_id).first()
    
    if not batch or not spec:
        raise HTTPException(status_code=404, detail="Batch or Specification not found")

    candidate_id = uuid.uuid4()
    
    # Create the pending evaluation skeleton
    db_eval = models.MatchEvaluation(
        candidate_id=candidate_id,
        material_batch_id=match_request.material_batch_id,
        buyer_specification_id=match_request.buyer_specification_id,
        technical_status=models.TechnicalStatus.PENDING,
        explanation={"reason": "Evaluation queued for background processing"},
        matching_algorithm_version="1.1"
    )
    db.add(db_eval)
    db.commit()
    db.refresh(db_eval)
    
    # Dispatch to Celery worker
    process_match_evaluation_async.delay(
        str(db_eval.id), 
        str(batch.id), 
        str(spec.id)
    )
    
    return db_eval

@router.get("/", response_model=list[schemas.MatchEvaluationResponse])
def get_matches(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.MatchEvaluation).all()

@router.get("/{match_id}", response_model=schemas.MatchEvaluationResponse)
def get_match(match_id: UUID, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
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
