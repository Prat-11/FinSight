import math
from typing import Any, Dict, Optional, Tuple, Union
import numpy as np
import pandas as pd


def calculate_sma(series: pd.Series, window: int = 20) -> pd.Series:
    """Calculate Simple Moving Average (SMA) for any window."""
    if len(series) == 0:
        return pd.Series(dtype=float)
    return series.rolling(window=window, min_periods=1).mean()


def calculate_ema(series: pd.Series, span: int = 20) -> pd.Series:
    """Calculate Exponential Moving Average (EMA) for any span."""
    if len(series) == 0:
        return pd.Series(dtype=float)
    return series.ewm(span=span, adjust=False).mean()


def calculate_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """
    Calculate Relative Strength Index (RSI) using standard 14-period Wilder smoothing.
    """
    if len(series) < 2:
        return pd.Series([50.0] * len(series), index=series.index, dtype=float)

    delta = series.diff()
    gain = delta.clip(lower=0.0)
    loss = -delta.clip(upper=0.0)

    # First average calculation using exponential weighting
    avg_gain = gain.ewm(alpha=1.0 / period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1.0 / period, min_periods=period, adjust=False).mean()

    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi = 100.0 - (100.0 / (1.0 + rs))

    # Fill beginning values or zero-loss scenarios
    rsi = rsi.fillna(50.0)
    # If loss was exactly 0 and gain > 0, RSI is 100
    rsi = pd.Series(
        np.where((avg_loss == 0) & (avg_gain > 0), 100.0, rsi),
        index=series.index
    )
    return rsi


def calculate_macd(
    series: pd.Series,
    fast: int = 12,
    slow: int = 26,
    signal: int = 9
) -> Dict[str, pd.Series]:
    """
    Calculate MACD line, Signal line, and MACD Histogram.
    Default parameters: 12, 26, 9.
    """
    if len(series) == 0:
        empty = pd.Series(dtype=float)
        return {"macd": empty, "signal": empty, "histogram": empty}

    ema_fast = calculate_ema(series, span=fast)
    ema_slow = calculate_ema(series, span=slow)
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line

    return {
        "macd": macd_line,
        "signal": signal_line,
        "histogram": histogram
    }


def calculate_bollinger_bands(
    series: pd.Series,
    window: int = 20,
    num_std: float = 2.0
) -> Dict[str, pd.Series]:
    """
    Calculate Bollinger Bands (Upper, Middle, Lower).
    """
    if len(series) == 0:
        empty = pd.Series(dtype=float)
        return {"upper": empty, "middle": empty, "lower": empty}

    middle = series.rolling(window=window, min_periods=1).mean()
    std = series.rolling(window=window, min_periods=1).std().fillna(0.0)
    upper = middle + (num_std * std)
    lower = middle - (num_std * std)

    return {
        "upper": upper,
        "middle": middle,
        "lower": lower
    }


def calculate_standard_deviation(
    series: pd.Series,
    window: Optional[int] = None
) -> Union[float, pd.Series]:
    """Calculate standard deviation of a series (either scalar or rolling)."""
    if series.empty:
        return 0.0 if window is None else pd.Series(dtype=float)

    if window is not None:
        return series.rolling(window=window, min_periods=1).std().fillna(0.0)
    
    val = series.std()
    return float(val) if not pd.isna(val) else 0.0


def calculate_daily_returns(series: pd.Series) -> pd.Series:
    """Calculate percentage daily returns."""
    if len(series) < 2:
        return pd.Series([0.0] * len(series), index=series.index, dtype=float)
    return series.pct_change().fillna(0.0)


def calculate_annualized_volatility(
    series: pd.Series,
    trading_days: int = 252
) -> float:
    """
    Calculate annualized volatility from a series of prices or returns.
    If prices are passed, daily returns are computed first.
    """
    if len(series) < 2:
        return 0.0

    returns = calculate_daily_returns(series)
    daily_std = returns.std()
    if pd.isna(daily_std):
        return 0.0

    annualized = daily_std * np.sqrt(trading_days)
    return float(annualized)


def calculate_cumulative_returns(series: pd.Series) -> pd.Series:
    """Calculate cumulative returns from a price series."""
    if len(series) < 1:
        return pd.Series(dtype=float)

    initial_price = series.iloc[0]
    if initial_price == 0:
        return pd.Series([0.0] * len(series), index=series.index, dtype=float)

    return ((series / initial_price) - 1.0)


def calculate_max_drawdown(series: pd.Series) -> float:
    """
    Calculate Maximum Drawdown (MDD) from a price series.
    Returns value as a percentage between -1.0 and 0.0 (e.g., -0.15 for 15% drawdown).
    """
    if len(series) < 2:
        return 0.0

    rolling_max = series.cummax()
    drawdown = (series - rolling_max) / rolling_max.replace(0, np.nan)
    max_dd = drawdown.min()

    if pd.isna(max_dd) or np.isinf(max_dd):
        return 0.0
    return float(max_dd)


def calculate_correlation(data_dict: Dict[str, pd.Series]) -> pd.DataFrame:
    """
    Calculate Pearson correlation matrix between multiple stock price or return series.
    """
    if not data_dict:
        return pd.DataFrame()

    df = pd.DataFrame(data_dict).dropna()
    if df.empty or len(df.columns) < 1:
        symbols = list(data_dict.keys())
        return pd.DataFrame(np.eye(len(symbols)), index=symbols, columns=symbols)

    return df.corr()


