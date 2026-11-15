import { useState, useEffect } from 'react';
import { stockService } from '../services/stockService';

export interface SearchResultItem {
  symbol: string;
  name: string;
  exchange?: string;
}

export const useStockSearch = (initialQuery: string = '', debounceMs: number = 300) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.trim().length === 0) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const handler = setTimeout(async () => {
      try {
        const searchResults = await stockService.searchStocks(query.trim());
        setResults(searchResults);
      } catch (err: any) {
        setError(err.message || 'Failed to search stocks');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [query, debounceMs]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clearResults: () => {
      setQuery('');
      setResults([]);
    },
  };
};
