def test_get_users_empty(client):
    response = client.get("/api/v1/users")
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"


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
