import apiClient from './api';
import { StockQuote, HistoricalDataPoint, TechnicalIndicators, StockDetails } from '../types';

const generateHistoricalData = (basePrice: number, days: number = 30): HistoricalDataPoint[] => {
  const points: HistoricalDataPoint[] = [];
  let currentPrice = basePrice;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const changePercent = (Math.random() - 0.48) * 0.035;
    currentPrice = Math.max(10, currentPrice * (1 + changePercent));
    const high = currentPrice * (1 + Math.random() * 0.015);
    const low = currentPrice * (1 - Math.random() * 0.015);
    const open = low + Math.random() * (high - low);
    const volume = Math.floor(1000000 + Math.random() * 4000000);

    points.push({
      date: d.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(currentPrice.toFixed(2)),
      volume,
    });
  }
  return points;
};

const getDemoStockQuote = (symbol: string): StockQuote => {
  const stockMap: Record<string, Partial<StockQuote>> = {
    AAPL: { companyName: 'Apple Inc.', price: 228.45, change: 3.12, changePercent: 1.38, high: 230.10, low: 225.80, open: 226.00, previousClose: 225.33, marketCap: 3480000000000, peRatio: 34.2, eps: 6.68, high52: 237.23, low52: 164.08, dividendYield: 0.44 },
    MSFT: { companyName: 'Microsoft Corporation', price: 422.80, change: -2.45, changePercent: -0.58, high: 426.50, low: 421.10, open: 425.00, previousClose: 425.25, marketCap: 3140000000000, peRatio: 35.8, eps: 11.80, high52: 468.35, low52: 366.50, dividendYield: 0.71 },
    NVDA: { companyName: 'NVIDIA Corporation', price: 138.25, change: 5.60, changePercent: 4.22, high: 140.20, low: 133.50, open: 134.10, previousClose: 132.65, marketCap: 3390000000000, peRatio: 52.4, eps: 2.64, high52: 140.76, low52: 45.45, dividendYield: 0.03 },
    GOOGL: { companyName: 'Alphabet Inc.', price: 174.50, change: 1.85, changePercent: 1.07, high: 176.20, low: 173.10, open: 173.80, previousClose: 172.65, marketCap: 2160000000000, peRatio: 23.6, eps: 7.39, high52: 193.31, low52: 129.40, dividendYield: 0.46 },
    AMZN: { companyName: 'Amazon.com Inc.', price: 186.40, change: -1.15, changePercent: -0.61, high: 188.50, low: 185.20, open: 187.50, previousClose: 187.55, marketCap: 1940000000000, peRatio: 43.1, eps: 4.32, high52: 201.20, low52: 118.35, dividendYield: 0.00 },
    TSLA: { companyName: 'Tesla, Inc.', price: 219.75, change: 8.90, changePercent: 4.22, high: 224.50, low: 212.30, open: 213.00, previousClose: 210.85, marketCap: 701000000000, peRatio: 61.2, eps: 3.59, high52: 271.00, low52: 138.80, dividendYield: 0.00 },
    RELIANCE: { companyName: 'Reliance Industries Ltd.', price: 2985.50, change: 34.20, changePercent: 1.16, high: 3010.00, low: 2962.00, open: 2970.00, previousClose: 2951.30, marketCap: 20200000000000, peRatio: 28.4, eps: 105.12, high52: 3217.90, low52: 2221.05, dividendYield: 0.33, currency: 'INR' },
    TCS: { companyName: 'Tata Consultancy Services', price: 4120.30, change: -18.70, changePercent: -0.45, high: 4160.00, low: 4105.00, open: 4150.00, previousClose: 4139.00, marketCap: 14900000000000, peRatio: 31.2, eps: 132.05, high52: 4592.25, low52: 3313.00, dividendYield: 1.15, currency: 'INR' },
    HDFCBANK: { companyName: 'HDFC Bank Ltd.', price: 1680.00, change: 12.40, changePercent: 0.74, high: 1695.00, low: 1672.00, open: 1675.00, previousClose: 1667.60, marketCap: 12800000000000, peRatio: 19.5, eps: 86.15, high52: 1794.00, low52: 1363.45, dividendYield: 1.16, currency: 'INR' },
    INFY: { companyName: 'Infosys Limited', price: 1855.20, change: 22.80, changePercent: 1.24, high: 1870.00, low: 1840.00, open: 1845.00, previousClose: 1832.40, marketCap: 7700000000000, peRatio: 29.8, eps: 62.25, high52: 1991.45, low52: 1358.35, dividendYield: 2.05, currency: 'INR' },
  };

  const upper = symbol.toUpperCase();
  const known = stockMap[upper] || {
    companyName: `${upper} Corp.`,
    price: 150.00,
    change: 1.50,
    changePercent: 1.01,
    high: 152.00,
    low: 148.50,
    open: 149.00,
    previousClose: 148.50,
    marketCap: 50000000000,
    peRatio: 25.0,
    eps: 6.0,
    high52: 175.0,
    low52: 120.0,
    dividendYield: 1.2,
    currency: 'USD',
  };

  return {
    symbol: upper,
    companyName: known.companyName || `${upper} Corporation`,
    price: known.price || 150,
    change: known.change || 0,
    changePercent: known.changePercent || 0,
    high: known.high || (known.price || 150) * 1.02,
    low: known.low || (known.price || 150) * 0.98,
    open: known.open || (known.price || 150) * 0.99,
    previousClose: known.previousClose || (known.price || 150),
    volume: 3450200,
    marketCap: known.marketCap || 50000000000,
    peRatio: known.peRatio || 25.4,
    eps: known.eps || 5.8,
    high52: known.high52 || 180,
    low52: known.low52 || 120,
    dividendYield: known.dividendYield || 1.1,
    currency: known.currency || (upper.includes('NSE') || ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'].includes(upper) ? 'INR' : 'USD'),
    lastUpdated: new Date().toLocaleTimeString(),
    isDemo: true,
  };
};

const mapBackendQuote = (raw: any, symbol: string): StockQuote => {
  const price = Number(raw.current_price ?? raw.price ?? 150);
  return {
    symbol: raw.symbol || symbol.toUpperCase(),
    companyName: raw.company_name ?? raw.companyName ?? `${symbol.toUpperCase()} Corporation`,
    price,
    change: Number(raw.change ?? 0),
    changePercent: Number(raw.percent_change ?? raw.changePercent ?? 0),
    high: Number(raw.day_high ?? raw.high ?? (price * 1.01)),
    low: Number(raw.day_low ?? raw.low ?? (price * 0.99)),
    open: Number(raw.open_price ?? raw.open ?? price),
    previousClose: Number(raw.previous_close ?? raw.previousClose ?? price),
    volume: Number(raw.volume ?? 1000000),
    marketCap: Number(raw.market_cap ?? raw.marketCap ?? 50000000000),
    peRatio: Number(raw.pe_ratio ?? raw.peRatio ?? 25),
    eps: Number(raw.eps ?? 5.5),
    high52: Number(raw.week_52_high ?? raw.high52 ?? (price * 1.2)),
    low52: Number(raw.week_52_low ?? raw.low52 ?? (price * 0.8)),
    dividendYield: Number(raw.dividend_yield ?? raw.dividendYield ?? 0.8),
    currency: raw.currency || 'USD',
    lastUpdated: raw.timestamp ? new Date(raw.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
    isDemo: false,
  };
};

export const stockService = {
  async getStockQuote(symbol: string): Promise<StockQuote> {
    try {
      const response = await apiClient.get<any>(`/stocks/${symbol}/quote`);
      return mapBackendQuote(response.data, symbol);
    } catch {
      return getDemoStockQuote(symbol);
    }
  },

  async getStockHistory(symbol: string, period: string = '1M'): Promise<HistoricalDataPoint[]> {
    try {
      const response = await apiClient.get<HistoricalDataPoint[]>(`/stocks/${symbol}/history`, {
        params: { period },
      });
      if (!Array.isArray(response.data) || response.data.length === 0) {
        throw new Error('Empty history');
      }
      return response.data;
    } catch {
      const daysMap: Record<string, number> = {
        '1D': 1,
        '1W': 7,
        '1M': 30,
        '3M': 90,
        '6M': 180,
        '1Y': 365,
        '5Y': 1825,
      };
      const quote = getDemoStockQuote(symbol);
      return generateHistoricalData(quote.price, daysMap[period] || 30);
    }
  },

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators> {
    try {
      const response = await apiClient.get<any>(`/stocks/${symbol}/indicators`);
      const d = response.data;
      return {
        symbol: symbol.toUpperCase(),
        sma20: Number(d.sma_20 ?? d.sma20 ?? 0),
        sma50: Number(d.sma_50 ?? d.sma50 ?? 0),
        sma200: Number(d.sma_200 ?? d.sma200 ?? 0),
        rsi14: Number(d.rsi ?? d.rsi14 ?? 50),
        macd: Number(d.macd ?? 0),
        macdSignal: Number(d.macd_signal ?? d.macdSignal ?? 0),
        macdHist: Number(d.macd_histogram ?? d.macdHist ?? 0),
        upperBand: Number(d.bollinger_upper ?? d.upperBand ?? 0),
        lowerBand: Number(d.bollinger_lower ?? d.lowerBand ?? 0),
        signal: d.signal || (Number(d.rsi ?? 50) > 65 ? 'BUY' : Number(d.rsi ?? 50) < 35 ? 'SELL' : 'NEUTRAL'),
      };
    } catch {
      const quote = getDemoStockQuote(symbol);
      const price = quote.price;
      const rsi = Math.floor(45 + Math.random() * 25);
      return {
        symbol: symbol.toUpperCase(),
        sma20: parseFloat((price * 0.98).toFixed(2)),
        sma50: parseFloat((price * 0.95).toFixed(2)),
        sma200: parseFloat((price * 0.91).toFixed(2)),
        rsi14: rsi,
        macd: parseFloat((price * 0.012).toFixed(2)),
        macdSignal: parseFloat((price * 0.009).toFixed(2)),
        macdHist: parseFloat((price * 0.003).toFixed(2)),
        upperBand: parseFloat((price * 1.05).toFixed(2)),
        lowerBand: parseFloat((price * 0.94).toFixed(2)),
        signal: rsi > 65 ? 'BUY' : rsi < 35 ? 'SELL' : 'NEUTRAL',
      };
    }
  },

  async getStockDetails(symbol: string, period: string = '1M'): Promise<StockDetails> {
    try {
      const response = await apiClient.get<any>(`/stocks/${symbol}`, {
        params: { period },
      });
      const d = response.data;
      const quote = mapBackendQuote(d.quote || {}, symbol);
      const history = Array.isArray(d.history) && d.history.length > 0 ? d.history : await this.getStockHistory(symbol, period);
      const ind = d.indicators || {};

      return {
        quote,
        historical: history,
        indicators: {
          symbol: symbol.toUpperCase(),
          sma20: Number(ind.sma_20 ?? ind.sma20 ?? (quote.price * 0.98)),
          sma50: Number(ind.sma_50 ?? ind.sma50 ?? (quote.price * 0.95)),
          sma200: Number(ind.sma_200 ?? ind.sma200 ?? (quote.price * 0.91)),
          rsi14: Number(ind.rsi ?? ind.rsi14 ?? 55),
          macd: Number(ind.macd ?? (quote.price * 0.012)),
          macdSignal: Number(ind.macd_signal ?? ind.macdSignal ?? (quote.price * 0.009)),
          macdHist: Number(ind.macd_histogram ?? ind.macdHist ?? (quote.price * 0.003)),
          upperBand: Number(ind.bollinger_upper ?? ind.upperBand ?? (quote.price * 1.05)),
          lowerBand: Number(ind.bollinger_lower ?? ind.lowerBand ?? (quote.price * 0.94)),
          signal: (Number(ind.rsi ?? 55) > 65 ? 'BUY' : Number(ind.rsi ?? 55) < 35 ? 'SELL' : 'NEUTRAL'),
        },
        overview: d.company_info || {
          sector: 'Technology & Financial Intelligence',
          industry: 'Enterprise Software & Analytics',
          description: `${quote.companyName} is a global leader in innovation, research, product development, and institutional operations.`,
          headquarters: 'Global Tech Park, CA',
          website: `https://${symbol.toLowerCase().replace('.ns', '')}.com`,
        },
      };
    } catch {
      const quote = getDemoStockQuote(symbol);
      const history = await this.getStockHistory(symbol, period);
      const indicators = await this.getTechnicalIndicators(symbol);

      return {
        quote,
        historical: history,
        indicators,
        overview: {
          sector: 'Technology & Financial Intelligence',
          industry: 'Enterprise Software & Analytics',
          description: `${quote.companyName} is a global leader in innovation, research, product development, and institutional operations.`,
          headquarters: 'Global Tech Park, CA',
          website: `https://${symbol.toLowerCase().replace('.ns', '')}.com`,
        },
      };
    }
  },

  async searchStocks(query: string): Promise<{ symbol: string; name: string; exchange?: string }[]> {
    if (!query || query.trim().length === 0) return [];
    try {
      const response = await apiClient.get<any>(`/stocks/search`, { params: { q: query } });
      const raw = Array.isArray(response.data) ? response.data : [response.data];
      return raw.map((item: any) => ({
        symbol: item.symbol,
        name: item.name || item.company_name || item.symbol,
        exchange: item.exchange || (item.currency === 'INR' ? 'NSE' : 'NASDAQ'),
      }));
    } catch {
      const defaultList = [
        { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
        { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ' },
        { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', exchange: 'NSE' },
        { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE' },
        { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', exchange: 'NSE' },
        { symbol: 'INFY', name: 'Infosys Limited', exchange: 'NSE' },
      ];
      const q = query.toUpperCase();
      return defaultList.filter(
        (s) => s.symbol.includes(q) || s.name.toUpperCase().includes(q)
      );
    }
  },
};

export default stockService;
