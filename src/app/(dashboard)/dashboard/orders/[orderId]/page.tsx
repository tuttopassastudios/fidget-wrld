'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDashboardRole } from '@/components/dashboard/DashboardGuard';
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import Link from 'next/link';
import { use } from 'react';
import styles from './page.module.css';
import { sanitizeAlphanumeric } from '@/lib/sanitize';

interface OrderItem {
  id: string;
  sku: string;
  name: string;
  variant: string | null;
  price: number;
  quantity: number;
  image: string | null;
}

interface TrackingEvent {
  time?: string;
  context?: string;
  description?: string;
  date?: string;
}

interface OrderDetail {
  id: string;
  orderId: string;
  contactEmail: string;
  userEmail: string | null;
  status: string;
  subtotal: number;
  discount: number;
  promoCode: string | null;
  shipping: number;
  shippingMethod: string;
  total: number;
  shipFirstName: string;
  shipLastName: string;
  shipPhone: string | null;
  shipAddress1: string;
  shipAddress2: string | null;
  shipCity: string;
  shipState: string;
  shipZip: string;
  shipCountry: string;
  trackingNumber: string | null;
  estDeliveryDisplay: string | null;
  createdAt: string;
  updatedAt: string;
  cjOrderId: string | null;
  cjOrderStatus: string | null;
  fulfillmentError: string | null;
  orderItems_on_order: OrderItem[];
}

const STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const { user } = useAuth();
  const role = useDashboardRole();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [liveTracking, setLiveTracking] = useState<TrackingEvent[] | null>(null);
  const [trackingMeta, setTrackingMeta] = useState<{ carrier?: string; status?: string } | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/orders?orderId=${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch order');
      const data = await res.json();
      setOrder(data.order || null);
      if (data.order) {
        setNewStatus(data.order.status);
        setTrackingNumber(data.order.trackingNumber || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateStatus = async () => {
    if (!user || !order) return;
    setUpdating(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: order.id,
          status: newStatus,
          trackingNumber: sanitizeAlphanumeric(trackingNumber, 100) || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to update order');
      await fetchOrder();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const fetchLiveTracking = async () => {
    if (!user || !order?.trackingNumber) return;
    setTrackingLoading(true);
    setTrackingError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(
        `/api/admin/orders/tracking?trackingNumber=${encodeURIComponent(order.trackingNumber)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch tracking');
      const t = data.tracking;
      setTrackingMeta({ carrier: t.logisticName || t.carrier, status: t.status });
      const events: TrackingEvent[] = t.trackInfoList || t.trackInfo || t.events || [];
      setLiveTracking(events);
    } catch (err) {
      setTrackingError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setTrackingLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <DashboardTopbar title="Order Detail" />
        <div className={styles.content}>
          <div className={styles.loading}>Loading order&hellip;</div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <DashboardTopbar title="Order Detail" />
        <div className={styles.content}>
          <p>Order not found.</p>
          <Link href="/dashboard/orders" className={styles.backLink}>
            ← Back to orders
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardTopbar title={`Order ${order.orderId}`} />
      <div className={styles.content}>
        <Link href="/dashboard/orders" className={styles.backLink}>
          ← Back to orders
        </Link>

        <div className={styles.grid}>
          {/* Order summary */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Order Summary</h3>
            <dl className={styles.dl}>
              <dt>Order ID</dt><dd>{order.orderId}</dd>
              <dt>Status</dt><dd><StatusBadge status={order.status} /></dd>
              <dt>Date</dt><dd>{new Date(order.createdAt).toLocaleString()}</dd>
              <dt>Email</dt><dd>{order.contactEmail}</dd>
              <dt>Subtotal</dt><dd>${order.subtotal.toFixed(2)}</dd>
              {order.discount > 0 && (
                <><dt>Discount</dt><dd>-${order.discount.toFixed(2)}{order.promoCode && ` (${order.promoCode})`}</dd></>
              )}
              <dt>Shipping</dt><dd>${order.shipping.toFixed(2)} ({order.shippingMethod})</dd>
              <dt>Total</dt><dd className={styles.total}>${order.total.toFixed(2)}</dd>
              {order.trackingNumber && (
                <><dt>Tracking</dt><dd className={styles.mono}>{order.trackingNumber}</dd></>
              )}
            </dl>
          </div>

          {/* Shipping info */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Shipping Address</h3>
            <p className={styles.address}>
              {order.shipFirstName} {order.shipLastName}<br />
              {order.shipAddress1}<br />
              {order.shipAddress2 && <>{order.shipAddress2}<br /></>}
              {order.shipCity}, {order.shipState} {order.shipZip}<br />
              {order.shipCountry}
              {order.shipPhone && <><br />{order.shipPhone}</>}
            </p>
          </div>

          {/* CJ Fulfillment */}
          {(order.cjOrderId || order.fulfillmentError) && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>CJ Fulfillment</h3>
              <dl className={styles.dl}>
                {order.cjOrderId && (
                  <><dt>CJ Order ID</dt><dd className={styles.mono}>{order.cjOrderId}</dd></>
                )}
                {order.cjOrderStatus && (
                  <><dt>CJ Status</dt><dd><StatusBadge status={order.cjOrderStatus} /></dd></>
                )}
                {order.trackingNumber && (
                  <><dt>Tracking #</dt><dd className={styles.mono}>{order.trackingNumber}</dd></>
                )}
                {order.fulfillmentError && (
                  <><dt>Error</dt><dd className={styles.errorText}>{order.fulfillmentError}</dd></>
                )}
              </dl>
              {order.trackingNumber && (
                <button
                  type="button"
                  onClick={fetchLiveTracking}
                  disabled={trackingLoading}
                  className={styles.trackingBtn}
                >
                  {trackingLoading ? 'Fetching\u2026' : 'Fetch live tracking'}
                </button>
              )}
              {trackingError && (
                <p className={styles.errorText} style={{ marginTop: 'var(--space-2)' }}>{trackingError}</p>
              )}
              {liveTracking !== null && (
                <div className={styles.trackingEvents}>
                  {trackingMeta && (
                    <p className={styles.trackingMeta}>
                      {trackingMeta.carrier && <span>Carrier: <strong>{trackingMeta.carrier}</strong></span>}
                      {trackingMeta.status && <span> &middot; {trackingMeta.status}</span>}
                    </p>
                  )}
                  {liveTracking.length === 0 ? (
                    <p className={styles.noEvents}>No tracking events yet.</p>
                  ) : (
                    <ol className={styles.eventList}>
                      {liveTracking.map((e, i) => (
                        <li key={i} className={styles.eventItem}>
                          <span className={styles.eventTime}>{e.time || e.date || ''}</span>
                          <span className={styles.eventContext}>{e.context || e.description || ''}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Update status (admin only) */}
          {role === 'admin' && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Update Order</h3>
              <div className={styles.updateForm}>
                <label className={styles.label}>
                  Status
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className={styles.select}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.label}>
                  Tracking Number
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className={styles.input}
                    placeholder="Optional&hellip;"
                  />
                </label>
                <button
                  onClick={updateStatus}
                  disabled={updating}
                  className={styles.updateBtn}
                  type="button"
                >
                  {updating ? 'Updating\u2026' : 'Update Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order items */}
        <div className={styles.section}>
          <h3 className={styles.cardTitle}>Items</h3>
          <div className={styles.itemsTable}>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems_on_order.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.name}
                      {item.variant && <span className={styles.variant}> ({item.variant})</span>}
                    </td>
                    <td className={styles.mono}>{item.sku}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
