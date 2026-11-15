import numpy as np
import pandas as pd
import pytest

from app.analytics.indicators import (
    analyze_historical_trend,
    calculate_annualized_volatility,
    calculate_bollinger_bands,
    calculate_correlation,
    calculate_cumulative_returns,
    calculate_daily_returns,
    calculate_ema,
    calculate_macd,
    calculate_max_drawdown,
    calculate_rsi,
    calculate_sma,
    calculate_standard_deviation,
    compute_technical_indicators,
)
from app.analytics.insights import generate_stock_insight
from app.ml.predictor import predict_stock_trend


@pytest.fixture
def sample_price_series():
    # 50 days of sequential prices
    return pd.Series([100.0 + i + (i % 3) * 1.5 for i in range(50)])


@pytest.fixture
def sample_ohlcv_dataframe():
    np.random.seed(42)
    n = 100
    dates = pd.date_range(end="2024-01-01", periods=n, freq="B").strftime("%Y-%m-%d")
    closes = 100.0 * np.cumprod(1 + np.random.normal(0.001, 0.02, n))
    highs = closes * 1.02
    lows = closes * 0.98
    opens = (highs + lows) / 2.0
    volumes = np.random.randint(100000, 5000000, n).astype(float)
    return pd.DataFrame({
        "date": dates,
        "open": opens,
        "high": highs,
        "low": lows,
        "close": closes,
        "volume": volumes,
    })


def test_sma_calculation(sample_price_series):
    sma_20 = calculate_sma(sample_price_series, window=20)
    assert len(sma_20) == len(sample_price_series)
    assert not np.isnan(sma_20.iloc[-1])
    assert sma_20.iloc[-1] > 0


def test_ema_calculation(sample_price_series):
    ema_12 = calculate_ema(sample_price_series, span=12)
    assert len(ema_12) == len(sample_price_series)
    assert not np.isnan(ema_12.iloc[-1])
    assert ema_12.iloc[-1] > 0


def test_rsi_calculation(sample_price_series):
    rsi = calculate_rsi(sample_price_series, period=14)
    assert len(rsi) == len(sample_price_series)
    # RSI must be strictly bounded between 0 and 100
    assert (rsi >= 0.0).all()
    assert (rsi <= 100.0).all()


def test_macd_calculation(sample_price_series):
    macd_res = calculate_macd(sample_price_series, fast=12, slow=26, signal=9)
    assert "macd" in macd_res
    assert "signal" in macd_res
    assert "histogram" in macd_res
    # Histogram equals macd - signal
    np.testing.assert_allclose(
        macd_res["histogram"],
        macd_res["macd"] - macd_res["signal"],
        atol=1e-5
    )


def test_bollinger_bands(sample_price_series):
    bb = calculate_bollinger_bands(sample_price_series, window=20, num_std=2.0)
    upper = bb["upper"]
    middle = bb["middle"]
    lower = bb["lower"]
    # Upper band >= Middle band >= Lower band
    assert (upper >= middle).all()
    assert (middle >= lower).all()


def test_volatility_and_returns(sample_price_series):
    daily_ret = calculate_daily_returns(sample_price_series)
    assert len(daily_ret) == len(sample_price_series)

    cum_ret = calculate_cumulative_returns(sample_price_series)
    assert cum_ret.iloc[0] == 0.0

    vol = calculate_annualized_volatility(sample_price_series)
    assert vol >= 0.0

    mdd = calculate_max_drawdown(sample_price_series)
    assert mdd <= 0.0  # Drawdown is zero or negative


def test_correlation_matrix():
    s1 = pd.Series([10, 11, 12, 13, 14])
    s2 = pd.Series([20, 22, 24, 26, 28])  # Perfectly correlated with s1
    s3 = pd.Series([14, 13, 12, 11, 10])  # Inversely correlated with s1

    corr_df = calculate_correlation({"A": s1, "B": s2, "C": s3})
    assert corr_df.loc["A", "B"] == pytest.approx(1.0, 1e-4)
    assert corr_df.loc["A", "C"] == pytest.approx(-1.0, 1e-4)


def test_trend_analysis(sample_ohlcv_dataframe):
    trend = analyze_historical_trend(sample_ohlcv_dataframe)
    assert "trend" in trend
    assert trend["trend"] in ["BULLISH", "BEARISH", "NEUTRAL"]
    assert "support" in trend
    assert "resistance" in trend
    assert trend["resistance"] >= trend["support"]


def test_compute_technical_indicators(sample_ohlcv_dataframe):
    indicators = compute_technical_indicators(sample_ohlcv_dataframe)
    assert indicators["sma_20"] is not None
    assert indicators["rsi"] is not None
    assert indicators["macd"] is not None
    assert indicators["bollinger_upper"] is not None


def test_generate_stock_insight(sample_ohlcv_dataframe):
    insight = generate_stock_insight("TEST", sample_ohlcv_dataframe, "Test Company")
    assert insight.symbol == "TEST"
    assert insight.signal in ["BULLISH", "BEARISH", "NEUTRAL"]
    assert insight.recommendation in ["BUY", "SELL", "HOLD"]
    assert 0.0 <= insight.confidence_score <= 100.0
    assert len(insight.key_factors) > 0
    assert "Disclaimer" in insight.disclaimer


def test_predict_stock_trend(sample_ohlcv_dataframe):
    pred = predict_stock_trend("TEST", sample_ohlcv_dataframe)
    assert pred.symbol == "TEST"
    assert pred.predicted_direction in ["UP", "DOWN", "NEUTRAL"]
    assert 0.0 <= pred.confidence <= 1.0
    assert 0.0 <= pred.accuracy <= 1.0
    assert pred.feature_importances is not None
    assert "Disclaimer" in pred.disclaimer
