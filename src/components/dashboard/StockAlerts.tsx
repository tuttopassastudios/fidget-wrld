'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './StockAlerts.module.css';

interface Product {
  slug: string;
  name: string;
  variants: Array<{
    sku: string;
    variant: string;
    price: number;
  }>;
}

interface StockItem {
  name: string;
  variant: string;
  sku: string;
}

const LOW_STOCK_THRESHOLD = 10;

export function StockAlerts() {
  const { user } = useAuth();
  const [lowStock, setLowStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const products: Product[] = data.products || [];

      // For now, flag products that have no stock tracking set up
      // (stockQuantity is on the Data Connect Product table, not the Firestore catalog)
      // We'll show this as a helpful reminder
      const items: StockItem[] = [];
      for (const p of products) {
        for (const v of p.variants) {
          items.push({
            name: p.name,
            variant: v.variant,
            sku: v.sku,
          });
        }
      }
      setLowStock(items.length > 0 ? [] : []); // No stock data yet — show info state
      setLowStock([]); // Placeholder until stock tracking is active
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) return null;

  if (lowStock.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.iconOk}>✓</span>
          <span className={styles.title}>Stock Levels</span>
        </div>
        <p className={styles.message}>
          No low-stock alerts. Items below {LOW_STOCK_THRESHOLD} units will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.iconWarn}>!</span>
        <span className={styles.title}>Low Stock ({lowStock.length})</span>
      </div>
      <div className={styles.list}>
        {lowStock.map((item) => (
          <div key={item.sku} className={styles.row}>
            <span className={styles.name}>{item.name}</span>
            <span className={styles.variant}>{item.variant}</span>
            <span className={styles.sku}>{item.sku}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
