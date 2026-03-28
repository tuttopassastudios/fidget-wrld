'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      user.getIdTokenResult().then((result) => {
        const role = result.claims.role as string | undefined;
        const admin = role === 'admin' || role === 'team';
        setIsAdmin(admin);

        // Pre-sync __session cookie so the proxy doesn't block /dashboard
        if (admin) {
          user.getIdToken().then((idToken) =>
            fetch('/api/admin/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken }),
            })
          ).then(() => {
            setSessionReady(true);
          }).catch(() => {
            // Still allow navigation — DashboardGuard will re-sync
            setSessionReady(true);
          });
        }
      });
    }
  }, [user]);

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

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <section className="product-page" style={{ padding: '48px 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 style={{ marginBottom: 8 }}>My Account</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 32 }}>
          Welcome back, {user.displayName || user.email}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          {isAdmin && (
            <Link
              href="/dashboard"
              style={{ textDecoration: 'none', pointerEvents: sessionReady ? 'auto' : 'none' }}
              aria-disabled={!sessionReady}
            >
              <div style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-accent-primary)',
                borderRadius: 12,
                padding: 24,
                transition: 'border-color 0.2s, background 0.2s',
                cursor: sessionReady ? 'pointer' : 'wait',
                opacity: sessionReady ? 1 : 0.6
              }}
              onMouseEnter={(e) => {
                if (sessionReady) e.currentTarget.style.background = 'color-mix(in srgb, var(--color-accent-primary) 8%, var(--color-bg-card))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-card)';
              }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" style={{ marginBottom: 12 }}>
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: 'var(--color-accent-primary)' }}>
                  {sessionReady ? 'Dashboard' : 'Syncing session\u2026'}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Manage orders, users & products</p>
              </div>
            </Link>
          )}

          <Link href="/account/orders" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: 24,
              transition: 'border-color 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-accent-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" style={{ marginBottom: 12 }}>
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: 'var(--color-text-primary)' }}>Orders</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>View your order history</p>
            </div>
          </Link>

          <Link href="/account/profile" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: 24,
              transition: 'border-color 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-accent-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" style={{ marginBottom: 12 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: 'var(--color-text-primary)' }}>Profile</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Update your information</p>
            </div>
          </Link>

          <Link href="/account/addresses" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: 24,
              transition: 'border-color 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-accent-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" style={{ marginBottom: 12 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: 'var(--color-text-primary)' }}>Addresses</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Manage shipping addresses</p>
            </div>
          </Link>

          <Link href="/account/payments" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: 24,
              transition: 'border-color 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-accent-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" style={{ marginBottom: 12 }}>
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: 'var(--color-text-primary)' }}>Payment Methods</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Manage saved payments</p>
            </div>
          </Link>
        </div>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Account Details</h3>
          <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
            <p style={{ marginBottom: 8 }}><strong>Email:</strong> {user.email}</p>
            {user.displayName && <p style={{ marginBottom: 8 }}><strong>Name:</strong> {user.displayName}</p>}
          </div>
        </div>

        <button
          onClick={handleSignOut}
          style={{
            marginTop: 32,
            padding: '12px 24px',
            background: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            color: 'var(--color-text-secondary)',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-error)';
            e.currentTarget.style.color = 'var(--color-error)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
        >
          Sign Out
        </button>
      </div>
    </section>
  );
}
