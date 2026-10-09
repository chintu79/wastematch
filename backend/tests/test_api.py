def test_read_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the WasteMatch API"}

def test_health_liveness(client):
    response = client.get("/health/liveness")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
