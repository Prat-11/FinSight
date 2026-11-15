import apiClient from './api';
import { ComparisonStockMetric } from '../types';
import { stockService } from './stockService';

export interface ComparisonResult {
  metrics: ComparisonStockMetric[];
  historicalSeries: {
    date: string;
    [symbol: string]: number | string;
  }[];
  isDemo?: boolean;
}

const STOCK_METRIC_MAP: Record<string, Partial<ComparisonStockMetric>> = {
  AAPL: { companyName: 'Apple Inc.', price: 228.45, changePercent: 1.38, marketCap: 3480000000000, peRatio: 34.2, eps: 6.68, rsi: 58, return1M: 4.8, return1Y: 28.5, dividendYield: 0.44 },
  MSFT: { companyName: 'Microsoft Corporation', price: 422.80, changePercent: -0.58, marketCap: 3140000000000, peRatio: 35.8, eps: 11.80, rsi: 49, return1M: 2.1, return1Y: 24.2, dividendYield: 0.71 },
  NVDA: { companyName: 'NVIDIA Corporation', price: 138.25, changePercent: 4.22, marketCap: 3390000000000, peRatio: 52.4, eps: 2.64, rsi: 68, return1M: 14.5, return1Y: 178.6, dividendYield: 0.03 },
  GOOGL: { companyName: 'Alphabet Inc.', price: 174.50, changePercent: 1.07, marketCap: 2160000000000, peRatio: 23.6, eps: 7.39, rsi: 54, return1M: 3.2, return1Y: 31.4, dividendYield: 0.46 },
  AMZN: { companyName: 'Amazon.com Inc.', price: 186.40, changePercent: -0.61, marketCap: 1940000000000, peRatio: 43.1, eps: 4.32, rsi: 52, return1M: 5.6, return1Y: 38.2, dividendYield: 0.00 },
  TSLA: { companyName: 'Tesla, Inc.', price: 219.75, changePercent: 4.22, marketCap: 701000000000, peRatio: 61.2, eps: 3.59, rsi: 62, return1M: 8.9, return1Y: 12.4, dividendYield: 0.00 },
  RELIANCE: { companyName: 'Reliance Industries Ltd.', price: 2985.50, changePercent: 1.16, marketCap: 240000000000, peRatio: 28.4, eps: 105.12, rsi: 56, return1M: 3.9, return1Y: 22.8, dividendYield: 0.33 },
  TCS: { companyName: 'Tata Consultancy Services', price: 4120.30, changePercent: -0.45, marketCap: 178000000000, peRatio: 31.2, eps: 132.05, rsi: 47, return1M: -1.2, return1Y: 19.4, dividendYield: 1.15 },
};

export const compareService = {
  async compareStocks(symbols: string[]): Promise<ComparisonResult> {
    try {
      const response = await apiClient.post<ComparisonResult>('/stocks/compare', { symbols });
      return response.data;
    } catch {
      const upperSymbols = symbols.map((s) => s.toUpperCase());
      const metrics: ComparisonStockMetric[] = [];

      for (const symbol of upperSymbols) {
        const known = STOCK_METRIC_MAP[symbol];
        if (known) {
          metrics.push({
            symbol,
            companyName: known.companyName || `${symbol} Inc.`,
            price: known.price || 150,
            changePercent: known.changePercent || 0,
            marketCap: known.marketCap || 100000000000,
            peRatio: known.peRatio || 25,
            eps: known.eps || 5,
            rsi: known.rsi || 50,
            return1M: known.return1M || 2.5,
            return1Y: known.return1Y || 15.0,
            dividendYield: known.dividendYield || 0.5,
          });
        } else {
          const quote = await stockService.getStockQuote(symbol);
          metrics.push({
            symbol,
            companyName: quote.companyName,
            price: quote.price,
            changePercent: quote.changePercent,
            marketCap: quote.marketCap || 50000000000,
            peRatio: quote.peRatio || 25,
            eps: quote.eps || 4.5,
            rsi: 55,
            return1M: 3.0,
            return1Y: 18.0,
            dividendYield: quote.dividendYield || 0.8,
          });
        }
      }

      // Generate 30 days of normalized performance (starting at 100 on day 0)
      const historicalSeries: { date: string; [symbol: string]: number | string }[] = [];
      const now = new Date();
      const currentValues: Record<string, number> = {};
      upperSymbols.forEach((s) => (currentValues[s] = 100));

      for (let i = 30; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const point: { date: string; [symbol: string]: number | string } = {
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        };

        upperSymbols.forEach((s) => {
          if (i === 30) {
            point[s] = 100;
          } else {
            const delta = (Math.random() - 0.48) * 1.8;
            currentValues[s] = parseFloat(Math.max(80, currentValues[s] + delta).toFixed(2));
            point[s] = currentValues[s];
          }
        });

        historicalSeries.push(point);
      }

      return {
        metrics,
        historicalSeries,
        isDemo: true,
      };
    }
  },
};
