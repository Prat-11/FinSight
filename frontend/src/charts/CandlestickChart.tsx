import React from 'react';
import {
  ResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { HistoricalDataPoint } from '../types';

interface CandlestickChartProps {
  data: HistoricalDataPoint[];
  height?: number;
  currency?: string;
  className?: string;
}

const OHLCTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  label?: string;
  currency?: string;
}> = ({ active, payload, label, currency = '$' }) => {
  if (active && payload && payload.length) {
    const point: HistoricalDataPoint = payload[0].payload;
    const isGain = point.close >= point.open;

    return (
      <div className="bg-[#111827] border border-gray-700/90 p-3.5 rounded-xl shadow-2xl text-xs backdrop-blur-md min-w-[190px]">
        <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-2 font-mono">
          <span className="text-gray-400">{label}</span>
          <span className={isGain ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
            {isGain ? 'BULLISH' : 'BEARISH'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-[11px]">
          <div>
            <span className="text-gray-500">Open:</span>{' '}
            <span className="text-gray-200 font-semibold">{currency}{point.open?.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-500">Close:</span>{' '}
            <span className={isGain ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {currency}{point.close?.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">High:</span>{' '}
            <span className="text-gray-200 font-semibold">{currency}{point.high?.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-500">Low:</span>{' '}
            <span className="text-gray-200 font-semibold">{currency}{point.low?.toFixed(2)}</span>
          </div>
          <div className="col-span-2 pt-1 border-t border-gray-800/80 flex justify-between">
            <span className="text-gray-500">Volume:</span>
            <span className="text-blue-400 font-medium">{point.volume?.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  height = 340,
  currency = '$',
  className,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="w-full flex items-center justify-center text-xs text-gray-500 bg-gray-900/30 rounded-lg"
        style={{ height }}
      >
        No price movement data available
      </div>
    );
  }

  const closes = data.map((d) => d.close);
  const minPrice = Math.min(...data.map((d) => d.low || d.close));
  const maxPrice = Math.max(...data.map((d) => d.high || d.close));
  const padding = (maxPrice - minPrice) * 0.08 || 5;

  const firstClose = closes[0] || 0;
  const lastClose = closes[closes.length - 1] || 0;
  const isNetPositive = lastClose >= firstClose;
  const mainColor = isNetPositive ? '#22C55E' : '#EF4444';

  return (
    <div className={className} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="ohlcGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={mainColor} stopOpacity={0.35} />
              <stop offset="95%" stopColor={mainColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#4b5563"
            tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={{ stroke: '#374151' }}
            minTickGap={25}
          />
          <YAxis
            domain={[Math.max(0, Math.floor(minPrice - padding)), Math.ceil(maxPrice + padding)]}
            stroke="#4b5563"
            tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${currency}${val}`}
          />
          <Tooltip content={<OHLCTooltip currency={currency} />} />
          <Area
            type="monotone"
            dataKey="close"
            stroke={mainColor}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#ohlcGrad)"
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CandlestickChart;
