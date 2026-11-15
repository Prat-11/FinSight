# 📊 FinSight — AI-Powered Financial Analysis & Stock Market Intelligence Platform

> **Smarter Financial Decisions Through Data.**

FinSight is a modern, production-quality financial analytics platform that empowers users to track stock market performance, analyze individual stocks, compare companies, visualize historical prices, monitor investment portfolios, and receive AI-powered financial insights — all through a professional dark-themed fintech dashboard.

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Project Objectives](#-project-objectives)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Financial Formulas & Analytics](#-financial-formulas--analytics)
- [Machine Learning Methodology](#-machine-learning-methodology)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Testing](#-testing)
- [Future Enhancements](#-future-enhancements)
- [Disclaimer](#-disclaimer)
- [License](#-license)

---

## 🎯 Problem Statement

Retail investors and finance enthusiasts often struggle with:
- **Fragmented information**: Stock data, news, and analytics spread across multiple platforms.
- **Complex technical analysis**: Calculating indicators like RSI, MACD, and moving averages requires specialized tools.
- **Portfolio management**: Tracking investments and understanding overall performance is tedious.
- **Lack of accessible AI insights**: Understanding market trends requires expertise most individuals don't have.

FinSight solves these problems by providing a **unified, intelligent platform** that consolidates market data, technical analysis, portfolio management, and AI-powered insights into a single, intuitive dashboard.

---

## 🎯 Project Objectives

1. Build a full-stack financial analytics platform with React + FastAPI.
2. Integrate real stock market data using the yfinance library.
3. Implement comprehensive technical analysis indicators (SMA, EMA, RSI, MACD, Bollinger Bands).
4. Create an AI-powered rule-based insight engine for actionable financial analysis.
5. Build a machine learning model for stock trend classification.
6. Implement secure JWT-based authentication and user-specific data persistence.
7. Design a professional, responsive dark-themed fintech UI.
8. Demonstrate full-stack development, data analytics, and software engineering best practices.

---

## ✨ Features

### 📈 Market Dashboard
- Real-time market overview with major indices (NIFTY 50, SENSEX, NASDAQ, S&P 500)
- Top gainers and top losers across Indian and US markets
- Portfolio performance overview with KPI stat cards
- Asset allocation visualization

### 🔍 Stock Analysis
- Search stocks by symbol or company name
- Interactive historical price charts with period selection (1D to 5Y)
- Key metrics: Market Cap, P/E Ratio, EPS, 52-Week Range, Dividend Yield
- Volume analysis and price trend visualization

### 📊 Technical Indicators
- Simple Moving Average (SMA 20, 50, 200)
- Exponential Moving Average (EMA)
- Relative Strength Index (RSI)
- MACD with Signal Line and Histogram
- Bollinger Bands
- Annualized Volatility

### 🤖 AI-Powered Insights
- Rule-based trend analysis (Bullish/Bearish/Neutral)
- RSI regime detection (Overbought/Oversold)
- Moving average crossover signals (Golden Cross/Death Cross)
- Volume anomaly detection
- Volatility assessment
- Confidence-scored recommendations with key factors

### 🧠 Machine Learning
- Stock trend classification (UP/DOWN/NEUTRAL) using Random Forest
- Feature engineering from price-derived indicators
- Time-based train/test splitting (no data leakage)
- Model evaluation metrics (Accuracy, Precision, Recall, F1-Score)
- Feature importance analysis

### 💼 Portfolio Management
- Add, edit, and delete stock holdings
- Automatic current price enrichment via yfinance
- Real-time P/L calculation (total and per-holding)
- Asset allocation pie chart
- Portfolio performance tracking

### 👁️ Watchlist
- Pin stocks for quick monitoring
- Live price and change tracking
- One-click navigation to detailed stock analysis

### 🏢 Company Comparison
- Side-by-side comparison of 2-3 stocks
- Normalized price performance overlay chart
- Comparative metrics table (Market Cap, P/E, EPS, Revenue)

### 📰 Financial News
- Market news feed with sentiment analysis
- Category and symbol filtering
- Source attribution (clearly labeled as demo data)

### 🔐 Authentication
- Secure JWT-based registration and login
- bcrypt password hashing
- Protected dashboard routes
- User-specific portfolio and watchlist data

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI component framework |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Build tool and dev server |
| **Tailwind CSS v4** | Utility-first styling |
| **Recharts** | Interactive financial charts |
| **Lucide React** | Modern icon library |
| **Axios** | HTTP API client |
| **React Router v6** | Client-side routing |

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.12** | Server-side language |
| **FastAPI** | High-performance async web framework |
| **SQLAlchemy 2.0** | ORM for database operations |
| **Pydantic v2** | Data validation and serialization |
| **yfinance** | Yahoo Finance market data API |
| **Pandas** | Financial data analysis |
| **NumPy** | Numerical computations |
| **Scikit-learn** | Machine learning models |
| **bcrypt** | Password hashing |
| **python-jose** | JWT token management |

### Database
| Technology | Purpose |
|---|---|
| **SQLite** | Default embedded database (zero config) |
| **PostgreSQL** | Production-grade database (optional) |

### Development
| Technology | Purpose |
|---|---|
| **Pytest** | Backend testing framework |
| **Docker Compose** | Container orchestration |
| **Git** | Version control |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Landing Page │  │  Auth Pages  │  │  Dashboard   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Stock Analysis│  │  Portfolio   │  │  AI Insights │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  React 18 + TypeScript + Tailwind CSS + Recharts             │
└───────────────────────────┬─────────────────────────────────┘
                            │ Axios HTTP (REST API)
                            │ JWT Bearer Token
┌───────────────────────────▼─────────────────────────────────┐
│                      FASTAPI BACKEND                         │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────┐  │
│  │ Auth API │  │Stock API │  │Portfolio  │  │Insights   │  │
│  │          │  │          │  │   API     │  │   API     │  │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └─────┬─────┘  │
│       │              │              │              │         │
│  ┌────▼──────────────▼──────────────▼──────────────▼─────┐  │
│  │                   SERVICE LAYER                        │  │
│  │  StockService │ PortfolioService │ AnalyticsEngine     │  │
│  └──────────┬────────────┬──────────────────┬────────────┘  │
│             │            │                  │               │
│  ┌──────────▼────┐ ┌─────▼──────┐ ┌────────▼──────────┐   │
│  │   yfinance    │ │  SQLAlchemy │ │  Scikit-learn ML  │   │
│  │  (Market Data)│ │   (ORM)    │ │  (Predictions)    │   │
│  └───────────────┘ └──────┬─────┘ └───────────────────┘   │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
               ┌────────────▼────────────┐
               │    SQLite / PostgreSQL   │
               │                         │
               │  Users │ Portfolio │     │
               │  Watchlist │ StockHist  │
               └─────────────────────────┘
```

---

## 🗃️ Database Schema

### Entity-Relationship Diagram

```
┌───────────────────┐       ┌────────────────────────┐
│      users        │       │   portfolio_holdings   │
├───────────────────┤       ├────────────────────────┤
│ id (PK)           │──┐    │ id (PK)                │
│ name              │  │    │ user_id (FK → users)   │
│ email (UNIQUE)    │  ├───>│ symbol                 │
│ hashed_password   │  │    │ company_name           │
│ is_active         │  │    │ quantity               │
│ created_at        │  │    │ purchase_price         │
└───────────────────┘  │    │ purchase_date          │
                       │    │ notes                  │
                       │    │ created_at             │
                       │    │ updated_at             │
                       │    └────────────────────────┘
                       │
                       │    ┌────────────────────────┐
                       │    │   watchlist_items       │
                       │    ├────────────────────────┤
                       └───>│ id (PK)                │
                            │ user_id (FK → users)   │
                            │ symbol                 │
                            │ company_name           │
                            │ added_at               │
                            │ UNIQUE(user_id,symbol) │
                            └────────────────────────┘

┌────────────────────────┐
│   stock_histories      │
├────────────────────────┤
│ id (PK)                │
│ symbol                 │
│ date                   │
│ open                   │
│ high                   │
│ low                    │
│ close                  │
│ volume                 │
│ created_at             │
│ UNIQUE(symbol, date)   │
└────────────────────────┘
```

---

## 📡 API Documentation

### Base URL: `http://localhost:8000/api`

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register a new user | No |
| POST | `/auth/login` | Login and receive JWT token | No |
| GET | `/auth/me` | Get current user info | Yes |

### Stock Data
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/stocks/search?q={query}` | Search stocks by symbol/name | No |
| GET | `/stocks/{symbol}` | Get full stock details | No |
| GET | `/stocks/{symbol}/quote` | Get current stock quote | No |
| GET | `/stocks/{symbol}/history?period={period}` | Get historical OHLCV data | No |
| GET | `/stocks/{symbol}/indicators` | Get technical indicators | No |

### Market Overview
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/market/overview` | Market indices + gainers/losers | No |
| GET | `/market/gainers` | Top gaining stocks | No |
| GET | `/market/losers` | Top losing stocks | No |

### Portfolio (Protected)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/portfolio` | List all holdings with live prices | Yes |
| GET | `/portfolio/summary` | Portfolio summary statistics | Yes |
| POST | `/portfolio` | Add a new holding | Yes |
| PUT | `/portfolio/{id}` | Update a holding | Yes |
| DELETE | `/portfolio/{id}` | Delete a holding | Yes |

### Watchlist (Protected)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/watchlist` | List watchlist with prices | Yes |
| POST | `/watchlist` | Add stock to watchlist | Yes |
| DELETE | `/watchlist/{id}` | Remove from watchlist | Yes |

### Comparison
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/compare` | Compare 2-3 stocks | No |

### AI Insights
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/insights/{symbol}` | AI analysis for a stock | No |
| GET | `/insights/portfolio` | Insights for portfolio | Yes |

### Machine Learning
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/ml/predict/{symbol}` | ML trend prediction | No |
| POST | `/ml/predict/{symbol}` | ML trend prediction | No |

### News
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/news?symbol={symbol}` | Financial news feed | No |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

---

## 📐 Financial Formulas & Analytics

### 1. Simple Moving Average (SMA)
$$SMA_n = \frac{1}{n} \sum_{i=0}^{n-1} P_{t-i}$$
Calculates the arithmetic mean of closing prices over *n* periods. Used to identify trend direction.

### 2. Exponential Moving Average (EMA)
$$EMA_t = P_t \times k + EMA_{t-1} \times (1 - k), \quad k = \frac{2}{n + 1}$$
Gives more weight to recent prices, making it more responsive to new information than SMA.

### 3. Relative Strength Index (RSI)
$$RSI = 100 - \frac{100}{1 + RS}, \quad RS = \frac{\text{Avg Gain}}{\text{Avg Loss}}$$
Momentum oscillator measuring overbought (>70) and oversold (<30) conditions using Wilder's smoothing method.

### 4. MACD (Moving Average Convergence Divergence)
$$MACD = EMA_{12} - EMA_{26}$$
$$Signal = EMA_9(MACD)$$
$$Histogram = MACD - Signal$$
Trend-following momentum indicator. Bullish when MACD crosses above Signal line.

### 5. Bollinger Bands
$$Upper = SMA_{20} + 2\sigma$$
$$Lower = SMA_{20} - 2\sigma$$
Volatility bands placed above and below a moving average. Price touching bands may signal reversal.

### 6. Annualized Volatility
$$\sigma_{annual} = \sigma_{daily} \times \sqrt{252}$$
Standard deviation of daily returns scaled to yearly periods (252 trading days).

### 7. Maximum Drawdown
$$MDD = \frac{\text{Trough} - \text{Peak}}{\text{Peak}}$$
Largest peak-to-trough decline, measuring worst-case downside risk.

### 8. Daily & Cumulative Returns
$$r_t = \frac{P_t - P_{t-1}}{P_{t-1}}$$
$$CR_t = \prod_{i=1}^{t} (1 + r_i) - 1$$

---

## 🧠 Machine Learning Methodology

### Model: Random Forest Classifier

**Objective:** Classify the next-period stock price direction as UP, DOWN, or NEUTRAL.

### Feature Engineering
Features are derived from historical price data to capture market dynamics:
- **SMA Ratios:** Price relative to 5-day and 20-day SMA (trend position)
- **RSI (14-period):** Momentum oscillator value
- **MACD:** Trend momentum signal
- **Volatility:** 20-day rolling standard deviation of returns
- **Volume Change:** Rate of change in trading volume
- **Price Momentum:** 5-day and 10-day price rate of change
- **Daily Return:** Previous day's percentage change

### Train/Test Split
- **Time-based split** (80% train / 20% test) — the training set always precedes the test set chronologically
- This prevents **data leakage** and simulates real-world prediction scenarios

### Evaluation Metrics
| Metric | Description |
|--------|-------------|
| Accuracy | Overall correct predictions / total predictions |
| Precision | True positives / predicted positives (per class) |
| Recall | True positives / actual positives (per class) |
| F1-Score | Harmonic mean of precision and recall |
| Feature Importance | Relative contribution of each feature to predictions |

> ⚠️ **Disclaimer:** Historical patterns and model outputs are **not reliable guarantees** of future stock performance. FinSight's ML predictions are for educational and analytical purposes only and should not be used as the sole basis for investment decisions.

---

## 🚀 Installation & Setup

### Prerequisites
- **Python 3.10+** (tested with 3.12)
- **Node.js 18+** (tested with 24.x)
- **npm 9+**
- **Git**

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/finsight.git
cd finsight
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a Python virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
# The default .env uses SQLite (works out of the box)
# To use PostgreSQL, edit .env and set:
# DATABASE_URL=postgresql://postgres:password@localhost:5432/finsight
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install Node.js dependencies
npm install

# The default .env points to http://localhost:8000/api
# Modify if your backend runs on a different port
```

### Step 4: PostgreSQL Setup (Optional)

The application works with **SQLite by default** (zero configuration). To use PostgreSQL:

```bash
# Install PostgreSQL and create a database
psql -U postgres
CREATE DATABASE finsight;
\q

# Update backend/.env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/finsight
```

### Environment Variables

**Backend (`backend/.env`)**
| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./finsight.db` | Database connection string |
| `SECRET_KEY` | `finsight-super-secret...` | JWT signing secret (**change in production**) |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Token expiry (24 hours) |
| `CORS_ORIGINS` | `["http://localhost:5173"]` | Allowed CORS origins |
| `CACHE_TTL_SECONDS` | `300` | Market data cache duration |

**Frontend (`frontend/.env`)**
| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000/api` | Backend API base URL |

---

## ▶️ Running the Application

### Option 1: Local Development (Recommended)

**Terminal 1 — Start Backend:**
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — Start Frontend:**
```bash
cd frontend
npm run dev
```

**Access the Application:**
- 🌐 Frontend: **http://localhost:5173**
- 🔧 Backend API: **http://localhost:8000**
- 📝 API Docs (Swagger): **http://localhost:8000/docs**
- 📝 API Docs (ReDoc): **http://localhost:8000/redoc**

### Option 2: Docker Compose

```bash
docker-compose up --build
```

This starts PostgreSQL, the FastAPI backend, and the React frontend in containers.

---

## 📁 Project Structure

```
finsight/
│
├── frontend/                          # React + TypeScript frontend
│   ├── src/
│   │   ├── charts/                    # Recharts chart components
│   │   │   ├── AreaChart.tsx          # Stock price history chart
│   │   │   ├── BarChart.tsx           # Volume / comparison bar chart
│   │   │   ├── CandlestickChart.tsx   # OHLC candlestick chart
│   │   │   ├── LineChart.tsx          # Multi-series comparison chart
│   │   │   ├── MiniChart.tsx          # Sparkline for stat cards
│   │   │   └── PieChart.tsx           # Asset allocation donut chart
│   │   │
│   │   ├── components/ui/             # Reusable UI component library
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── StockTicker.tsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.tsx         # JWT auth context provider
│   │   │
│   │   ├── hooks/
│   │   │   └── useStockSearch.ts       # Debounced stock search hook
│   │   │
│   │   ├── layouts/
│   │   │   ├── AuthLayout.tsx          # Login/register layout
│   │   │   └── MainLayout.tsx          # Dashboard sidebar layout
│   │   │
│   │   ├── pages/
│   │   │   ├── AIInsightsPage.tsx      # AI analysis & ML predictions
│   │   │   ├── ComparisonPage.tsx      # Multi-stock comparison
│   │   │   ├── DashboardPage.tsx       # Main financial dashboard
│   │   │   ├── LandingPage.tsx         # Marketing landing page
│   │   │   ├── LoginPage.tsx           # User login
│   │   │   ├── NewsPage.tsx            # Financial news feed
│   │   │   ├── PortfolioPage.tsx       # Portfolio management
│   │   │   ├── RegisterPage.tsx        # User registration
│   │   │   ├── StockAnalysisPage.tsx   # Individual stock analysis
│   │   │   └── WatchlistPage.tsx       # Stock watchlist
│   │   │
│   │   ├── services/                   # API service layer
│   │   │   ├── api.ts                  # Axios client with interceptors
│   │   │   ├── authService.ts
│   │   │   ├── compareService.ts
│   │   │   ├── insightService.ts
│   │   │   ├── marketService.ts
│   │   │   ├── mlService.ts
│   │   │   ├── newsService.ts
│   │   │   ├── portfolioService.ts
│   │   │   ├── stockService.ts
│   │   │   └── watchlistService.ts
│   │   │
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript interfaces
│   │   │
│   │   ├── App.tsx                     # Root component with routes
│   │   ├── main.tsx                    # React entry point
│   │   └── index.css                   # Global styles & Tailwind
│   │
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                           # Python FastAPI backend
│   ├── app/
│   │   ├── api/                       # API route handlers
│   │   │   ├── auth.py                # Authentication endpoints
│   │   │   ├── compare.py             # Stock comparison endpoint
│   │   │   ├── insights.py            # AI insights endpoints
│   │   │   ├── market.py              # Market overview endpoints
│   │   │   ├── ml.py                  # ML prediction endpoint
│   │   │   ├── news.py                # Financial news endpoint
│   │   │   ├── portfolio.py           # Portfolio CRUD endpoints
│   │   │   ├── stocks.py              # Stock data endpoints
│   │   │   └── watchlist.py           # Watchlist endpoints
│   │   │
│   │   ├── analytics/                 # Financial analytics engine
│   │   │   ├── indicators.py          # SMA, EMA, RSI, MACD, etc.
│   │   │   └── insights.py            # Rule-based AI insight generator
│   │   │
│   │   ├── core/                      # Application core
│   │   │   ├── config.py              # Pydantic settings
│   │   │   ├── deps.py                # FastAPI dependencies
│   │   │   └── security.py            # JWT & bcrypt utilities
│   │   │
│   │   ├── database/                  # Database configuration
│   │   │   ├── base.py                # SQLAlchemy engine & session
│   │   │   └── init_db.py             # Table initialization
│   │   │
│   │   ├── ml/                        # Machine learning module
│   │   │   └── predictor.py           # Random Forest stock predictor
│   │   │
│   │   ├── models/                    # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── portfolio.py
│   │   │   ├── watchlist.py
│   │   │   └── stock_history.py
│   │   │
│   │   ├── schemas/                   # Pydantic validation schemas
│   │   │   ├── user.py
│   │   │   ├── stock.py
│   │   │   ├── portfolio.py
│   │   │   └── watchlist.py
│   │   │
│   │   ├── services/                  # Business logic services
│   │   │   ├── stock_service.py       # yfinance data retrieval
│   │   │   ├── portfolio_service.py   # Portfolio calculations
│   │   │   ├── watchlist_service.py   # Watchlist operations
│   │   │   └── news_service.py        # News content service
│   │   │
│   │   └── main.py                    # FastAPI app entry point
│   │
│   ├── tests/                         # Test suite
│   │   ├── conftest.py                # Test fixtures & configuration
│   │   ├── test_auth.py               # Authentication tests
│   │   ├── test_stocks.py             # Stock endpoint tests
│   │   ├── test_portfolio.py          # Portfolio CRUD tests
│   │   └── test_analytics.py          # Financial formula unit tests
│   │
│   ├── requirements.txt               # Python dependencies
│   ├── .env                           # Environment configuration
│   ├── .env.example                   # Example environment file
│   └── Dockerfile                     # Backend Docker image
│
├── docker-compose.yml                 # Multi-container orchestration
├── .gitignore                         # Git ignore rules
└── README.md                          # This documentation
```

---

## 📸 Screenshots

> After running the application, you can capture screenshots of the following pages:

| Page | Description |
|------|-------------|
| Landing Page | Hero section with market preview and feature highlights |
| Dashboard | KPI cards, market indices, portfolio chart, gainers/losers |
| Stock Analysis | AAPL price chart, technical indicators, key metrics |
| Company Comparison | Side-by-side metrics with overlay chart |
| Portfolio | Holdings table, allocation chart, P/L calculations |
| AI Insights | Trend analysis, confidence score, recommendation |
| Watchlist | Monitored stocks with live prices |
| News | Financial news feed with sentiment badges |

---

## 🧪 Testing

### Running Backend Tests

```bash
cd backend

# Run all tests
python -m pytest tests/ -v

# Run specific test files
python -m pytest tests/test_auth.py -v
python -m pytest tests/test_analytics.py -v
python -m pytest tests/test_stocks.py -v
python -m pytest tests/test_portfolio.py -v
```

### Test Coverage

| Test Suite | Tests | Description |
|------------|-------|-------------|
| `test_auth.py` | 4+ | Registration, login, JWT validation, duplicate rejection |
| `test_stocks.py` | 5+ | Search, quotes, historical data, technical indicators |
| `test_portfolio.py` | 5+ | CRUD operations, price enrichment, summary calculations |
| `test_analytics.py` | 10+ | SMA, EMA, RSI, MACD, Bollinger Bands, returns, drawdown, correlation, ML |

**Total: 26 tests — all passing ✅**

### Frontend Build Verification

```bash
cd frontend
npm run build    # TypeScript compilation + Vite production bundling
```

---

## 🔮 Future Enhancements

1. **Real-time WebSocket data streaming** for live price updates
2. **Options chain analysis** with Greeks calculations
3. **Fundamental analysis** with quarterly earnings and balance sheet data
4. **Social sentiment analysis** from Twitter/Reddit using NLP
5. **Email alerts** for price targets and portfolio changes
6. **Advanced charting** with TradingView widget integration
7. **Multi-currency support** with forex conversion
8. **LSTM/Transformer models** for time-series price forecasting
9. **Backtesting engine** for testing trading strategies against historical data
10. **Mobile app** using React Native with shared TypeScript logic
11. **Real news API integration** (NewsAPI, Alpha Vantage) when API key available
12. **Export reports** as PDF for portfolio performance summaries
13. **Two-factor authentication** for enhanced security
14. **Rate limiting** and API key management for production deployment

---

## ⚠️ Disclaimer

FinSight is an **educational and analytical tool** built for learning purposes. It is **not a licensed financial advisor** and should not be used as the sole basis for investment decisions.

- Stock data is retrieved from Yahoo Finance and may be **delayed or cached** — it is never labeled as "real-time."
- AI insights are generated using **rule-based heuristics**, not a licensed advisory engine.
- ML predictions are **statistical models** based on historical patterns and carry no guarantee of future performance.
- Always consult a qualified financial advisor before making investment decisions.
- Past performance is not indicative of future results.

---

## 📄 License

This project is built for educational purposes as part of a Computer Science Engineering curriculum. Feel free to use, modify, and learn from the codebase.

---

**Built with ❤️ by FinSight Team | 2026**

