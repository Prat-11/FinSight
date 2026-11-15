import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  BrainCircuit,
  Search,
  ArrowRight,
  Activity,
  Layers,
  ChevronRight,
  Database,
  Globe2,
  Cpu,
  Lock,
  PieChart as PieIcon,
  CheckCircle2,
} from 'lucide-react';
import Button from '../components/ui/Button';

const LIVE_TICKERS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 228.45, change: '+1.38%', isUp: true },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 138.25, change: '+4.22%', isUp: true },
  { symbol: 'MSFT', name: 'Microsoft', price: 422.80, change: '-0.58%', isUp: false },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 219.75, change: '+4.22%', isUp: true },
  { symbol: 'GOOGL', name: 'Alphabet', price: 174.50, change: '+1.07%', isUp: true },
  { symbol: 'NIFTY 50', name: 'Nifty 50', price: 24367.85, change: '+0.59%', isUp: true },
  { symbol: 'SENSEX', name: 'BSE Sensex', price: 80115.20, change: '+0.61%', isUp: true },
  { symbol: 'RELIANCE', name: 'Reliance Ind.', price: 2985.50, change: '+1.16%', isUp: true },
];

const FEATURES = [
  {
    icon: <Activity className="w-6 h-6 text-blue-400" />,
    title: 'Real-Time Market Data',
    description: 'Instant quotes, order-depth insights, and institutional liquidity feeds across global and Indian exchanges.',
  },
  {
    icon: <BrainCircuit className="w-6 h-6 text-purple-400" />,
    title: 'AI-Powered Insights',
    description: 'Deep neural networks analyze news sentiment, quarterly filings, and volume patterns to generate clear recommendations.',
  },
  {
    icon: <PieIcon className="w-6 h-6 text-emerald-400" />,
    title: 'Portfolio Tracking',
    description: 'Track weighted performance, sector allocations, unrealized gains, and risk-adjusted Sharpe ratios in real time.',
  },
  {
    icon: <Layers className="w-6 h-6 text-amber-400" />,
    title: 'Stock Comparison',
    description: 'Overlay normalized multi-asset performance charts, P/E ratios, and balance sheet metrics side-by-side.',
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-cyan-400" />,
    title: 'Technical Analysis',
    description: 'Interactive candlestick charts powered by RSI, MACD histograms, Bollinger Bands, and dynamic moving averages.',
  },
  {
    icon: <Cpu className="w-6 h-6 text-rose-400" />,
    title: 'ML Predictions',
    description: 'Predictive price trajectories built using hybrid LSTM ensembles with confidence intervals and impact drivers.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Connect or Search',
    description: 'Look up any stock or set up your investment portfolio with a few clicks.',
  },
  {
    number: '02',
    title: 'Analyze Deep Metrics',
    description: 'Evaluate technical indicators, historical distributions, and ML forecast trajectories.',
  },
  {
    number: '03',
    title: 'Execute with Confidence',
    description: 'Act on institutional-grade intelligence and receive automated risk warnings.',
  },
];

