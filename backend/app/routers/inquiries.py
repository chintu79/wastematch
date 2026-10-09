from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/v1/inquiries", tags=["inquiries"])

@router.post("/", response_model=schemas.InquiryResponse, status_code=status.HTTP_201_CREATED)
def create_inquiry(inquiry: schemas.InquiryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_inquiry = models.Inquiry(**inquiry.model_dump())
    db.add(db_inquiry)
    db.commit()
    db.refresh(db_inquiry)
    return db_inquiry

@router.get("/", response_model=List[schemas.InquiryResponse])
def get_inquiries(db: Session = Depends(get_db)):
    return db.query(models.Inquiry).all()

@router.get("/{inquiry_id}", response_model=schemas.InquiryResponse)
def get_inquiry(inquiry_id: UUID, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    inquiry = db.query(models.Inquiry).filter(models.Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return inquiry

@router.post("/{inquiry_id}/sample-requests", response_model=schemas.SampleRequestResponse, status_code=status.HTTP_201_CREATED)
def request_sample(inquiry_id: UUID, sample_req: schemas.SampleRequestCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if sample_req.inquiry_id != inquiry_id:
        raise HTTPException(status_code=400, detail="Inquiry ID mismatch")
    db_req = models.SampleRequest(**sample_req.model_dump())
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return db_req
