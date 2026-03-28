'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  orderId: string;
  status: string;
  total: number;
  createdAt: string;
  orderItems_on_order: Array<{
    name: string;
    variant?: string;
    quantity: number;
  }>;
}

const DC_API = 'https://firebasedataconnect.googleapis.com/v1beta/projects/pepmax-ac025/locations/us-central1/services/pepmax-service/connectors/default';

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
        // First get user's database ID
        const userRes = await fetch(`${DC_API}:executeQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operationName: 'GetUserByUid',
            variables: { uid: user.uid }
          })
        });
        const userData = await userRes.json();
        const dbUserId = userData.data?.users?.[0]?.id;

        if (dbUserId) {
          const ordersRes = await fetch(`${DC_API}:executeQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              operationName: 'ListOrdersByUser',
              variables: { userId: dbUserId, limit: 50 }
            })
          });
          const ordersData = await ordersRes.json();
          setOrders(ordersData.data?.orders || []);
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
    switch (status) {
      case 'DELIVERED': return 'var(--color-success)';
      case 'SHIPPED': return 'var(--color-accent-primary)';
      case 'PROCESSING': return '#f59e0b';
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
            {orders.map((order) => (
              <div key={order.id} style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                padding: 20
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Order #{order.orderId}</h3>
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{formatDate(order.createdAt)}</p>
                  </div>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 20,
                    background: `${getStatusColor(order.status)}20`,
                    color: getStatusColor(order.status)
                  }}>
                    {order.status}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                  {order.orderItems_on_order.map((item, i) => (
                    <span key={i}>
                      {item.name} {item.variant && `(${item.variant})`} x{item.quantity}
                      {i < order.orderItems_on_order.length - 1 && ', '}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>${order.total.toFixed(2)}</span>
                  <Link href={`/account/orders/${order.orderId}`} style={{
                    fontSize: 14,
                    color: 'var(--color-accent-primary)',
                    fontWeight: 500
                  }}>
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