def analyze_historical_trend(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyze historical trend for a dataframe containing 'close' column.
    Provides short-term, medium-term, and long-term trend, support, resistance, and crossovers.
    """
    if df.empty or "close" not in df.columns:
        return {
            "trend": "NEUTRAL",
            "short_term": "NEUTRAL",
            "medium_term": "NEUTRAL",
            "long_term": "NEUTRAL",
            "golden_cross": False,
            "death_cross": False,
            "support": 0.0,
            "resistance": 0.0,
            "pct_change_total": 0.0,
        }

    close = df["close"]
    n = len(close)
    current_price = float(close.iloc[-1])
    first_price = float(close.iloc[0])
    pct_change_total = ((current_price - first_price) / first_price * 100.0) if first_price > 0 else 0.0

    # Calculate MAs
    sma_20 = calculate_sma(close, 20)
    sma_50 = calculate_sma(close, 50)
    sma_200 = calculate_sma(close, 200)

    curr_sma_20 = float(sma_20.iloc[-1]) if n >= 20 else current_price
    curr_sma_50 = float(sma_50.iloc[-1]) if n >= 50 else current_price
    curr_sma_200 = float(sma_200.iloc[-1]) if n >= 200 else current_price

    # Support & Resistance (recent min/max)
    recent_window = min(n, 60)
    recent_slice = close.iloc[-recent_window:]
    support = float(recent_slice.min())
    resistance = float(recent_slice.max())

    # Crossovers
    golden_cross = False
    death_cross = False
    if n >= 55:
        prev_sma_50 = float(sma_50.iloc[-5])
        prev_sma_200 = float(sma_200.iloc[-5])
        if prev_sma_50 <= prev_sma_200 and curr_sma_50 > curr_sma_200:
            golden_cross = True
        elif prev_sma_50 >= prev_sma_200 and curr_sma_50 < curr_sma_200:
            death_cross = True

    short_term = "BULLISH" if current_price > curr_sma_20 else ("BEARISH" if current_price < curr_sma_20 else "NEUTRAL")
    medium_term = "BULLISH" if curr_sma_20 > curr_sma_50 else ("BEARISH" if curr_sma_20 < curr_sma_50 else "NEUTRAL")
    long_term = "BULLISH" if current_price > curr_sma_200 else ("BEARISH" if current_price < curr_sma_200 else "NEUTRAL")

    # Overall trend
    bullish_votes = [short_term, medium_term, long_term].count("BULLISH")
    bearish_votes = [short_term, medium_term, long_term].count("BEARISH")
    if bullish_votes >= 2:
        overall = "BULLISH"
    elif bearish_votes >= 2:
        overall = "BEARISH"
    else:
        overall = "NEUTRAL"

    return {
        "trend": overall,
        "short_term": short_term,
        "medium_term": medium_term,
        "long_term": long_term,
        "golden_cross": golden_cross,
        "death_cross": death_cross,
        "support": round(support, 2),
        "resistance": round(resistance, 2),
        "pct_change_total": round(pct_change_total, 2),
    }


def compute_technical_indicators(df: pd.DataFrame) -> Dict[str, Optional[float]]:
    """
    Compute current technical indicator values for a stock dataframe.
    Returns a dictionary suitable for TechnicalIndicators schema.
    """
    if df.empty or "close" not in df.columns:
        return {
            "sma_20": None,
            "sma_50": None,
            "sma_200": None,
            "ema_12": None,
            "ema_26": None,
            "rsi": None,
            "macd": None,
            "macd_signal": None,
            "macd_histogram": None,
            "bollinger_upper": None,
            "bollinger_middle": None,
            "bollinger_lower": None,
            "volatility": None,
        }

    close = df["close"]
    n = len(close)

    sma_20 = calculate_sma(close, 20)
    sma_50 = calculate_sma(close, 50)
    sma_200 = calculate_sma(close, 200)

    ema_12 = calculate_ema(close, 12)
    ema_26 = calculate_ema(close, 26)

    rsi = calculate_rsi(close, 14)
    macd_res = calculate_macd(close, 12, 26, 9)
    bb = calculate_bollinger_bands(close, 20, 2.0)
    volatility = calculate_annualized_volatility(close)

    def _val(series: pd.Series, min_len: int = 1) -> Optional[float]:
        if n < min_len or series.empty or pd.isna(series.iloc[-1]):
            return None
        v = float(series.iloc[-1])
        return None if (math.isnan(v) or math.isinf(v)) else round(v, 4)

    return {
        "sma_20": _val(sma_20, 1),
        "sma_50": _val(sma_50, 1),
        "sma_200": _val(sma_200, 1),
        "ema_12": _val(ema_12, 1),
        "ema_26": _val(ema_26, 1),
        "rsi": _val(rsi, 2),
        "macd": _val(macd_res["macd"], 1),
        "macd_signal": _val(macd_res["signal"], 1),
        "macd_histogram": _val(macd_res["histogram"], 1),
        "bollinger_upper": _val(bb["upper"], 1),
        "bollinger_middle": _val(bb["middle"], 1),
        "bollinger_lower": _val(bb["lower"], 1),
        "volatility": round(volatility, 4) if not math.isnan(volatility) else None,
    }
