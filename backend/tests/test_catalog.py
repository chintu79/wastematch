def test_create_material_category(client):
    cat_data = {
        "name": "Plastic Waste",
        "description": "Various plastics"
    }
    response = client.post("/api/v1/categories", json=cat_data)
    assert response.status_code == 201
    assert response.json()["name"] == "Plastic Waste"

def test_create_listing(client):
    # First create org
    org_resp = client.post("/api/v1/organizations", json={"name": "Org", "org_type": "PRODUCER", "registration_number": "1"})
    org_id = org_resp.json()["id"]
    
    # Create facility
    fac_resp = client.post("/api/v1/facilities", json={"organization_id": org_id, "name": "Fac", "address_line1": "123", "city": "City", "country": "Country"})
    fac_id = fac_resp.json()["id"]
    
    # Create category
    cat_resp = client.post("/api/v1/categories", json={"name": "Cat"})
    cat_id = cat_resp.json()["id"]
    
    listing_data = {
        "organization_id": org_id,
        "facility_id": fac_id,
        "category_id": cat_id,
        "title": "Clean PET Bottles",
        "description": "Baled PET bottles"
    }
    response = client.post("/api/v1/listings", json=listing_data)
    assert response.status_code == 201
    assert response.json()["title"] == "Clean PET Bottles"
