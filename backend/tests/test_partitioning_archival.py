"""Comprehensive tests for Database Partitioning & S3 Data Lake Archival Strategy (Issue #68).

Tests:
1. Native table partitioning DDL generation and partition management service.
2. WasteTrackingLog model behavior and date-range partitioned schemas.
3. Parquet serialization and PyArrow validation.
4. S3 Data Lake archival service offloading completed batches.
5. Celery tasks for scheduled archival and partition maintenance.
6. Compliance API endpoints for tracking logs and archival triggers.
"""

import io
import json

import pyarrow.parquet as pq

from app import models
from app.archival_service import (
    archive_completed_batches,
    serialize_batches_to_parquet,
    upload_parquet_to_data_lake,
)
from app.partition_service import (
    create_default_partition_ddl,
    create_yearly_partition_ddl,
    detach_partition_ddl,
    drop_partition_ddl,
    ensure_date_partitions,
    get_default_partition_name,
    get_partition_name,
)
from app.worker import (
    archive_completed_batches_to_data_lake,
    maintain_database_partitions,
)


def test_partition_ddl_generation():
    """Verify correct PostgreSQL DDL syntax for date-range partitioning."""
    table = "waste_tracking_logs"
    ddl_2026 = create_yearly_partition_ddl(table, 2026)
    assert "waste_tracking_logs_y2026" in ddl_2026
    assert "FOR VALUES FROM ('2026-01-01 00:00:00') TO ('2027-01-01 00:00:00')" in ddl_2026

    default_ddl = create_default_partition_ddl(table)
    assert "waste_tracking_logs_default" in default_ddl
    assert "DEFAULT" in default_ddl

    detach_ddl = detach_partition_ddl(table, "waste_tracking_logs_y2024")
    assert "ALTER TABLE waste_tracking_logs DETACH PARTITION waste_tracking_logs_y2024;" == detach_ddl

    drop_ddl = drop_partition_ddl("waste_tracking_logs_y2024")
    assert "DROP TABLE IF EXISTS waste_tracking_logs_y2024;" == drop_ddl

    assert get_partition_name(table, 2028) == "waste_tracking_logs_y2028"
    assert get_default_partition_name(table) == "waste_tracking_logs_default"


def test_ensure_date_partitions_non_postgres(db_session):
    """Verify partition manager safely handles non-postgres environments without crashing."""
    created = ensure_date_partitions(db_session, "waste_tracking_logs")
    assert isinstance(created, list)


def test_parquet_serialization_structure(db_session):
    """Verify material batches serialize into valid Apache Parquet binaries with all required fields."""
    org = models.Organization(legal_name="Industrial Recovery Corp", organization_type=models.OrgType.PRODUCER)
    db_session.add(org)
    db_session.commit()
    db_session.refresh(org)

    fac = models.Facility(organization_id=org.id, name="Plant Alpha")
    db_session.add(fac)
    cat = models.MaterialCategory(code="SLAG-02", name="Steel Slag")
    db_session.add(cat)
    db_session.commit()
    db_session.refresh(fac)
    db_session.refresh(cat)

    listing = models.MaterialListing(
        producer_organization_id=org.id,
        source_facility_id=fac.id,
        material_category_id=cat.id,
        material_description="Refined converter slag",
        source_process="Steelmaking",
        available_quantity=250.0,
        quantity_unit="MT",
    )
    db_session.add(listing)
    db_session.commit()
    db_session.refresh(listing)

    batch = models.MaterialBatch(
        listing_id=listing.id,
        batch_reference="BATCH-ARCHIVE-001",
        quantity=250.0,
        quantity_unit="MT",
        batch_status=models.BatchStatus.CONSUMED,
        properties={"iron_content": 42.5, "calcium_oxide": 33.1},
    )
    db_session.add(batch)
    db_session.commit()
    db_session.refresh(batch)

    # Serialize
    parquet_bytes = serialize_batches_to_parquet([batch])
    assert isinstance(parquet_bytes, bytes)
    assert len(parquet_bytes) > 0

    # Read back and inspect columns
    buf = io.BytesIO(parquet_bytes)
    table = pq.read_table(buf)
    assert table.num_rows == 1
    assert "batch_id" in table.column_names
    assert "batch_reference" in table.column_names
    assert "properties_json" in table.column_names
    assert "archived_at" in table.column_names

    read_dict = table.to_pylist()[0]
    assert read_dict["batch_reference"] == "BATCH-ARCHIVE-001"
    assert read_dict["batch_status"] == "CONSUMED"
    parsed_props = json.loads(read_dict["properties_json"])
    assert parsed_props["iron_content"] == 42.5


