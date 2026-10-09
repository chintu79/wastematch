from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user, get_tenant_db
from ..database import get_db
from ..limiter import limiter

router = APIRouter(prefix="/api/v1/materials", tags=["catalog"])

@router.post("/categories", response_model=schemas.MaterialCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(category: schemas.MaterialCategoryCreate, db: Session = Depends(get_tenant_db), current_user: models.User = Depends(get_current_user)):
    db_cat = models.MaterialCategory(**category.model_dump())
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

@router.get("/categories", response_model=list[schemas.MaterialCategoryResponse])
def get_categories(db: Session = Depends(get_tenant_db)):
    return db.query(models.MaterialCategory).all()

@router.post("/listings", response_model=schemas.MaterialListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(listing: schemas.MaterialListingCreate, db: Session = Depends(get_tenant_db), current_user: models.User = Depends(get_current_user)):
    new_listing = models.MaterialListing(**listing.model_dump())
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)
    return new_listing

@router.get("/listings", response_model=list[schemas.MaterialListingResponse])
@limiter.limit("60/minute")
def get_listings(request: Request, db: Session = Depends(get_tenant_db)):    return db.query(models.MaterialListing).all()

@router.get("/listings/{listing_id}", response_model=schemas.MaterialListingResponse)
def get_listing(listing_id: UUID, db: Session = Depends(get_tenant_db), current_user: models.User = Depends(get_current_user)):
    listing = db.query(models.MaterialListing).filter(models.MaterialListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

@router.post("/listings/{listing_id}/batches", response_model=schemas.MaterialBatchResponse, status_code=status.HTTP_201_CREATED)
def create_batch(listing_id: UUID, batch: schemas.MaterialBatchCreate, db: Session = Depends(get_tenant_db), current_user: models.User = Depends(get_current_user)):
    if batch.listing_id != listing_id:
        raise HTTPException(status_code=400, detail="Listing ID mismatch")
    new_batch = models.MaterialBatch(**batch.model_dump())
    db.add(new_batch)
    db.commit()
    db.refresh(new_batch)
    return new_batch

@router.patch("/batches/{batch_id}/properties", response_model=schemas.MaterialBatchResponse)
def update_batch_properties(batch_id: UUID, properties: dict, db: Session = Depends(get_tenant_db), current_user: models.User = Depends(get_current_user)):
    batch = db.query(models.MaterialBatch).filter(models.MaterialBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    # Merge new properties with existing
    current_props = batch.properties or {}
    current_props.update(properties)
    batch.properties = current_props
    
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(batch, "properties")
    
    db.commit()
    db.refresh(batch)
    return batch
