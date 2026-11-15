from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, status
import numpy as np
import pandas as pd

from app.analytics.indicators import (
    calculate_annualized_volatility,
    calculate_correlation,
    calculate_max_drawdown,
    calculate_rsi,
)
from app.schemas.stock import ComparisonRequest, ComparisonResult
from app.services.stock_service import stock_service

router = APIRouter(tags=["Stock Comparison"])


@router.post("/compare", response_model=ComparisonResult)
@router.post("/stocks/compare", response_model=ComparisonResult)
def compare_stocks(request: ComparisonRequest):
    """
    Compare 2 to 5 stocks across performance, valuation, risk metrics,
    correlation matrix, and normalized relative trajectory.
    """
    clean_symbols = [s.strip().upper() for s in request.symbols if s.strip()]
    if len(clean_symbols) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 2 distinct stock symbols are required for comparison.",
        )

    # Remove duplicates preserving order
    symbols = list(dict.fromkeys(clean_symbols))[:5]

    metrics: Dict[str, Dict[str, Any]] = {}
    price_series_dict: Dict[str, pd.Series] = {}
    df_map: Dict[str, pd.DataFrame] = {}

    for sym in symbols:
        try:
            quote = stock_service.get_quote(sym)
            df = stock_service.get_history_df(sym, period=request.period or "1Y")
            df_map[sym] = df

            close = df["close"] if not df.empty and "close" in df.columns else pd.Series(dtype=float)

            # Performance & Risk calculations
            volatility = calculate_annualized_volatility(close) if len(close) > 2 else 0.0
            max_dd = calculate_max_drawdown(close) if len(close) > 2 else 0.0
            rsi_series = calculate_rsi(close) if len(close) > 2 else pd.Series(dtype=float)
            curr_rsi = float(rsi_series.iloc[-1]) if not rsi_series.empty else 50.0

            # Returns
            total_ret = 0.0
            ret_1m = 0.0
            ret_1y = 0.0
            if len(close) >= 2:
                total_ret = ((close.iloc[-1] - close.iloc[0]) / close.iloc[0]) * 100.0
            if len(close) >= 22:
                ret_1m = ((close.iloc[-1] - close.iloc[-22]) / close.iloc[-22]) * 100.0
            if len(close) >= 250:
                ret_1y = ((close.iloc[-1] - close.iloc[-250]) / close.iloc[-250]) * 100.0
            else:
                ret_1y = total_ret

            metrics[sym] = {
                "symbol": sym,
                "company_name": quote.company_name,
                "companyName": quote.company_name,
                "price": quote.current_price,
                "current_price": quote.current_price,
                "change": quote.change,
                "percent_change": quote.percent_change,
                "changePercent": quote.percent_change,
                "market_cap": quote.market_cap,
                "marketCap": quote.market_cap,
                "pe_ratio": quote.pe_ratio,
                "peRatio": quote.pe_ratio,
                "volatility": round(volatility * 100.0, 2),
                "rsi": round(curr_rsi, 1),
                "max_drawdown": round(max_dd * 100.0, 2),
                "total_return": round(total_ret, 2),
                "return1M": round(ret_1m, 2),
                "return1Y": round(ret_1y, 2),
                "currency": quote.currency,
            }

            if not df.empty and "date" in df.columns and "close" in df.columns:
                price_series_dict[sym] = df.set_index("date")["close"]

        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error evaluating comparison metrics for {sym}: {str(exc)}",
            )

    # Correlation Matrix
    corr_df = calculate_correlation(price_series_dict)
    corr_matrix: Dict[str, Dict[str, float]] = {}
    for row_sym in symbols:
        corr_matrix[row_sym] = {}
        for col_sym in symbols:
            if row_sym in corr_df.index and col_sym in corr_df.columns:
                val = float(corr_df.loc[row_sym, col_sym])
                corr_matrix[row_sym][col_sym] = round(val, 3)
            else:
                corr_matrix[row_sym][col_sym] = 1.0 if row_sym == col_sym else 0.0

    # Normalized Performance Trajectory (% return from baseline date)
    normalized_list: List[Dict[str, Any]] = []
    if price_series_dict:
        combined_df = pd.DataFrame(price_series_dict).dropna()
        if not combined_df.empty:
            base_row = combined_df.iloc[0]
            norm_df = ((combined_df / base_row) - 1.0) * 100.0
            for date_val, row in norm_df.iterrows():
                point: Dict[str, Any] = {"date": str(date_val)}
                for s in symbols:
                    point[s] = round(float(row.get(s, 0.0)), 2)
                normalized_list.append(point)

    return ComparisonResult(
        symbols=symbols,
        metrics=metrics,
        correlation_matrix=corr_matrix,
        normalized_performance=normalized_list,
    )
