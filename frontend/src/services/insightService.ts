import apiClient from './api';
import { AIInsight } from '../types';

const generateDemoInsight = (symbol: string, companyName?: string): AIInsight => {
  const upper = symbol.toUpperCase();
  const presets: Record<string, Partial<AIInsight>> = {
    NVDA: {
      companyName: 'NVIDIA Corporation',
      trend: 'Strong Bullish',
      rsiSignal: 'Overbought',
      volatilityLevel: 'High',
      movingAverageSignal: 'Golden Cross',
      volumeAnalysis: 'Institutional accumulation observed; volume is 28% higher than 30-day moving average.',
      summary: 'NVIDIA demonstrates exceptional market momentum propelled by unmatched demand in AI accelerators and data center compute infrastructure. Short-term consolidation risk exists around major resistance, but fundamental drivers remain overwhelmingly positive.',
      recommendation: 'STRONG_BUY',
      confidenceScore: 92,
      keyFactors: [
        'Surging enterprise AI infrastructure spending with record datacenter revenue backlog',
        'Gross margins sustain north of 75% driven by pricing power in Blackwell architecture',
        'Technical indicator MACD histogram confirms continuation of upward expansion',
        'Consensus analyst target upgraded by 18% over the past quarter',
      ],
      modelMetrics: {
        modelType: 'Hybrid LSTM + XGBoost Ensemble',
        accuracy: 89.4,
        precision: 91.2,
        rmse: 2.14,
        targetPrice: 165.00,
      },
    },
    AAPL: {
      companyName: 'Apple Inc.',
      trend: 'Bullish',
      rsiSignal: 'Neutral',
      volatilityLevel: 'Low',
      movingAverageSignal: 'Above 50 SMA',
      volumeAnalysis: 'Healthy volume with steady retail and institutional absorption along ascending trendline.',
      summary: 'Apple displays defensive quality with recurring high-margin services expansion. Hardware refresh cycle anticipation bolstered by Apple Intelligence rollout provides stable medium-term tailwinds.',
      recommendation: 'BUY',
      confidenceScore: 86,
      keyFactors: [
        'Services segment revenue growing at 14% year-over-year at 74% gross margin',
        'Robust balance sheet enabling massive $110B annual share repurchases and growing dividends',
        'Technical support firmly validated at the 50-day simple moving average',
        'RSI of 58 indicates balanced momentum without immediate overextension',
      ],
      modelMetrics: {
        modelType: 'Multi-Factor Random Forest Regressor',
        accuracy: 87.2,
        precision: 88.5,
        rmse: 3.45,
        targetPrice: 248.00,
      },
    },
    TSLA: {
      companyName: 'Tesla, Inc.',
      trend: 'Bullish',
      rsiSignal: 'Neutral',
      volatilityLevel: 'Extreme',
      movingAverageSignal: 'Above 50 SMA',
      volumeAnalysis: 'Heavy options volume and elevated volatility profile following vehicle delivery metrics.',
      summary: 'Tesla shows sharp upside volatility supported by autonomous vehicle platform expectations and energy storage margin growth. Investors should monitor automotive gross margin dynamics.',
      recommendation: 'HOLD',
      confidenceScore: 74,
      keyFactors: [
        'Energy storage deployments accelerating with record quarterly megawatt-hour volume',
        'FSD hardware and licensing opportunities expanding market total addressable valuation',
        'Elevated beta (2.1) creates vulnerability during broader macroeconomic fluctuations',
        'Price testing upper boundary of multi-month descending wedge',
      ],
      modelMetrics: {
        modelType: 'Gradient Boosted Time-Series Regressor',
        accuracy: 78.6,
        precision: 76.9,
        rmse: 6.82,
        targetPrice: 235.00,
      },
    },
    MSFT: {
      companyName: 'Microsoft Corporation',
      trend: 'Neutral',
      rsiSignal: 'Neutral',
      volatilityLevel: 'Low',
      movingAverageSignal: 'Consolidating',
      volumeAnalysis: 'Subdued volume characteristic of base-building consolidation within a narrow channel.',
      summary: 'Microsoft maintains an elite market position through Azure cloud leadership and Copilot monetisation. Currently consolidating after substantial prior multi-quarter gains.',
      recommendation: 'BUY',
      confidenceScore: 84,
      keyFactors: [
        'Azure revenue expanding at 29% YoY with expanding enterprise AI workload commitments',
        'Cash flow generation exceeds $70B annually with diversified enterprise revenue streams',
        'RSI sitting near 48 represents attractive risk-reward entry zone for long-term investors',
        'Holding firm above 200-day exponential moving average',
      ],
      modelMetrics: {
        modelType: 'Deep Neural Network (DNN) Predictor',
        accuracy: 85.8,
        precision: 86.4,
        rmse: 4.10,
        targetPrice: 460.00,
      },
    },
  };

  const preset = presets[upper] || {
    companyName: companyName || `${upper} Corporation`,
    trend: 'Bullish',
    rsiSignal: 'Neutral',
    volatilityLevel: 'Moderate',
    movingAverageSignal: 'Above 50 SMA',
    volumeAnalysis: 'Average transaction volume across key trading sessions with constructive accumulation.',
    summary: `${upper} exhibits stable fundamental performance and constructive technical positioning. Risk metrics reflect standard market correlation with positive trend confirmation.`,
    recommendation: 'BUY',
    confidenceScore: 81,
    keyFactors: [
      'Positive price action relative to sectoral peer benchmark index',
      'Neutral momentum indicators suggest ample room for further capital appreciation',
      'Institutional ownership percentage remains consistent with institutional consensus',
      'Solid cash conversion cycles and conservative debt-to-equity leverage',
    ],
    modelMetrics: {
      modelType: 'Ensemble Gradient Boosting',
      accuracy: 83.5,
      precision: 84.1,
      rmse: 3.20,
      targetPrice: 175.00,
    },
  };

  return {
    id: 'insight-' + upper + '-' + Date.now(),
    symbol: upper,
    companyName: preset.companyName || `${upper} Corporation`,
    timestamp: new Date().toISOString(),
    trend: preset.trend || 'Bullish',
    rsiSignal: preset.rsiSignal || 'Neutral',
    volatilityLevel: preset.volatilityLevel || 'Moderate',
    movingAverageSignal: preset.movingAverageSignal || 'Above 50 SMA',
    volumeAnalysis: preset.volumeAnalysis || 'Trading volume within normal institutional parameters.',
    summary: preset.summary || '',
    recommendation: preset.recommendation || 'BUY',
    confidenceScore: preset.confidenceScore || 80,
    keyFactors: preset.keyFactors || [],
    modelMetrics: preset.modelMetrics,
    isDemo: true,
  };
};

export const insightService = {
  async getStockInsights(symbol: string): Promise<AIInsight> {
    try {
      const response = await apiClient.get<AIInsight>(`/insights/stock/${symbol}`);
      return response.data;
    } catch {
      return generateDemoInsight(symbol);
    }
  },

  async getPortfolioInsights(): Promise<AIInsight[]> {
    try {
      const response = await apiClient.get<AIInsight[]>('/insights/portfolio');
      return response.data;
    } catch {
      return [
        generateDemoInsight('NVDA', 'NVIDIA Corporation'),
        generateDemoInsight('AAPL', 'Apple Inc.'),
        generateDemoInsight('MSFT', 'Microsoft Corporation'),
        generateDemoInsight('TSLA', 'Tesla, Inc.'),
      ];
    }
  },
};
