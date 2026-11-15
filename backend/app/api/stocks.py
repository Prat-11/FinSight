from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.analytics.indicators import compute_technical_indicators
from app.schemas.stock import HistoricalDataPoint, StockDetails, StockQuote, TechnicalIndicators
from app.services.stock_service import stock_service

router = APIRouter(prefix="/stocks", tags=["Stocks"])


@router.get("/search", response_model=List[Dict[str, str]])
def search_stocks(q: str = Query(..., min_length=1, description="Stock ticker symbol or company name")):
    """Search for stocks by ticker symbol or company name."""
    return stock_service.search_stocks(q)


@router.get("/{symbol}", response_model=StockDetails)
def get_stock_details(
    symbol: str,
    period: str = Query(default="1Y", description="Time period: 1D, 1W, 1M, 3M, 6M, 1Y, 5Y"),
):
    """Retrieve comprehensive stock details including live quote, historical price chart, and technical indicators."""
    try:
        return stock_service.get_stock_details(symbol=symbol, period=period)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to load stock details for {symbol}: {str(e)}",
        )


@router.get("/{symbol}/quote", response_model=StockQuote)
def get_stock_quote(symbol: str):
    """Retrieve real-time quote for a specific ticker symbol."""
    try:
        return stock_service.get_quote(symbol)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to load quote for {symbol}: {str(e)}",
        )


@router.get("/{symbol}/history", response_model=List[HistoricalDataPoint])
def get_stock_history(
    symbol: str,
    period: str = Query(default="1Y", description="Time period: 1D, 1W, 1M, 3M, 6M, 1Y, 5Y"),
):
    """Retrieve historical OHLCV price series for a given symbol and timeframe."""
    try:
        return stock_service.get_history(symbol=symbol, period=period)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to load historical data for {symbol}: {str(e)}",
        )


@router.get("/{symbol}/indicators", response_model=TechnicalIndicators)
def get_stock_indicators(symbol: str):
    """Compute and retrieve technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands, Volatility)."""
    try:
        df = stock_service.get_history_df(symbol=symbol, period="1Y")
        indicators = compute_technical_indicators(df)
        return TechnicalIndicators(**indicators)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to compute indicators for {symbol}: {str(e)}",
        )
