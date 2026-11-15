import apiClient from './api';
import { NewsArticle } from '../types';

const DEMO_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'NVIDIA Expands Custom AI Silicon Roadmap as Hyperscalers Accelerate Infrastructure Capital Outlay',
    description: 'Major technology enterprises are intensifying capital expenditure in AI data centers, boosting multi-quarter demand projections for next-generation GPU platforms and high-speed networking solutions.',
    source: 'Bloomberg Markets',
    url: 'https://bloomberg.com',
    publishedAt: '25 mins ago',
    sentiment: 'POSITIVE',
    symbol: 'NVDA',
    category: 'Technology & AI',
    isDemo: true,
  },
  {
    id: 'news-2',
    title: 'Federal Reserve Holds Benchmark Rates Steady, Signaling Measured Path Ahead Amid Steady Labor Data',
    description: 'Federal Reserve policymakers opted to maintain current interest rate corridors while noting resilient economic indicators and gradual disinflationary trends across wholesale goods.',
    source: 'Financial Times',
    url: 'https://ft.com',
    publishedAt: '1 hour ago',
    sentiment: 'NEUTRAL',
    category: 'Macro Economy',
    isDemo: true,
  },
  {
    id: 'news-3',
    title: 'Apple Services Revenue Sets All-Time Record Fueled by Cloud, App Store, and Payment Ecosystem Expansion',
    description: 'Apple disclosed record ecosystem engagement across its active device install base, with high-margin subscriptions offsetting slight cyclical hardware variations.',
    source: 'Wall Street Journal',
    url: 'https://wsj.com',
    publishedAt: '2 hours ago',
    sentiment: 'POSITIVE',
    symbol: 'AAPL',
    category: 'Earnings & Corporate',
    isDemo: true,
  },
  {
    id: 'news-4',
    title: 'Indian Benchmark Indices Nifty 50 and Sensex Scale Higher Led by Banking and Information Technology Rallies',
    description: 'Foreign portfolio investments returned into frontline Indian equities, sparking a 140-point breakout in the Nifty 50 index with heavy participation from banking majors.',
    source: 'Economic Times',
    url: 'https://economictimes.indiatimes.com',
    publishedAt: '3 hours ago',
    sentiment: 'POSITIVE',
    symbol: 'RELIANCE',
    category: 'Emerging Markets',
    isDemo: true,
  },
  {
    id: 'news-5',
    title: 'Tesla Energy Storage Deployments Surge 150% YoY, Providing Diversified Margin Support',
    description: 'Megapack utility installations and commercial storage ramp up significantly, offering substantial revenue diversification amidst intense global EV market competition.',
    source: 'Reuters',
    url: 'https://reuters.com',
    publishedAt: '4 hours ago',
    sentiment: 'POSITIVE',
    symbol: 'TSLA',
    category: 'Clean Energy & Automotive',
    isDemo: true,
  },
  {
    id: 'news-6',
    title: 'Microsoft Accelerates Enterprise Copilot Integrations Across Fortune 500 Clients',
    description: 'Enterprise adoption of generative AI workplace copilots jumps over 60% quarter-over-quarter as business productivity benchmarks yield measurable operational cost reductions.',
    source: 'CNBC',
    url: 'https://cnbc.com',
    publishedAt: '5 hours ago',
    sentiment: 'POSITIVE',
    symbol: 'MSFT',
    category: 'Technology & AI',
    isDemo: true,
  },
  {
    id: 'news-7',
    title: 'Global Semiconductor Supply Chains Navigate Geopolitical Shifts with Domestic Foundry Expansion',
    description: 'Leading chipmakers commit billions in regional advanced fabrication facilities across the US, Europe, and Asia to mitigate single-geography manufacturing bottlenecks.',
    source: 'MarketWatch',
    url: 'https://marketwatch.com',
    publishedAt: '6 hours ago',
    sentiment: 'NEUTRAL',
    category: 'Semiconductors',
    isDemo: true,
  },
  {
    id: 'news-8',
    title: 'Crude Oil Prices Retrace as Global Inventory Builds Offset Shipping Corridor Disruptions',
    description: 'Brent crude dipped toward $78 a barrel as unexpected builds in commercial petroleum inventories balanced ongoing concerns over logistical supply transit channels.',
    source: 'Barron’s',
    url: 'https://barrons.com',
    publishedAt: '8 hours ago',
    sentiment: 'NEGATIVE',
    category: 'Commodities',
    isDemo: true,
  },
];

export const newsService = {
  async getFinancialNews(symbol?: string): Promise<NewsArticle[]> {
    try {
      const response = await apiClient.get<NewsArticle[]>('/news', {
        params: symbol ? { symbol } : {},
      });
      return response.data;
    } catch {
      if (symbol) {
        const upper = symbol.toUpperCase();
        const filtered = DEMO_NEWS_ARTICLES.filter((item) => item.symbol === upper);
        if (filtered.length > 0) return filtered;
        // Generic fallback for queried stock
        return [
          {
            id: 'news-custom-1',
            title: `${upper} Posts Strong Quarterly Metric Performance, Expanding Operating Cash Reserves`,
            description: `Institutional analysts highlight steady operational improvements for ${upper} as strategic investments across core product verticals begin realizing positive returns.`,
            source: 'FinSight Intelligence',
            url: 'https://finsight.io',
            publishedAt: '1 hour ago',
            sentiment: 'POSITIVE',
            symbol: upper,
            category: 'Corporate Updates',
            isDemo: true,
          },
          ...DEMO_NEWS_ARTICLES.slice(0, 3),
        ];
      }
      return DEMO_NEWS_ARTICLES;
    }
  },
};
