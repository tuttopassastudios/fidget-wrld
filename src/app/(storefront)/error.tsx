'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="product-page" style={{ padding: '80px 0', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ fontSize: 48, marginBottom: 16, color: 'var(--color-error)' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </div>
        <h1 style={{ marginBottom: 8 }}>Something went wrong</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 24, fontSize: 14 }}>
          An unexpected error occurred. Please try again.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
          <button className="btn btn-primary" onClick={() => unstable_retry()}>
            Try Again
          </button>
          <Link href="/" className="btn btn-secondary">Go Home</Link>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            fontSize: 12,
            textDecoration: 'underline',
          }}
        >
          {showDetails ? 'Hide' : 'Show'} Debug Info
        </button>

        {showDetails && (
          <div style={{
            marginTop: 16,
            padding: 16,
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            textAlign: 'left',
            fontSize: 12,
            fontFamily: 'var(--font-secondary)',
            color: 'var(--color-text-secondary)',
            wordBreak: 'break-word',
          }}>
            <p style={{ margin: '0 0 8px', color: 'var(--color-error)' }}>
              <strong>Error:</strong> {error.message || 'Unknown error'}
            </p>
            <p style={{ margin: '0 0 8px' }}>
              <strong>Name:</strong> {error.name}
            </p>
            {error.digest && (
              <p style={{ margin: '0 0 8px' }}>
                <strong>Digest:</strong> {error.digest}
              </p>
            )}
            <p style={{ margin: '0 0 8px' }}>
              <strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}
            </p>
            <p style={{ margin: '0 0 8px' }}>
              <strong>Time:</strong> {new Date().toISOString()}
            </p>
            {error.stack && (
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: 'pointer', color: 'var(--color-text-muted)' }}>Stack Trace</summary>
                <pre style={{
                  marginTop: 8,
                  padding: 12,
                  background: 'var(--color-bg-card)',
                  borderRadius: 4,
                  overflow: 'auto',
                  maxHeight: 300,
                  fontSize: 11,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}>
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
