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

export interface AreaChartDataPoint {
  date: string;
  value?: number;
  close?: number;
  price?: number;
  [key: string]: any;
}

interface AreaChartProps {
  data: AreaChartDataPoint[];
  dataKey?: string;
  height?: number;
  color?: string;
  gradientId?: string;
  showGrid?: boolean;
  currency?: string;
  className?: string;
}

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  label?: string;
  currency?: string;
}> = ({ active, payload, label, currency = '$' }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-[#111827] border border-gray-700/80 p-3 rounded-lg shadow-xl text-xs backdrop-blur-md">
        <p className="text-gray-400 mb-1 font-mono">{label}</p>
        <p className="text-white font-bold text-sm font-mono flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          <span>
            {currency}
            {typeof val === 'number' ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : val}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  dataKey = 'close',
  height = 300,
  color = '#3B82F6',
  gradientId = 'areaGrad',
  showGrid = true,
  currency = '$',
  className,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="w-full flex items-center justify-center text-xs text-gray-500 bg-gray-900/30 rounded-lg"
        style={{ height }}
      >
        No historical price data available
      </div>
    );
  }

  // Calculate dynamic min/max for tight y-axis scaling
  const values = data.map((d) => d[dataKey] ?? d.value ?? d.close ?? 0).filter((v) => typeof v === 'number');
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 100;
  const padding = (maxVal - minVal) * 0.1 || 5;
  const yDomain = [Math.max(0, Math.floor(minVal - padding)), Math.ceil(maxVal + padding)];

  return (
    <div className={className} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />}
          <XAxis
            dataKey="date"
            stroke="#4b5563"
            tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={{ stroke: '#374151' }}
            minTickGap={25}
          />
          <YAxis
            domain={yDomain}
            stroke="#4b5563"
            tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${currency}${val}`}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            isAnimationActive={true}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChart;
