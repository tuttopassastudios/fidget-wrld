'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 'var(--space-4)', color: 'var(--color-text-secondary)', background: 'var(--color-bg-dark, #001428)' }}>
      <h2 style={{ color: 'var(--color-error)', fontSize: '1.25rem', fontWeight: 700 }}>
        Something went wrong
      </h2>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: 400, textAlign: 'center' }}>
        {error.message || 'An unexpected error occurred in the dashboard.'}
      </p>
      <button
        onClick={reset}
        style={{
          background: 'var(--color-accent-primary)',
          color: 'var(--color-bg-dark)',
          border: 'none',
          padding: '8px 20px',
          borderRadius: 8,
          fontWeight: 700,
          cursor: 'pointer',
        }}
        type="button"
      >
        Try again
      </button>
    </div>
  );
}
