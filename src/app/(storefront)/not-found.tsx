import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="product-page" style={{ padding: '80px 0', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--color-accent-primary)', marginBottom: 8 }}>
          404
        </h1>
        <h2 style={{ marginBottom: 8 }}>Page Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 24, fontSize: 14 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/products" className="btn btn-primary">Browse Products</Link>
          <Link href="/" className="btn btn-secondary">Go Home</Link>
        </div>
      </div>
    </section>
  );
}
