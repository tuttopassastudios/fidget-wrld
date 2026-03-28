export default function DashboardLoading() {
  return (
    <div className="page-loading" role="status" aria-label="Loading" style={{ padding: 32 }}>
      {/* Topbar placeholder */}
      <div style={{ height: 32, width: 180, background: 'var(--color-bg-elevated)', borderRadius: 4, marginBottom: 32 }} />
      {/* Stat cards placeholder */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ height: 100, background: 'var(--color-bg-elevated)', borderRadius: 12 }} />
        ))}
      </div>
      {/* Table placeholder */}
      <div style={{ height: 300, background: 'var(--color-bg-elevated)', borderRadius: 12 }} />
    </div>
  );
}
