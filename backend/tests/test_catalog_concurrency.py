import pytest
from app.main import app

def test_reserve_batch(client):
    # First create org
    org_resp = client.post("/api/v1/organizations", json={"name": "Org2", "org_type": "PRODUCER", "registration_number": "2"})
    org_id = org_resp.json()["id"]
    
    # Create facility
    fac_resp = client.post("/api/v1/facilities", json={"organization_id": org_id, "name": "Fac2", "address_line1": "123", "city": "City", "country": "Country"})
    fac_id = fac_resp.json()["id"]
    
    # Create category
    cat_resp = client.post("/api/v1/materials/categories", json={"name": "Cat2"})
    cat_id = cat_resp.json()["id"]
    
    listing_data = {
        "organization_id": org_id,
        "facility_id": fac_id,
        "category_id": cat_id,
        "title": "Batch Reserve Test",
        "description": "Desc"
    }
    list_resp = client.post("/api/v1/materials/listings", json=listing_data)
    list_id = list_resp.json()["id"]
    
    batch_data = {
        "batch_reference": "REF1",
        "quantity": 100.0,
        "quantity_unit": "TONS"
    }
    batch_resp = client.post(f"/api/v1/materials/listings/{list_id}/batches", json=batch_data)
    batch_id = batch_resp.json()["id"]
    
    # Reserve some
    res1 = client.post(f"/api/v1/materials/batches/{batch_id}/reserve", json={"quantity": 40.0})
    assert res1.status_code == 200
    assert res1.json()["quantity"] == 60.0
    
    # Reserve too much
    res2 = client.post(f"/api/v1/materials/batches/{batch_id}/reserve", json={"quantity": 70.0})
    assert res2.status_code == 400
    
    # Reserve the rest
    res3 = client.post(f"/api/v1/materials/batches/{batch_id}/reserve", json={"quantity": 60.0})
    assert res3.status_code == 200
    assert res3.json()["quantity"] == 0.0
    assert res3.json()["batch_status"] == "RESERVED"
    
