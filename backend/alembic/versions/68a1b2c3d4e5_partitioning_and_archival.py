"""Implement table partitioning for tracking logs and archival strategy (Issue #68).

Revision ID: 68a1b2c3d4e5
Revises: None
Create Date: 2026-10-09 13:42:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "68a1b2c3d4e5"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    dialect = bind.dialect.name if bind else "unknown"

    # 1. Add archival columns to material_batches
    with op.batch_alter_table("material_batches") as batch_op:
        batch_op.add_column(
            sa.Column("is_archived", sa.Boolean(), server_default=sa.text("false"), nullable=True)
        )
        batch_op.add_column(sa.Column("archived_at", sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column("archive_s3_uri", sa.String(), nullable=True))

    # 2. Create partitioned waste_tracking_logs table
    if dialect == "postgresql":
        op.execute(
            """
            CREATE TABLE IF NOT EXISTS waste_tracking_logs (
                id UUID NOT NULL,
                created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc'),
                batch_id UUID,
                listing_id UUID,
                organization_id UUID,
                facility_id UUID,
                event_type VARCHAR NOT NULL,
                summary VARCHAR NOT NULL,
                payload JSONB DEFAULT '{}'::jsonb,
                PRIMARY KEY (id, created_at)
            ) PARTITION BY RANGE (created_at);
            """
        )
        # Ensure default catch-all partition
        op.execute(
            """
            CREATE TABLE IF NOT EXISTS waste_tracking_logs_default
            PARTITION OF waste_tracking_logs DEFAULT;
            """
        )
        # Pre-create yearly partitions for past 2 years and 10 upcoming years (7+ years compliance)
        for yr in range(2024, 2036):
            start_date = f"{yr}-01-01 00:00:00"
            end_date = f"{yr + 1}-01-01 00:00:00"
            op.execute(
                f"""
                CREATE TABLE IF NOT EXISTS waste_tracking_logs_y{yr}
                PARTITION OF waste_tracking_logs
                FOR VALUES FROM ('{start_date}') TO ('{end_date}');
                """
            )
    else:
        # SQLite / generic SQL fallback
        op.create_table(
            "waste_tracking_logs",
            sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("batch_id", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("listing_id", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("facility_id", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("event_type", sa.String(), nullable=False),
            sa.Column("summary", sa.String(), nullable=False),
            sa.Column("payload", sa.JSON(), nullable=True),
            sa.PrimaryKeyConstraint("id", "created_at"),
        )


def downgrade() -> None:
    op.drop_table("waste_tracking_logs")
    with op.batch_alter_table("material_batches") as batch_op:
        batch_op.drop_column("archive_s3_uri")
        batch_op.drop_column("archived_at")
        batch_op.drop_column("is_archived")
