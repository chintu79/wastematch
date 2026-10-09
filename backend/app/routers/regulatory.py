from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user, get_tenant_db

router = APIRouter(prefix="/api/v1/compliance", tags=["compliance"])

@router.post("/rules", response_model=schemas.RegulatoryRuleResponse, status_code=status.HTTP_201_CREATED)
def create_rule(rule: schemas.RegulatoryRuleCreate, db: Session = Depends(get_tenant_db), current_user: models.User = Depends(get_current_user)):
    db_rule = models.RegulatoryRule(**rule.model_dump())
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule

@router.get("/rules", response_model=schemas.PaginatedResponse[schemas.RegulatoryRuleResponse])
def get_rules(db: Session = Depends(get_tenant_db), page: int = 1, size: int = 50):
    query = db.query(models.RegulatoryRule)
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    return schemas.PaginatedResponse(data=items, total=total, page=page, size=size)
@router.post("/evaluate", response_model=schemas.RegulatoryEvaluationResponse, status_code=status.HTTP_201_CREATED)
def evaluate_compliance(evaluation: schemas.RegulatoryEvaluationCreate, db: Session = Depends(get_tenant_db), current_user: models.User = Depends(get_current_user)):
    db_eval = models.RegulatoryEvaluation(**evaluation.model_dump())
    db.add(db_eval)
    db.commit()
    db.refresh(db_eval)
    return db_eval

@router.get("/evaluations/{evaluation_id}", response_model=schemas.RegulatoryEvaluationResponse)
def get_evaluation(evaluation_id: UUID, db: Session = Depends(get_tenant_db), current_user: models.User = Depends(get_current_user)):
    db_eval = db.query(models.RegulatoryEvaluation).filter(models.RegulatoryEvaluation.id == evaluation_id).first()
    if not db_eval:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return db_eval
