from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
import uuid

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/v1/matches", tags=["matching"])

@router.post("/evaluate", response_model=schemas.MatchEvaluationResponse, status_code=status.HTTP_201_CREATED)
def evaluate_candidate(match_request: schemas.MatchRequest, db: Session = Depends(get_db)):
    batch = db.query(models.MaterialBatch).filter(models.MaterialBatch.id == match_request.material_batch_id).first()
    spec = db.query(models.BuyerSpecification).filter(models.BuyerSpecification.id == match_request.buyer_specification_id).first()
    
    if not batch or not spec:
        raise HTTPException(status_code=404, detail="Batch or Specification not found")

    # In a real implementation, candidate discovery and rule engine goes here
    candidate_id = uuid.uuid4()
    
    db_eval = models.MatchEvaluation(
        candidate_id=candidate_id,
        material_batch_id=match_request.material_batch_id,
        buyer_specification_id=match_request.buyer_specification_id,
        technical_status=models.TechnicalStatus.COMPATIBLE,
        compatibility_score=85.0,
        ranking_score=90.0,
        explanation={"reason": "Mocked successful match evaluation"},
        matching_algorithm_version="1.0"
    )
    db.add(db_eval)
    db.commit()
    db.refresh(db_eval)
    return db_eval

@router.get("/", response_model=List[schemas.MatchEvaluationResponse])
def get_matches(db: Session = Depends(get_db)):
    return db.query(models.MatchEvaluation).all()

@router.get("/{match_id}", response_model=schemas.MatchEvaluationResponse)
def get_match(match_id: UUID, db: Session = Depends(get_db)):
    db_match = db.query(models.MatchEvaluation).filter(models.MatchEvaluation.id == match_id).first()
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    return db_match
