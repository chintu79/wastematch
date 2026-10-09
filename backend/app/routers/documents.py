import os
import uuid
from uuid import UUID

import boto3
from botocore.exceptions import ClientError
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])

# Configuration is validated at startup via app.config (Issue #38); the
# mock credentials only apply outside production, where app.config
# enforces real S3 credentials.
settings = get_settings()

AWS_ACCESS_KEY_ID = settings.AWS_ACCESS_KEY_ID or "mock-access-key"
AWS_SECRET_ACCESS_KEY = settings.AWS_SECRET_ACCESS_KEY or "mock-secret-key"
AWS_REGION = settings.AWS_REGION
S3_BUCKET_NAME = settings.S3_BUCKET_NAME or "wastematch-documents-dev"

s3_client = boto3.client(
    's3',
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    endpoint_url=settings.S3_ENDPOINT_URL # Useful for MinIO/Localstack
)

@router.post("/presigned-url", status_code=status.HTTP_200_OK)
def generate_presigned_url(filename: str, content_type: str, current_user: models.User = Depends(get_current_user)):
    """
    Generate a pre-signed POST URL to allow the frontend to upload a file directly to S3.
    """
    # Create a unique S3 key using UUID to prevent collisions
    file_extension = filename.split(".")[-1] if "." in filename else ""
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    s3_key = f"uploads/{current_user.id}/{unique_filename}"

    try:
        presigned_post = s3_client.generate_presigned_post(
            Bucket=S3_BUCKET_NAME,
            Key=s3_key,
            Fields={"Content-Type": content_type},
            Conditions=[
                {"Content-Type": content_type},
                ["content-length-range", 1, 10485760] # 10MB limit
            ],
            ExpiresIn=3600 # 1 hour
        )
        return {"presigned_post": presigned_post, "s3_key": s3_key}
    except ClientError:
        raise HTTPException(status_code=500, detail="Could not generate presigned URL")

@router.post("/direct-upload", response_model=schemas.DocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_file_direct(
    document_type: models.DocumentType,
    owner_organization_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Fallback endpoint to upload a file directly through the FastAPI server to S3.
    """
    file_extension = file.filename.split(".")[-1] if "." in file.filename else ""
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    s3_key = f"uploads/{current_user.id}/{unique_filename}"
    
    try:
        s3_client.upload_fileobj(
            file.file,
            S3_BUCKET_NAME,
            s3_key,
            ExtraArgs={"ContentType": file.content_type}
        )
    except Exception:
        raise HTTPException(status_code=500, detail="File upload to S3 failed")
    
    # Save metadata to database
    db_doc = models.Document(
        owner_organization_id=owner_organization_id,
        document_type=document_type,
        s3_key=s3_key,
        original_filename=file.filename,
        file_size=file.size or 0,
        content_type=file.content_type,
        document_status=models.DocumentStatus.ACTIVE
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc

@router.post("/", response_model=schemas.DocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_document_metadata(doc: schemas.DocumentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Register document metadata after a successful frontend direct-to-S3 upload using the presigned URL.
    """
    db_doc = models.Document(**doc.model_dump())
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc

@router.get("/{document_id}", response_model=schemas.DocumentResponse)
def get_document(document_id: UUID, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    doc = db.query(models.Document).filter(models.Document.id == document_id, models.Document.is_deleted == False).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.post("/{document_id}/access", response_model=schemas.DocumentAccessResponse)
def grant_document_access(document_id: UUID, access_req: schemas.DocumentAccessCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    doc = db.query(models.Document).filter(models.Document.id == document_id, models.Document.is_deleted == False).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    access = models.DocumentAccess(
        document_id=document_id,
        granted_to_organization_id=access_req.granted_to_organization_id,
        granted_by_user_id=current_user.id,
        expires_at=access_req.expires_at
    )
    db.add(access)
    db.commit()
    db.refresh(access)
    return access

@router.delete("/{document_id}/access/{access_id}")
def revoke_document_access(document_id: UUID, access_id: UUID, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    access = db.query(models.DocumentAccess).filter(
        models.DocumentAccess.id == access_id,
        models.DocumentAccess.document_id == document_id
    ).first()
    
    if not access:
        raise HTTPException(status_code=404, detail="Access record not found")
        
    access.is_revoked = True
    from datetime import datetime
    access.revoked_at = datetime.utcnow()
    db.commit()
    return {"status": "success", "message": "Access revoked successfully"}

@router.delete("/{document_id}")
def delete_document(document_id: UUID, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    doc = db.query(models.Document).filter(models.Document.id == document_id, models.Document.is_deleted == False).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc.is_deleted = True
    from datetime import datetime
    doc.deleted_at = datetime.utcnow()
    db.commit()
    return {"status": "success", "message": "Document soft-deleted successfully"}
