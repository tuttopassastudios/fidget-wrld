'use client';

import { useState, useLayoutEffect, useRef } from 'react';
import styles from './ViewSwitcher.module.css';

export type DashboardView = 'executive' | 'sales' | 'operations';

const VIEWS: { value: DashboardView; label: string; desc: string }[] = [
  { value: 'executive', label: 'Executive', desc: 'Revenue, growth, KPIs' },
  { value: 'sales', label: 'Sales', desc: 'AOV, products, conversions' },
  { value: 'operations', label: 'Operations', desc: 'Fulfillment, orders, status' },
];

const STORAGE_KEY = 'fidgetopia_dashboard_view';

function getDefaultView(role: string | null): DashboardView {
  if (role === 'admin') return 'executive';
  return 'operations';
}

interface ViewSwitcherProps {
  role: string | null;
  value: DashboardView;
  onChange: (view: DashboardView) => void;
}

export function usePersistedView(role: string | null): [DashboardView, (v: DashboardView) => void] {
  const initializedRef = useRef(false);
  const [view, setView] = useState<DashboardView>(() => {
    if (typeof window === 'undefined') return getDefaultView(role);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['executive', 'sales', 'operations'].includes(stored)) {
      return stored as DashboardView;
    }
    return getDefaultView(role);
  });

  // Sync default when role loads (only once)
  useLayoutEffect(() => {
    if (role && !initializedRef.current && !localStorage.getItem(STORAGE_KEY)) {
      initializedRef.current = true;
      queueMicrotask(() => setView(getDefaultView(role)));
    }
  }, [role]);

  const updateView = (v: DashboardView) => {
    setView(v);
    localStorage.setItem(STORAGE_KEY, v);
  };

  return [view, updateView];
}

export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  return (
    <div className={styles.wrapper} role="tablist" aria-label="Dashboard view">
      {VIEWS.map((v) => (
        <button
          key={v.value}
          type="button"
          role="tab"
          aria-selected={value === v.value}
          className={`${styles.tab} ${value === v.value ? styles.active : ''}`}
          onClick={() => onChange(v.value)}
        >
          <span className={styles.label}>{v.label}</span>
          <span className={styles.desc}>{v.desc}</span>
        </button>
      ))}
    </div>
  );
}
