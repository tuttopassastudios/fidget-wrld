'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import styles from './LiveOrderFeed.module.css';

interface RecentOrder {
  id: string;
  orderId: string;
  status: string;
  total: number;
  customer: string;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const POLL_INTERVAL = 30_000; // 30 seconds

export function LiveOrderFeed() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const knownIdsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/stats?range=7', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const recent: RecentOrder[] = data.recentOrders || [];
      setOrders(recent);

      // Detect new orders after initial load
      if (initialLoadRef.current) {
        knownIdsRef.current = new Set(recent.map(o => o.id));
        initialLoadRef.current = false;
      } else {
        const freshIds = new Set<string>();
        for (const o of recent) {
          if (!knownIdsRef.current.has(o.id)) {
            freshIds.add(o.id);
            knownIdsRef.current.add(o.id);
          }
        }
        if (freshIds.size > 0) {
          setNewIds(prev => new Set([...prev, ...freshIds]));
          // Clear "new" highlight after 10s
          setTimeout(() => {
            setNewIds(prev => {
              const next = new Set(prev);
              for (const id of freshIds) next.delete(id);
              return next;
            });
          }, 10_000);
        }
      }
    } catch {
      // Silently fail — this is background polling
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  if (orders.length === 0) {
    return null; // Don't show empty feed
  }

  return (
    <div className={styles.feed}>
      <div className={styles.header}>
        <span className={styles.dot} />
        <span className={styles.title}>Live Orders</span>
      </div>
      <div className={styles.list}>
        {orders.slice(0, 5).map((o) => (
          <div
            key={o.id}
            className={`${styles.item} ${newIds.has(o.id) ? styles.itemNew : ''}`}
          >
            <div className={styles.itemMain}>
              <span className={styles.orderId}>{o.orderId}</span>
              <span className={styles.customer}>{o.customer}</span>
            </div>
            <div className={styles.itemMeta}>
              <StatusBadge status={o.status} />
              <span className={styles.total}>${o.total.toFixed(2)}</span>
              <span className={styles.time}>{timeAgo(o.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
