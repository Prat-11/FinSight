export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
  access_token?: string;
  token_type?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface StockQuote {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  marketCap?: number;
  peRatio?: number;
  eps?: number;
  high52?: number;
  low52?: number;
  dividendYield?: number;
  currency?: string;
  lastUpdated?: string;
  isDemo?: boolean;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  symbol: string;
  sma20: number;
  sma50: number;
  sma200: number;
  rsi14: number;
  macd: number;
  macdSignal: number;
  macdHist: number;
  upperBand: number;
  lowerBand: number;
  signal?: 'BUY' | 'SELL' | 'NEUTRAL' | 'STRONG_BUY' | 'STRONG_SELL';
}

export interface StockDetails {
  quote: StockQuote;
  historical: HistoricalDataPoint[];
  indicators: TechnicalIndicators;
  overview?: {
    sector?: string;
    industry?: string;
    description?: string;
    employees?: number;
    ceo?: string;
    headquarters?: string;
    website?: string;
  };
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  isDemo?: boolean;
}

export interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export interface MarketOverview {
  indices: MarketIndex[];
  topGainers: MarketMover[];
  topLosers: MarketMover[];
  marketSentiment?: string;
  lastUpdated: string;
  isDemo?: boolean;
}

export interface PortfolioHolding {
  id: string;
  symbol: string;
  companyName: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice: number;
  currentValue: number;
  totalCost: number;
  profitLoss: number;
  profitLossPercent: number;
  allocationPercent?: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  dailyProfitLoss: number;
  dailyProfitLossPercent: number;
  holdingsCount: number;
  isDemo?: boolean;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  high52?: number;
  low52?: number;
  addedAt: string;
  isDemo?: boolean;
}

export interface AIInsight {
  id: string;
  symbol: string;
  companyName: string;
  timestamp: string;
  trend: 'Bullish' | 'Bearish' | 'Neutral' | 'Strong Bullish';
  rsiSignal: 'Overbought' | 'Oversold' | 'Neutral';
  volatilityLevel: 'Low' | 'Moderate' | 'High' | 'Extreme';
  movingAverageSignal: 'Golden Cross' | 'Death Cross' | 'Above 50 SMA' | 'Below 50 SMA' | 'Consolidating';
  volumeAnalysis: string;
  summary: string;
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  confidenceScore: number;
  keyFactors: string[];
  modelMetrics?: {
    modelType: string;
    accuracy: number;
    precision: number;
    rmse: number;
    targetPrice?: number;
  };
  isDemo?: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  symbol?: string;
  category?: string;
  isDemo?: boolean;
}

export interface ComparisonStockMetric {
  symbol: string;
  companyName: string;
  price: number;
  changePercent: number;
  marketCap: number;
  peRatio: number;
  eps: number;
  rsi: number;
  return1M: number;
  return1Y: number;
  dividendYield: number;
}
