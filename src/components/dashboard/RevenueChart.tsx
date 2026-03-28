'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import styles from './Charts.module.css';

interface DailyStat {
  date: string;
  revenue: number;
}

interface RevenueChartProps {
  data: DailyStat[];
}

function formatDate(dateStr: string | number): string {
  const parts = String(dateStr).split('-');
  return `${Number(parts[1])}/${Number(parts[2])}`;
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) {
    return <div className={styles.empty}>No revenue data</div>;
  }

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#46C8DC" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#46C8DC" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            tickFormatter={formatCurrency}
            stroke="rgba(255,255,255,0.3)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={60}
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
            formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#46C8DC"
            strokeWidth={2}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
