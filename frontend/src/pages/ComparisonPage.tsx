import React, { useState, useEffect } from 'react';
import { Plus, X, GitCompare, TrendingUp, BarChart2, Layers } from 'lucide-react';
import { compareService, ComparisonResult } from '../services/compareService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SearchInput from '../components/ui/SearchInput';
import LineChart from '../charts/LineChart';
import BarChart from '../charts/BarChart';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'NVDA'];

const SERIES_COLORS: Record<string, string> = {
  AAPL: '#3B82F6',   // Blue
  MSFT: '#10B981',   // Emerald
  NVDA: '#8B5CF6',   // Purple
  GOOGL: '#F59E0B',  // Amber
  AMZN: '#EC4899',   // Pink
  TSLA: '#EF4444',   // Red
  RELIANCE: '#06B6D4', // Cyan
  TCS: '#6366F1',    // Indigo
};

export const ComparisonPage: React.FC = () => {
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_SYMBOLS);
  const [data, setData] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = async (currentSymbols: string[]) => {
    if (currentSymbols.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await compareService.compareStocks(currentSymbols);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to compare stocks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison(symbols);
  }, [symbols]);

  const handleAddStock = (item: { symbol: string }) => {
    const sym = item.symbol.toUpperCase();
    if (!symbols.includes(sym)) {
      if (symbols.length >= 4) {
        alert('You can compare up to 4 assets at once.');
        return;
      }
      setSymbols([...symbols, sym]);
    }
  };

  const handleRemoveStock = (sym: string) => {
    if (symbols.length <= 1) {
      alert('Please select at least 1 stock to compare.');
      return;
    }
    setSymbols(symbols.filter((s) => s !== sym));
  };

  const seriesConfigs = symbols.map((s, idx) => ({
    key: s,
    name: s,
    color: SERIES_COLORS[s] || ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'][idx % 4],
  }));

  // Bar chart data for Market Cap comparison (in Billions USD)
  const marketCapData = data?.metrics.map((m) => ({
    symbol: m.symbol,
    marketCapB: parseFloat((m.marketCap / 1e9).toFixed(1)),
  })) || [];

  // Bar chart data for P/E Ratio comparison
  const peData = data?.metrics.map((m) => ({
    symbol: m.symbol,
    peRatio: m.peRatio,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <GitCompare className="w-7 h-7 text-blue-500" />
            <span>Multi-Stock Comparative Analysis</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Compare relative valuations, normalized return curves, and technical oscillator momentum side-by-side.
          </p>
        </div>
      </div>

      {/* Selected Stock Pills & Add Bar */}
      <div className="glass-panel p-4 rounded-xl border border-gray-800 bg-[#111827]/80 flex flex-wrap items-center gap-3">
        <span className="text-xs text-gray-400 uppercase font-mono font-medium">Selected:</span>
        {symbols.map((s, idx) => (
          <span
            key={s}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-white border"
            style={{
              borderColor: seriesConfigs[idx]?.color || '#3B82F6',
              backgroundColor: `${seriesConfigs[idx]?.color || '#3B82F6'}20`,
            }}
          >
            <span>{s}</span>
            <button
              onClick={() => handleRemoveStock(s)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}

        <div className="w-full sm:w-72 sm:ml-auto">
          <SearchInput
            placeholder="Add ticker to compare..."
            onSelectStock={handleAddStock}
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" message="Synthesizing multi-asset comparative matrix..." className="py-24" />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => fetchComparison(symbols)} />
      ) : data ? (
        <>
          {/* Normalized Performance Chart */}
          <Card
            title="Relative Price Performance (Normalized Base = 100)"
            subtitle="Indexed price progression over the trailing 30 trading sessions"
          >
            <LineChart
              data={data.historicalSeries}
              series={seriesConfigs}
              height={320}
              valueFormatter={(v) => `${v.toFixed(1)}`}
            />
          </Card>

          {/* Side-by-Side Metric Comparison Table */}
          <Card
            title="Institutional Metric Comparison Matrix"
            subtitle="Fundamental valuations, earnings, technical signals, and trailing returns"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-gray-800 text-gray-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold uppercase">Metric</th>
                    {data.metrics.map((m, idx) => (
                      <th key={m.symbol} className="py-3 px-4 font-bold text-sm" style={{ color: seriesConfigs[idx]?.color }}>
                        {m.symbol}
                        <span className="block text-[10px] text-gray-400 font-normal font-sans truncate max-w-[140px]">
                          {m.companyName}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  <tr className="hover:bg-gray-800/30">
                    <td className="py-3 px-4 text-gray-400 font-sans">Current Price</td>
                    {data.metrics.map((m) => (
                      <td key={m.symbol} className="py-3 px-4 font-bold text-white">
                        ${m.price.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-800/30">
                    <td className="py-3 px-4 text-gray-400 font-sans">Day Change %</td>
                    {data.metrics.map((m) => (
                      <td
                        key={m.symbol}
                        className={`py-3 px-4 font-bold ${
                          m.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {m.changePercent >= 0 ? '+' : ''}{m.changePercent.toFixed(2)}%
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-800/30">
                    <td className="py-3 px-4 text-gray-400 font-sans">Market Cap</td>
                    {data.metrics.map((m) => (
                      <td key={m.symbol} className="py-3 px-4 text-gray-200">
                        ${(m.marketCap / 1e9).toFixed(1)} Billion
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-800/30">
                    <td className="py-3 px-4 text-gray-400 font-sans">P/E Ratio</td>
                    {data.metrics.map((m) => (
                      <td key={m.symbol} className="py-3 px-4 text-gray-200 font-bold">
                        {m.peRatio.toFixed(1)}x
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-800/30">
                    <td className="py-3 px-4 text-gray-400 font-sans">EPS (TTM)</td>
                    {data.metrics.map((m) => (
                      <td key={m.symbol} className="py-3 px-4 text-gray-200">
                        ${m.eps.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-800/30">
                    <td className="py-3 px-4 text-gray-400 font-sans">RSI (14 Period)</td>
                    {data.metrics.map((m) => (
                      <td key={m.symbol} className="py-3 px-4 text-blue-400 font-semibold">
                        {m.rsi}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-800/30">
                    <td className="py-3 px-4 text-gray-400 font-sans">Trailing 1-Month Return</td>
                    {data.metrics.map((m) => (
                      <td
                        key={m.symbol}
                        className={`py-3 px-4 font-bold ${
                          m.return1M >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {m.return1M >= 0 ? '+' : ''}{m.return1M.toFixed(1)}%
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-800/30">
                    <td className="py-3 px-4 text-gray-400 font-sans">Trailing 1-Year Return</td>
                    {data.metrics.map((m) => (
                      <td
                        key={m.symbol}
                        className={`py-3 px-4 font-bold ${
                          m.return1Y >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {m.return1Y >= 0 ? '+' : ''}{m.return1Y.toFixed(1)}%
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-800/30">
                    <td className="py-3 px-4 text-gray-400 font-sans">Dividend Yield</td>
                    {data.metrics.map((m) => (
                      <td key={m.symbol} className="py-3 px-4 text-gray-300">
                        {m.dividendYield.toFixed(2)}%
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Bar Charts Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Market Capitalization ($B)" subtitle="Total equity valuation in billions">
              <BarChart
                data={marketCapData}
                dataKey="marketCapB"
                xAxisKey="symbol"
                height={220}
                color="#3B82F6"
                valueFormatter={(val) => `$${val}B`}
              />
            </Card>

            <Card title="Price-to-Earnings Multiples (P/E)" subtitle="Comparative earnings valuation multiples">
              <BarChart
                data={peData}
                dataKey="peRatio"
                xAxisKey="symbol"
                height={220}
                color="#10B981"
                valueFormatter={(val) => `${val}x`}
              />
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ComparisonPage;
