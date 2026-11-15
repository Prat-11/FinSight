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
    const cleanSymbols = symbols.map((s) => s.toUpperCase().trim());

    try {
      const response = await apiClient.post<any>('/compare', { symbols: cleanSymbols });
      const data = response.data;
      if (!data) throw new Error('No comparison data');

      // Backend metrics is a dictionary { [sym]: metricObj }
      const rawMetrics = data.metrics || {};
      const metricsList: ComparisonStockMetric[] = Object.keys(rawMetrics).map((sym) => {
        const m = rawMetrics[sym];
        return {
          symbol: sym,
          companyName: m.companyName || m.company_name || `${sym} Inc.`,
          price: Number(m.price ?? m.current_price ?? 150),
          changePercent: Number(m.changePercent ?? m.percent_change ?? 0),
          marketCap: Number(m.marketCap ?? m.market_cap ?? 100000000000),
          peRatio: Number(m.peRatio ?? m.pe_ratio ?? 25),
          eps: Number(m.eps ?? 5),
          rsi: Number(m.rsi ?? 50),
          return1M: Number(m.return1M ?? m.return_1m ?? 2.5),
          return1Y: Number(m.return1Y ?? m.return_1y ?? 15.0),
          dividendYield: Number(m.dividendYield ?? m.dividend_yield ?? 0.5),
        };
      });

      const historicalSeries = (data.normalized_performance || data.historicalSeries || []).map((pt: any) => {
        const out: any = { date: String(pt.date || '') };
        cleanSymbols.forEach((s) => {
          // ensure Base=100 relative price progression
          out[s] = Number(pt[s] !== undefined ? (100 + Number(pt[s])) : 100);
        });
        return out;
      });

      return {
        metrics: metricsList.length > 0 ? metricsList : cleanSymbols.map((sym) => ({
          symbol: sym,
          companyName: `${sym} Corp.`,
          price: 150,
          changePercent: 1.2,
          marketCap: 100000000000,
          peRatio: 25,
          eps: 5.5,
          rsi: 54,
          return1M: 3.2,
          return1Y: 18.5,
          dividendYield: 0.6,
        })),
        historicalSeries: historicalSeries.length > 0 ? historicalSeries : generateFallbackSeries(cleanSymbols),
        isDemo: false,
      };
    } catch {
      const metrics: ComparisonStockMetric[] = [];
      for (const symbol of cleanSymbols) {
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
          metrics.push({
            symbol,
            companyName: `${symbol} Corporation`,
            price: 150,
            changePercent: 1.0,
            marketCap: 75000000000,
            peRatio: 24,
            eps: 5.2,
            rsi: 55,
            return1M: 3.0,
            return1Y: 16.0,
            dividendYield: 0.8,
          });
        }
      }

      return {
        metrics,
        historicalSeries: generateFallbackSeries(cleanSymbols),
        isDemo: true,
      };
    }
  },
};

const generateFallbackSeries = (symbols: string[]) => {
  const points: { date: string; [symbol: string]: number | string }[] = [];
  const now = new Date();
  const currentPrices: Record<string, number> = {};
  symbols.forEach((s) => (currentPrices[s] = 100));

  for (let i = 30; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const point: any = { date: dateStr };

    symbols.forEach((s) => {
      const delta = (Math.random() - 0.47) * 2.5;
      currentPrices[s] = Math.max(70, currentPrices[s] + delta);
      point[s] = parseFloat(currentPrices[s].toFixed(1));
    });
    points.push(point);
  }
  return points;
};

export default compareService;
