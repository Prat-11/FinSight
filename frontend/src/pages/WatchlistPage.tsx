import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { watchlistService } from '../services/watchlistService';
import { WatchlistItem } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SearchInput from '../components/ui/SearchInput';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

export const WatchlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlist = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await watchlistService.getWatchlist();
      setWatchlist(items);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch watchlist');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleAddStock = async (item: { symbol: string; name: string }) => {
    try {
      await watchlistService.addToWatchlist(item.symbol, item.name);
      fetchWatchlist();
    } catch {
      // handled
    }
  };

  const handleRemove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await watchlistService.removeFromWatchlist(id);
      setWatchlist((prev) => prev.filter((item) => item.id !== id));
    } catch {
      // handled
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading watched equities..." className="py-24" />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchWatchlist} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Bookmark className="w-7 h-7 text-blue-500" />
            <span>Market Watchlist</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Pin priority assets, monitor price oscillations, and trigger technical alerts.
          </p>
        </div>

        <div className="w-full sm:w-80">
          <SearchInput
            placeholder="Add ticker to watchlist..."
            onSelectStock={handleAddStock}
          />
        </div>
      </div>

      {/* Watchlist Table */}
      <Card
        title={`Pinned Securities (${watchlist.length})`}
        subtitle="Live prices, daily fluctuations, and 52-week trading ranges"
      >
        {watchlist.length === 0 ? (
          <EmptyState
            title="Watchlist is Empty"
            description="Use the search bar above to look up stocks and add them to your watchlist."
            className="my-6"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-gray-800 text-gray-400">
                <tr>
                  <th className="py-3 px-4">Security</th>
                  <th className="py-3 px-4 text-right">Last Price</th>
                  <th className="py-3 px-4 text-right">Net Change</th>
                  <th className="py-3 px-4 text-right">Change %</th>
                  <th className="py-3 px-4 text-right">52W Range</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {watchlist.map((item) => {
                  const isGain = item.change >= 0;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/stocks/${item.symbol}`)}
                      className="hover:bg-gray-800/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                            {item.symbol}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 font-sans truncate max-w-[200px]">
                          {item.companyName}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-sm text-white">
                        ${item.price.toFixed(2)}
                      </td>

                      <td className={`py-3.5 px-4 text-right font-semibold ${isGain ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isGain ? '+' : ''}${item.change.toFixed(2)}
                      </td>

                      <td className={`py-3.5 px-4 text-right font-bold ${isGain ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <div className="inline-flex items-center gap-1">
                          {isGain ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          <span>{isGain ? '+' : ''}{item.changePercent.toFixed(2)}%</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right text-gray-400">
                        {item.low52 && item.high52 ? (
                          <span>
                            ${item.low52.toFixed(2)} - ${item.high52.toFixed(2)}
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/stocks/${item.symbol}`)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-gray-800 transition-colors"
                            title="Detailed Analysis"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleRemove(item.id, e)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-gray-800 transition-colors"
                            title="Remove from Watchlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default WatchlistPage;
