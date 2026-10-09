from pydantic import BaseModel


class BatchReserveRequest(BaseModel):
    quantity: float


def patch_catalog():
    with open("backend/app/routers/catalog.py", "r") as f:
        content = f.read()

    # Add reserve endpoint
    reserve_code = """
@router.post("/batches/{batch_id}/reserve", response_model=schemas.MaterialBatchResponse)
def reserve_batch(batch_id: UUID, req: schemas.BatchReserveRequest, db: Session = Depends(get_tenant_db), current_user: models.User = Depends(get_current_user)):
    # Pessimistic locking to prevent double-sell race conditions
    batch = db.query(models.MaterialBatch).filter(models.MaterialBatch.id == batch_id).with_for_update().first()
    
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
        
    if batch.batch_status != models.BatchStatus.AVAILABLE:
        raise HTTPException(status_code=400, detail="Batch is not available")
        
    if req.quantity > batch.quantity:
        raise HTTPException(status_code=400, detail="Requested quantity exceeds available batch quantity")
        
    batch.quantity -= req.quantity
    
    if batch.quantity == 0:
        batch.batch_status = models.BatchStatus.RESERVED
        
    db.commit()
    db.refresh(batch)
    return batch
"""
    if "def reserve_batch" not in content:
        content += reserve_code
        with open("backend/app/routers/catalog.py", "w") as f:
            f.write(content)


if __name__ == "__main__":
    patch_catalog()
