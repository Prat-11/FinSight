import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  ExternalLink,
  Filter,
  Search,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import { newsService } from '../services/newsService';
import { NewsArticle } from '../types';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

const CATEGORIES = [
  'All',
  'Technology & AI',
  'Macro Economy',
  'Earnings & Corporate',
  'Emerging Markets',
  'Clean Energy & Automotive',
  'Semiconductors',
];

export const NewsPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterSymbol, setFilterSymbol] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await newsService.getFinancialNews();
      setArticles(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch financial news');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const filteredArticles = articles.filter((item) => {
    const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSymbol =
      !filterSymbol ||
      (item.symbol && item.symbol.toUpperCase().includes(filterSymbol.toUpperCase())) ||
      item.title.toUpperCase().includes(filterSymbol.toUpperCase());
    return matchCategory && matchSymbol;
  });

  const getSentimentVariant = (sentiment: string): 'success' | 'danger' | 'default' => {
    if (sentiment === 'POSITIVE') return 'success';
    if (sentiment === 'NEGATIVE') return 'danger';
    return 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Newspaper className="w-7 h-7 text-blue-500" />
            <span>Financial News & Sentiment Feeds</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time macroeconomic dispatches, corporate earnings reports, and algorithmic NLP sentiment grading.
          </p>
        </div>

        <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 self-start sm:self-auto">
          Demo Wire Active
        </span>
      </div>

      {/* Category Filter Pills & Search */}
      <div className="glass-panel p-4 rounded-xl border border-gray-800 bg-[#111827]/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white bg-gray-900/60 hover:bg-gray-800 border border-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <input
            type="text"
            placeholder="Filter news by ticker..."
            value={filterSymbol}
            onChange={(e) => setFilterSymbol(e.target.value)}
            className="w-full bg-gray-900 text-xs text-gray-200 placeholder-gray-500 rounded-lg px-3 py-2 border border-gray-700/80 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <LoadingSpinner size="lg" message="Streaming news intelligence from global wires..." className="py-24" />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchNews} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-panel p-5 rounded-2xl border border-gray-800 bg-[#111827]/75 hover:bg-[#111827] hover:border-gray-700 hover:shadow-2xl transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {article.symbol && (
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        {article.symbol}
                      </span>
                    )}
                    <span className="text-[11px] text-gray-400 font-mono truncate">{article.source}</span>
                  </div>
                  <Badge variant={getSentimentVariant(article.sentiment)} size="sm">
                    {article.sentiment}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug mb-2">
                  {article.title}
                </h3>

                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mb-4">
                  {article.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-800/80 text-[11px] text-gray-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{article.publishedAt}</span>
                </div>
                <div className="flex items-center gap-1 text-blue-400 group-hover:translate-x-1 transition-transform">
                  <span>Read Article</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsPage;
