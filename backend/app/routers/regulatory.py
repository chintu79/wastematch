from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user, get_tenant_db

router = APIRouter(prefix="/api/v1/compliance", tags=["compliance"])


@router.post(
    "/rules",
    response_model=schemas.RegulatoryRuleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_rule(
    rule: schemas.RegulatoryRuleCreate,
    db: Session = Depends(get_tenant_db),
    current_user: models.User = Depends(get_current_user),
):
    db_rule = models.RegulatoryRule(**rule.model_dump())
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule


@router.get(
    "/rules", response_model=schemas.PaginatedResponse[schemas.RegulatoryRuleResponse]
)
def get_rules(db: Session = Depends(get_tenant_db), page: int = 1, size: int = 50):
    query = db.query(models.RegulatoryRule)
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    return schemas.PaginatedResponse(data=items, total=total, page=page, size=size)


@router.post(
    "/evaluate",
    response_model=schemas.RegulatoryEvaluationResponse,
    status_code=status.HTTP_201_CREATED,
)
def evaluate_compliance(
    evaluation: schemas.RegulatoryEvaluationCreate,
    db: Session = Depends(get_tenant_db),
    current_user: models.User = Depends(get_current_user),
):
    db_eval = models.RegulatoryEvaluation(**evaluation.model_dump())
    db.add(db_eval)
    db.commit()
    db.refresh(db_eval)
    return db_eval


@router.get(
    "/evaluations/{evaluation_id}", response_model=schemas.RegulatoryEvaluationResponse
)
def get_evaluation(
    evaluation_id: UUID,
    db: Session = Depends(get_tenant_db),
    current_user: models.User = Depends(get_current_user),
):
    db_eval = (
        db.query(models.RegulatoryEvaluation)
        .filter(models.RegulatoryEvaluation.id == evaluation_id)
        .first()
    )
    if not db_eval:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return db_eval


@router.post(
    "/tracking",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
)
def record_tracking_event(
    entry: dict,
    db: Session = Depends(get_tenant_db),
    current_user: models.User = Depends(get_current_user),
):
    """Record an immutable compliance waste tracking log into partitioned table (Issue #68)."""
    log_record = models.WasteTrackingLog(**entry.model_dump())
    db.add(log_record)
    db.commit()
    db.refresh(log_record)
    return log_record


@router.get("/tracking", response_model=list[dict])
def get_tracking_logs(
    batch_id: UUID | None = None,
    event_type: str | None = None,
    db: Session = Depends(get_tenant_db),
    current_user: models.User = Depends(get_current_user),
):
    """Query partitioned waste tracking logs."""
    query = db.query(models.WasteTrackingLog)
    if batch_id:
        query = query.filter(models.WasteTrackingLog.batch_id == batch_id)
    if event_type:
        query = query.filter(models.WasteTrackingLog.event_type == event_type)
    return query.order_by(models.WasteTrackingLog.created_at.desc()).limit(100).all()


@router.post("/archive", response_model=dict)
def trigger_batch_archival(
    req: dict,
    db: Session = Depends(get_tenant_db),
    current_user: models.User = Depends(get_current_user),
):
    """Trigger offloading of completed material batches to S3 Data Lake Parquet (Issue #68)."""
    from ..archival_service import archive_completed_batches

    cutoff = req.cutoff_days or 90
    res = archive_completed_batches(
        db,
        cutoff_days=cutoff,
        batch_ids=req.batch_ids,
        dry_run=req.dry_run,
    )
    return res


@router.get("/partitions", response_model=list[str])
def get_partitions(
    table: str = "waste_tracking_logs",
    db: Session = Depends(get_tenant_db),
    current_user: models.User = Depends(get_current_user),
):
    """List native table partitions for tracking logs."""
    from ..partition_service import list_table_partitions

    return list_table_partitions(db, parent_table=table)
