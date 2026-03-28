'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import styles from './Charts.module.css';

interface DayStatusData {
  date: string;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

interface StatusOverTimeProps {
  data: DayStatusData[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#22c55e',
  cancelled: '#ef4444',
};

function formatDate(dateStr: string | number): string {
  const parts = String(dateStr).split('-');
  return `${Number(parts[1])}/${Number(parts[2])}`;
}

export function StatusOverTime({ data }: StatusOverTimeProps) {
  if (data.length === 0) {
    return <div className={styles.empty}>No order data</div>;
  }

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="rgba(255,255,255,0.3)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={30}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: '#0d1f38',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              color: '#fafafa',
            }}
            labelFormatter={(label) => formatDate(String(label))}
          />
          <Legend
            wrapperStyle={{ fontSize: '0.75rem', color: '#94a3b8' }}
            iconType="square"
            iconSize={10}
          />
          {Object.entries(STATUS_COLORS).map(([key, color]) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="status"
              fill={color}
              radius={key === 'cancelled' ? [4, 4, 0, 0] : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
