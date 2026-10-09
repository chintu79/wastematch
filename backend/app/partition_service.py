"""PostgreSQL Native Table Partitioning Service (Issue #68).

Manages date-range partitioned tables for historical compliance and waste tracking logs,
ensuring retention records for 7+ years without degrading hot index performance.
"""

from datetime import datetime, timezone
from typing import Optional

import structlog
from sqlalchemy import text
from sqlalchemy.orm import Session

logger = structlog.get_logger()


def get_partition_name(parent_table: str, year: int) -> str:
    """Return canonical partition name for a given year."""
    return f"{parent_table}_y{year}"


def get_default_partition_name(parent_table: str) -> str:
    """Return canonical catch-all partition name."""
    return f"{parent_table}_default"


def create_yearly_partition_ddl(parent_table: str, year: int) -> str:
    """Generate DDL for a yearly RANGE partition in PostgreSQL."""
    part_name = get_partition_name(parent_table, year)
    start_date = f"{year}-01-01 00:00:00"
    end_date = f"{year + 1}-01-01 00:00:00"
    return (
        f"CREATE TABLE IF NOT EXISTS {part_name} "
        f"PARTITION OF {parent_table} "
        f"FOR VALUES FROM ('{start_date}') TO ('{end_date}');"
    )


def create_default_partition_ddl(parent_table: str) -> str:
    """Generate DDL for a catch-all DEFAULT partition in PostgreSQL."""
    part_name = get_default_partition_name(parent_table)
    return (
        f"CREATE TABLE IF NOT EXISTS {part_name} "
        f"PARTITION OF {parent_table} DEFAULT;"
    )


def detach_partition_ddl(parent_table: str, partition_name: str) -> str:
    """Generate DDL to detach a partition for archival or offloading."""
    return f"ALTER TABLE {parent_table} DETACH PARTITION {partition_name};"


def drop_partition_ddl(partition_name: str) -> str:
    """Generate DDL to drop a detached partition."""
    return f"DROP TABLE IF EXISTS {partition_name};"


def ensure_date_partitions(
    session: Session,
    parent_table: str = "waste_tracking_logs",
    start_year: Optional[int] = None,
    end_year: Optional[int] = None,
) -> list[str]:
    """Ensure yearly partitions and a default partition exist for the target table.

    Covers 7+ years of past and future compliance tracking requirements.
    In SQLite environments, partition DDL is safely skipped.
    """
    bind = session.get_bind()
    dialect_name = bind.dialect.name if bind else "unknown"

    if dialect_name != "postgresql":
        logger.debug(
            "skipping_partition_creation_non_postgres",
            dialect=dialect_name,
            table=parent_table,
        )
        return []

    current_year = datetime.now(timezone.utc).year
    start = start_year or (current_year - 2)
    end = end_year or (current_year + 8)  # Covers 7+ years ahead for compliance

    created_partitions: list[str] = []

    # 1. Ensure catch-all default partition exists
    default_ddl = create_default_partition_ddl(parent_table)
    try:
        session.execute(text(default_ddl))
        created_partitions.append(get_default_partition_name(parent_table))
    except Exception as exc:
        logger.warning(
            "failed_creating_default_partition",
            table=parent_table,
            error=str(exc),
        )

    # 2. Ensure yearly range partitions exist
    for yr in range(start, end + 1):
        ddl = create_yearly_partition_ddl(parent_table, yr)
        part_name = get_partition_name(parent_table, yr)
        try:
            session.execute(text(ddl))
            created_partitions.append(part_name)
        except Exception as exc:
            logger.warning(
                "failed_creating_yearly_partition",
                partition=part_name,
                error=str(exc),
            )

    session.commit()
    logger.info(
        "partitions_ensured",
        parent_table=parent_table,
        count=len(created_partitions),
        range=f"{start}-{end}",
    )
    return created_partitions


def list_table_partitions(session: Session, parent_table: str = "waste_tracking_logs") -> list[str]:
    """List child partitions attached to a partitioned PostgreSQL table."""
    bind = session.get_bind()
    if not bind or bind.dialect.name != "postgresql":
        return []

    query = text(
        """
        SELECT c.relname AS child_partition
        FROM pg_class c
        JOIN pg_inherits i ON i.inhrelid = c.oid
        WHERE i.inhparent = :table_name::regclass
        ORDER BY c.relname;
        """
    )
    try:
        res = session.execute(query, {"table_name": parent_table}).fetchall()
        return [row[0] for row in res]
    except Exception as exc:
        logger.warning("failed_listing_partitions", table=parent_table, error=str(exc))
        return []
