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

interface DayData {
  date: string;
  signups: number;
}

interface AcquisitionChartProps {
  data: DayData[];
}

function formatDate(dateStr: string | number): string {
  const parts = String(dateStr).split('-');
  return `${Number(parts[1])}/${Number(parts[2])}`;
}

export function AcquisitionChart({ data }: AcquisitionChartProps) {
  if (data.length === 0) {
    return <div className={styles.empty}>No signup data</div>;
  }

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
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
            formatter={(value) => [String(value), 'Signups']}
          />
          <Area
            type="monotone"
            dataKey="signups"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#signupGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
