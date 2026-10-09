from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user, get_tenant_db

router = APIRouter(prefix="/api/v1/inquiries", tags=["inquiries"])

@router.post("/", response_model=schemas.InquiryResponse, status_code=status.HTTP_201_CREATED)
def create_inquiry(inquiry: schemas.InquiryCreate, db: Session = Depends(get_tenant_db), current_user: models.User = Depends(get_current_user)):
    db_inquiry = models.Inquiry(**inquiry.model_dump())
    db.add(db_inquiry)
    db.commit()
    db.refresh(db_inquiry)
    return db_inquiry

@router.get("/", response_model=schemas.PaginatedResponse[schemas.InquiryResponse])
def get_inquiries(db: Session = Depends(get_tenant_db), page: int = 1, size: int = 50):
    query = db.query(models.Inquiry)
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    return schemas.PaginatedResponse(data=items, total=total, page=page, size=size)
@router.get("/{inquiry_id}", response_model=schemas.InquiryResponse)
def get_inquiry(inquiry_id: UUID, db: Session = Depends(get_tenant_db), current_user: models.User = Depends(get_current_user)):
    inquiry = db.query(models.Inquiry).filter(models.Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return inquiry

@router.post("/{inquiry_id}/sample-requests", response_model=schemas.SampleRequestResponse, status_code=status.HTTP_201_CREATED)
def request_sample(inquiry_id: UUID, sample_req: schemas.SampleRequestCreate, db: Session = Depends(get_tenant_db), current_user: models.User = Depends(get_current_user)):
    if sample_req.inquiry_id != inquiry_id:
        raise HTTPException(status_code=400, detail="Inquiry ID mismatch")
    db_req = models.SampleRequest(**sample_req.model_dump())
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return db_req

@router.post("/{inquiry_id}/messages", response_model=schemas.InquiryMessageResponse, status_code=status.HTTP_201_CREATED)
def add_inquiry_message(inquiry_id: UUID, message: schemas.InquiryMessageCreate, db: Session = Depends(get_tenant_db), current_user: models.User = Depends(get_current_user)):
    inquiry = db.query(models.Inquiry).filter(models.Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
        
    db_msg = models.InquiryMessage(
        inquiry_id=inquiry_id,
        sender_user_id=current_user.id,
        **message.model_dump()
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

@router.get("/{inquiry_id}/messages", response_model=schemas.PaginatedResponse[schemas.InquiryMessageResponse])
def get_inquiry_messages(inquiry_id: UUID, db: Session = Depends(get_tenant_db), current_user: models.User = Depends(get_current_user), page: int = 1, size: int = 50):
    query = db.query(models.InquiryMessage).filter(models.InquiryMessage.inquiry_id == inquiry_id).order_by(models.InquiryMessage.created_at.asc())
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    return schemas.PaginatedResponse(data=items, total=total, page=page, size=size)
