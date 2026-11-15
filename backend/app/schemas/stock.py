from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class StockQuote(BaseModel):
    symbol: str
    company_name: str
    current_price: float
    change: float
    percent_change: float
    currency: str = "USD"
    day_high: Optional[float] = None
    day_low: Optional[float] = None
    open_price: Optional[float] = None
    previous_close: Optional[float] = None
    volume: Optional[float] = None
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    week_52_high: Optional[float] = None
    week_52_low: Optional[float] = None
    timestamp: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class HistoricalDataPoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: float

    model_config = ConfigDict(from_attributes=True)


class TechnicalIndicators(BaseModel):
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    sma_200: Optional[float] = None
    ema_12: Optional[float] = None
    ema_26: Optional[float] = None
    rsi: Optional[float] = None
    macd: Optional[float] = None
    macd_signal: Optional[float] = None
    macd_histogram: Optional[float] = None
    bollinger_upper: Optional[float] = None
    bollinger_middle: Optional[float] = None
    bollinger_lower: Optional[float] = None
    volatility: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class StockDetails(BaseModel):
    quote: StockQuote
    history: List[HistoricalDataPoint] = []
    indicators: Optional[TechnicalIndicators] = None
    company_info: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class MarketIndex(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    percent_change: float

    model_config = ConfigDict(from_attributes=True)


class MarketMover(BaseModel):
    symbol: str
    company_name: str
    price: float
    change: float
    percent_change: float
    volume: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class MarketOverview(BaseModel):
    indices: List[MarketIndex]
    gainers: List[MarketMover]
    losers: List[MarketMover]
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class ComparisonRequest(BaseModel):
    symbols: List[str] = Field(..., min_length=2, max_length=5)
    period: str = Field(default="1Y")


class ComparisonResult(BaseModel):
    symbols: List[str]
    metrics: Dict[str, Dict[str, Any]]
    correlation_matrix: Dict[str, Dict[str, float]]
    normalized_performance: List[Dict[str, Any]]

    model_config = ConfigDict(from_attributes=True)


class AIInsight(BaseModel):
    symbol: str
    signal: str  # BULLISH, BEARISH, NEUTRAL
    recommendation: str  # BUY, SELL, HOLD
    confidence_score: float  # e.g., 85.0
    summary: str
    key_factors: List[str]
    technical_signals: Dict[str, str]
    disclaimer: str
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PortfolioInsight(BaseModel):
    total_value: float
    total_gain_loss: float
    total_gain_loss_percent: float
    overall_sentiment: str
    diversification_score: float
    insights: List[str]
    holdings_insights: List[AIInsight]
    disclaimer: str
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MLPrediction(BaseModel):
    symbol: str
    predicted_direction: str  # UP, DOWN, NEUTRAL
    confidence: float
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    feature_importances: Optional[Dict[str, float]] = None
    disclaimer: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class NewsArticle(BaseModel):
    id: str
    title: str
    summary: str
    source: str
    url: Optional[str] = None
    published_at: datetime
    sentiment: Optional[str] = "NEUTRAL"
    symbols: List[str] = []
    category: Optional[str] = "Market"

    model_config = ConfigDict(from_attributes=True)
