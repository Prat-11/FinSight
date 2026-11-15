import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { useStockSearch, SearchResultItem } from '../../hooks/useStockSearch';

interface SearchInputProps {
  placeholder?: string;
  onSelectStock: (item: SearchResultItem) => void;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search stocks by symbol or company name (e.g. AAPL, NVDA, RELIANCE)...',
  onSelectStock,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { query, setQuery, results, isLoading, clearResults } = useStockSearch('', 250);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (item: SearchResultItem) => {
    onSelectStock(item);
    clearResults();
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={clsx('relative w-full', className)}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          ) : (
            <Search className="w-4 h-4 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-[#111827] text-gray-100 placeholder-gray-500 text-sm rounded-xl pl-10 pr-10 py-2.5 border border-gray-700/80 hover:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-inner transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              clearResults();
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#111827] border border-gray-700/80 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl max-h-72 overflow-y-auto">
          {results.length > 0 ? (
            <ul className="divide-y divide-gray-800/80">
              {results.map((item) => (
                <li
                  key={item.symbol}
                  onClick={() => handleSelect(item)}
                  className="px-4 py-3 hover:bg-blue-600/10 cursor-pointer flex items-center justify-between transition-colors group"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm font-mono group-hover:text-blue-400 transition-colors">
                        {item.symbol}
                      </span>
                      {item.exchange && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">
                          {item.exchange}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 truncate mt-0.5 max-w-[280px]">
                      {item.name}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </li>
              ))}
            </ul>
          ) : !isLoading ? (
            <div className="p-4 text-center text-xs text-gray-400">
              No matching tickers found for &quot;{query}&quot;
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
