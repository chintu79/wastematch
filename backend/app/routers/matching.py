import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(prefix="/api/v1/matches", tags=["matching"])

def evaluate_technical_constraints(db: Session, batch_id: UUID, spec_id: UUID):
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

@router.post("/evaluate", response_model=schemas.MatchEvaluationResponse, status_code=status.HTTP_201_CREATED)
def evaluate_candidate(match_request: schemas.MatchRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    batch = db.query(models.MaterialBatch).filter(models.MaterialBatch.id == match_request.material_batch_id).first()
    spec = db.query(models.BuyerSpecification).filter(models.BuyerSpecification.id == match_request.buyer_specification_id).first()
    
    if not batch or not spec:
        raise HTTPException(status_code=404, detail="Batch or Specification not found")

    tech_status, failed, missing = evaluate_technical_constraints(db, batch.id, spec.id)
    
    # Simple compatibility score mock logic based on constraints passed
    score = 100.0 if tech_status == models.TechnicalStatus.COMPATIBLE else (50.0 if tech_status == models.TechnicalStatus.MISSING_DATA else 0.0)

    candidate_id = uuid.uuid4()
    db_eval = models.MatchEvaluation(
        candidate_id=candidate_id,
        material_batch_id=match_request.material_batch_id,
        buyer_specification_id=match_request.buyer_specification_id,
        technical_status=tech_status,
        compatibility_score=score,
        ranking_score=score,
        failed_constraints=failed,
        missing_fields=missing,
        explanation={"reason": "Evaluated against buyer specification constraints"},
        matching_algorithm_version="1.1"
    )
    db.add(db_eval)
    db.commit()
    db.refresh(db_eval)
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
