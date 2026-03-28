'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageReveal } from '@/components/ui/PageReveal';
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
import { StatCard } from '@/components/dashboard/StatCard';
import { AcquisitionChart } from '@/components/dashboard/AcquisitionChart';
import { RetentionCohort } from '@/components/dashboard/RetentionCohort';
import { PromoAnalytics } from '@/components/dashboard/PromoAnalytics';
import { generateCSV, downloadCSV } from '@/lib/csv-export';
import styles from './page.module.css';

interface TopCustomer {
  email: string;
  totalSpent: number;
  orderCount: number;
  firstOrder: string;
  lastOrder: string;
}

interface CohortData {
  cohortMonth: string;
  customerCount: number;
  retention: Record<string, number>;
}

interface PromoStat {
  code: string;
  usageCount: number;
  totalDiscount: number;
  totalRevenue: number;
  avgOrderValue: number;
}

interface CustomerData {
  summary: {
    totalCustomers: number;
    newCustomers: number;
    repeatCustomers: number;
    repeatRate: number;
    avgCLV: number;
    registeredOrders: number;
    guestOrders: number;
  };
  topCustomers: TopCustomer[];
  acquisitionByDay: Array<{ date: string; signups: number }>;
  cohorts: CohortData[];
  promoStats: PromoStat[];
}

export default function CustomersPage() {
  const { user } = useAuth();
  const [data, setData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/customers', {
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
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportCustomers = () => {
    if (!data?.topCustomers) return;
    const csv = generateCSV(data.topCustomers, [
      { header: 'Email', accessor: (c) => c.email },
      { header: 'Total Spent', accessor: (c) => c.totalSpent.toFixed(2) },
      { header: 'Orders', accessor: (c) => c.orderCount },
      { header: 'First Order', accessor: (c) => new Date(c.firstOrder).toLocaleDateString() },
      { header: 'Last Order', accessor: (c) => new Date(c.lastOrder).toLocaleDateString() },
    ]);
    downloadCSV(csv, 'top-customers.csv');
  };

  return (
    <PageReveal>
      <div className="reveal-item">
        <DashboardTopbar title="Customer Insights" />
      </div>
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Loading customer data&hellip;</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : data ? (
          <>
            <div className={`${styles.statGrid} reveal-item`}>
              <StatCard label="Total Customers" value={data.summary.totalCustomers} />
              <StatCard label="Repeat Customers" value={data.summary.repeatCustomers} />
              <StatCard label="Repeat Rate" value={`${data.summary.repeatRate}%`} />
              <StatCard
                label="Avg Lifetime Value"
                value={`$${data.summary.avgCLV.toFixed(2)}`}
              />
              <StatCard label="Registered Orders" value={data.summary.registeredOrders} />
              <StatCard label="Guest Orders" value={data.summary.guestOrders} />
            </div>

            <div className={`${styles.section} reveal-item`}>
              <h2 className={styles.sectionTitle}>User Acquisition (Last 30 Days)</h2>
              <AcquisitionChart data={data.acquisitionByDay} />
            </div>

            <div className={`${styles.section} reveal-item`}>
              <h2 className={styles.sectionTitle}>Retention Cohorts</h2>
              <p className={styles.sectionDesc}>
                Percentage of customers who placed orders in each month, grouped by first-order month.
              </p>
              <RetentionCohort data={data.cohorts} />
            </div>

            <div className={`${styles.section} reveal-item`}>
              <h2 className={styles.sectionTitle}>Promo Code Performance</h2>
              <PromoAnalytics data={data.promoStats} />
            </div>

            <div className={`${styles.section} reveal-item`}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Top Customers by Lifetime Value</h2>
                <button
                  type="button"
                  className={styles.exportBtn}
                  onClick={handleExportCustomers}
                  disabled={!data.topCustomers.length}
                >
                  Export CSV
                </button>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>#</th>
                      <th className={styles.th}>Email</th>
                      <th className={`${styles.th} ${styles.alignRight}`}>Total Spent</th>
                      <th className={`${styles.th} ${styles.alignRight}`}>Orders</th>
                      <th className={styles.th}>First Order</th>
                      <th className={styles.th}>Last Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topCustomers.map((c, i) => (
                      <tr key={c.email} className={styles.tr}>
                        <td className={styles.td}>{i + 1}</td>
                        <td className={styles.td}>{c.email}</td>
                        <td className={`${styles.td} ${styles.alignRight}`}>
                          ${c.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`${styles.td} ${styles.alignRight}`}>{c.orderCount}</td>
                        <td className={styles.td}>
                          {new Date(c.firstOrder).toLocaleDateString()}
                        </td>
                        <td className={styles.td}>
                          {new Date(c.lastOrder).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {data.topCustomers.length === 0 && (
                      <tr>
                        <td className={styles.td} colSpan={6}>No customer data yet</td>
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
