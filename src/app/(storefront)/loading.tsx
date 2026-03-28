export default function RootLoading() {
  return (
    <section className="page-loading" role="status" aria-label="Loading" style={{ padding: '80px 0' }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Hero placeholder */}
        <div className="skeleton-block" style={{ height: 320, borderRadius: 12, marginBottom: 48 }} />
        {/* Stat strip placeholder */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-block" style={{ height: 80, borderRadius: 10 }} />
          ))}
        </div>
        {/* Content placeholder */}
        <div className="skeleton-block" style={{ height: 200, borderRadius: 12 }} />
      </div>
    </section>
  );
}
