import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface MiniChartProps {
  data: number[];
  height?: number;
  width?: number | string;
  isPositive?: boolean;
  color?: string;
  className?: string;
}

export const MiniChart: React.FC<MiniChartProps> = ({
  data,
  height = 36,
  width = '100%',
  isPositive = true,
  color,
  className,
}) => {
  if (!data || data.length === 0) return null;

  const chartData = data.map((val, idx) => ({ idx, val }));
  const strokeColor = color || (isPositive ? '#22C55E' : '#EF4444');
  const gradientId = `miniGrad-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={className} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="val"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MiniChart;
