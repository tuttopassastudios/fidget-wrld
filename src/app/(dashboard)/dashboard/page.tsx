'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDashboardRole } from '@/components/dashboard/DashboardGuard';
import { PageReveal } from '@/components/ui/PageReveal';
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
import { StatCard } from '@/components/dashboard/StatCard';
import { DataTable, type Column } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import dynamic from 'next/dynamic';

const RevenueChart = dynamic(
  () => import('@/components/dashboard/RevenueChart').then(m => ({ default: m.RevenueChart })),
  { loading: () => <div style={{ height: 300, background: '#f1f5f9', borderRadius: 8 }} /> }
);
const OrdersChart = dynamic(
  () => import('@/components/dashboard/OrdersChart').then(m => ({ default: m.OrdersChart })),
  { loading: () => <div style={{ height: 300, background: '#f1f5f9', borderRadius: 8 }} /> }
);
import { TopProducts } from '@/components/dashboard/TopProducts';
import { OrderFunnel } from '@/components/dashboard/OrderFunnel';
import { ViewSwitcher, usePersistedView } from '@/components/dashboard/ViewSwitcher';
import { AlertsBanner } from '@/components/dashboard/AlertsBanner';
import { LiveOrderFeed } from '@/components/dashboard/LiveOrderFeed';
import { StockAlerts } from '@/components/dashboard/StockAlerts';
import type { DashboardView } from '@/components/dashboard/ViewSwitcher';
import styles from './page.module.css';

interface DailyStat {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  name: string;
  revenue: number;
  unitsSold: number;
}

interface FunnelStage {
  stage: string;
  count: number;
}

interface PrevPeriod {
  totalOrders: number;
  totalRevenue: number;
  aov: number;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  aov: number;
  userCount: number;
  ordersByStatus: Record<string, number>;
  dailyStats: DailyStat[];
  topProducts: TopProduct[];
  funnel: FunnelStage[];
  avgFulfillmentHours: number;
  prevPeriod: PrevPeriod;
  recentOrders: Array<{
    id: string;
    orderId: string;
    status: string;
    total: number;
    email: string;
    customer: string;
    createdAt: string;
  }>;
}

const recentOrderColumns: Column<Stats['recentOrders'][number]>[] = [
  { key: 'orderId', label: 'Order' },
  { key: 'customer', label: 'Customer' },
  { key: 'email', label: 'Email' },
  {
    key: 'status',
    label: 'Status',
    render: (item) => <StatusBadge status={item.status} />,
  },
  {
    key: 'total',
    label: 'Total',
    align: 'right',
    render: (item) => `$${item.total.toFixed(2)}`,
  },
  {
    key: 'createdAt',
    label: 'Date',
    render: (item) => new Date(item.createdAt).toLocaleDateString(),
  },
];

function formatFulfillment(hours: number): string {
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24 * 10) / 10;
  return `${days}d`;
}

function computeTrend(current: number, previous: number): { trend: string; trendDirection: 'up' | 'down' | 'neutral' } {
  if (previous === 0) return { trend: '', trendDirection: 'neutral' };
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return { trend: '0%', trendDirection: 'neutral' };
  return {
    trend: `${Math.abs(pct)}% vs prev`,
    trendDirection: pct > 0 ? 'up' : 'down',
  };
}

// ---------------------------------------------------------------------------
// View-specific layouts
// ---------------------------------------------------------------------------

function ExecutiveView({ stats }: { stats: Stats }) {
  const revTrend = computeTrend(stats.totalRevenue, stats.prevPeriod.totalRevenue);
  const aovTrend = computeTrend(stats.aov, stats.prevPeriod.aov);
  const orderTrend = computeTrend(stats.totalOrders, stats.prevPeriod.totalOrders);

  return (
    <>
      <div className={`${styles.statGrid} reveal-item`}>
        <StatCard label="Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} {...revTrend} />
        <StatCard label="Avg Order Value" value={`$${stats.aov.toFixed(2)}`} {...aovTrend} />
        <StatCard label="Total Orders" value={stats.totalOrders} {...orderTrend} />
        <StatCard label="Registered Users" value={stats.userCount} />
      </div>

      <div className={`${styles.chartGrid} reveal-item`}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Revenue Trend</h2>
          <RevenueChart data={stats.dailyStats} />
        </div>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Order Funnel</h2>
          <OrderFunnel data={stats.funnel} />
        </div>
      </div>

      <div className={`${styles.chartGrid} reveal-item`}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Top Products</h2>
          <TopProducts data={stats.topProducts} />
        </div>
        <div className={styles.section}>
          <LiveOrderFeed />
        </div>
      </div>
    </>
  );
}

