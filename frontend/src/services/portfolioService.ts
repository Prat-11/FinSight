import apiClient from './api';
import { PortfolioHolding, PortfolioSummary } from '../types';

const INITIAL_DEMO_HOLDINGS: PortfolioHolding[] = [
  {
    id: 'hold-1',
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    quantity: 25,
    purchasePrice: 195.50,
    purchaseDate: '2024-01-15',
    currentPrice: 228.45,
    currentValue: 5711.25,
    totalCost: 4887.50,
    profitLoss: 823.75,
    profitLossPercent: 16.85,
    allocationPercent: 32.5,
  },
  {
    id: 'hold-2',
    symbol: 'NVDA',
    companyName: 'NVIDIA Corporation',
    quantity: 30,
    purchasePrice: 110.20,
    purchaseDate: '2024-03-22',
    currentPrice: 138.25,
    currentValue: 4147.50,
    totalCost: 3306.00,
    profitLoss: 841.50,
    profitLossPercent: 25.45,
    allocationPercent: 23.6,
  },
  {
    id: 'hold-3',
    symbol: 'MSFT',
    companyName: 'Microsoft Corporation',
    quantity: 10,
    purchasePrice: 410.00,
    purchaseDate: '2024-04-10',
    currentPrice: 422.80,
    currentValue: 4228.00,
    totalCost: 4100.00,
    profitLoss: 128.00,
    profitLossPercent: 3.12,
    allocationPercent: 24.1,
  },
  {
    id: 'hold-4',
    symbol: 'TSLA',
    companyName: 'Tesla, Inc.',
    quantity: 16,
    purchasePrice: 180.50,
    purchaseDate: '2024-06-05',
    currentPrice: 219.75,
    currentValue: 3516.00,
    totalCost: 2888.00,
    profitLoss: 628.00,
    profitLossPercent: 21.75,
    allocationPercent: 19.8,
  },
];

const STORAGE_KEY = 'finsight_demo_portfolio';

const getStoredHoldings = (): PortfolioHolding[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_DEMO_HOLDINGS;
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_HOLDINGS));
  return INITIAL_DEMO_HOLDINGS;
};

const saveStoredHoldings = (holdings: PortfolioHolding[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
};

const calculateSummary = (holdings: PortfolioHolding[]): PortfolioSummary => {
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalInvested = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalProfitLoss = totalValue - totalInvested;
  const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
  
  // Calculate allocations
  holdings.forEach((h) => {
    h.allocationPercent = totalValue > 0 ? parseFloat(((h.currentValue / totalValue) * 100).toFixed(1)) : 0;
  });

  // Calculate simulated daily P/L (approx +0.84%)
  const dailyProfitLoss = totalValue * 0.0084;
  const dailyProfitLossPercent = 0.84;

  return {
    totalValue: parseFloat(totalValue.toFixed(2)),
    totalInvested: parseFloat(totalInvested.toFixed(2)),
    totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
    totalProfitLossPercent: parseFloat(totalProfitLossPercent.toFixed(2)),
    dailyProfitLoss: parseFloat(dailyProfitLoss.toFixed(2)),
    dailyProfitLossPercent,
    holdingsCount: holdings.length,
    isDemo: true,
  };
};

export const portfolioService = {
  async getPortfolio(): Promise<{ holdings: PortfolioHolding[]; summary: PortfolioSummary }> {
    try {
      const response = await apiClient.get<{ holdings: PortfolioHolding[]; summary: PortfolioSummary }>('/portfolio');
      return response.data;
    } catch {
      const holdings = getStoredHoldings();
      const summary = calculateSummary(holdings);
      return { holdings, summary };
    }
  },

  async addHolding(data: {
    symbol: string;
    companyName: string;
    quantity: number;
    purchasePrice: number;
    purchaseDate: string;
    currentPrice?: number;
  }): Promise<PortfolioHolding> {
    try {
      const response = await apiClient.post<PortfolioHolding>('/portfolio/holdings', data);
      return response.data;
    } catch {
      const holdings = getStoredHoldings();
      const currentPrice = data.currentPrice || data.purchasePrice;
      const totalCost = data.quantity * data.purchasePrice;
      const currentValue = data.quantity * currentPrice;
      const profitLoss = currentValue - totalCost;
      const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

      const newHolding: PortfolioHolding = {
        id: 'hold-' + Date.now(),
        symbol: data.symbol.toUpperCase(),
        companyName: data.companyName,
        quantity: data.quantity,
        purchasePrice: data.purchasePrice,
        purchaseDate: data.purchaseDate || new Date().toISOString().split('T')[0],
        currentPrice,
        currentValue: parseFloat(currentValue.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        profitLoss: parseFloat(profitLoss.toFixed(2)),
        profitLossPercent: parseFloat(profitLossPercent.toFixed(2)),
      };

      holdings.push(newHolding);
      saveStoredHoldings(holdings);
      return newHolding;
    }
  },

  async updateHolding(
    id: string,
    data: {
      quantity: number;
      purchasePrice: number;
      purchaseDate?: string;
    }
  ): Promise<PortfolioHolding> {
    try {
      const response = await apiClient.put<PortfolioHolding>(`/portfolio/holdings/${id}`, data);
      return response.data;
    } catch {
      const holdings = getStoredHoldings();
      const index = holdings.findIndex((h) => h.id === id);
      if (index === -1) {
        throw new Error('Holding not found');
      }

      const existing = holdings[index];
      const quantity = data.quantity;
      const purchasePrice = data.purchasePrice;
      const totalCost = quantity * purchasePrice;
      const currentValue = quantity * existing.currentPrice;
      const profitLoss = currentValue - totalCost;
      const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

      const updated: PortfolioHolding = {
        ...existing,
        quantity,
        purchasePrice,
        purchaseDate: data.purchaseDate || existing.purchaseDate,
        totalCost: parseFloat(totalCost.toFixed(2)),
        currentValue: parseFloat(currentValue.toFixed(2)),
        profitLoss: parseFloat(profitLoss.toFixed(2)),
        profitLossPercent: parseFloat(profitLossPercent.toFixed(2)),
      };

      holdings[index] = updated;
      saveStoredHoldings(holdings);
      return updated;
    }
  },

  async deleteHolding(id: string): Promise<void> {
    try {
      await apiClient.delete(`/portfolio/holdings/${id}`);
    } catch {
      const holdings = getStoredHoldings();
      const filtered = holdings.filter((h) => h.id !== id);
      saveStoredHoldings(filtered);
    }
  },
};
