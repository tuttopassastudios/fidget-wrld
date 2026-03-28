'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function PaymentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <section className="product-page" style={{ padding: '48px 0', minHeight: '60vh' }}>
        <div className="container" style={{ maxWidth: 600, textAlign: 'center' }}>
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

  if (!user) {
    return null;
  }

  return (
    <section className="product-page" style={{ padding: '48px 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <Link
          href="/account"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--color-text-muted)',
            textDecoration: 'none',
            fontSize: 14,
            marginBottom: 24
          }}
        >
          &larr; Back to Account
        </Link>

        <h1 style={{ marginBottom: 8 }}>Saved Payment Methods</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 32, fontSize: 14 }}>
          Securely save payment methods for faster checkout.
        </p>

        <div style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-muted)"
            strokeWidth="1.5"
            style={{ marginBottom: 16, opacity: 0.6 }}
          >
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          <h3 style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: 8
          }}>
            No payment methods saved yet
          </h3>
          <p style={{
            fontSize: 14,
            color: 'var(--color-text-muted)',
            maxWidth: 360,
            margin: '0 auto 24px'
          }}>
            Secure payment options are coming soon. You&apos;ll be able to save cards and other payment methods for faster checkout.
          </p>
          <button
            disabled
            style={{
              padding: '10px 20px',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              color: 'var(--color-text-muted)',
              fontSize: 14,
              cursor: 'not-allowed',
              opacity: 0.6
            }}
          >
            Add Payment Method
          </button>
        </div>

        <div style={{
          marginTop: 24,
          padding: '16px 20px',
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-accent-primary)"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
            All payment information is encrypted and securely stored. We never store your full card number.
          </p>
        </div>
      </div>
    </section>
  );
}
