from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/v1/materials", tags=["catalog"])

@router.post("/categories", response_model=schemas.MaterialCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(category: schemas.MaterialCategoryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_cat = models.MaterialCategory(**category.model_dump())
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

@router.get("/categories", response_model=List[schemas.MaterialCategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.MaterialCategory).all()

@router.post("/listings", response_model=schemas.MaterialListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(listing: schemas.MaterialListingCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_listing = models.MaterialListing(**listing.model_dump())
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)
    return new_listing

@router.get("/listings", response_model=List[schemas.MaterialListingResponse])
def get_listings(db: Session = Depends(get_db)):
    return db.query(models.MaterialListing).all()

@router.get("/listings/{listing_id}", response_model=schemas.MaterialListingResponse)
def get_listing(listing_id: UUID, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    listing = db.query(models.MaterialListing).filter(models.MaterialListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

@router.post("/listings/{listing_id}/batches", response_model=schemas.MaterialBatchResponse, status_code=status.HTTP_201_CREATED)
def create_batch(listing_id: UUID, batch: schemas.MaterialBatchCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if batch.listing_id != listing_id:
        raise HTTPException(status_code=400, detail="Listing ID mismatch")
    new_batch = models.MaterialBatch(**batch.model_dump())
    db.add(new_batch)
    db.commit()
    db.refresh(new_batch)
    return new_batch

@router.post("/batches/{batch_id}/measurements", response_model=schemas.BatchMeasurementResponse, status_code=status.HTTP_201_CREATED)
def add_measurement(batch_id: UUID, measurement: schemas.BatchMeasurementCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if measurement.batch_id != batch_id:
        raise HTTPException(status_code=400, detail="Batch ID mismatch")
    new_measurement = models.BatchMeasurement(**measurement.model_dump())
    db.add(new_measurement)
    db.commit()
    db.refresh(new_measurement)
    return new_measurement
