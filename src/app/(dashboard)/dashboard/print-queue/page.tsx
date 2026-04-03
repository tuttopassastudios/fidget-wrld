'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDashboardRole } from '@/components/dashboard/DashboardGuard';
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
import styles from '../page.module.css';

interface PrintQueueOrder {
  id: string;
  orderId: string;
  contactEmail: string;
  shipFirstName: string;
  shipLastName: string;
  status: string;
  printStatus: string;
  createdAt: string;
  items: Array<{
    id: string;
    sku: string;
    name: string;
    variant: string | null;
    quantity: number;
    customization?: {
      filamentColorId?: string;
      engravingText?: string;
      keychainHole?: boolean;
    } | null;
  }>;
}

type Tab = 'needs_review' | 'in_progress' | 'completed';

const BADGE_STYLES: Record<string, React.CSSProperties> = {
  pending_review: {
    background: 'rgba(251, 191, 36, 0.15)',
    color: '#f59e0b',
    border: '1px solid rgba(251, 191, 36, 0.3)',
  },
  approved: {
    background: 'rgba(59, 130, 246, 0.15)',
    color: '#60a5fa',
    border: '1px solid rgba(59, 130, 246, 0.3)',
  },
  printing: {
    background: 'rgba(139, 92, 246, 0.15)',
    color: '#a78bfa',
    border: '1px solid rgba(139, 92, 246, 0.3)',
  },
  ready_to_ship: {
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  shipped: {
    background: 'rgba(156, 163, 175, 0.15)',
    color: '#9ca3af',
    border: '1px solid rgba(156, 163, 175, 0.3)',
  },
};

const STATUS_LABELS: Record<string, string> = {
  pending_review: 'Needs Review',
  approved: 'Approved',
  printing: 'Printing',
  ready_to_ship: 'Ready to Ship',
  shipped: 'Shipped',
};

function PrintStatusBadge({ status }: { status: string }) {
  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    ...(BADGE_STYLES[status] ?? {
      background: 'rgba(156, 163, 175, 0.15)',
      color: '#9ca3af',
      border: '1px solid rgba(156, 163, 175, 0.3)',
    }),
  };
  return <span style={badgeStyle}>{STATUS_LABELS[status] ?? status}</span>;
}

function ActionButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: 'rgba(70, 200, 220, 0.12)',
        border: '1px solid rgba(70, 200, 220, 0.3)',
        color: 'var(--color-accent-primary, #46c8dc)',
        padding: '6px 14px',
        borderRadius: '6px',
        fontSize: '0.8125rem',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 0.15s, opacity 0.15s',
      }}
    >
      {label}
    </button>
  );
}

