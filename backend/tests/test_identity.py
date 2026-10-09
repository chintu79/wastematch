def test_get_users_empty(client):
    response = client.get("/api/v1/users")
    assert response.status_code == 200
    assert len(response.json()) >= 1 # The test_user fixture creates one

def test_create_organization(client):
    org_data = {
        "name": "Test Org",
        "org_type": "PRODUCER",
        "registration_number": "12345",
        "tax_id": "TAX123"
    }
    response = client.post("/api/v1/organizations", json=org_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Org"
    assert "id" in data
