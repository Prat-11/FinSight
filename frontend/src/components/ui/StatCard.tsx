import React from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon,
  subtitle,
  prefix = '',
  suffix = '',
  className,
}) => {
  const isPositive = typeof change === 'number' && change > 0;
  const isNegative = typeof change === 'number' && change < 0;
  const isNeutral = typeof change === 'number' && change === 0;

  return (
    <div
      className={clsx(
        'glass-panel p-5 rounded-xl border border-gray-800/80 bg-[#111827]/80 hover:border-gray-700/80 transition-all duration-200 group shadow-lg',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</span>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-gray-800/70 border border-gray-700/50 flex items-center justify-center text-blue-400 group-hover:text-blue-300 group-hover:scale-105 transition-all">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-2xl font-bold text-white tracking-tight font-mono">
          {prefix}{value}{suffix}
        </span>
      </div>

      {(typeof change === 'number' || subtitle) && (
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-800/60 text-xs">
          {typeof change === 'number' && (
            <div
              className={clsx(
                'flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded',
                isPositive && 'text-emerald-400 bg-emerald-500/10',
                isNegative && 'text-rose-400 bg-rose-500/10',
                isNeutral && 'text-gray-400 bg-gray-800'
              )}
            >
              {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
              {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
              {isNeutral && <Minus className="w-3.5 h-3.5" />}
              <span>
                {change > 0 ? '+' : ''}
                {change.toFixed(2)}%
              </span>
            </div>
          )}
          <span className="text-gray-400 truncate">{subtitle || changeLabel}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
