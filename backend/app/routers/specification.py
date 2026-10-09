from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user, get_tenant_db

router = APIRouter(prefix="/api/v1/specifications", tags=["specifications"])


@router.post(
    "/",
    response_model=schemas.BuyerSpecificationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_specification(
    spec: schemas.BuyerSpecificationCreate,
    db: Session = Depends(get_tenant_db),
    current_user: models.User = Depends(get_current_user),
):
    db_spec = models.BuyerSpecification(**spec.model_dump())
    db.add(db_spec)
    db.commit()
    db.refresh(db_spec)
    return db_spec


@router.get(
    "/", response_model=schemas.PaginatedResponse[schemas.BuyerSpecificationResponse]
)
def get_specifications(
    db: Session = Depends(get_tenant_db), page: int = 1, size: int = 50
):
    query = db.query(models.BuyerSpecification)
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    return schemas.PaginatedResponse(data=items, total=total, page=page, size=size)


@router.get("/{spec_id}", response_model=schemas.BuyerSpecificationResponse)
def get_specification(
    spec_id: UUID,
    db: Session = Depends(get_tenant_db),
    current_user: models.User = Depends(get_current_user),
):
    db_spec = (
        db.query(models.BuyerSpecification)
        .filter(models.BuyerSpecification.id == spec_id)
        .first()
    )
    if not db_spec:
        raise HTTPException(status_code=404, detail="Specification not found")
    return db_spec


@router.post(
    "/{spec_id}/constraints",
    response_model=schemas.SpecificationConstraintResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_constraint(
    spec_id: UUID,
    constraint: schemas.SpecificationConstraintCreate,
    db: Session = Depends(get_tenant_db),
    current_user: models.User = Depends(get_current_user),
):
    if constraint.specification_id != spec_id:
        raise HTTPException(status_code=400, detail="Specification ID mismatch")
    db_constraint = models.SpecificationConstraint(**constraint.model_dump())
    db.add(db_constraint)
    db.commit()
    db.refresh(db_constraint)
    return db_constraint
