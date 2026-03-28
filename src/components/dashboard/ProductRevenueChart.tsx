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

interface ProductData {
  name: string;
  revenue: number;
  unitsSold: number;
}

interface ProductRevenueChartProps {
  data: ProductData[];
}

function formatCurrency(value: string | number): string {
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function ProductRevenueChart({ data }: ProductRevenueChartProps) {
  if (data.length === 0) {
    return <div className={styles.empty}>No product data</div>;
  }

  // Show top 10 for the chart
  const chartData = data.slice(0, 10);

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={Math.max(280, chartData.length * 44)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={formatCurrency}
            stroke="rgba(255,255,255,0.3)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="rgba(255,255,255,0.3)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={120}
          />
          <Tooltip
            contentStyle={{
              background: '#0d1f38',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              color: '#fafafa',
            }}
            formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
          />
          <Bar
            dataKey="revenue"
            fill="#46C8DC"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
