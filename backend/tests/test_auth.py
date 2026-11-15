import pytest
from fastapi.testclient import TestClient


def test_register_user_success(client: TestClient):
    payload = {
        "name": "Alice Trader",
        "email": "alice@example.com",
        "password": "Password123!",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "alice@example.com"
    assert data["user"]["name"] == "Alice Trader"


def test_register_duplicate_email(client: TestClient):
    payload = {
        "name": "Duplicate User",
        "email": "duplicate@example.com",
        "password": "Password123!",
    }
    resp1 = client.post("/api/auth/register", json=payload)
    assert resp1.status_code == 201

    resp2 = client.post("/api/auth/register", json=payload)
    assert resp2.status_code == 400
    assert "already exists" in resp2.json()["detail"]


def test_login_success(client: TestClient):
    # Register first
    client.post(
        "/api/auth/register",
        json={"name": "Bob", "email": "bob@example.com", "password": "SecurePassword1"},
    )

    login_payload = {"email": "bob@example.com", "password": "SecurePassword1"}
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "bob@example.com"


def test_login_invalid_credentials(client: TestClient):
    response = client.post(
        "/api/auth/login",
        json={"email": "nonexistent@example.com", "password": "WrongPassword"},
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_get_current_user_me(client: TestClient, auth_headers: dict):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "trader@example.com"
    assert data["name"] == "Test Trader"


def test_get_current_user_unauthorized(client: TestClient):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
