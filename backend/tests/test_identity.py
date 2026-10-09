def test_get_user_by_id(client, test_user):
    # The API exposes single-user reads (GET /users/{user_id}); there is no
    # user-list endpoint.
    response = client.get(f"/api/v1/users/{test_user.id}")
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
