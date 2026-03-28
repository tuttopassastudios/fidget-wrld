'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function CheckoutError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  function clearAndRetry() {
    try {
      localStorage.removeItem('fidgetopia_cart');
      localStorage.removeItem('fidgetopia_promo');
    } catch {
      // Storage unavailable
    }
    unstable_retry();
  }

  return (
    <section className="product-page" style={{ padding: '80px 0', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ fontSize: 48, marginBottom: 16, color: 'var(--color-error)' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </div>
        <h1 style={{ marginBottom: 8 }}>Checkout Error</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 24, fontSize: 14 }}>
          Checkout encountered an error. Please try again or return to your cart.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => unstable_retry()}>
            Try Again
          </button>
          <button className="btn btn-secondary" onClick={clearAndRetry}>
            Clear Cart &amp; Retry
          </button>
        </div>
        <div style={{ marginTop: 16 }}>
          <Link href="/cart" style={{ color: 'var(--color-accent-primary)', fontSize: 14 }}>
            Return to Cart
          </Link>
        </div>
      </div>
    </section>
  );
}
