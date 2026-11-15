import React from 'react';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

interface BarChartProps {
  data: any[];
  dataKey: string;
  xAxisKey?: string;
  height?: number;
  color?: string;
  colorBySign?: boolean;
  valueFormatter?: (value: number) => string;
  className?: string;
}

const CustomBarTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  label?: string;
  valueFormatter?: (value: number) => string;
}> = ({ active, payload, label, valueFormatter }) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="bg-[#111827] border border-gray-700/80 p-3 rounded-lg shadow-xl text-xs backdrop-blur-md">
        <p className="text-gray-400 mb-1 font-mono">{label}</p>
        <p className="text-white font-bold text-sm font-mono flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color || '#3B82F6' }} />
          <span>{valueFormatter ? valueFormatter(entry.value) : entry.value?.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const BarChart: React.FC<BarChartProps> = ({
  data,
  dataKey,
  xAxisKey = 'date',
  height = 200,
  color = '#3B82F6',
  colorBySign = false,
  valueFormatter,
  className,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="w-full flex items-center justify-center text-xs text-gray-500 bg-gray-900/30 rounded-lg"
        style={{ height }}
      >
        No volume data available
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey={xAxisKey}
            stroke="#4b5563"
            tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={{ stroke: '#374151' }}
            minTickGap={25}
          />
          <YAxis
            stroke="#4b5563"
            tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={
              valueFormatter
                ? (val) => valueFormatter(val)
                : (val) => (val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${val}`)
            }
          />
          <Tooltip content={<CustomBarTooltip valueFormatter={valueFormatter} />} />
          <Bar dataKey={dataKey} radius={[3, 3, 0, 0]}>
            {data.map((entry, index) => {
              let barColor = color;
              if (colorBySign) {
                // If entry has close and open, green if close >= open, else red
                if (entry.close !== undefined && entry.open !== undefined) {
                  barColor = entry.close >= entry.open ? '#22C55E' : '#EF4444';
                } else if (entry[dataKey] < 0) {
                  barColor = '#EF4444';
                } else {
                  barColor = '#22C55E';
                }
              }
              return <Cell key={`cell-${index}`} fill={barColor} fillOpacity={0.8} />;
            })}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
