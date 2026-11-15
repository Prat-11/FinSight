from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
import hashlib
import logging
import math
import time
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
import yfinance as yf

from app.analytics.indicators import compute_technical_indicators
from app.core.config import settings
from app.schemas.stock import (
    HistoricalDataPoint,
    MarketIndex,
    MarketMover,
    MarketOverview,
    StockDetails,
    StockQuote,
    TechnicalIndicators,
)

logger = logging.getLogger(__name__)

POPULAR_STOCKS = [
    {"symbol": "RELIANCE.NS", "name": "Reliance Industries Ltd", "currency": "INR", "base_price": 2850.0},
    {"symbol": "TCS.NS", "name": "Tata Consultancy Services Ltd", "currency": "INR", "base_price": 3890.0},
    {"symbol": "INFY.NS", "name": "Infosys Ltd", "currency": "INR", "base_price": 1620.0},
    {"symbol": "HDFCBANK.NS", "name": "HDFC Bank Ltd", "currency": "INR", "base_price": 1540.0},
    {"symbol": "ICICIBANK.NS", "name": "ICICI Bank Ltd", "currency": "INR", "base_price": 1110.0},
    {"symbol": "SBIN.NS", "name": "State Bank of India", "currency": "INR", "base_price": 760.0},
    {"symbol": "TATAMOTORS.NS", "name": "Tata Motors Ltd", "currency": "INR", "base_price": 980.0},
    {"symbol": "ITC.NS", "name": "ITC Ltd", "currency": "INR", "base_price": 435.0},
    {"symbol": "AAPL", "name": "Apple Inc.", "currency": "USD", "base_price": 185.0},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "currency": "USD", "base_price": 420.0},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "currency": "USD", "base_price": 175.0},
    {"symbol": "AMZN", "name": "Amazon.com Inc.", "currency": "USD", "base_price": 180.0},
    {"symbol": "NVDA", "name": "NVIDIA Corporation", "currency": "USD", "base_price": 125.0},
    {"symbol": "TSLA", "name": "Tesla Inc.", "currency": "USD", "base_price": 240.0},
    {"symbol": "META", "name": "Meta Platforms Inc.", "currency": "USD", "base_price": 480.0},
]

MARKET_INDICES = [
    {"symbol": "^NSEI", "name": "NIFTY 50", "currency": "INR", "base_price": 22400.0},
    {"symbol": "^BSESN", "name": "S&P BSE SENSEX", "currency": "INR", "base_price": 73800.0},
    {"symbol": "^IXIC", "name": "NASDAQ Composite", "currency": "USD", "base_price": 16400.0},
    {"symbol": "^GSPC", "name": "S&P 500", "currency": "USD", "base_price": 5120.0},
]


