'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageReveal } from '@/components/ui/PageReveal';
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { StatCard } from '@/components/dashboard/StatCard';
import { OrderFunnel } from '@/components/dashboard/OrderFunnel';
import dynamic from 'next/dynamic';

const StatusOverTime = dynamic(
  () => import('@/components/dashboard/StatusOverTime').then(m => ({ default: m.StatusOverTime })),
  { loading: () => <div style={{ height: 300, background: '#f1f5f9', borderRadius: 8 }} /> }
);
const ProductRevenueChart = dynamic(
  () => import('@/components/dashboard/ProductRevenueChart').then(m => ({ default: m.ProductRevenueChart })),
  { loading: () => <div style={{ height: 300, background: '#f1f5f9', borderRadius: 8 }} /> }
);
import { generateCSV, downloadCSV } from '@/lib/csv-export';
import styles from './page.module.css';

interface FunnelStage {
  stage: string;
  count: number;
}

interface ProductData {
  name: string;
  revenue: number;
  unitsSold: number;
}

interface DayStatusData {
  date: string;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  aov: number;
  ordersByStatus: Record<string, number>;
  funnel: FunnelStage[];
  dailyByStatus: DayStatusData[];
  allProducts: ProductData[];
  avgFulfillmentHours: number;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState('30');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/stats?range=${range}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API returned ${res.status}`);
      }
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user, range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportProducts = () => {
    if (!data?.allProducts) return;
    const csv = generateCSV(data.allProducts, [
      { header: 'Product', accessor: (p) => p.name },
      { header: 'Revenue', accessor: (p) => p.revenue.toFixed(2) },
      { header: 'Units Sold', accessor: (p) => p.unitsSold },
    ]);
    downloadCSV(csv, `product-analytics-${range}d.csv`);
  };

  const formatFulfillment = (hours: number): string => {
    if (hours < 24) return `${hours}h`;
    const days = Math.round(hours / 24 * 10) / 10;
    return `${days}d`;
  };

  return (
    <PageReveal>
      <div className="reveal-item">
        <DashboardTopbar title="Analytics" />
      </div>
      <div className={styles.content}>
        <div className={`${styles.toolbar} reveal-item`}>
          <DateRangePicker value={range} onChange={setRange} />
        </div>

        {loading ? (
          <div className={styles.loading}>Loading analytics&hellip;</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : data ? (
          <>
            <div className={`${styles.statGrid} reveal-item`}>
              <StatCard label="Total Orders" value={data.totalOrders} />
              <StatCard
                label="Revenue"
                value={`$${data.totalRevenue.toFixed(2)}`}
              />
              <StatCard
                label="Avg Order Value"
                value={`$${data.aov.toFixed(2)}`}
              />
              <StatCard
                label="Avg Fulfillment"
                value={data.avgFulfillmentHours > 0 ? formatFulfillment(data.avgFulfillmentHours) : 'N/A'}
              />
              <StatCard
                label="Delivered"
                value={data.ordersByStatus.delivered || 0}
              />
              <StatCard
                label="Cancelled"
                value={data.ordersByStatus.cancelled || 0}
              />
            </div>

            <div className={`${styles.twoCol} reveal-item`}>
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Order Funnel</h2>
                <OrderFunnel data={data.funnel} />
              </div>
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Orders by Status Over Time</h2>
                <StatusOverTime data={data.dailyByStatus} />
              </div>
            </div>

            <div className={`${styles.section} reveal-item`}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Product Performance</h2>
                <button
                  type="button"
                  className={styles.exportBtn}
                  onClick={handleExportProducts}
                  disabled={!data.allProducts.length}
                >
                  Export CSV
                </button>
              </div>
              <ProductRevenueChart data={data.allProducts} />
            </div>

            <div className={`${styles.section} reveal-item`}>
              <h2 className={styles.sectionTitle}>All Products</h2>
              <div className={styles.productTable}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>#</th>
                      <th className={styles.th}>Product</th>
                      <th className={`${styles.th} ${styles.alignRight}`}>Revenue</th>
                      <th className={`${styles.th} ${styles.alignRight}`}>Units Sold</th>
                      <th className={`${styles.th} ${styles.alignRight}`}>Avg Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.allProducts.map((p, i) => (
                      <tr key={p.name} className={styles.tr}>
                        <td className={styles.td}>{i + 1}</td>
                        <td className={styles.td}>{p.name}</td>
                        <td className={`${styles.td} ${styles.alignRight}`}>
                          ${p.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`${styles.td} ${styles.alignRight}`}>
                          {p.unitsSold}
                        </td>
                        <td className={`${styles.td} ${styles.alignRight}`}>
                          ${p.unitsSold > 0 ? (p.revenue / p.unitsSold).toFixed(2) : '0.00'}
                        </td>
                      </tr>
                    ))}
                    {data.allProducts.length === 0 && (
                      <tr>
                        <td className={styles.td} colSpan={5}>
                          No product data yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </PageReveal>
  );
}
