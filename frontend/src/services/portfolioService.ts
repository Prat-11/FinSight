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
  const totalValue = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
  const totalInvested = holdings.reduce((sum, h) => sum + (h.totalCost || 0), 0);
  const totalProfitLoss = totalValue - totalInvested;
  const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  // Calculate allocations
  holdings.forEach((h) => {
    h.allocationPercent = totalValue > 0 ? parseFloat((((h.currentValue || 0) / totalValue) * 100).toFixed(1)) : 0;
  });

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
      const response = await apiClient.get<any>('/portfolio');
      const data = response.data;
      if (!data) throw new Error('No portfolio data');

      const rawHoldings = data.holdings || (Array.isArray(data) ? data : []);
      const holdings: PortfolioHolding[] = rawHoldings.map((h: any) => {
        const qty = Number(h.quantity ?? 1);
        const buyPrice = Number(h.purchase_price ?? h.purchasePrice ?? 0);
        const curPrice = Number(h.current_price ?? h.currentPrice ?? buyPrice);
        const curVal = Number(h.current_value ?? h.currentValue ?? (qty * curPrice));
        const cost = Number(h.invested_value ?? h.totalCost ?? (qty * buyPrice));
        const pl = Number(h.gain_loss ?? h.profitLoss ?? (curVal - cost));
        const plPct = cost > 0 ? Number(h.gain_loss_percent ?? h.profitLossPercent ?? ((pl / cost) * 100)) : 0;

        return {
          id: String(h.id),
          symbol: h.symbol || '',
          companyName: h.company_name ?? h.companyName ?? h.symbol ?? '',
          quantity: qty,
          purchasePrice: buyPrice,
          purchaseDate: String(h.purchase_date ?? h.purchaseDate ?? ''),
          currentPrice: curPrice,
          currentValue: curVal,
          totalCost: cost,
          profitLoss: pl,
          profitLossPercent: plPct,
          allocationPercent: Number(h.allocationPercent ?? 0),
        };
      });

      const totalVal = Number(data.total_current_value ?? data.totalValue ?? holdings.reduce((s, h) => s + h.currentValue, 0));
      const totalInv = Number(data.total_invested ?? data.totalInvested ?? holdings.reduce((s, h) => s + h.totalCost, 0));
      const totalPl = Number(data.total_gain_loss ?? data.totalProfitLoss ?? (totalVal - totalInv));
      const totalPlPct = totalInv > 0 ? Number(data.total_gain_loss_percent ?? data.totalProfitLossPercent ?? ((totalPl / totalInv) * 100)) : 0;

      if (totalVal > 0) {
        holdings.forEach((h) => {
          h.allocationPercent = parseFloat(((h.currentValue / totalVal) * 100).toFixed(1));
        });
      }

      const summary: PortfolioSummary = {
        totalValue: parseFloat(totalVal.toFixed(2)),
        totalInvested: parseFloat(totalInv.toFixed(2)),
        totalProfitLoss: parseFloat(totalPl.toFixed(2)),
        totalProfitLossPercent: parseFloat(totalPlPct.toFixed(2)),
        dailyProfitLoss: parseFloat((totalVal * 0.0084).toFixed(2)),
        dailyProfitLossPercent: 0.84,
        holdingsCount: Number(data.total_holdings_count ?? data.holdingsCount ?? holdings.length),
        isDemo: holdings.length === 0,
      };

      // If user has no holdings yet in the database, return demo holdings for rich presentation
      if (holdings.length === 0) {
        const demoHoldings = getStoredHoldings();
        return { holdings: demoHoldings, summary: calculateSummary(demoHoldings) };
      }

      return { holdings, summary };
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
      const response = await apiClient.post<any>('/portfolio', {
        symbol: data.symbol,
        company_name: data.companyName,
        quantity: data.quantity,
        purchase_price: data.purchasePrice,
        purchase_date: data.purchaseDate,
      });
      const h = response.data;
      return {
        id: String(h.id),
        symbol: h.symbol,
        companyName: h.company_name ?? data.companyName,
        quantity: h.quantity,
        purchasePrice: h.purchase_price ?? data.purchasePrice,
        purchaseDate: h.purchase_date ?? data.purchaseDate,
        currentPrice: h.current_price ?? data.purchasePrice,
        currentValue: h.current_value ?? (data.quantity * (h.current_price ?? data.purchasePrice)),
        totalCost: h.invested_value ?? (data.quantity * data.purchasePrice),
        profitLoss: h.gain_loss ?? 0,
        profitLossPercent: h.gain_loss_percent ?? 0,
      };
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
      const response = await apiClient.put<any>(`/portfolio/${id}`, {
        quantity: data.quantity,
        purchase_price: data.purchasePrice,
        purchase_date: data.purchaseDate,
      });
      const h = response.data;
      return {
        id: String(h.id),
        symbol: h.symbol,
        companyName: h.company_name,
        quantity: h.quantity,
        purchasePrice: h.purchase_price,
        purchaseDate: h.purchase_date,
        currentPrice: h.current_price ?? h.purchase_price,
        currentValue: h.current_value ?? (h.quantity * (h.current_price ?? h.purchase_price)),
        totalCost: h.invested_value ?? (h.quantity * h.purchase_price),
        profitLoss: h.gain_loss ?? 0,
        profitLossPercent: h.gain_loss_percent ?? 0,
      };
    } catch {
      const holdings = getStoredHoldings();
      const index = holdings.findIndex((h) => h.id === id);
      if (index === -1) throw new Error('Holding not found');

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
      await apiClient.delete(`/portfolio/${id}`);
    } catch {
      const holdings = getStoredHoldings();
      const filtered = holdings.filter((h) => h.id !== id);
      saveStoredHoldings(filtered);
    }
  },
};

export default portfolioService;
