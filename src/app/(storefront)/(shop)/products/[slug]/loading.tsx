export default function ProductDetailLoading() {
  return (
    <section className="product-page page-loading" role="status" aria-label="Loading">
      <div className="container">
        {/* Breadcrumb skeleton */}
        <div style={{ height: 14, width: 250, background: 'var(--color-bg-elevated)', borderRadius: 4, marginBottom: 24 }} />

        <div className="product-layout">
          {/* Image skeleton */}
          <div className="product-gallery">
            <div style={{ aspectRatio: '1', background: 'var(--color-bg-elevated)', borderRadius: 12 }} />
          </div>

          {/* Info skeleton */}
          <div className="product-info">
            <div style={{ height: 28, width: '60%', background: 'var(--color-bg-elevated)', borderRadius: 4, marginBottom: 12 }} />
            <div style={{ height: 14, width: '40%', background: 'var(--color-bg-elevated)', borderRadius: 4, marginBottom: 16 }} />
            <div style={{ height: 32, width: 120, background: 'var(--color-bg-elevated)', borderRadius: 4, marginBottom: 24 }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: 40, width: 80, background: 'var(--color-bg-elevated)', borderRadius: 6 }} />
              ))}
            </div>
            <div style={{ height: 48, background: 'var(--color-bg-elevated)', borderRadius: 8, marginBottom: 16 }} />
          </div>
        </div>
      </div>
    </section>
  );
}
