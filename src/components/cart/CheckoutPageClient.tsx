'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { usePromo } from '@/context/PromoContext';
import { formatCurrency } from '@/lib/utils';
import { getBulkTier } from '@/data/products';
import { calculateOrderPricing, STANDARD_SHIPPING } from '@/lib/pricing';
import { useSubmissionGuard } from '@/lib/submission-guard';
import { useHaptics } from '@/hooks/useHaptics';
import { CheckoutProgress } from '@/components/checkout/CheckoutProgress';

export function CheckoutPageClient() {
  const { items, getSubtotal, clear } = useCart();
  const { calculateDiscount } = usePromo();
  const [shipping, setShipping] = useState(STANDARD_SHIPPING);
  const [researchAffirm, setResearchAffirm] = useState(false);
  const [termsAffirm, setTermsAffirm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { isSubmitting: submitting, isCompleted, submit: guardedSubmit } = useSubmissionGuard();
  const { trigger } = useHaptics();
  const [affirmError, setAffirmError] = useState('');

  // Use extracted pricing module — single source of truth
  const orderPricing = (() => {
    const { subtotal: sub } = calculateOrderPricing({ items, promoResult: { discount: 0, freeShipping: false, label: '' }, shippingPrice: shipping });
    const promo = calculateDiscount(sub);
    return { ...calculateOrderPricing({ items, promoResult: promo, shippingPrice: shipping }), promoResult: promo };
  })();
  const { subtotal, freeShipping: freeStandardShipping, effectiveShipping, tax: estimatedTax, total } = orderPricing;
  const promoResult = orderPricing.promoResult;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    // Honeypot check — bots will fill the hidden field
    const honeypot = form.elements.namedItem('website') as HTMLInputElement;
    if (honeypot?.value) return;

    // Validate affirmations — don't pre-disable, show error on submit
    if (!researchAffirm || !termsAffirm) {
      trigger('error');
      setAffirmError('Please confirm both affirmations before placing your order.');
      return;
    }
    setAffirmError('');

    if (items.length === 0) return;

    guardedSubmit(() => {
      // When payment is added, the idempotency key will be sent to the payment API
      trigger('success');
      setShowConfirmation(true);
      clear();
    });
  };

  if (showConfirmation) {
    return (
      <section className="product-page" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 600, margin: '0 auto' }}>
          <CheckoutProgress currentStep={4} />
          <div style={{ fontSize: 48, marginBottom: 16 }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2"><path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
          </div>
          <h1 style={{ marginBottom: 8 }}>Order Confirmed!</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 8 }}>Order #{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: 14 }}>Thank you for your order. You will receive a confirmation email shortly.</p>
          <Link href="/products" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="product-page" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ marginBottom: 16 }}>Your cart is empty</h1>
          <Link href="/products" className="btn btn-primary">Browse Catalog</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="product-page" style={{ padding: '32px 0' }}>
      <div className="container">
        <CheckoutProgress currentStep={3} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Checkout</h1>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-success)', background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: 6, padding: '4px 10px', fontWeight: 500 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Secure Checkout
          </span>
        </div>

        <form onSubmit={handlePlaceOrder} className="page-grid-sidebar-wide">
          {/* Left Column */}
          <div>
            {/* Contact */}
            <div className="checkout-section" style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Contact Information</h3>
              <div className="checkout-grid-2">
                <div>
                  <label htmlFor="checkout-first-name" style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>First Name</label>
                  <input id="checkout-first-name" name="given-name" autoComplete="given-name" className="form-input" placeholder="Jane..." required maxLength={100} />
                </div>
                <div>
                  <label htmlFor="checkout-last-name" style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Last Name</label>
                  <input id="checkout-last-name" name="family-name" autoComplete="family-name" className="form-input" placeholder="Doe..." required maxLength={100} />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label htmlFor="checkout-email" style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Email Address</label>
                <input id="checkout-email" name="email" autoComplete="email" spellCheck={false} className="form-input" placeholder="you@example.com..." type="email" required maxLength={254} style={{ width: '100%' }} />
              </div>
              <div style={{ marginTop: 12 }}>
                <label htmlFor="checkout-phone" style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Phone Number</label>
                <input id="checkout-phone" name="tel" autoComplete="tel" spellCheck={false} inputMode="tel" className="form-input" placeholder="+1 (555) 123-4567..." type="tel" maxLength={20} style={{ width: '100%' }} />
              </div>
              {/* Honeypot */}
              <input name="website" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            </div>

            {/* Shipping Address */}
            <div className="checkout-section" style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Shipping Address</h3>
              <div style={{ marginBottom: 12 }}>
                <label htmlFor="checkout-address1" style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Address Line 1</label>
                <input id="checkout-address1" name="address-line1" autoComplete="address-line1" className="form-input" placeholder="123 Main St..." required maxLength={200} style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label htmlFor="checkout-address2" style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Address Line 2 (Optional)</label>
                <input id="checkout-address2" name="address-line2" autoComplete="address-line2" className="form-input" placeholder="Apt, suite, unit..." maxLength={200} style={{ width: '100%' }} />
              </div>
              <div className="checkout-grid-3">
                <div>
                  <label htmlFor="checkout-city" style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>City</label>
                  <input id="checkout-city" name="address-level2" autoComplete="address-level2" className="form-input" placeholder="New York..." required maxLength={100} />
                </div>
                <div>
                  <label htmlFor="checkout-state" style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>State</label>
                  <input id="checkout-state" name="address-level1" autoComplete="address-level1" className="form-input" placeholder="NY..." required maxLength={50} />
                </div>
                <div>
                  <label htmlFor="checkout-zip" style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>ZIP Code</label>
                  <input id="checkout-zip" name="postal-code" autoComplete="postal-code" spellCheck={false} inputMode="numeric" className="form-input" placeholder="10001..." required maxLength={10} />
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="checkout-section" style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Shipping Method</h3>
              {[
                { label: 'Standard (5-7 business days)', price: 9.99, id: 'standard' },
                { label: 'Priority (3-4 business days)', price: 14.99, id: 'priority' },
                { label: 'Express (1-2 business days)', price: 24.99, id: 'express' },
              ].map(method => (
                <label key={method.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid var(--color-border)', borderRadius: 8, marginBottom: 8, cursor: 'pointer', background: shipping === method.price ? 'var(--color-bg-elevated)' : 'transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="radio" name="shipping" checked={shipping === method.price} onChange={() => setShipping(method.price)} />
                    <span style={{ fontSize: 14 }}>{method.label}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>
                    {method.price === 9.99 && freeStandardShipping ? 'FREE' : formatCurrency(method.price)}
                  </span>
                </label>
              ))}
            </div>

            {/* Payment */}
            <div className="checkout-section" style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Payment Information</h3>
              <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 24, textAlign: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="1.5" style={{ marginBottom: 8 }}>
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Secure payment processing coming soon</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>Payment will be handled by a PCI-compliant provider.</p>
              </div>
            </div>

            {/* Affirmations */}
            <label className="checkout-affirmation" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12, fontSize: 13, color: 'var(--color-text-secondary)', cursor: 'pointer', minHeight: 44 }}>
              <input type="checkbox" checked={researchAffirm} onChange={e => { setResearchAffirm(e.target.checked); setAffirmError(''); }} style={{ marginTop: 2, accentColor: 'var(--color-accent-primary)', width: 20, height: 20, cursor: 'pointer' }} />
              I have read and understand all product safety information and age recommendations.
            </label>
            <label className="checkout-affirmation" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12, fontSize: 13, color: 'var(--color-text-secondary)', cursor: 'pointer', minHeight: 44 }}>
              <input type="checkbox" checked={termsAffirm} onChange={e => { setTermsAffirm(e.target.checked); setAffirmError(''); }} style={{ marginTop: 2, accentColor: 'var(--color-accent-primary)', width: 20, height: 20, cursor: 'pointer' }} />
              I accept the Terms &amp; Conditions and Disclaimer.
            </label>

            {affirmError && (
              <div style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: 8, padding: 12, marginBottom: 12, color: 'var(--color-error)', fontSize: 13 }}>
                {affirmError}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting || isCompleted} style={{ width: '100%', opacity: submitting || isCompleted ? 0.7 : (!researchAffirm || !termsAffirm) ? 0.5 : 1 }}>
              {submitting ? 'Placing Order\u2026' : `Place Order — ${formatCurrency(total)}`}
            </button>

            {/* Trust Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
              {/* SSL Encryption Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                256-bit SSL Encrypted
              </div>
              {/* Secure Payment Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                Secure Payment
              </div>
              {/* Satisfaction Guaranteed Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                Satisfaction Guaranteed
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24, height: 'fit-content', position: 'sticky', top: 100 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Order Summary</h3>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {items.map(item => (
                <div key={item.sku} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(51,65,85,0.5)' }}>
                  <Image src={item.image} alt={item.name} width={40} height={40} sizes="40px" style={{ objectFit: 'contain', borderRadius: 6, background: 'var(--color-bg-elevated)' }} onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/products/placeholder.svg'; }} />
                  <div style={{ flex: 1, fontSize: 13 }}>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-accent-primary)' }}>
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12, marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
                <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
              </div>
              {promoResult.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4, color: 'var(--color-success)' }}>
                  <span>Discount</span><span>-{formatCurrency(promoResult.discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
                <span>Shipping</span><span>{effectiveShipping === 0 ? 'FREE' : formatCurrency(effectiveShipping)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                <span>Est. Tax</span><span>{formatCurrency(estimatedTax)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
                <span>Total</span><span style={{ color: 'var(--color-accent-primary)' }}>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
