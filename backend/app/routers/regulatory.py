from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/v1/compliance", tags=["compliance"])

@router.post("/rules", response_model=schemas.RegulatoryRuleResponse, status_code=status.HTTP_201_CREATED)
def create_rule(rule: schemas.RegulatoryRuleCreate, db: Session = Depends(get_db)):
    db_rule = models.RegulatoryRule(**rule.model_dump())
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule

@router.get("/rules", response_model=List[schemas.RegulatoryRuleResponse])
def get_rules(db: Session = Depends(get_db)):
    return db.query(models.RegulatoryRule).all()

@router.post("/evaluate", response_model=schemas.RegulatoryEvaluationResponse, status_code=status.HTTP_201_CREATED)
def evaluate_compliance(evaluation: schemas.RegulatoryEvaluationCreate, db: Session = Depends(get_db)):
    db_eval = models.RegulatoryEvaluation(**evaluation.model_dump())
    db.add(db_eval)
    db.commit()
    db.refresh(db_eval)
    return db_eval

@router.get("/evaluations/{evaluation_id}", response_model=schemas.RegulatoryEvaluationResponse)
def get_evaluation(evaluation_id: UUID, db: Session = Depends(get_db)):
    db_eval = db.query(models.RegulatoryEvaluation).filter(models.RegulatoryEvaluation.id == evaluation_id).first()
    if not db_eval:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return db_eval