function OrderCard({
  order,
  onAction,
  updating,
}: {
  order: PrintQueueOrder;
  onAction: (id: string, printStatus: string) => void;
  updating: string | null;
}) {
  const isUpdating = updating === order.id;
  const customerName = `${order.shipFirstName} ${order.shipLastName}`.trim();

  const nextAction: { label: string; nextStatus: string } | null = (() => {
    switch (order.printStatus) {
      case 'pending_review': return { label: 'Approve for Printing', nextStatus: 'approved' };
      case 'approved':       return { label: 'Mark as Printing', nextStatus: 'printing' };
      case 'printing':       return { label: 'Mark Ready to Ship', nextStatus: 'ready_to_ship' };
      default:               return null;
    }
  })();

  return (
    <div
      style={{
        background: 'var(--color-bg-card, #0a1628)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '12px',
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <span className={styles.mono} style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
            {order.orderId}
          </span>
          <div style={{ marginTop: '4px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {customerName && <span>{customerName} &middot; </span>}
            <span>{order.contactEmail}</span>
          </div>
          <div style={{ marginTop: '2px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <PrintStatusBadge status={order.printStatus} />
          {nextAction && (
            <ActionButton
              label={isUpdating ? 'Updating\u2026' : nextAction.label}
              onClick={() => onAction(order.id, nextAction.nextStatus)}
              disabled={isUpdating}
            />
          )}
        </div>
      </div>

      {/* Items */}
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
        {order.items.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
              marginBottom: '6px',
              fontSize: '0.875rem',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {item.quantity}&times;
            </span>
            <span style={{ color: 'var(--color-text-primary)' }}>{item.name}</span>
            {item.variant && (
              <span style={{ color: 'var(--color-text-secondary)' }}>({item.variant})</span>
            )}
            <span className={styles.mono} style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
              {item.sku}
            </span>
            {item.customization && (
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                {[
                  item.customization.filamentColorId && `Color: ${item.customization.filamentColorId}`,
                  item.customization.engravingText && `Engraving: \u201c${item.customization.engravingText}\u201d`,
                  item.customization.keychainHole && 'Keychain hole',
                ]
                  .filter(Boolean)
                  .join(' \u00b7 ')}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const TAB_DEFS: Array<{ key: Tab; label: string }> = [
  { key: 'needs_review', label: 'Needs Review' },
  { key: 'in_progress', label: 'Approved / Printing' },
  { key: 'completed', label: 'Completed' },
];

function tabForOrder(order: PrintQueueOrder): Tab {
  if (order.printStatus === 'pending_review') return 'needs_review';
  if (order.printStatus === 'ready_to_ship' || order.printStatus === 'shipped') return 'completed';
  return 'in_progress';
}

const EMPTY_MESSAGES: Record<Tab, string> = {
  needs_review: 'No orders need review.',
  in_progress: 'No orders are currently approved or printing.',
  completed: 'No completed print orders.',
};

export default function PrintQueuePage() {
  const { user } = useAuth();
  useDashboardRole();
  const [orders, setOrders] = useState<PrintQueueOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('needs_review');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/print-queue', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch print queue');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('[PrintQueue]', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleAction = async (id: string, printStatus: string) => {
    if (!user) return;
    setUpdating(id);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/print-queue', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, printStatus }),
      });
      if (!res.ok) throw new Error('Failed to update print status');
      await fetchQueue();
    } catch (err) {
      console.error('[PrintQueue PATCH]', err);
    } finally {
      setUpdating(null);
    }
  };

  const tabOrders = orders.filter((o) => tabForOrder(o) === activeTab);

  const tabCounts: Record<Tab, number> = {
    needs_review: orders.filter((o) => tabForOrder(o) === 'needs_review').length,
    in_progress: orders.filter((o) => tabForOrder(o) === 'in_progress').length,
    completed: orders.filter((o) => tabForOrder(o) === 'completed').length,
  };

  return (
    <>
      <DashboardTopbar title="Print Queue" />
      <div className={styles.content}>
        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Print queue tabs"
          style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '20px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '0',
          }}
        >
          {TAB_DEFS.map(({ key, label }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${key}`}
                id={`tab-${key}`}
                type="button"
                onClick={() => setActiveTab(key)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive
                    ? '2px solid var(--color-accent-primary, #46c8dc)'
                    : '2px solid transparent',
                  color: isActive
                    ? 'var(--color-accent-primary, #46c8dc)'
                    : 'var(--color-text-secondary)',
                  padding: '8px 16px',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 400,
                  cursor: 'pointer',
                  marginBottom: '-1px',
                  transition: 'color 0.15s, border-color 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
                {tabCounts[key] > 0 && (
                  <span
                    style={{
                      marginLeft: '6px',
                      background: isActive
                        ? 'rgba(70, 200, 220, 0.2)'
                        : 'rgba(255,255,255,0.08)',
                      color: isActive
                        ? 'var(--color-accent-primary, #46c8dc)'
                        : 'var(--color-text-muted)',
                      borderRadius: '10px',
                      padding: '1px 7px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {tabCounts[key]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab panel */}
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {loading ? (
            <div className={styles.loading}>Loading print queue&hellip;</div>
          ) : tabOrders.length === 0 ? (
            <div className={styles.loading} style={{ color: 'var(--color-text-muted)' }}>
              {EMPTY_MESSAGES[activeTab]}
            </div>
          ) : (
            tabOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAction={handleAction}
                updating={updating}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
