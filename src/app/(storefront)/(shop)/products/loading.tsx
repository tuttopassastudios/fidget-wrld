export default function ProductsLoading() {
  return (
    <section className="product-page page-loading" role="status" aria-label="Loading" style={{ padding: '32px 0' }}>
      <div className="container">
        <div style={{ display: 'flex', gap: 32 }}>
          {/* Sidebar skeleton */}
          <aside style={{ width: 220, flexShrink: 0 }}>
            <div style={{ height: 14, width: 100, background: 'var(--color-bg-elevated)', borderRadius: 4, marginBottom: 16 }} />
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 14, width: 80, background: 'var(--color-bg-elevated)', borderRadius: 4, marginBottom: 12 }} />
            ))}
          </aside>

          {/* Product grid skeleton */}
          <div style={{ flex: 1 }}>
            <div style={{ height: 16, width: 200, background: 'var(--color-bg-elevated)', borderRadius: 4, marginBottom: 24 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--color-bg-card)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ height: 200, background: 'var(--color-bg-elevated)' }} />
                  <div style={{ padding: 16 }}>
                    <div style={{ height: 14, width: '70%', background: 'var(--color-bg-elevated)', borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ height: 12, width: '40%', background: 'var(--color-bg-elevated)', borderRadius: 4, marginBottom: 12 }} />
                    <div style={{ height: 36, background: 'var(--color-bg-elevated)', borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
