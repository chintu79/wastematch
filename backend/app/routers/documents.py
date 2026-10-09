from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])

@router.post("/", response_model=schemas.DocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_document_metadata(doc: schemas.DocumentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_doc = models.Document(**doc.model_dump())
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc

@router.get("/{document_id}", response_model=schemas.DocumentResponse)
def get_document(document_id: UUID, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc
