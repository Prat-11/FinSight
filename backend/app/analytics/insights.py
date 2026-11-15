from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd

from app.analytics.indicators import (
    calculate_annualized_volatility,
    calculate_bollinger_bands,
    calculate_ema,
    calculate_macd,
    calculate_rsi,
    calculate_sma,
)
from app.schemas.stock import AIInsight, PortfolioInsight

FINANCIAL_DISCLAIMER = (
    "Disclaimer: FinSight analytics and AI insights are provided strictly for educational "
    "and informational purposes only. This does not constitute financial, investment, trading, "
    "or legal advice. Past performance is no guarantee of future results. Always conduct your "
    "own independent due diligence and consult a qualified financial advisor before making investment decisions."
)


def generate_stock_insight(
    symbol: str,
    df: pd.DataFrame,
    company_name: Optional[str] = None
) -> AIInsight:
    """
    Generate comprehensive rule-based AI insights for an individual stock.
    Analyzes trend, RSI, MACD, Moving Averages, Bollinger Bands, Volume, and Volatility.
    """
    display_name = company_name or symbol
    now = datetime.now(timezone.utc)

    # Fallback if no data available
    if df.empty or "close" not in df.columns or len(df) < 2:
        return AIInsight(
            symbol=symbol,
            signal="NEUTRAL",
            recommendation="HOLD",
            confidence_score=50.0,
            summary=f"Insufficient historical data available to generate high-confidence insights for {display_name}.",
            key_factors=["Limited historical data available"],
            technical_signals={"Trend": "INSUFFICIENT_DATA"},
            disclaimer=FINANCIAL_DISCLAIMER,
            generated_at=now,
        )

    close = df["close"]
    n = len(close)
    current_price = float(close.iloc[-1])
    prev_price = float(close.iloc[-2])
    day_pct_change = ((current_price - prev_price) / prev_price) * 100.0

    # Calculate indicators
    sma_20 = calculate_sma(close, 20)
    sma_50 = calculate_sma(close, 50)
    sma_200 = calculate_sma(close, 200)
    rsi_series = calculate_rsi(close, 14)
    macd_data = calculate_macd(close, 12, 26, 9)
    bb = calculate_bollinger_bands(close, 20, 2.0)
    volatility = calculate_annualized_volatility(close)

    curr_sma_20 = float(sma_20.iloc[-1]) if n >= 20 else current_price
    curr_sma_50 = float(sma_50.iloc[-1]) if n >= 50 else current_price
    curr_sma_200 = float(sma_200.iloc[-1]) if n >= 200 else current_price
    curr_rsi = float(rsi_series.iloc[-1]) if not rsi_series.empty else 50.0
    curr_macd = float(macd_data["macd"].iloc[-1]) if not macd_data["macd"].empty else 0.0
    curr_signal = float(macd_data["signal"].iloc[-1]) if not macd_data["signal"].empty else 0.0
    curr_hist = float(macd_data["histogram"].iloc[-1]) if not macd_data["histogram"].empty else 0.0

    bb_upper = float(bb["upper"].iloc[-1]) if not bb["upper"].empty else current_price * 1.05
    bb_lower = float(bb["lower"].iloc[-1]) if not bb["lower"].empty else current_price * 0.95

    # Factors and signals
    factors: List[str] = []
    technical_signals: Dict[str, str] = {}
    bullish_points = 0
    bearish_points = 0

    # 1. Price vs Moving Averages
    if current_price > curr_sma_20:
        bullish_points += 1
        technical_signals["SMA_20"] = "BULLISH (Above 20-day SMA)"
        factors.append(f"Price ({current_price:.2f}) is trading above its 20-day moving average ({curr_sma_20:.2f}), reflecting short-term momentum.")
    else:
        bearish_points += 1
        technical_signals["SMA_20"] = "BEARISH (Below 20-day SMA)"
        factors.append(f"Price ({current_price:.2f}) is below its 20-day moving average ({curr_sma_20:.2f}), indicating short-term weakness.")

    if current_price > curr_sma_50:
        bullish_points += 1
        technical_signals["SMA_50"] = "BULLISH (Above 50-day SMA)"
    else:
        bearish_points += 1
        technical_signals["SMA_50"] = "BEARISH (Below 50-day SMA)"

    if n >= 150:
        if current_price > curr_sma_200:
            bullish_points += 1
            technical_signals["SMA_200"] = "BULLISH (Above 200-day SMA)"
            factors.append(f"Long-term trend is positive with price above 200-day SMA ({curr_sma_200:.2f}).")
        else:
            bearish_points += 1
            technical_signals["SMA_200"] = "BEARISH (Below 200-day SMA)"
            factors.append(f"Long-term trend is pressured with price below 200-day SMA ({curr_sma_200:.2f}).")

    # Golden / Death Cross
    if curr_sma_50 > curr_sma_200 and n >= 50:
        bullish_points += 1
        technical_signals["Cross_Trend"] = "GOLDEN CROSS (50 MA > 200 MA)"
    elif curr_sma_50 < curr_sma_200 and n >= 50:
        bearish_points += 1
        technical_signals["Cross_Trend"] = "DEATH CROSS (50 MA < 200 MA)"

    # 2. RSI interpretation
    if curr_rsi > 70:
        bearish_points += 1  # Overbought pullback risk
        technical_signals["RSI_14"] = f"OVERBOUGHT ({curr_rsi:.1f})"
        factors.append(f"RSI is elevated at {curr_rsi:.1f} (overbought > 70), indicating potential consolidation or profit-taking ahead.")
    elif curr_rsi < 30:
        bullish_points += 1  # Oversold bounce opportunity
        technical_signals["RSI_14"] = f"OVERSOLD ({curr_rsi:.1f})"
        factors.append(f"RSI is depressed at {curr_rsi:.1f} (oversold < 30), suggesting severe selling may be exhausted and a rebound is possible.")
    else:
        technical_signals["RSI_14"] = f"NEUTRAL ({curr_rsi:.1f})"
        factors.append(f"RSI sits at a neutral momentum level of {curr_rsi:.1f}.")

    # 3. MACD
    if curr_macd > curr_signal and curr_hist > 0:
        bullish_points += 1
        technical_signals["MACD"] = "BULLISH (Positive crossover & rising histogram)"
        factors.append("MACD is currently trending above its signal line with an expanding histogram, confirming upward momentum.")
    elif curr_macd < curr_signal:
        bearish_points += 1
        technical_signals["MACD"] = "BEARISH (Below signal line)"
        factors.append("MACD is below its signal line, signaling sustained downward or consolidating momentum.")
    else:
        technical_signals["MACD"] = "NEUTRAL"

    # 4. Bollinger Bands
    if current_price >= bb_upper:
        bearish_points += 1
        technical_signals["Bollinger_Bands"] = "UPPER BAND TOUCH (Stretched)"
        factors.append(f"Price is testing upper Bollinger Band ({bb_upper:.2f}), suggesting extended near-term upside.")
    elif current_price <= bb_lower:
        bullish_points += 1
        technical_signals["Bollinger_Bands"] = "LOWER BAND TOUCH (Potential Support)"
        factors.append(f"Price is testing lower Bollinger Band ({bb_lower:.2f}), presenting potential support or mean-reversion.")
    else:
        technical_signals["Bollinger_Bands"] = "INSIDE BANDS (Normal range)"

    # 5. Volume Analysis (if volume exists)
    if "volume" in df.columns and len(df["volume"]) >= 5:
        vol_series = df["volume"]
        avg_vol = vol_series.rolling(window=min(n, 20), min_periods=1).mean().iloc[-1]
        curr_vol = vol_series.iloc[-1]
        if avg_vol > 0:
            vol_ratio = curr_vol / avg_vol
            if vol_ratio > 1.3:
                technical_signals["Volume"] = f"HIGH (+{(vol_ratio - 1) * 100:.0f}% vs 20-day avg)"
                if day_pct_change > 0:
                    bullish_points += 1
                    factors.append("Above-average volume accompanies price gains, confirming institutional buying interest.")
                else:
                    bearish_points += 1
                    factors.append("Heavy trading volume accompanies downward movement, pointing to elevated selling pressure.")
            else:
                technical_signals["Volume"] = "AVERAGE"

    # 6. Volatility Assessment
    vol_pct = volatility * 100.0
    if volatility < 0.20:
        technical_signals["Volatility"] = f"LOW ({vol_pct:.1f}% annualized)"
        factors.append(f"Annualized volatility is low at {vol_pct:.1f}%, indicating a relatively stable pricing environment.")
    elif volatility <= 0.40:
        technical_signals["Volatility"] = f"MODERATE ({vol_pct:.1f}% annualized)"
    else:
        technical_signals["Volatility"] = f"HIGH ({vol_pct:.1f}% annualized)"
        factors.append(f"Annualized volatility is elevated at {vol_pct:.1f}%, warranting disciplined risk management.")

    # Determine Signal, Recommendation, Confidence
    net_score = bullish_points - bearish_points

    if net_score >= 2:
        signal = "BULLISH"
        recommendation = "BUY"
        confidence_score = min(65.0 + (net_score * 5.5), 92.0)
    elif net_score <= -2:
        signal = "BEARISH"
        recommendation = "SELL"
        confidence_score = min(65.0 + (abs(net_score) * 5.5), 90.0)
    else:
        signal = "NEUTRAL"
        recommendation = "HOLD"
        confidence_score = 60.0

    # Summary synthesis
    summary = (
        f"{display_name} ({symbol}) shows an overall {signal} posture with a {recommendation} "
        f"technical recommendation (Confidence: {confidence_score:.1f}%). The stock is currently trading at {current_price:.2f} "
        f"({'+' if day_pct_change >= 0 else ''}{day_pct_change:.2f}%). "
        f"Technical indicators highlight {bullish_points} bullish cues against {bearish_points} bearish signals, "
        f"with RSI at {curr_rsi:.1f} and annualized volatility at {vol_pct:.1f}%."
    )

    return AIInsight(
        symbol=symbol,
        signal=signal,
        recommendation=recommendation,
        confidence_score=round(confidence_score, 1),
        summary=summary,
        key_factors=factors[:5],  # top 5 key factors
        technical_signals=technical_signals,
        disclaimer=FINANCIAL_DISCLAIMER,
        generated_at=now,
    )


def generate_portfolio_insight(
    portfolio_summary: Dict[str, Any],
    holdings_insights: List[AIInsight]
) -> PortfolioInsight:
    """
    Generate portfolio-level health assessment and diversification insights.
    """
    now = datetime.now(timezone.utc)
    total_val = float(portfolio_summary.get("total_current_value", 0.0))
    total_invested = float(portfolio_summary.get("total_invested", 0.0))
    total_gain_loss = float(portfolio_summary.get("total_gain_loss", 0.0))
    total_gain_loss_pct = float(portfolio_summary.get("total_gain_loss_percent", 0.0))
    count = int(portfolio_summary.get("total_holdings_count", len(holdings_insights)))

    # Compute sentiment tally
    signals = [h.signal for h in holdings_insights]
    bullish_count = signals.count("BULLISH")
    bearish_count = signals.count("BEARISH")
    neutral_count = signals.count("NEUTRAL")

    if bullish_count > bearish_count and bullish_count >= count * 0.4:
        overall_sentiment = "BULLISH"
    elif bearish_count > bullish_count and bearish_count >= count * 0.4:
        overall_sentiment = "BEARISH"
    else:
        overall_sentiment = "BALANCED / NEUTRAL"

    # Diversification score (based on holding count and asset dispersion)
    if count == 0:
        diversification_score = 0.0
    elif count == 1:
        diversification_score = 30.0
    elif count < 5:
        diversification_score = 55.0 + (count * 5.0)
    elif count < 10:
        diversification_score = 80.0 + (count * 1.5)
    else:
        diversification_score = 95.0

    insights: List[str] = []
    if count == 0:
        insights.append("Portfolio is empty. Add stock holdings to unlock portfolio health insights.")
    else:
        insights.append(
            f"Portfolio comprises {count} assets with a total valuation of ${total_val:,.2f} "
            f"({'gain' if total_gain_loss >= 0 else 'loss'} of {total_gain_loss_pct:+.2f}%)."
        )
        insights.append(
            f"Market stance: {bullish_count} Bullish, {bearish_count} Bearish, and {neutral_count} Neutral positions."
        )

        if count < 4:
            insights.append("Concentration Risk: Consider expanding across non-correlated sectors to improve risk-adjusted stability.")
        else:
            insights.append("Diversification is solid across multiple holdings, mitigating single-stock idiosyncratic volatility.")

        if total_gain_loss_pct > 15.0:
            insights.append("Strong portfolio outperformance; consider rebalancing to lock in gains and reset risk allocations.")
        elif total_gain_loss_pct < -10.0:
            insights.append("Portfolio is experiencing a drawdown; review laggards and assess if underlying investment theses remain valid.")

    return PortfolioInsight(
        total_value=round(total_val, 2),
        total_gain_loss=round(total_gain_loss, 2),
        total_gain_loss_percent=round(total_gain_loss_pct, 2),
        overall_sentiment=overall_sentiment,
        diversification_score=round(diversification_score, 1),
        insights=insights,
        holdings_insights=holdings_insights,
        disclaimer=FINANCIAL_DISCLAIMER,
        generated_at=now,
    )
