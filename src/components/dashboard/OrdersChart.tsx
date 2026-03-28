'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import styles from './Charts.module.css';

interface DailyStat {
  date: string;
  orders: number;
}

interface OrdersChartProps {
  data: DailyStat[];
}

function formatDate(dateStr: string | number): string {
  const parts = String(dateStr).split('-');
  return `${Number(parts[1])}/${Number(parts[2])}`;
}

export function OrdersChart({ data }: OrdersChartProps) {
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
            formatter={(value) => [String(value), 'Orders']}
          />
          <Bar
            dataKey="orders"
            fill="#146E78"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
