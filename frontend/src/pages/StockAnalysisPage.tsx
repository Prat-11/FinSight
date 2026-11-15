import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Bookmark,
  PlusCircle,
  BarChart2,
  Calendar,
  Layers,
  Sparkles,
  Check,
} from 'lucide-react';
import { stockService } from '../services/stockService';
import { watchlistService } from '../services/watchlistService';
import { portfolioService } from '../services/portfolioService';
import { StockDetails } from '../types';
import SearchInput from '../components/ui/SearchInput';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import AreaChart from '../charts/AreaChart';
import BarChart from '../charts/BarChart';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

const PERIODS = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'];

export const StockAnalysisPage: React.FC = () => {
  const { symbol: routeSymbol } = useParams<{ symbol?: string }>();
  const navigate = useNavigate();

  const [currentSymbol, setCurrentSymbol] = useState<string>(routeSymbol?.toUpperCase() || 'AAPL');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1M');
  const [stockDetails, setStockDetails] = useState<StockDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Watchlist action state
  const [isWatchlistAdded, setIsWatchlistAdded] = useState<boolean>(false);

  // Buy / Add to Portfolio Modal state
  const [isBuyModalOpen, setIsBuyModalOpen] = useState<boolean>(false);
  const [buyQuantity, setBuyQuantity] = useState<string>('10');
  const [buyPrice, setBuyPrice] = useState<string>('');
  const [isBuying, setIsBuying] = useState<boolean>(false);
  const [buySuccessMsg, setBuySuccessMsg] = useState<string | null>(null);

  const fetchStock = async (sym: string, period: string) => {
    setIsLoading(true);
    setError(null);
    setIsWatchlistAdded(false);
    try {
      const data = await stockService.getStockDetails(sym, period);
      setStockDetails(data);
      setBuyPrice(String(data.quote?.price ?? 150));
    } catch (err: any) {
      setError(err.message || `Failed to fetch data for ${sym}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (routeSymbol && routeSymbol.toUpperCase() !== currentSymbol) {
      setCurrentSymbol(routeSymbol.toUpperCase());
    }
  }, [routeSymbol]);

  useEffect(() => {
    fetchStock(currentSymbol, selectedPeriod);
  }, [currentSymbol, selectedPeriod]);

  const handleSelectStock = (item: { symbol: string }) => {
    setCurrentSymbol(item.symbol.toUpperCase());
    navigate(`/stocks/${item.symbol.toUpperCase()}`);
  };

  const handleAddToWatchlist = async () => {
    if (!stockDetails) return;
    try {
      await watchlistService.addToWatchlist(stockDetails.quote.symbol, stockDetails.quote.companyName);
      setIsWatchlistAdded(true);
      setTimeout(() => setIsWatchlistAdded(false), 3000);
    } catch {
      // silently handle
    }
  };

  const handleConfirmBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockDetails) return;
    const qty = parseInt(buyQuantity, 10);
    const prc = parseFloat(buyPrice);

    if (isNaN(qty) || qty <= 0 || isNaN(prc) || prc <= 0) {
      return;
    }

    setIsBuying(true);
    try {
      await portfolioService.addHolding({
        symbol: stockDetails.quote.symbol,
        companyName: stockDetails.quote.companyName,
        quantity: qty,
        purchasePrice: prc,
        purchaseDate: new Date().toISOString().split('T')[0],
        currentPrice: stockDetails.quote.price,
      });
      setBuySuccessMsg(`Successfully added ${qty} shares of ${stockDetails.quote.symbol} to portfolio!`);
      setTimeout(() => {
        setBuySuccessMsg(null);
        setIsBuyModalOpen(false);
      }, 1500);
    } catch (err: any) {
      // error handled
    } finally {
      setIsBuying(false);
    }
  };

  const quote = stockDetails?.quote;
  const indicators = stockDetails?.indicators;
  const isPositive = quote ? quote.change >= 0 : true;
  const currency = quote?.currency === 'INR' ? '₹' : '$';

  return (
    <div className="space-y-6">
      {/* Top Search Bar */}
      <div className="max-w-xl">
        <SearchInput
          placeholder="Search any ticker (e.g. AAPL, NVDA, TSLA, RELIANCE, TCS)..."
          onSelectStock={handleSelectStock}
        />
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" message={`Loading financial metrics for ${currentSymbol}...`} className="py-24" />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => fetchStock(currentSymbol, selectedPeriod)} />
      ) : stockDetails && quote ? (
        <>
          {/* Header Card: Ticker Info & Action Buttons */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 bg-[#111827]/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-xl">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold text-white font-mono tracking-tight">
                  {quote.symbol}
                </h1>
                <Badge variant={indicators?.signal === 'BUY' || indicators?.signal === 'STRONG_BUY' ? 'success' : indicators?.signal === 'SELL' ? 'danger' : 'primary'}>
                  {indicators?.signal || 'NEUTRAL'}
                </Badge>
                {quote.isDemo && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Live Demo
                  </span>
                )}
              </div>
              <h2 className="text-base text-gray-300 font-medium mt-1">{quote.companyName}</h2>
              {stockDetails.overview?.sector && (
                <p className="text-xs text-gray-400 mt-0.5 font-mono">
                  {stockDetails.overview.sector} &bull; {stockDetails.overview.industry}
                </p>
              )}
            </div>

            <div className="flex flex-col md:items-end">
              <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                {currency}{(quote.price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div
                className={`flex items-center gap-1.5 text-sm font-bold font-mono mt-1 ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>
                  {isPositive ? '+' : ''}{(quote.change ?? 0).toFixed(2)} ({isPositive ? '+' : ''}{(quote.changePercent ?? 0).toFixed(2)}%)
                </span>
                <span className="text-xs text-gray-400 font-normal">Today</span>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-6">
              <Button
                variant={isWatchlistAdded ? 'success' : 'outline'}
                size="sm"
                onClick={handleAddToWatchlist}
                leftIcon={isWatchlistAdded ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              >
                {isWatchlistAdded ? 'Watched' : 'Watchlist'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsBuyModalOpen(true)}
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Add Position
              </Button>
            </div>
          </div>

          {/* Interactive Historical Chart & Period Selector */}
          <Card
            title="Interactive Price History"
            subtitle="Historical price trajectory and volume bars"
            action={
              <div className="flex items-center gap-1 bg-gray-900/80 p-1 rounded-lg border border-gray-800">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPeriod(p)}
                    className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                      selectedPeriod === p
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            }
          >
            <div className="space-y-4">
              <AreaChart
                data={stockDetails.historical}
                dataKey="close"
                height={320}
                color={isPositive ? '#3B82F6' : '#EF4444'}
                currency={currency}
              />
              <div>
                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider font-mono mb-2">
                  Volume Distribution
                </h4>
                <BarChart
                  data={stockDetails.historical}
                  dataKey="volume"
                  height={120}
                  color="#6366F1"
                  colorBySign={true}
                />
              </div>
            </div>
          </Card>

          {/* Key Metrics Grid */}
          <Card title="Key Financial & Trading Metrics" subtitle="Comprehensive balance sheet and valuation stats">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono text-xs">
              <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                <span className="text-gray-400 block text-[11px]">Open</span>
                <span className="text-white font-bold text-sm mt-0.5 block">{currency}{(quote.open ?? 0).toFixed(2)}</span>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                <span className="text-gray-400 block text-[11px]">Day High</span>
                <span className="text-white font-bold text-sm mt-0.5 block">{currency}{(quote.high ?? 0).toFixed(2)}</span>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                <span className="text-gray-400 block text-[11px]">Day Low</span>
                <span className="text-white font-bold text-sm mt-0.5 block">{currency}{(quote.low ?? 0).toFixed(2)}</span>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                <span className="text-gray-400 block text-[11px]">Prev Close</span>
                <span className="text-white font-bold text-sm mt-0.5 block">{currency}{(quote.previousClose ?? 0).toFixed(2)}</span>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                <span className="text-gray-400 block text-[11px]">Volume</span>
                <span className="text-white font-bold text-sm mt-0.5 block">{((quote.volume || 0) / 1000000).toFixed(2)}M</span>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                <span className="text-gray-400 block text-[11px]">Market Cap</span>
                <span className="text-white font-bold text-sm mt-0.5 block">
                  {quote.marketCap ? `${currency}${(quote.marketCap / 1e9).toFixed(1)}B` : 'N/A'}
                </span>
              </div>

              <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                <span className="text-gray-400 block text-[11px]">P/E Ratio</span>
                <span className="text-white font-bold text-sm mt-0.5 block">{quote.peRatio?.toFixed(1) || 'N/A'}</span>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                <span className="text-gray-400 block text-[11px]">EPS (TTM)</span>
                <span className="text-white font-bold text-sm mt-0.5 block">{currency}{quote.eps?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                <span className="text-gray-400 block text-[11px]">52-Week High</span>
                <span className="text-emerald-400 font-bold text-sm mt-0.5 block">{currency}{quote.high52?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                <span className="text-gray-400 block text-[11px]">52-Week Low</span>
                <span className="text-rose-400 font-bold text-sm mt-0.5 block">{currency}{quote.low52?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                <span className="text-gray-400 block text-[11px]">Div Yield</span>
                <span className="text-white font-bold text-sm mt-0.5 block">{quote.dividendYield ? `${quote.dividendYield.toFixed(2)}%` : '0.00%'}</span>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                <span className="text-gray-400 block text-[11px]">Exchange</span>
                <span className="text-blue-400 font-bold text-sm mt-0.5 block">{quote.currency === 'INR' ? 'NSE / BSE' : 'NASDAQ'}</span>
              </div>
            </div>
          </Card>

          {/* Technical Indicators Section */}
          {indicators && (
            <Card
              title="Technical Indicators & Oscillator Signals"
              subtitle="Algorithmic trend filters, momentum oscillators, and volatility bands"
              action={
                <Link to="/insights">
                  <Button variant="ghost" size="sm" rightIcon={<Sparkles className="w-3.5 h-3.5 text-purple-400" />}>
                    AI Analysis Deep-Dive
                  </Button>
                </Link>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400 font-mono">20 SMA & 50 SMA</span>
                    <Badge variant={(indicators.sma20 ?? 0) > (indicators.sma50 ?? 0) ? 'success' : 'danger'} size="sm">
                      {(indicators.sma20 ?? 0) > (indicators.sma50 ?? 0) ? 'Bullish Cross' : 'Bearish Cross'}
                    </Badge>
                  </div>
                  <div className="text-base font-bold text-white font-mono mt-2">
                    {currency}{(indicators.sma20 ?? 0).toFixed(2)} / {currency}{(indicators.sma50 ?? 0).toFixed(2)}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1 font-mono">
                    200 SMA: {currency}{(indicators.sma200 ?? 0).toFixed(2)}
                  </div>
                </div>

                <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400 font-mono">RSI (14 Period)</span>
                    <Badge variant={(indicators.rsi14 ?? 50) > 70 ? 'danger' : (indicators.rsi14 ?? 50) < 30 ? 'success' : 'primary'} size="sm">
                      {(indicators.rsi14 ?? 50) > 70 ? 'Overbought' : (indicators.rsi14 ?? 50) < 30 ? 'Oversold' : 'Neutral'}
                    </Badge>
                  </div>
                  <div className="text-base font-bold text-white font-mono mt-2">
                    {(indicators.rsi14 ?? 50).toFixed(1)} / 100
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, indicators.rsi14 ?? 50)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400 font-mono">MACD Line / Signal</span>
                    <Badge variant={(indicators.macdHist ?? 0) >= 0 ? 'success' : 'danger'} size="sm">
                      {(indicators.macdHist ?? 0) >= 0 ? 'Expansion' : 'Contraction'}
                    </Badge>
                  </div>
                  <div className="text-base font-bold text-white font-mono mt-2">
                    {(indicators.macd ?? 0).toFixed(2)} | {(indicators.macdSignal ?? 0).toFixed(2)}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1 font-mono">
                    Histogram: {(indicators.macdHist ?? 0).toFixed(2)}
                  </div>
                </div>

                <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400 font-mono">Bollinger Bands</span>
                    <span className="text-[10px] text-gray-400 font-mono">20, 2σ</span>
                  </div>
                  <div className="text-base font-bold text-white font-mono mt-2">
                    {currency}{(indicators.upperBand ?? 0).toFixed(2)}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1 font-mono">
                    Lower: {currency}{(indicators.lowerBand ?? 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Buy / Add to Portfolio Modal */}
          <Modal
            isOpen={isBuyModalOpen}
            onClose={() => setIsBuyModalOpen(false)}
            title={`Add Position: ${quote.symbol}`}
            description="Record a stock purchase into your active portfolio tracking system"
          >
            {buySuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center text-sm font-semibold">
                {buySuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleConfirmBuy} className="space-y-4">
                <Input
                  label="Number of Shares (Quantity)"
                  type="number"
                  min="1"
                  step="1"
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(e.target.value)}
                  required
                />

                <Input
                  label={`Purchase Price per Share (${currency})`}
                  type="number"
                  step="0.01"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  required
                />

                <div className="p-3 rounded-lg bg-gray-900 border border-gray-800 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-gray-400">
                    <span>Estimated Total Outlay:</span>
                    <span className="text-white font-bold">
                      {currency}{((parseInt(buyQuantity, 10) || 0) * (parseFloat(buyPrice) || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="ghost" type="button" onClick={() => setIsBuyModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" isLoading={isBuying}>
                    Confirm Acquisition
                  </Button>
                </div>
              </form>
            )}
          </Modal>
        </>
      ) : null}
    </div>
  );
};

export default StockAnalysisPage;