export const LandingPage: React.FC = () => {
  const [activeTickerIdx, setActiveTickerIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTickerIdx((prev) => (prev + 1) % LIVE_TICKERS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1120] text-gray-100 selection:bg-blue-600 selection:text-white">
      {/* Top Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B1120]/80 backdrop-blur-xl border-b border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 border border-blue-400/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white font-mono">
              Fin<span className="text-blue-500">Sight</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a>
            <a href="#technology" className="hover:text-blue-400 transition-colors">Technology</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Glow ambient backdrops */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8 animate-fadeIn">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>Next-Gen Financial Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Understand the Market. <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Invest with Confidence.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            FinSight delivers institutional-grade analytics, real-time indicators, and deep machine learning forecasts to empower retail and professional investors alike.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 shadow-xl shadow-blue-500/25" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Launch Terminal
              </Button>
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5">
                Explore Live Demo
              </Button>
            </Link>
          </div>

          {/* Interactive Live Ticker Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-gray-800 bg-[#111827]/70 shadow-2xl backdrop-blur-xl max-w-4xl mx-auto overflow-hidden">
            <div className="flex items-center justify-between mb-3 px-2 border-b border-gray-800/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-gray-300 font-mono uppercase tracking-wider">
                  Live Global Ticker Tape
                </span>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">Stream Synchronized</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {LIVE_TICKERS.slice(0, 4).map((tick) => (
                <div key={tick.symbol} className="bg-gray-900/60 p-3 rounded-xl border border-gray-800 text-left">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white font-mono text-sm">{tick.symbol}</span>
                    <span className={`text-xs font-semibold font-mono ${tick.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tick.change}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 truncate">{tick.name}</div>
                  <div className="text-base font-bold text-white font-mono mt-1">${tick.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-24 bg-[#0d1424] border-t border-gray-800/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2 font-mono">
              Institutional Capabilities
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything You Need to Master the Markets
            </h3>
            <p className="text-gray-400 mt-4 text-sm sm:text-base">
              Built for precision, engineered for speed. Experience a platform built from the ground up to replace fragmented legacy tooling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="glass-panel p-6 rounded-2xl border border-gray-800/80 bg-[#111827]/60 hover:bg-[#111827] hover:border-gray-700 transition-all duration-200 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-800/80 border border-gray-700/60 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2 font-mono">
              Workflow
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Three Steps to Smarter Capital Allocation
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {STEPS.map((step, idx) => (
              <div
                key={idx}
                className="glass-panel p-8 rounded-2xl border border-gray-800 bg-[#111827]/70 relative"
              >
                <div className="text-4xl font-extrabold text-blue-500/30 font-mono mb-4">
                  {step.number}
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{step.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack Showcase */}
      <section id="technology" className="py-20 bg-[#0d1424] border-t border-b border-gray-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8 font-mono">
            Powered by Next-Generation Modern Architecture
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl border border-gray-800 bg-[#111827]/50 flex flex-col items-center">
              <Database className="w-6 h-6 text-blue-400 mb-2" />
              <span className="text-sm font-semibold text-white">PostgreSQL & Redis</span>
              <span className="text-xs text-gray-400">High-throughput caching</span>
            </div>
            <div className="p-4 rounded-xl border border-gray-800 bg-[#111827]/50 flex flex-col items-center">
              <Cpu className="w-6 h-6 text-purple-400 mb-2" />
              <span className="text-sm font-semibold text-white">LSTM & XGBoost</span>
              <span className="text-xs text-gray-400">Time-series forecasting</span>
            </div>
            <div className="p-4 rounded-xl border border-gray-800 bg-[#111827]/50 flex flex-col items-center">
              <Globe2 className="w-6 h-6 text-emerald-400 mb-2" />
              <span className="text-sm font-semibold text-white">FastAPI Core</span>
              <span className="text-xs text-gray-400">Asynchronous low-latency</span>
            </div>
            <div className="p-4 rounded-xl border border-gray-800 bg-[#111827]/50 flex flex-col items-center">
              <Lock className="w-6 h-6 text-cyan-400 mb-2" />
              <span className="text-sm font-semibold text-white">JWT + Argon2</span>
              <span className="text-xs text-gray-400">Enterprise security</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-24 relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-blue-500/30 bg-gradient-to-b from-[#1e293b]/70 to-[#0f172a]/90 shadow-2xl relative">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Ready to Upgrade Your Market Edge?
            </h3>
            <p className="text-gray-300 max-w-xl mx-auto mb-8 text-sm sm:text-base">
              Join thousands of investors using FinSight to discover anomalies, monitor portfolios, and beat market averages.
            </p>
            <Link to="/register">
              <Button variant="primary" size="lg" className="px-8 py-3.5 shadow-lg shadow-blue-500/30">
                Create Free Account Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 bg-[#0B1120]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg text-white font-mono">
              Fin<span className="text-blue-500">Sight</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link to="/stocks" className="hover:text-white transition-colors">Stocks</Link>
            <Link to="/portfolio" className="hover:text-white transition-colors">Portfolio</Link>
            <Link to="/news" className="hover:text-white transition-colors">News</Link>
          </div>

          <div className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} FinSight Financial Analytics.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