class StockService:
    def __init__(self):
        # In-memory cache: key -> (expire_time, data)
        self._cache: Dict[str, Tuple[float, Any]] = {}

    def _get_cache(self, key: str) -> Optional[Any]:
        if key in self._cache:
            exp, data = self._cache[key]
            if time.time() < exp:
                return data
            del self._cache[key]
        return None

    def _set_cache(self, key: str, data: Any, ttl: Optional[int] = None) -> None:
        duration = ttl if ttl is not None else settings.CACHE_TTL_SECONDS
        self._cache[key] = (time.time() + duration, data)

    def _resolve_stock_meta(self, symbol: str) -> Dict[str, Any]:
        sym_clean = symbol.upper().strip()
        for s in POPULAR_STOCKS:
            if s["symbol"].upper() == sym_clean:
                return s
        for idx in MARKET_INDICES:
            if idx["symbol"].upper() == sym_clean:
                return idx
        curr = "INR" if (sym_clean.endswith(".NS") or sym_clean.endswith(".BO")) else "USD"
        return {"symbol": sym_clean, "name": sym_clean, "currency": curr, "base_price": 150.0}

    def _generate_fallback_history(self, symbol: str, period: str = "1Y") -> pd.DataFrame:
        """
        Generates realistic deterministic OHLCV historical time series if yfinance fails.
        """
        meta = self._resolve_stock_meta(symbol)
        base = meta.get("base_price", 150.0)

        # Determine number of days based on period
        days_map = {
            "1D": 1,
            "1W": 7,
            "1M": 30,
            "3M": 90,
            "6M": 180,
            "1Y": 365,
            "5Y": 365 * 5,
        }
        num_days = days_map.get(period.upper(), 365)
        # Use trading days approx
        points = max(int(num_days * (5 / 7)), 25)

        seed = int(hashlib.md5(f"{symbol}_{period}".encode()).hexdigest()[:7], 16)
        rng = np.random.default_rng(seed)

        end_date = datetime.now()
        dates = pd.date_range(end=end_date, periods=points, freq="B")

        # Random walk for prices
        daily_returns = rng.normal(0.0005, 0.015, points)
        price_multipliers = np.cumprod(1 + daily_returns)
        start_price = base / price_multipliers[-1] if price_multipliers[-1] > 0 else base
        closes = start_price * price_multipliers

        highs = closes * (1 + rng.uniform(0.002, 0.02, points))
        lows = closes * (1 - rng.uniform(0.002, 0.02, points))
        opens = (closes + (closes * rng.normal(0, 0.005, points))) / 2.0
        opens = np.clip(opens, lows, highs)
        volumes = rng.integers(500000, 10000000, points).astype(float)

        df = pd.DataFrame(
            {
                "date": dates.strftime("%Y-%m-%d"),
                "open": np.round(opens, 2),
                "high": np.round(highs, 2),
                "low": np.round(lows, 2),
                "close": np.round(closes, 2),
                "volume": volumes,
            }
        )
        return df

    def get_history_df(self, symbol: str, period: str = "1Y") -> pd.DataFrame:
        cache_key = f"hist_df:{symbol.upper()}:{period.upper()}"
        cached = self._get_cache(cache_key)
        if cached is not None:
            return cached

        period_yf_map = {
            "1D": ("1d", "5m"),
            "1W": ("5d", "15m"),
            "1M": ("1mo", "1d"),
            "3M": ("3mo", "1d"),
            "6M": ("6mo", "1d"),
            "1Y": ("1y", "1d"),
            "5Y": ("5y", "1wk"),
        }
        yf_period, yf_interval = period_yf_map.get(period.upper(), ("1y", "1d"))

        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=yf_period, interval=yf_interval)

            if hist is None or hist.empty or len(hist) < 3:
                logger.warning(f"yfinance returned empty/minimal history for {symbol}. Using fallback data.")
                df = self._generate_fallback_history(symbol, period)
            else:
                hist = hist.reset_index()
                # Determine date column name (Date or Datetime)
                date_col = "Date" if "Date" in hist.columns else "Datetime"
                if date_col in hist.columns:
                    hist["date"] = pd.to_datetime(hist[date_col]).dt.strftime("%Y-%m-%d")
                else:
                    hist["date"] = pd.date_range(end=datetime.now(), periods=len(hist), freq="B").strftime("%Y-%m-%d")

                df = pd.DataFrame(
                    {
                        "date": hist["date"],
                        "open": hist["Open"].astype(float).round(2),
                        "high": hist["High"].astype(float).round(2),
                        "low": hist["Low"].astype(float).round(2),
                        "close": hist["Close"].astype(float).round(2),
                        "volume": hist["Volume"].astype(float),
                    }
                ).dropna(subset=["close"])

        except Exception as e:
            logger.error(f"Error fetching historical data from yfinance for {symbol}: {e}")
            df = self._generate_fallback_history(symbol, period)

        self._set_cache(cache_key, df)
        return df

    def get_history(self, symbol: str, period: str = "1Y") -> List[HistoricalDataPoint]:
        df = self.get_history_df(symbol, period)
        points: List[HistoricalDataPoint] = []
        for _, row in df.iterrows():
            points.append(
                HistoricalDataPoint(
                    date=str(row["date"]),
                    open=float(row["open"]),
                    high=float(row["high"]),
                    low=float(row["low"]),
                    close=float(row["close"]),
                    volume=float(row["volume"]),
                )
            )
        return points

    def get_quote(self, symbol: str) -> StockQuote:
        clean_sym = symbol.upper().strip()
        cache_key = f"quote:{clean_sym}"
        cached = self._get_cache(cache_key)
        if cached is not None:
            return cached

        meta = self._resolve_stock_meta(clean_sym)
        company_name = meta.get("name", clean_sym)
        currency = meta.get("currency", "USD")

        try:
            ticker = yf.Ticker(clean_sym)
            info = ticker.info or {}

            # Fast price check or fallback
            price = (
                info.get("currentPrice")
                or info.get("regularMarketPrice")
                or info.get("previousClose")
            )

            if price is not None and not math.isnan(price):
                prev_close = info.get("previousClose") or (price * 0.99)
                change = price - prev_close
                pct_change = (change / prev_close * 100.0) if prev_close else 0.0

                quote = StockQuote(
                    symbol=clean_sym,
                    company_name=info.get("shortName") or info.get("longName") or company_name,
                    current_price=round(float(price), 2),
                    change=round(float(change), 2),
                    percent_change=round(float(pct_change), 2),
                    currency=info.get("currency", currency),
                    day_high=info.get("dayHigh"),
                    day_low=info.get("dayLow"),
                    open_price=info.get("open") or info.get("regularMarketOpen"),
                    previous_close=round(float(prev_close), 2),
                    volume=info.get("volume") or info.get("regularMarketVolume"),
                    market_cap=info.get("marketCap"),
                    pe_ratio=info.get("trailingPE"),
                    week_52_high=info.get("fiftyTwoWeekHigh"),
                    week_52_low=info.get("fiftyTwoWeekLow"),
                    timestamp=datetime.now(timezone.utc),
                )
                self._set_cache(cache_key, quote, ttl=180)
                return quote
        except Exception as e:
            logger.warning(f"Could not load quote from yfinance for {clean_sym}: {e}")

        # Fallback using historical dataframe
        df = self.get_history_df(clean_sym, "1M")
        if not df.empty and len(df) >= 2:
            last = df.iloc[-1]
            prev = df.iloc[-2]
            cur_p = float(last["close"])
            prev_p = float(prev["close"])
            diff = cur_p - prev_p
            pct = (diff / prev_p) * 100.0 if prev_p else 0.0

            quote = StockQuote(
                symbol=clean_sym,
                company_name=company_name,
                current_price=round(cur_p, 2),
                change=round(diff, 2),
                percent_change=round(pct, 2),
                currency=currency,
                day_high=round(float(last["high"]), 2),
                day_low=round(float(last["low"]), 2),
                open_price=round(float(last["open"]), 2),
                previous_close=round(prev_p, 2),
                volume=float(last["volume"]),
                market_cap=round(cur_p * 1e8, 2),
                pe_ratio=24.5,
                week_52_high=round(cur_p * 1.25, 2),
                week_52_low=round(cur_p * 0.75, 2),
                timestamp=datetime.now(timezone.utc),
            )
        else:
            base_p = meta.get("base_price", 150.0)
            quote = StockQuote(
                symbol=clean_sym,
                company_name=company_name,
                current_price=round(base_p, 2),
                change=1.25,
                percent_change=0.85,
                currency=currency,
                day_high=round(base_p * 1.015, 2),
                day_low=round(base_p * 0.985, 2),
                open_price=round(base_p * 0.995, 2),
                previous_close=round(base_p - 1.25, 2),
                volume=1500000.0,
                market_cap=round(base_p * 5e7, 2),
                pe_ratio=22.0,
                week_52_high=round(base_p * 1.3, 2),
                week_52_low=round(base_p * 0.8, 2),
                timestamp=datetime.now(timezone.utc),
            )

        self._set_cache(cache_key, quote, ttl=180)
        return quote

    def get_stock_details(self, symbol: str, period: str = "1Y") -> StockDetails:
        quote = self.get_quote(symbol)
        history = self.get_history(symbol, period)
        hist_df = self.get_history_df(symbol, "1Y")
        indicators_dict = compute_technical_indicators(hist_df)
        indicators = TechnicalIndicators(**indicators_dict)

        company_info = {
            "symbol": quote.symbol,
            "company_name": quote.company_name,
            "currency": quote.currency,
            "market_cap": quote.market_cap,
            "pe_ratio": quote.pe_ratio,
            "week_52_high": quote.week_52_high,
            "week_52_low": quote.week_52_low,
        }

        return StockDetails(
            quote=quote,
            history=history,
            indicators=indicators,
            company_info=company_info,
        )

    def search_stocks(self, query: str) -> List[Dict[str, str]]:
        q = query.strip().upper()
        if not q:
            return []

        results = []
        for stock in POPULAR_STOCKS:
            if q in stock["symbol"].upper() or q in stock["name"].upper():
                results.append(
                    {
                        "symbol": stock["symbol"],
                        "name": stock["name"],
                        "currency": stock["currency"],
                    }
                )

        # If direct search query is not in popular stocks, add it as a possible ticker
        if not any(r["symbol"] == q for r in results) and len(q) <= 12:
            clean_q = q.replace(" ", "")
            results.insert(
                0,
                {
                    "symbol": clean_q,
                    "name": clean_q,
                    "currency": "INR" if clean_q.endswith(".NS") else "USD",
                },
            )

        return results[:10]

    def get_market_overview(self) -> MarketOverview:
        cache_key = "market_overview"
        cached = self._get_cache(cache_key)
        if cached is not None:
            return cached

        # Fetch indices and movers concurrently for high responsiveness
        with ThreadPoolExecutor(max_workers=10) as executor:
            index_futures = [executor.submit(self.get_quote, idx["symbol"]) for idx in MARKET_INDICES]
            mover_futures = [executor.submit(self.get_quote, s["symbol"]) for s in POPULAR_STOCKS]

            indices_list: List[MarketIndex] = []
            for idx, fut in zip(MARKET_INDICES, index_futures):
                try:
                    q = fut.result()
                    indices_list.append(
                        MarketIndex(
                            symbol=idx["symbol"],
                            name=idx["name"],
                            price=q.current_price,
                            change=q.change,
                            percent_change=q.percent_change,
                        )
                    )
                except Exception as e:
                    logger.error(f"Error fetching index {idx['symbol']}: {e}")

            movers: List[MarketMover] = []
            for fut in mover_futures:
                try:
                    q = fut.result()
                    movers.append(
                        MarketMover(
                            symbol=q.symbol,
                            company_name=q.company_name,
                            price=q.current_price,
                            change=q.change,
                            percent_change=q.percent_change,
                            volume=q.volume,
                        )
                    )
                except Exception as e:
                    logger.warning(f"Failed to fetch quote for mover: {e}")

        gainers = sorted(movers, key=lambda m: m.percent_change, reverse=True)[:5]
        losers = sorted(movers, key=lambda m: m.percent_change)[:5]

        overview = MarketOverview(
            indices=indices_list,
            gainers=gainers,
            losers=losers,
            timestamp=datetime.now(timezone.utc),
        )
        self._set_cache(cache_key, overview, ttl=300)
        return overview

    def get_top_gainers(self, limit: int = 5) -> List[MarketMover]:
        overview = self.get_market_overview()
        return overview.gainers[:limit]

    def get_top_losers(self, limit: int = 5) -> List[MarketMover]:
        overview = self.get_market_overview()
        return overview.losers[:limit]


stock_service = StockService()
