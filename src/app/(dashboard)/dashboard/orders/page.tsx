'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
import { DataTable, type Column } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { generateCSV, downloadCSV } from '@/lib/csv-export';
import styles from '../page.module.css';

interface Order {
  id: string;
  orderId: string;
  contactEmail: string;
  status: string;
  total: number;
  shipFirstName: string;
  shipLastName: string;
  createdAt: string;
}

const STATUS_OPTIONS = ['all', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const columns: Column<Order>[] = [
  { key: 'orderId', label: 'Order ID' },
  {
    key: 'customer',
    label: 'Customer',
    render: (item) => `${item.shipFirstName} ${item.shipLastName}`,
  },
  { key: 'contactEmail', label: 'Email' },
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

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, statusFilter, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <>
      <DashboardTopbar title="Orders" />
      <div className={styles.content}>
        <div className={styles.filterBar}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
            aria-label="Filter by status"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Statuses' : s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <input
            type="search"
            placeholder="Search orders&hellip;"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            aria-label="Search orders"
          />
          <button
            type="button"
            className={styles.loadMoreBtn}
            onClick={() => {
              const csv = generateCSV(orders, [
                { header: 'Order ID', accessor: (o) => o.orderId },
                { header: 'Customer', accessor: (o) => `${o.shipFirstName} ${o.shipLastName}` },
                { header: 'Email', accessor: (o) => o.contactEmail },
                { header: 'Status', accessor: (o) => o.status },
                { header: 'Total', accessor: (o) => o.total.toFixed(2) },
                { header: 'Date', accessor: (o) => new Date(o.createdAt).toLocaleDateString() },
              ]);
              downloadCSV(csv, 'orders.csv');
            }}
            disabled={orders.length === 0}
          >
            Export CSV
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading orders&hellip;</div>
        ) : (
          <DataTable
            columns={columns}
            data={orders}
            keyExtractor={(item) => item.id}
            onRowClick={(item) => router.push(`/dashboard/orders/${item.orderId}`)}
            emptyMessage="No orders found"
          />
        )}
      </div>
    </>
  );
}
