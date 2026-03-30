'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface OrderItem {
  name: string;
  variant?: string;
  quantity: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;

      try {
        const supabase = createClient();

        // Fetch orders by user_id or email
        const { data, error } = await supabase
          .from('orders')
          .select('id, status, total, created_at, items')
          .or(`user_id.eq.${user.uid},email.eq.${user.email}`)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Failed to fetch orders:', error);
        } else {
          // Transform data to match Order interface
          const transformed: Order[] = (data || []).map(o => ({
            id: o.id,
            status: o.status,
            total: o.total,
            created_at: o.created_at,
            items: (o.items as unknown as OrderItem[]) || [],
          }));
          setOrders(transformed);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <section className="product-page" style={{ padding: '48px 0', minHeight: '60vh' }}>
        <div className="container" style={{ maxWidth: 800, textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-accent-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto'
          }} />
          <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </section>
    );
  }

  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED': return 'var(--color-success)';
      case 'SHIPPED': return 'var(--color-accent-primary)';
      case 'PAID': return '#f59e0b';
      case 'CANCELLED': return 'var(--color-error)';
      default: return 'var(--color-text-muted)';
    }
  };

  return (
    <section className="product-page" style={{ padding: '48px 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <Link href="/account" style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 style={{ margin: 0 }}>Order History</h1>
        </div>

        {orders.length === 0 ? (
          <div style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            padding: 48,
            textAlign: 'center'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" style={{ marginBottom: 16 }}>
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <h3 style={{ marginBottom: 8, color: 'var(--color-text-secondary)' }}>No orders yet</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>Your order history will appear here.</p>
            <Link href="/products" style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'var(--color-accent-primary)',
              borderRadius: 8,
              color: 'var(--color-bg-dark)',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              Browse Products
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map((order) => {
              const items = (order.items as OrderItem[]) || [];
              return (
                <div key={order.id} style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 12,
                  padding: 20
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Order #{order.id.slice(0, 8)}</h3>
                      <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{formatDate(order.created_at)}</p>
                    </div>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 20,
                      background: `${getStatusColor(order.status)}20`,
                      color: getStatusColor(order.status)
                    }}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                    {items.map((item, i) => (
                      <span key={i}>
                        {item.name} {item.variant && `(${item.variant})`} x{item.quantity}
                        {i < items.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>${order.total.toFixed(2)}</span>
                    <Link href={`/account/orders/${order.id}`} style={{
                      fontSize: 14,
                      color: 'var(--color-accent-primary)',
                      fontWeight: 500
                    }}>
                      View Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
