import apiClient from './api';
import { WatchlistItem } from '../types';
import { stockService } from './stockService';

const INITIAL_DEMO_WATCHLIST: WatchlistItem[] = [
  {
    id: 'watch-1',
    symbol: 'NVDA',
    companyName: 'NVIDIA Corporation',
    price: 138.25,
    change: 5.60,
    changePercent: 4.22,
    high52: 140.76,
    low52: 45.45,
    addedAt: '2024-02-10',
    isDemo: true,
  },
  {
    id: 'watch-2',
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    price: 228.45,
    change: 3.12,
    changePercent: 1.38,
    high52: 237.23,
    low52: 164.08,
    addedAt: '2024-03-01',
    isDemo: true,
  },
  {
    id: 'watch-3',
    symbol: 'TSLA',
    companyName: 'Tesla, Inc.',
    price: 219.75,
    change: 8.90,
    changePercent: 4.22,
    high52: 271.00,
    low52: 138.80,
    addedAt: '2024-04-12',
    isDemo: true,
  },
  {
    id: 'watch-4',
    symbol: 'RELIANCE',
    companyName: 'Reliance Industries Ltd.',
    price: 2985.50,
    change: 34.20,
    changePercent: 1.16,
    high52: 3217.90,
    low52: 2221.05,
    addedAt: '2024-05-18',
    isDemo: true,
  },
  {
    id: 'watch-5',
    symbol: 'GOOGL',
    companyName: 'Alphabet Inc.',
    price: 174.50,
    change: 1.85,
    changePercent: 1.07,
    high52: 193.31,
    low52: 129.40,
    addedAt: '2024-06-20',
    isDemo: true,
  },
];

const WATCHLIST_STORAGE_KEY = 'finsight_demo_watchlist';

const getStoredWatchlist = (): WatchlistItem[] => {
  const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_DEMO_WATCHLIST;
    }
  }
  localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_WATCHLIST));
  return INITIAL_DEMO_WATCHLIST;
};

const saveStoredWatchlist = (watchlist: WatchlistItem[]) => {
  localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
};

export const watchlistService = {
  async getWatchlist(): Promise<WatchlistItem[]> {
    try {
      const response = await apiClient.get<any>('/watchlist');
      const data = response.data;
      if (!data) throw new Error('No watchlist data');

      const raw = Array.isArray(data) ? data : [data];
      const items: WatchlistItem[] = raw.map((item: any) => ({
        id: String(item.id),
        symbol: item.symbol || '',
        companyName: item.company_name ?? item.companyName ?? item.symbol ?? '',
        price: Number(item.current_price ?? item.price ?? 0),
        change: Number(item.change ?? 0),
        changePercent: Number(item.percent_change ?? item.changePercent ?? 0),
        high52: Number(item.week_52_high ?? item.day_high ?? item.high52 ?? 0),
        low52: Number(item.week_52_low ?? item.day_low ?? item.low52 ?? 0),
        addedAt: String(item.added_at ?? item.addedAt ?? ''),
        isDemo: item.isDemo || false,
      }));

      if (items.length === 0) {
        return getStoredWatchlist();
      }

      return items;
    } catch {
      return getStoredWatchlist();
    }
  },

  async addToWatchlist(symbol: string, companyName?: string): Promise<WatchlistItem> {
    try {
      const response = await apiClient.post<any>('/watchlist', {
        symbol: symbol.toUpperCase(),
        company_name: companyName,
      });
      const item = response.data;
      return {
        id: String(item.id),
        symbol: item.symbol,
        companyName: item.company_name ?? companyName ?? item.symbol,
        price: Number(item.current_price ?? 0),
        change: Number(item.change ?? 0),
        changePercent: Number(item.percent_change ?? 0),
        high52: Number(item.week_52_high ?? item.day_high ?? 0),
        low52: Number(item.week_52_low ?? item.day_low ?? 0),
        addedAt: String(item.added_at ?? new Date().toISOString()),
        isDemo: false,
      };
    } catch {
      const watchlist = getStoredWatchlist();
      const upper = symbol.toUpperCase();
      const existing = watchlist.find((item) => item.symbol === upper);
      if (existing) return existing;

      const quote = await stockService.getStockQuote(upper);

      const newItem: WatchlistItem = {
        id: 'watch-' + Date.now(),
        symbol: upper,
        companyName: companyName || quote.companyName,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        high52: quote.high52,
        low52: quote.low52,
        addedAt: new Date().toISOString().split('T')[0],
        isDemo: true,
      };

      watchlist.unshift(newItem);
      saveStoredWatchlist(watchlist);
      return newItem;
    }
  },

  async removeFromWatchlist(id: string): Promise<void> {
    try {
      await apiClient.delete(`/watchlist/${id}`);
    } catch {
      const watchlist = getStoredWatchlist();
      const filtered = watchlist.filter((item) => item.id !== id && item.symbol !== id);
      saveStoredWatchlist(filtered);
    }
  },
};

export default watchlistService;
