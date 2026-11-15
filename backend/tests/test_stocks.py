from fastapi.testclient import TestClient


def test_search_stocks(client: TestClient):
    response = client.get("/api/stocks/search?q=AAPL")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert any(item["symbol"] == "AAPL" for item in data)


def test_get_stock_quote(client: TestClient):
    response = client.get("/api/stocks/AAPL/quote")
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "AAPL"
    assert data["current_price"] > 0
    assert "percent_change" in data
    assert "company_name" in data


def test_get_stock_details(client: TestClient):
    response = client.get("/api/stocks/AAPL?period=1M")
    assert response.status_code == 200
    data = response.json()
    assert "quote" in data
    assert data["quote"]["symbol"] == "AAPL"
    assert "history" in data
    assert len(data["history"]) > 0
    assert "indicators" in data


def test_get_stock_history(client: TestClient):
    response = client.get("/api/stocks/MSFT/history?period=1M")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    first_pt = data[0]
    assert "date" in first_pt
    assert "open" in first_pt
    assert "high" in first_pt
    assert "low" in first_pt
    assert "close" in first_pt
    assert "volume" in first_pt


def test_get_stock_indicators(client: TestClient):
    response = client.get("/api/stocks/AAPL/indicators")
    assert response.status_code == 200
    data = response.json()
    assert "sma_20" in data
    assert "rsi" in data
    assert "macd" in data
    assert "bollinger_upper" in data
    assert "volatility" in data
