from fastapi.testclient import TestClient


def test_get_empty_portfolio(client: TestClient, auth_headers: dict):
    response = client.get("/api/portfolio", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_invested"] == 0.0
    assert data["total_current_value"] == 0.0
    assert data["total_holdings_count"] == 0
    assert data["holdings"] == []


def test_create_portfolio_holding(client: TestClient, auth_headers: dict):
    payload = {
        "symbol": "AAPL",
        "company_name": "Apple Inc.",
        "quantity": 10.0,
        "purchase_price": 175.50,
        "purchase_date": "2024-01-15",
        "notes": "Long term investment",
    }
    response = client.post("/api/portfolio", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["symbol"] == "AAPL"
    assert data["quantity"] == 10.0
    assert data["purchase_price"] == 175.50
    assert data["invested_value"] == 1755.00
    assert data["current_price"] > 0
    assert data["current_value"] > 0
    assert "gain_loss" in data
    assert "gain_loss_percent" in data


def test_update_portfolio_holding(client: TestClient, auth_headers: dict):
    # Create holding
    payload = {
        "symbol": "MSFT",
        "quantity": 5.0,
        "purchase_price": 400.00,
    }
    create_resp = client.post("/api/portfolio", json=payload, headers=auth_headers)
    assert create_resp.status_code == 201
    holding_id = create_resp.json()["id"]

    # Update holding
    update_payload = {
        "quantity": 15.0,
        "purchase_price": 410.00,
        "notes": "Added to dip",
    }
    update_resp = client.put(f"/api/portfolio/{holding_id}", json=update_payload, headers=auth_headers)
    assert update_resp.status_code == 200
    data = update_resp.json()
    assert data["quantity"] == 15.0
    assert data["purchase_price"] == 410.00
    assert data["invested_value"] == 6150.00
    assert data["notes"] == "Added to dip"


def test_delete_portfolio_holding(client: TestClient, auth_headers: dict):
    # Create holding
    create_resp = client.post(
        "/api/portfolio",
        json={"symbol": "NVDA", "quantity": 20.0, "purchase_price": 120.00},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    holding_id = create_resp.json()["id"]

    # Delete holding
    delete_resp = client.delete(f"/api/portfolio/{holding_id}", headers=auth_headers)
    assert delete_resp.status_code == 200
    assert delete_resp.json()["success"] is True

    # Verify not found on subsequent delete
    del_again = client.delete(f"/api/portfolio/{holding_id}", headers=auth_headers)
    assert del_again.status_code == 404