function SalesView({ stats }: { stats: Stats }) {
  const revTrend = computeTrend(stats.totalRevenue, stats.prevPeriod.totalRevenue);
  const aovTrend = computeTrend(stats.aov, stats.prevPeriod.aov);
  const orderTrend = computeTrend(stats.totalOrders, stats.prevPeriod.totalOrders);

  return (
    <>
      <div className={`${styles.statGrid} reveal-item`}>
        <StatCard label="Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} {...revTrend} />
        <StatCard label="Avg Order Value" value={`$${stats.aov.toFixed(2)}`} {...aovTrend} />
        <StatCard label="Total Orders" value={stats.totalOrders} {...orderTrend} />
        <StatCard
          label="Delivered"
          value={stats.ordersByStatus.delivered || 0}
        />
      </div>

      <div className={`${styles.chartGrid} reveal-item`}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Daily Orders</h2>
          <OrdersChart data={stats.dailyStats} />
        </div>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Revenue Trend</h2>
          <RevenueChart data={stats.dailyStats} />
        </div>
      </div>

      <div className={`${styles.section} reveal-item`}>
        <h2 className={styles.sectionTitle}>Top Products</h2>
        <TopProducts data={stats.topProducts} />
      </div>

      <div className={`${styles.section} reveal-item`}>
        <h2 className={styles.sectionTitle}>Recent Orders</h2>
        <DataTable
          columns={recentOrderColumns}
          data={stats.recentOrders}
          keyExtractor={(item) => item.id}
          emptyMessage="No orders yet"
        />
      </div>
    </>
  );
}

function OperationsView({ stats }: { stats: Stats }) {
  return (
    <>
      <div className={`${styles.statGrid} reveal-item`}>
        <StatCard label="Pending Orders" value={stats.ordersByStatus.pending || 0} />
        <StatCard label="Processing" value={stats.ordersByStatus.processing || 0} />
        <StatCard label="Shipped" value={stats.ordersByStatus.shipped || 0} />
        <StatCard
          label="Avg Fulfillment"
          value={stats.avgFulfillmentHours > 0 ? formatFulfillment(stats.avgFulfillmentHours) : 'N/A'}
        />
      </div>

      <div className={`${styles.chartGrid} reveal-item`}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Order Funnel</h2>
          <OrderFunnel data={stats.funnel} />
        </div>
        <div className={styles.section}>
          <LiveOrderFeed />
        </div>
      </div>

      <div className={`${styles.chartGrid} reveal-item`}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Orders by Status</h2>
          <div className={styles.statusGrid}>
            {Object.entries(stats.ordersByStatus).map(([status, count]) => (
              <div key={status} className={styles.statusItem}>
                <StatusBadge status={status} />
                <span className={styles.statusCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.section}>
          <StockAlerts />
        </div>
      </div>

      <div className={`${styles.section} reveal-item`}>
        <h2 className={styles.sectionTitle}>Recent Orders</h2>
        <DataTable
          columns={recentOrderColumns}
          data={stats.recentOrders}
          keyExtractor={(item) => item.id}
          emptyMessage="No orders yet"
        />
      </div>
    </>
  );
}

const VIEW_COMPONENTS: Record<DashboardView, React.ComponentType<{ stats: Stats }>> = {
  executive: ExecutiveView,
  sales: SalesView,
  operations: OperationsView,
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DashboardOverview() {
  const { user } = useAuth();
  const role = useDashboardRole();
  const [view, setView] = usePersistedView(role);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState('30');

  const fetchStats = useCallback(async () => {
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
        throw new Error(errData.error || `Stats API returned ${res.status}`);
      }
      setStats(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user, range]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const ViewComponent = VIEW_COMPONENTS[view];

  return (
    <PageReveal>
      <div className="reveal-item">
        <DashboardTopbar title="Overview" />
      </div>
      <div className={styles.content}>
        <div className={`${styles.toolbar} reveal-item`}>
          <ViewSwitcher role={role} value={view} onChange={setView} />
          <DateRangePicker value={range} onChange={setRange} />
        </div>

        {loading ? (
          <div className={styles.loading}>Loading stats&hellip;</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : stats ? (
          <>
            {stats.prevPeriod && (
              <div className="reveal-item">
                <AlertsBanner
                  currentRevenue={stats.totalRevenue}
                  currentOrders={stats.totalOrders}
                  prevPeriod={stats.prevPeriod}
                />
              </div>
            )}
            <ViewComponent stats={stats} />
          </>
        ) : null}
      </div>
    </PageReveal>
  );
}
