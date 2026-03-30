import type { Metadata } from 'next';
import Link from 'next/link';
import { stripe } from '@/lib/stripe';
import { CheckoutProgress } from '@/components/checkout/CheckoutProgress';

export const metadata: Metadata = {
  title: 'Order Confirmed',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams;

  let customerEmail: string | null = null;
  let orderTotal: number | null = null;

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      customerEmail = session.customer_details?.email || null;
      orderTotal = session.amount_total ? session.amount_total / 100 : null;
    } catch {
      // Session not found or expired - that's OK, show generic success
    }
  }

  return (
    <section className="product-page" style={{ padding: '80px 0', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: 600, margin: '0 auto' }}>
        <CheckoutProgress currentStep={4} />

        <div style={{ fontSize: 48, marginBottom: 16 }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2">
            <path d="m9 12 2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>

        <h1 style={{ marginBottom: 8 }}>Order Confirmed!</h1>

        {orderTotal && (
          <p style={{ color: 'var(--color-accent-primary)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            ${orderTotal.toFixed(2)}
          </p>
        )}

        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: 14 }}>
          Thank you for your order!
          {customerEmail && (
            <> A confirmation email has been sent to <strong>{customerEmail}</strong>.</>
          )}
        </p>

        <div style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          textAlign: 'left'
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>What happens next?</h3>
          <ul style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0, paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}>Your order is being processed</li>
            <li style={{ marginBottom: 8 }}>You will receive a shipping confirmation email with tracking</li>
            <li>Expected delivery: 5-7 business days</li>
          </ul>
        </div>

        <Link href="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    </section>
  );
}
