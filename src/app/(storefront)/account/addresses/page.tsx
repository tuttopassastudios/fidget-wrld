'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

const DC_API = 'https://firebasedataconnect.googleapis.com/v1beta/projects/pepmax-ac025/locations/us-central1/services/pepmax-service/connectors/default';

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
          const addrRes = await fetch(`${DC_API}:executeQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              operationName: 'ListAddresses',
              variables: { userId: dbUserId }
            })
          });
          const addrData = await addrRes.json();
          setAddresses(addrData.data?.addresses || []);
        }
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
              Add a shipping address for faster checkout.
            </p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
              Addresses will be saved during checkout.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {addresses.map((address) => (
              <div key={address.id} style={{
                background: 'var(--color-bg-card)',
                border: address.isDefault ? '2px solid var(--color-accent-primary)' : '1px solid var(--color-border)',
                borderRadius: 12,
                padding: 20
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>{address.label}</h3>
                    {address.isDefault && (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 10,
                        background: 'var(--color-accent-primary)',
                        color: 'var(--color-bg-dark)'
                      }}>
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  <p>{address.firstName} {address.lastName}</p>
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
