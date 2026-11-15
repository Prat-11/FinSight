import React from 'react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface SeriesConfig {
  key: string;
  name?: string;
  color: string;
}

interface LineChartProps {
  data: any[];
  series: SeriesConfig[];
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  valueFormatter?: (value: number) => string;
  className?: string;
}

const CustomLineTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  label?: string;
  valueFormatter?: (value: number) => string;
}> = ({ active, payload, label, valueFormatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111827] border border-gray-700/80 p-3 rounded-lg shadow-xl text-xs backdrop-blur-md">
        <p className="text-gray-400 mb-2 font-mono">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 font-mono">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name || entry.dataKey}</span>
              </span>
              <span className="text-white font-bold">
                {valueFormatter ? valueFormatter(entry.value) : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const LineChart: React.FC<LineChartProps> = ({
  data,
  series,
  xAxisKey = 'date',
  height = 300,
  showGrid = true,
  valueFormatter,
  className,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="w-full flex items-center justify-center text-xs text-gray-500 bg-gray-900/30 rounded-lg"
        style={{ height }}
      >
        No comparison data available
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />}
          <XAxis
            dataKey={xAxisKey}
            stroke="#4b5563"
            tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={{ stroke: '#374151' }}
            minTickGap={20}
          />
          <YAxis
            stroke="#4b5563"
            tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={valueFormatter ? (val) => valueFormatter(val) : undefined}
          />
          <Tooltip content={<CustomLineTooltip valueFormatter={valueFormatter} />} />
          <Legend
            wrapperStyle={{ paddingTop: 10, fontSize: 12, fontFamily: 'monospace' }}
            formatter={(value) => <span className="text-gray-300 font-medium">{value}</span>}
          />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name || s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, stroke: '#111827', strokeWidth: 2 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
