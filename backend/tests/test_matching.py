import uuid
from types import SimpleNamespace

import pytest
from sqlalchemy.dialects import postgresql

from app import models, worker
from app.routers import matching as matching_router


class _RecordingDispatch:
    """Stand-in for the Celery task that records dispatches."""

    def __init__(self):
        self.calls = []

    def delay(self, *args):
        self.calls.append(args)


def _seed_property(db_session, code):
    prop = models.PropertyDefinition(
        code=code,
        name=code.title(),
        data_type=models.DataType.NUMERIC,
        canonical_unit="%",
    )
    db_session.add(prop)
    db_session.commit()
    return prop


def _create_batch(client, listing_id, reference):
    response = client.post(
        f"/api/v1/materials/listings/{listing_id}/batches",
        json={
            "listing_id": str(listing_id),
            "batch_reference": reference,
            "quantity": 100.0,
            "quantity_unit": "kg",
        },
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


def _add_measurement(client, batch_id, property_id, value):
    response = client.post(
        f"/api/v1/materials/batches/{batch_id}/measurements",
        json={
            "batch_id": str(batch_id),
            "property_definition_id": str(property_id),
            "numeric_value": value,
            "unit": "%",
        },
    )
    assert response.status_code == 201, response.text


@pytest.fixture
def match_env(client, db_session):
    org = client.post(
        "/api/v1/organizations",
        json={"legal_name": "Matcher Org", "organization_type": "PRODUCER"},
    )
    assert org.status_code == 201, org.text
    facility = client.post(
        "/api/v1/facilities",
        json={"organization_id": org.json()["id"], "name": "Main Facility"},
    )
    assert facility.status_code == 201, facility.text
    category = client.post(
        "/api/v1/materials/categories",
        json={"code": "MIXED-PLASTIC", "name": "Mixed Plastic"},
    )
    assert category.status_code == 201, category.text

    spec = client.post(
        "/api/v1/specifications/",
        json={
            "buyer_organization_id": org.json()["id"],
            "receiving_facility_id": facility.json()["id"],
            "target_category_id": category.json()["id"],
            "intended_use": "Recycling feedstock",
            "effective_from": "2026-01-01T00:00:00Z",
        },
    )
    assert spec.status_code == 201, spec.text
    spec_id = spec.json()["id"]

    # Property definitions have no API endpoint; seed them directly.
    purity = _seed_property(db_session, "PURITY")
    moisture = _seed_property(db_session, "MOISTURE")
    ash = _seed_property(db_session, "ASH")

    constraints = {
        purity: {
            "constraint_type": "HARD_LIMIT",
            "lower_bound": 90,
            "upper_bound": 100,
            "unit": "%",
            "missing_data_policy": "MANUAL_REVIEW",
        },
        moisture: {
            "constraint_type": "HARD_LIMIT",
            "upper_bound": 10,
            "unit": "%",
            "missing_data_policy": "MANUAL_REVIEW",
        },
        ash: {
            "constraint_type": "HARD_LIMIT",
            "lower_bound": 0,
            "upper_bound": 5,
            "unit": "%",
            "missing_data_policy": "HOLD",
        },
    }
    for prop, constraint in constraints.items():
        constraint["specification_id"] = spec_id
        constraint["property_definition_id"] = str(prop.id)
        response = client.post(
            f"/api/v1/specifications/{spec_id}/constraints", json=constraint
        )
        assert response.status_code == 201, response.text

    listing = client.post(
        "/api/v1/materials/listings",
        json={
            "producer_organization_id": org.json()["id"],
            "source_facility_id": facility.json()["id"],
            "material_category_id": category.json()["id"],
            "material_description": "Mixed plastic batches",
            "source_process": "Collection",
            "available_quantity": 1000.0,
            "quantity_unit": "kg",
        },
    )
    assert listing.status_code == 201, listing.text
    listing_id = listing.json()["id"]

    batches = {
        "pass": _create_batch(client, listing_id, "B-PASS"),
        "below_lower": _create_batch(client, listing_id, "B-BELOW-LOWER"),
        "above_upper": _create_batch(client, listing_id, "B-ABOVE-UPPER"),
        "over_moisture": _create_batch(client, listing_id, "B-OVER-MOISTURE"),
        "missing_ash_hold": _create_batch(client, listing_id, "B-MISSING-ASH"),
        "missing_moisture_manual": _create_batch(client, listing_id, "B-MISSING-MOISTURE"),
    }
    measurements = {
        "pass": [(purity, 95), (moisture, 5), (ash, 2)],
        "below_lower": [(purity, 85), (moisture, 5), (ash, 2)],
        "above_upper": [(purity, 105), (moisture, 5), (ash, 2)],
        "over_moisture": [(purity, 95), (moisture, 15), (ash, 2)],
        "missing_ash_hold": [(purity, 95), (moisture, 5)],
        "missing_moisture_manual": [(purity, 95), (ash, 2)],
    }
    for name, batch_id in batches.items():
        for prop, value in measurements[name]:
            _add_measurement(client, batch_id, prop.id, value)

    return SimpleNamespace(
        spec_id=spec_id,
        spec_uuid=uuid.UUID(spec_id),
        batches=batches,
        expected_survivors={batches["pass"], batches["missing_moisture_manual"]},
        db_session=db_session,
    )


def test_discover_excludes_hard_limit_violations(client, match_env, monkeypatch):
    dispatch = _RecordingDispatch()
    monkeypatch.setattr(matching_router, "process_match_evaluation_async", dispatch)

    response = client.post(
        "/api/v1/matches/discover",
        json={"buyer_specification_id": match_env.spec_id},
    )
    assert response.status_code == 202
    data = response.json()

    # Six batches seeded: two survive, four are excluded in SQL
    # (range below/above, one-sided upper, missing HOLD measurement).
    assert data["batches_scanned"] == 6
    assert data["candidates_found"] == 2
    assert data["candidates_excluded"] == 4
    assert data["evaluations_queued"] == 2
    assert set(data["queued_batch_ids"]) == match_env.expected_survivors

    # One Celery dispatch per queued candidate, each referencing its
    # pending evaluation record.
    assert len(dispatch.calls) == 2
    dispatched_evaluation_ids = {call[0] for call in dispatch.calls}
    rows = (
        match_env.db_session.query(models.MatchEvaluation)
        .filter(models.MatchEvaluation.buyer_specification_id == match_env.spec_uuid)
        .all()
    )
    assert len(rows) == 2
    assert {str(row.id) for row in rows} == dispatched_evaluation_ids
    assert {str(row.material_batch_id) for row in rows} == match_env.expected_survivors
    assert all(
        row.technical_status == models.TechnicalStatus.PENDING for row in rows
    )


def test_sql_prefilter_equals_python_engine(match_env, db_session):
    """The SQL pre-filter must select exactly the batches the Python
    engine would not mark INCOMPATIBLE (Issue #53 equivalence)."""
    survivors = {
        str(batch_id)
        for batch_id in db_session.scalars(
            matching_router.build_candidate_query(match_env.spec_uuid)
        ).all()
    }
    assert survivors == match_env.expected_survivors

    for batch in db_session.query(models.MaterialBatch).all():
        tech_status, _, _ = worker.evaluate_technical_constraints(
            db_session, batch.id, match_env.spec_uuid
        )
        assert (str(batch.id) in survivors) == (
            tech_status != models.TechnicalStatus.INCOMPATIBLE
        ), batch.batch_reference


def test_candidate_query_pushes_between_into_sql():
    statement = matching_router.build_candidate_query(uuid.uuid4())
    sql = str(statement.compile(dialect=postgresql.dialect()))
    assert "BETWEEN" in sql
    assert "NOT (EXISTS" in sql
    assert "batch_measurements" in sql
    assert "specification_constraints" in sql
    # No per-batch Python loop: the exclusion happens in one statement.
    assert sql.count("SELECT") >= 2  # outer candidates + correlated EXISTS


def test_discover_respects_limit(client, match_env, monkeypatch):
    dispatch = _RecordingDispatch()
    monkeypatch.setattr(matching_router, "process_match_evaluation_async", dispatch)

    response = client.post(
        "/api/v1/matches/discover",
        json={"buyer_specification_id": match_env.spec_id, "limit": 1},
    )
    assert response.status_code == 202
    data = response.json()
    assert data["candidates_found"] == 2
    assert data["evaluations_queued"] == 1
    assert len(data["queued_batch_ids"]) == 1
    assert data["queued_batch_ids"][0] in match_env.expected_survivors
    assert len(dispatch.calls) == 1

    invalid = client.post(
        "/api/v1/matches/discover",
        json={"buyer_specification_id": match_env.spec_id, "limit": 0},
    )
    assert invalid.status_code == 422


def test_discover_unknown_specification_returns_404(client):
    response = client.post(
        "/api/v1/matches/discover",
        json={"buyer_specification_id": str(uuid.uuid4())},
    )
    assert response.status_code == 404
