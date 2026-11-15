import React from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockTickerProps {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  currency?: string;
  onClick?: () => void;
  className?: string;
}

export const StockTicker: React.FC<StockTickerProps> = ({
  symbol,
  name,
  price,
  change,
  changePercent,
  currency = '$',
  onClick,
  className,
}) => {
  const isPositive = change >= 0;

  return (
    <div
      onClick={onClick}
      className={clsx(
        'flex items-center justify-between p-3 rounded-lg bg-gray-900/60 border border-gray-800/80 hover:border-gray-700 transition-all duration-150',
        onClick && 'cursor-pointer hover:bg-gray-800/50',
        className
      )}
    >
      <div className="flex flex-col min-w-0 pr-3">
        <span className="font-bold text-white text-sm tracking-wide font-mono">{symbol}</span>
        {name && <span className="text-xs text-gray-400 truncate max-w-[140px]">{name}</span>}
      </div>

      <div className="flex flex-col items-end flex-shrink-0">
        <span className="text-sm font-semibold text-white font-mono">
          {currency}{price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <div
          className={clsx(
            'flex items-center gap-0.5 text-xs font-medium font-mono',
            isPositive ? 'text-emerald-400' : 'text-rose-400'
          )}
        >
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>
            {isPositive ? '+' : ''}
            {change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
};

export default StockTicker;
