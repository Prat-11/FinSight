from typing import List
from fastapi import APIRouter, Query

from app.schemas.stock import MarketMover, MarketOverview
from app.services.stock_service import stock_service

router = APIRouter(prefix="/market", tags=["Market Overview"])


@router.get("/overview", response_model=MarketOverview)
def get_market_overview():
    """Retrieve global market indices and top market movers (gainers & losers)."""
    return stock_service.get_market_overview()


@router.get("/gainers", response_model=List[MarketMover])
def get_top_gainers(limit: int = Query(default=5, ge=1, le=20)):
    """Retrieve top gaining stocks for the current session."""
    return stock_service.get_top_gainers(limit=limit)


@router.get("/losers", response_model=List[MarketMover])
def get_top_losers(limit: int = Query(default=5, ge=1, le=20)):
    """Retrieve top losing stocks for the current session."""
    return stock_service.get_top_losers(limit=limit)
