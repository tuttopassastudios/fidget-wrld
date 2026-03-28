'use client';

import { useState } from 'react';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <html lang="en">
      <body style={{
        margin: 0,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0A1628',
        color: '#E2E8F0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 600, padding: '0 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16, color: '#EF4444' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            Something went wrong
          </h1>
          <p style={{ color: '#94A3B8', marginBottom: 24, fontSize: 14, lineHeight: 1.5 }}>
            A critical error occurred. Please try again or return to the homepage.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
            <button
              onClick={() => unstable_retry()}
              style={{
                padding: '10px 24px',
                background: '#00D4FF',
                color: '#0A1628',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global-error cannot use next/link as root layout may have crashed */}
            <a
              href="/"
              style={{
                padding: '10px 24px',
                background: 'transparent',
                color: '#00D4FF',
                border: '1px solid #00D4FF',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Go Home
            </a>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
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
              background: '#001E3A',
              border: '1px solid #0A3A4A',
              borderRadius: 8,
              textAlign: 'left',
              fontSize: 12,
              fontFamily: 'monospace',
              color: '#94A3B8',
              wordBreak: 'break-word',
            }}>
              <p style={{ margin: '0 0 8px', color: '#EF4444' }}>
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
                  <summary style={{ cursor: 'pointer', color: '#64748B' }}>Stack Trace</summary>
                  <pre style={{
                    marginTop: 8,
                    padding: 12,
                    background: '#001428',
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
      </body>
    </html>
  );
}