def test_upload_parquet_to_data_lake():
    """Verify Parquet bytes upload returns a valid URI."""
    test_bytes = b"PAR1test_parquet_content"
    uri = upload_parquet_to_data_lake(test_bytes, bucket_name="test-lake-bucket")
    assert uri.startswith(("s3://", "file://"))
    assert "batch_archive_" in uri
    assert uri.endswith(".parquet")


def test_archive_completed_batches_lifecycle(db_session):
    """Verify end-to-end archival: identifies batch, exports to Parquet, updates status, and logs event."""
    org = models.Organization(legal_name="Green Metals Ltd", organization_type=models.OrgType.PRODUCER)
    db_session.add(org)
    db_session.commit()
    db_session.refresh(org)

    fac = models.Facility(organization_id=org.id, name="Smelter 1")
    db_session.add(fac)
    cat = models.MaterialCategory(code="ALUM-01", name="Aluminium Dross")
    db_session.add(cat)
    db_session.commit()
    db_session.refresh(fac)
    db_session.refresh(cat)

    listing = models.MaterialListing(
        producer_organization_id=org.id,
        source_facility_id=fac.id,
        material_category_id=cat.id,
        material_description="Aluminium dross byproduct",
        source_process="Smelting",
        available_quantity=80.0,
        quantity_unit="MT",
    )
    db_session.add(listing)
    db_session.commit()
    db_session.refresh(listing)

    # 1. Batch consumed
    batch = models.MaterialBatch(
        listing_id=listing.id,
        batch_reference="BATCH-TO-ARCHIVE",
        quantity=80.0,
        quantity_unit="MT",
        batch_status=models.BatchStatus.CONSUMED,
        properties={"grade": "A"},
    )
    db_session.add(batch)
    db_session.commit()
    db_session.refresh(batch)

    # 2. Dry run first
    dry_result = archive_completed_batches(db_session, cutoff_days=0, dry_run=True)
    assert dry_result["status"] == "dry_run"
    assert dry_result["archived_count"] >= 1

    # Batch should still not be marked archived
    db_session.refresh(batch)
    assert batch.is_archived is False

    # 3. Real archival execution
    arch_result = archive_completed_batches(db_session, cutoff_days=0, batch_ids=[batch.id])
    assert arch_result["status"] == "success"
    assert arch_result["archived_count"] == 1
    assert arch_result["s3_uri"] is not None

    # Verify batch state in database
    db_session.refresh(batch)
    assert batch.is_archived is True
    assert batch.batch_status == models.BatchStatus.ARCHIVED
    assert batch.archived_at is not None
    assert batch.archive_s3_uri == arch_result["s3_uri"]

    # Verify WasteTrackingLog entry was written
    logs = (
        db_session.query(models.WasteTrackingLog)
        .filter(models.WasteTrackingLog.event_type == "BATCH_ARCHIVED_TO_DATA_LAKE")
        .all()
    )
    assert len(logs) >= 1
    latest_log = logs[-1]
    assert latest_log.payload["s3_uri"] == arch_result["s3_uri"]
    assert str(batch.id) in latest_log.payload["batch_ids"]


def test_celery_archival_and_partition_tasks(monkeypatch):
    """Verify Celery tasks run successfully without unhandled exceptions."""
    # Test partition maintenance task
    res_part = maintain_database_partitions()
    assert res_part["status"] == "success"

    # Test batch archival task (dry run)
    res_arch = archive_completed_batches_to_data_lake(cutoff_days=365, dry_run=True)
    assert res_arch["status"] in ("dry_run", "noop")


def test_compliance_api_tracking_and_archival(client):
    """Verify API endpoints for recording/querying tracking logs and triggering archival."""
    # 1. Record tracking event
    log_payload = {
        "event_type": "DISPATCH_MANIFEST_GENERATED",
        "summary": "Carrier manifest generated for safe waste transit",
        "payload": {"carrier": "SecureTrans Logistics", "vehicle_reg": "MH-12-AB-1234"},
    }
    res = client.post("/api/v1/compliance/tracking", json=log_payload)
    assert res.status_code == 201, res.text
    log_data = res.json()
    assert log_data["event_type"] == "DISPATCH_MANIFEST_GENERATED"
    assert log_data["summary"] == "Carrier manifest generated for safe waste transit"
    log_id = log_data["id"]

    # 2. Query tracking events
    res = client.get("/api/v1/compliance/tracking?event_type=DISPATCH_MANIFEST_GENERATED")
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 1
    assert any(i["id"] == log_id for i in items)

    # 3. Trigger archival via API (dry run)
    arch_payload = {"cutoff_days": 180, "dry_run": True}
    res = client.post("/api/v1/compliance/archive", json=arch_payload)
    assert res.status_code == 200
    res_json = res.json()
    assert res_json["status"] in ("dry_run", "noop")

    # 4. List partitions endpoint
    res = client.get("/api/v1/compliance/partitions")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
