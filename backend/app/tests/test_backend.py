import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_endpoint():
    """Verify the API is alive and kicking."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_admin_login_invalid_credentials():
    """Ensure the security system blocks unauthorized admin attempts."""
    payload = {"email": "wrong_admin@test.com", "password": "BadPassword123"}
    response = client.post("/api/admin/login", json=payload)
    assert response.status_code == 401

def test_admin_login_success():
    """Verify valid admin credentials unlock the portal successfully."""
    payload = {"email": "admin@carrecon.com", "password": "SuperSecureAdminPassword2026"}
    response = client.post("/api/admin/login", json=payload)
    assert response.status_code == 200
    assert response.json()["role"] == "admin"

def test_admin_stats_loading():
    """Ensure the analytics engine parses the telemetry logs securely."""
    response = client.get("/api/admin/stats")
    assert response.status_code == 200
    assert "total_scans" in response.json()