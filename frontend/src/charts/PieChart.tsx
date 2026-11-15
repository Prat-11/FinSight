import React from 'react';
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

export interface PieChartItem {
  name: string;
  value: number;
  color?: string;
  [key: string]: any;
}

interface PieChartProps {
  data: PieChartItem[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  currency?: string;
  className?: string;
}

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#14B8A6', // Teal
];

const CustomPieTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  currency?: string;
}> = ({ active, payload, currency = '$' }) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="bg-[#111827] border border-gray-700/80 p-3 rounded-lg shadow-xl text-xs backdrop-blur-md">
        <p className="font-semibold text-white mb-1 flex items-center gap-1.5 font-mono">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.payload.fill || entry.color }} />
          <span>{entry.name}</span>
        </p>
        <p className="text-gray-300 font-mono">
          Value: {currency}{typeof entry.value === 'number' ? entry.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : entry.value}
        </p>
        {entry.payload.percent !== undefined && (
          <p className="text-gray-400 font-mono mt-0.5">
            Share: {(entry.payload.percent * 100).toFixed(1)}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const PieChart: React.FC<PieChartProps> = ({
  data,
  height = 280,
  innerRadius = 55,
  outerRadius = 85,
  showLegend = true,
  currency = '$',
  className,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="w-full flex items-center justify-center text-xs text-gray-500 bg-gray-900/30 rounded-lg"
        style={{ height }}
      >
        No asset distribution data available
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Tooltip content={<CustomPieTooltip currency={currency} />} />
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: 11, fontFamily: 'monospace', paddingTop: 8 }}
              formatter={(value) => <span className="text-gray-300 font-medium">{value}</span>}
            />
          )}
          <Pie
            data={data}
            cx="50%"
            cy="46%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value"
            stroke="#111827"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;
