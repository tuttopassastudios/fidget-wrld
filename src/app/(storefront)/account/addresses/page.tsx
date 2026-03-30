'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export default function AddressesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchAddresses() {
      if (!user) return;

      try {
        const supabase = createClient();

        // Fetch unique addresses from user's orders
        const { data: orders, error } = await supabase
          .from('orders')
          .select('id, shipping_address')
          .or(`user_id.eq.${user.uid},email.eq.${user.email}`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Failed to fetch addresses:', error);
          return;
        }

        // Extract unique addresses from orders
        const addressMap = new Map<string, Address>();

        for (const order of orders || []) {
          const addr = order.shipping_address as {
            firstName?: string;
            lastName?: string;
            address1?: string;
            address2?: string;
            city?: string;
            state?: string;
            zip?: string;
            country?: string;
          };

          if (addr && addr.address1) {
            // Create a unique key based on address components
            const key = `${addr.address1}-${addr.city}-${addr.zip}`.toLowerCase();

            if (!addressMap.has(key)) {
              addressMap.set(key, {
                id: order.id,
                firstName: addr.firstName || '',
                lastName: addr.lastName || '',
                address1: addr.address1 || '',
                address2: addr.address2 || undefined,
                city: addr.city || '',
                state: addr.state || '',
                zip: addr.zip || '',
                country: addr.country || 'US',
              });
            }
          }
        }

        setAddresses(Array.from(addressMap.values()));
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchAddresses();
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

  return (
    <section className="product-page" style={{ padding: '48px 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/account" style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 style={{ margin: 0 }}>Shipping Addresses</h1>
          </div>
        </div>

        {addresses.length === 0 ? (
          <div style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            padding: 48,
            textAlign: 'center'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" style={{ marginBottom: 16 }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <h3 style={{ marginBottom: 8, color: 'var(--color-text-secondary)' }}>No addresses saved</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>
              Your shipping addresses from previous orders will appear here.
            </p>
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
          <div style={{ display: 'grid', gap: 16 }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 8 }}>
              Addresses from your recent orders:
            </p>
            {addresses.map((address, index) => (
              <div key={address.id} style={{
                background: 'var(--color-bg-card)',
                border: index === 0 ? '2px solid var(--color-accent-primary)' : '1px solid var(--color-border)',
                borderRadius: 12,
                padding: 20
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>
                      {address.firstName} {address.lastName}
                    </h3>
                    {index === 0 && (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 10,
                        background: 'var(--color-accent-primary)',
                        color: 'var(--color-bg-dark)'
                      }}>
                        Most Recent
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  <p>{address.address1}</p>
                  {address.address2 && <p>{address.address2}</p>}
                  <p>{address.city}, {address.state} {address.zip}</p>
                  <p>{address.country}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
