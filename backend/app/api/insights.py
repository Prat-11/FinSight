from typing import Any, Dict, List, Union
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.analytics.insights import generate_portfolio_insight, generate_stock_insight
from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.stock import AIInsight, PortfolioInsight
from app.services.portfolio_service import portfolio_service
from app.services.stock_service import stock_service

router = APIRouter(prefix="/insights", tags=["AI Insights"])


@router.get("/portfolio", response_model=Union[PortfolioInsight, List[AIInsight]])
def get_portfolio_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate comprehensive AI health, risk, and diversification insights
    for all assets currently held in the user portfolio.
    """
    summary = portfolio_service.get_portfolio_summary(db, current_user.id)
    holdings = summary.holdings

    holdings_insights: List[AIInsight] = []
    # If portfolio is empty, generate insights for default tracked leaders
    target_symbols = [h.symbol for h in holdings] if holdings else ["NVDA", "AAPL", "MSFT", "RELIANCE.NS"]

    for sym in target_symbols:
        try:
            df = stock_service.get_history_df(sym, period="1Y")
            quote = stock_service.get_quote(sym)
            ins = generate_stock_insight(sym, df, company_name=quote.company_name)
            holdings_insights.append(ins)
        except Exception:
            continue

    summary_dict = {
        "total_invested": summary.total_invested,
        "total_current_value": summary.total_current_value,
        "total_gain_loss": summary.total_gain_loss,
        "total_gain_loss_percent": summary.total_gain_loss_percent,
        "total_holdings_count": summary.total_holdings_count,
    }

    return generate_portfolio_insight(summary_dict, holdings_insights)


@router.get("/stock/{symbol}", response_model=AIInsight)
@router.get("/{symbol}", response_model=AIInsight)
def get_stock_insights(symbol: str):
    """
    Generate rule-based AI technical insights, trend analysis, momentum signals,
    and confidence scores for a specific stock ticker.
    """
    clean_sym = symbol.upper().strip()
    try:
        df = stock_service.get_history_df(clean_sym, period="1Y")
        quote = stock_service.get_quote(clean_sym)
        return generate_stock_insight(clean_sym, df, company_name=quote.company_name)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to generate AI insights for {clean_sym}: {str(exc)}",
        )
