import apiClient from './api';
import { MarketOverview, MarketMover, MarketIndex } from '../types';

const DEMO_INDICES: MarketIndex[] = [
  { symbol: 'NIFTY 50', name: 'Nifty 50 Index', value: 24367.85, change: 142.30, changePercent: 0.59, high: 24420.50, low: 24280.10, isDemo: true },
  { symbol: 'SENSEX', name: 'BSE Sensex', value: 80115.20, change: 485.60, changePercent: 0.61, high: 80280.40, low: 79850.30, isDemo: true },
  { symbol: 'NASDAQ', name: 'NASDAQ Composite', value: 18780.25, change: 124.75, changePercent: 0.67, high: 18850.10, low: 18690.40, isDemo: true },
  { symbol: 'S&P 500', name: 'S&P 500 Index', value: 5864.67, change: 23.40, changePercent: 0.40, high: 5885.20, low: 5845.10, isDemo: true },
];

const DEMO_GAINERS: MarketMover[] = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 138.25, change: 5.60, changePercent: 4.22, volume: 48290120 },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 219.75, change: 8.90, changePercent: 4.22, volume: 35120400 },
  { symbol: 'INFY', name: 'Infosys Limited', price: 1855.20, change: 22.80, changePercent: 1.24, volume: 8124000 },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 228.45, change: 3.12, changePercent: 1.38, volume: 32410800 },
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', price: 2985.50, change: 34.20, changePercent: 1.16, volume: 6412000 },
];

const DEMO_LOSERS: MarketMover[] = [
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 186.40, change: -1.15, changePercent: -0.61, volume: 19800450 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 422.80, change: -2.45, changePercent: -0.58, volume: 14230100 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4120.30, change: -18.70, changePercent: -0.45, volume: 3201400 },
  { symbol: 'META', name: 'Meta Platforms Inc.', price: 582.10, change: -4.30, changePercent: -0.73, volume: 12401800 },
  { symbol: 'INTC', name: 'Intel Corporation', price: 22.40, change: -0.85, changePercent: -3.66, volume: 45210900 },
];

export const marketService = {
  async getMarketOverview(): Promise<MarketOverview> {
    try {
      const response = await apiClient.get<MarketOverview>('/market/overview');
      return response.data;
    } catch {
      return {
        indices: DEMO_INDICES,
        topGainers: DEMO_GAINERS,
        topLosers: DEMO_LOSERS,
        marketSentiment: 'Bullish (Fear & Greed: 64 - Greed)',
        lastUpdated: new Date().toLocaleTimeString(),
        isDemo: true,
      };
    }
  },

  async getTopGainers(): Promise<MarketMover[]> {
    try {
      const response = await apiClient.get<MarketMover[]>('/market/movers/gainers');
      return response.data;
    } catch {
      return DEMO_GAINERS;
    }
  },

  async getTopLosers(): Promise<MarketMover[]> {
    try {
      const response = await apiClient.get<MarketMover[]>('/market/movers/losers');
      return response.data;
    } catch {
      return DEMO_LOSERS;
    }
  },
};
