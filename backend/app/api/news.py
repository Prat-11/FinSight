from typing import List, Optional
from fastapi import APIRouter, Query

from app.schemas.stock import NewsArticle
from app.services.news_service import news_service

router = APIRouter(prefix="/news", tags=["News"])


@router.get("", response_model=List[NewsArticle])
def get_financial_news(
    symbol: Optional[str] = Query(default=None, description="Optional stock ticker symbol filter"),
    category: Optional[str] = Query(default=None, description="Optional news category filter"),
    limit: int = Query(default=20, ge=1, le=50, description="Maximum number of articles to return"),
):
    """
    Retrieve curated financial and corporate market news articles,
    with support for symbol-specific and category-based filtering.
    """
    return news_service.get_news(symbol=symbol, category=category, limit=limit)
