from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user, get_tenant_db
from ..database import get_db

router = APIRouter(prefix="/api/v1", tags=["identity"])

@router.post("/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_tenant_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = models.User(**user.model_dump())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/users/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: UUID, db: Session = Depends(get_tenant_db), current_user: models.User = Depends(get_current_user)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.post("/organizations", response_model=schemas.OrganizationResponse, status_code=status.HTTP_201_CREATED)
def create_organization(org: schemas.OrganizationCreate, db: Session = Depends(get_tenant_db), current_user: models.User = Depends(get_current_user)):
    new_org = models.Organization(**org.model_dump())
    db.add(new_org)
    db.commit()
    db.refresh(new_org)
    return new_org

@router.get("/organizations/{org_id}", response_model=schemas.OrganizationResponse)
def get_organization(org_id: UUID, db: Session = Depends(get_tenant_db), current_user: models.User = Depends(get_current_user)):
    db_org = db.query(models.Organization).filter(models.Organization.id == org_id).first()
    if not db_org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return db_org

@router.post("/facilities", response_model=schemas.FacilityResponse, status_code=status.HTTP_201_CREATED)
def create_facility(facility: schemas.FacilityCreate, db: Session = Depends(get_tenant_db), current_user: models.User = Depends(get_current_user)):
    db_org = db.query(models.Organization).filter(models.Organization.id == facility.organization_id).first()
    if not db_org:
        raise HTTPException(status_code=404, detail="Organization not found")
    new_facility = models.Facility(**facility.model_dump())
    db.add(new_facility)
    db.commit()
    db.refresh(new_facility)
    return new_facility
