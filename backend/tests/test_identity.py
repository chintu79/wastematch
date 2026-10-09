
def test_create_organization(client):
    org_data = {
        "legal_name": "Test Org",
        "organization_type": "PRODUCER"
    }
    response = client.post("/api/v1/organizations", json=org_data)
    assert response.status_code == 201
    data = response.json()
    assert data["legal_name"] == "Test Org"
    assert "id" in data
