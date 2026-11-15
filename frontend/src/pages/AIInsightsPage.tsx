import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  Brain,
  AlertTriangle,
  Cpu,
  Target,
  BarChart,
  ShieldAlert,
  Briefcase,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { insightService } from '../services/insightService';
import { mlService, MLPrediction } from '../services/mlService';
import { AIInsight } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SearchInput from '../components/ui/SearchInput';
import LineChart from '../charts/LineChart';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

export const AIInsightsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'portfolio'>('single');
  const [symbol, setSymbol] = useState<string>('NVDA');
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [prediction, setPrediction] = useState<MLPrediction | null>(null);
  const [portfolioInsights, setPortfolioInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSingleData = async (sym: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [insightRes, predRes] = await Promise.all([
        insightService.getStockInsights(sym),
        mlService.getPrediction(sym, '7D'),
      ]);
      setInsight(insightRes);
      setPrediction(predRes);
    } catch (err: any) {
      setError(err.message || `Failed to generate AI insights for ${sym}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPortfolioData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const insights = await insightService.getPortfolioInsights();
      setPortfolioInsights(insights);
    } catch (err: any) {
      setError(err.message || 'Failed to generate portfolio insights');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'single') {
      fetchSingleData(symbol);
    } else {
      fetchPortfolioData();
    }
  }, [activeTab, symbol]);

  const handleSelectStock = (item: { symbol: string }) => {
    setSymbol(item.symbol.toUpperCase());
  };

  const getRecBadgeVariant = (rec: string): 'success' | 'danger' | 'warning' | 'primary' => {
    if (rec === 'STRONG_BUY' || rec === 'BUY') return 'success';
    if (rec === 'STRONG_SELL' || rec === 'SELL') return 'danger';
    return 'warning';
  };

  // Trajectory series for LineChart
  const trajectorySeries = [
    { key: 'predicted', name: 'Predicted Path', color: '#3B82F6' },
    { key: 'upperBound', name: 'Upper 95% Bound', color: '#10B981' },
    { key: 'lowerBound', name: 'Lower 95% Bound', color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Tab Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-purple-400" />
            <span>AI Market Intelligence & ML Forecasts</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Hybrid neural networks synthesizing price action, news sentiment, and technical order imbalance.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-900/90 p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'single'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Single Asset Deep-Dive
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'portfolio'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Portfolio Insights
          </button>
        </div>
      </div>

      {/* Regulatory & Methodology Disclaimer */}
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 text-amber-300 text-xs flex items-start gap-3 shadow-md">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block text-amber-200">Algorithmic Modeling Notice</span>
          <p className="text-amber-300/80 mt-0.5">
            FinSight AI and ML predictions represent algorithmic time-series simulations based on probabilistic distributions. They do not constitute formal financial advice. Always execute independent risk assessment before capital deployment.
          </p>
        </div>
      </div>

      {activeTab === 'single' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="max-w-xl">
            <SearchInput
              placeholder="Analyze any ticker (e.g. NVDA, AAPL, MSFT, TSLA, INFY)..."
              onSelectStock={handleSelectStock}
            />
          </div>

          {isLoading ? (
            <LoadingSpinner size="lg" message={`Synthesizing neural weights for ${symbol}...`} className="py-24" />
          ) : error ? (
            <ErrorMessage message={error} onRetry={() => fetchSingleData(symbol)} />
          ) : insight ? (
            <>
              {/* Main Insight Recommendation Card */}
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-gray-800 bg-[#111827]/85 shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-extrabold text-white font-mono tracking-tight">
                        {insight.symbol}
                      </h2>
                      <Badge variant={getRecBadgeVariant(insight.recommendation)} size="md">
                        {insight.recommendation.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 font-medium mt-1">{insight.companyName}</p>
                  </div>

                  <div className="flex flex-col sm:items-end">
                    <span className="text-xs text-gray-400 uppercase font-mono">Confidence Index</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-extrabold text-white font-mono">{insight.confidenceScore}%</span>
                      <span className="text-xs text-emerald-400 font-mono">High Probability</span>
                    </div>
                    {/* Confidence bar */}
                    <div className="w-48 bg-gray-800 h-2 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${insight.confidenceScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Synthesis Summary */}
                <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono mb-1.5 flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-blue-400" />
                    <span>Executive AI Summary</span>
                  </h4>
                  <p className="text-sm text-gray-200 leading-relaxed font-sans">{insight.summary}</p>
                </div>

                {/* 4 Signals Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="bg-gray-900/40 p-3.5 rounded-xl border border-gray-800">
                    <span className="text-gray-400 block text-[11px]">Primary Trend</span>
                    <span className="text-white font-bold text-sm mt-1 block">{insight.trend}</span>
                  </div>
                  <div className="bg-gray-900/40 p-3.5 rounded-xl border border-gray-800">
                    <span className="text-gray-400 block text-[11px]">RSI Oscillator</span>
                    <span className="text-white font-bold text-sm mt-1 block">{insight.rsiSignal}</span>
                  </div>
                  <div className="bg-gray-900/40 p-3.5 rounded-xl border border-gray-800">
                    <span className="text-gray-400 block text-[11px]">Volatility Level</span>
                    <span className="text-white font-bold text-sm mt-1 block">{insight.volatilityLevel}</span>
                  </div>
                  <div className="bg-gray-900/40 p-3.5 rounded-xl border border-gray-800">
                    <span className="text-gray-400 block text-[11px]">Moving Avg Signal</span>
                    <span className="text-white font-bold text-sm mt-1 block">{insight.movingAverageSignal}</span>
                  </div>
                </div>

                {/* Key Drivers List */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-3">
                    Key Quantitative & Fundamental Drivers
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {insight.keyFactors.map((factor, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-900/40 border border-gray-800/80 text-xs text-gray-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Machine Learning Forecast Trajectory Section */}
              {prediction && (
                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-blue-400" />
                      <span>Machine Learning Forecast Trajectory (7-Day Horizon)</span>
                    </div>
                  }
                  subtitle="Forward predictive cone with 95% statistical confidence bounds"
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                      <div className="bg-gray-900/60 p-3.5 rounded-xl border border-gray-800">
                        <span className="text-gray-400 block text-[11px]">Current Price</span>
                        <span className="text-white font-bold text-sm mt-0.5 block">${prediction.currentPrice.toFixed(2)}</span>
                      </div>
                      <div className="bg-gray-900/60 p-3.5 rounded-xl border border-gray-800">
                        <span className="text-gray-400 block text-[11px]">Target Forecast</span>
                        <span className="text-emerald-400 font-bold text-sm mt-0.5 block">${prediction.predictedPrice.toFixed(2)}</span>
                      </div>
                      <div className="bg-gray-900/60 p-3.5 rounded-xl border border-gray-800">
                        <span className="text-gray-400 block text-[11px]">Expected Delta</span>
                        <span className="text-emerald-400 font-bold text-sm mt-0.5 block">
                          +{prediction.predictedChangePercent.toFixed(2)}%
                        </span>
                      </div>
                      <div className="bg-gray-900/60 p-3.5 rounded-xl border border-gray-800">
                        <span className="text-gray-400 block text-[11px]">Architecture</span>
                        <span className="text-blue-400 font-bold text-xs mt-0.5 truncate block">
                          {prediction.modelInfo.algorithm.split(' ')[0]} + XGBoost
                        </span>
                      </div>
                    </div>

                    <LineChart
                      data={prediction.forecastTrajectory}
                      series={trajectorySeries}
                      xAxisKey="day"
                      height={280}
                      valueFormatter={(v) => `$${v.toFixed(2)}`}
                    />
                  </div>
                </Card>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* Portfolio Insights Tab */}
      {activeTab === 'portfolio' && (
        <div className="space-y-4">
          {isLoading ? (
            <LoadingSpinner size="lg" message="Aggregating portfolio neural insights..." className="py-24" />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchPortfolioData} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {portfolioInsights.map((item) => (
                <div
                  key={item.symbol}
                  className="glass-panel p-6 rounded-2xl border border-gray-800 bg-[#111827]/80 hover:border-gray-700 transition-all space-y-4 shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <div>
                      <span className="font-extrabold text-xl text-white font-mono">{item.symbol}</span>
                      <span className="text-xs text-gray-400 block">{item.companyName}</span>
                    </div>
                    <Badge variant={getRecBadgeVariant(item.recommendation)}>
                      {item.recommendation.replace('_', ' ')}
                    </Badge>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed font-sans">{item.summary}</p>

                  <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-gray-800/80">
                    <span className="text-gray-400">Confidence: {item.confidenceScore}%</span>
                    <span className="text-blue-400">{item.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIInsightsPage;
