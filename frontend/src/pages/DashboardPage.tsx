import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { marketService } from '../services/marketService';
import { portfolioService } from '../services/portfolioService';
import { watchlistService } from '../services/watchlistService';
import { MarketOverview, PortfolioHolding, PortfolioSummary, WatchlistItem } from '../types';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AreaChart from '../charts/AreaChart';
import PieChart from '../charts/PieChart';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [marketData, setMarketData] = useState<MarketOverview | null>(null);
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [marketRes, portfolioRes, watchlistRes] = await Promise.all([
        marketService.getMarketOverview(),
        portfolioService.getPortfolio(),
        watchlistService.getWatchlist(),
      ]);
      setMarketData(marketRes);
      setHoldings(portfolioRes.holdings);
      setSummary(portfolioRes.summary);
      setWatchlist(watchlistRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading market intelligence and portfolio summary..." className="py-24" />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchData} className="my-8" />;
  }

  // Generate portfolio historical trend for area chart
  const portfolioHistory = [
    { date: 'Day -30', value: (summary?.totalInvested || 15000) * 0.94 },
    { date: 'Day -25', value: (summary?.totalInvested || 15000) * 0.96 },
    { date: 'Day -20', value: (summary?.totalInvested || 15000) * 0.98 },
    { date: 'Day -15', value: (summary?.totalInvested || 15000) * 1.02 },
    { date: 'Day -10', value: (summary?.totalInvested || 15000) * 1.05 },
    { date: 'Day -5', value: (summary?.totalInvested || 15000) * 1.09 },
    { date: 'Today', value: summary?.totalValue || 17600 },
  ];

  // Prepare allocation data for PieChart
  const pieData = holdings.map((h) => ({
    name: h.symbol,
    value: h.currentValue,
  }));

  return (
    <div className="space-y-6">
      {/* Page Title & Sentiment banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Market Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time equity overview, active portfolio distribution, and institutional market drivers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {marketData?.isDemo && (
            <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
              Demo Active
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/insights')}
            leftIcon={<Sparkles className="w-4 h-4 text-purple-400" />}
          >
            AI Insight Report
          </Button>
        </div>
      </div>

      {/* Top Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Portfolio Value"
          prefix="$"
          value={summary?.totalValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          change={summary?.dailyProfitLossPercent || 0.84}
          changeLabel="24h movement"
          icon={<Wallet className="w-4 h-4" />}
        />
        <StatCard
          title="Daily P/L"
          prefix={summary && summary.dailyProfitLoss >= 0 ? '+$' : '-$'}
          value={Math.abs(summary?.dailyProfitLoss || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          change={summary?.dailyProfitLossPercent || 0.84}
          changeLabel="today"
          icon={<Activity className="w-4 h-4" />}
        />
        <StatCard
          title="Total Investment"
          prefix="$"
          value={summary?.totalInvested?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          subtitle={`${summary?.holdingsCount || 0} active positions`}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatCard
          title="Overall Returns"
          prefix={summary && summary.totalProfitLoss >= 0 ? '+$' : '-$'}
          value={Math.abs(summary?.totalProfitLoss || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          change={summary?.totalProfitLossPercent || 0}
          changeLabel="cumulative gain"
          icon={<Percent className="w-4 h-4" />}
        />
      </div>

      {/* Market Indices Row */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
            Benchmark Global Indices
          </h2>
          <span className="text-[11px] text-gray-400 font-mono">
            Updated: {marketData?.lastUpdated || 'Live'}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {marketData?.indices?.map((idx) => {
            const isUp = idx.change >= 0;
            return (
              <div
                key={idx.symbol}
                className="glass-panel p-4 rounded-xl border border-gray-800 bg-[#111827]/70 hover:border-gray-700 transition-all"
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-sm text-white font-mono">{idx.symbol}</span>
                  <div
                    className={`flex items-center text-xs font-mono font-semibold ${
                      isUp ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    <span>{isUp ? '+' : ''}{idx.changePercent.toFixed(2)}%</span>
                  </div>
                </div>
                <div className="text-lg font-extrabold text-white font-mono mt-1">
                  {idx.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-gray-400 truncate mt-0.5">{idx.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Layout: Left Area Chart, Right Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Portfolio Performance Trajectory"
            subtitle="Historical asset valuation over the preceding 30 days"
            action={
              <Link to="/portfolio">
                <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Manage Holdings
                </Button>
              </Link>
            }
          >
            <AreaChart data={portfolioHistory} dataKey="value" height={280} color="#3B82F6" />
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card
            title="Asset Allocation"
            subtitle="Holdings capital weighting"
            action={
              <span className="text-xs text-gray-400 font-mono">
                {holdings.length} assets
              </span>
            }
          >
            <PieChart data={pieData} height={280} currency="$" />
          </Card>
        </div>
      </div>

      {/* Market Movers Section: Top Gainers & Top Losers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <Card
          title={
            <div className="flex items-center gap-2 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>Top Gainers</span>
            </div>
          }
          subtitle="Highest intraday percentage advances"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-800 text-gray-400 font-mono">
                <tr>
                  <th className="pb-2 font-medium">Symbol</th>
                  <th className="pb-2 font-medium">Price</th>
                  <th className="pb-2 font-medium text-right">Change</th>
                  <th className="pb-2 font-medium text-right">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {marketData?.topGainers?.map((mover) => (
                  <tr
                    key={mover.symbol}
                    onClick={() => navigate(`/stocks/${mover.symbol}`)}
                    className="hover:bg-gray-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5">
                      <div className="font-bold text-white group-hover:text-blue-400">{mover.symbol}</div>
                      <div className="text-[10px] text-gray-400 font-sans truncate max-w-[120px]">{mover.name}</div>
                    </td>
                    <td className="py-2.5 text-gray-200">${mover.price.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-semibold text-emerald-400">
                      +{mover.changePercent.toFixed(2)}%
                    </td>
                    <td className="py-2.5 text-right text-gray-400">
                      {(mover.volume / 1000000).toFixed(1)}M
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Losers */}
        <Card
          title={
            <div className="flex items-center gap-2 text-rose-400">
              <TrendingUp className="w-4 h-4 rotate-180" />
              <span>Top Losers</span>
            </div>
          }
          subtitle="Largest intraday pullbacks"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-800 text-gray-400 font-mono">
                <tr>
                  <th className="pb-2 font-medium">Symbol</th>
                  <th className="pb-2 font-medium">Price</th>
                  <th className="pb-2 font-medium text-right">Change</th>
                  <th className="pb-2 font-medium text-right">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {marketData?.topLosers?.map((mover) => (
                  <tr
                    key={mover.symbol}
                    onClick={() => navigate(`/stocks/${mover.symbol}`)}
                    className="hover:bg-gray-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5">
                      <div className="font-bold text-white group-hover:text-blue-400">{mover.symbol}</div>
                      <div className="text-[10px] text-gray-400 font-sans truncate max-w-[120px]">{mover.name}</div>
                    </td>
                    <td className="py-2.5 text-gray-200">${mover.price.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-semibold text-rose-400">
                      {mover.changePercent.toFixed(2)}%
                    </td>
                    <td className="py-2.5 text-right text-gray-400">
                      {(mover.volume / 1000000).toFixed(1)}M
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Watchlist Quick View */}
      <Card
        title="Active Watchlist Preview"
        subtitle="Pinned equities and live market valuations"
        action={
          <Link to="/watchlist">
            <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
              View Full Watchlist
            </Button>
          </Link>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {watchlist.slice(0, 5).map((item) => {
            const isPos = item.change >= 0;
            return (
              <div
                key={item.id}
                onClick={() => navigate(`/stocks/${item.symbol}`)}
                className="bg-gray-900/60 p-3 rounded-xl border border-gray-800/80 hover:border-gray-700 cursor-pointer transition-all hover:bg-gray-800/50"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white font-mono text-sm">{item.symbol}</span>
                  <span className={`text-xs font-semibold font-mono ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPos ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 truncate">{item.companyName}</div>
                <div className="text-base font-bold text-white font-mono mt-1">
                  ${item.price.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
