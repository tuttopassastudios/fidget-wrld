'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { usePromo } from '@/context/PromoContext';
import { useToast } from '@/context/ToastContext';
import { QuantitySelector } from '@/components/product/QuantitySelector';
import { formatCurrency } from '@/lib/utils';
import { getBulkTier } from '@/data/products';
import { calculateSubtotal, FREE_SHIP_THRESHOLD, STANDARD_SHIPPING } from '@/lib/pricing';
import { useHaptics } from '@/hooks/useHaptics';
import { CheckoutProgress } from '@/components/checkout/CheckoutProgress';
import { RecommendationCarousel } from '@/components/product/RecommendationCarousel';
import { productPages, getProductBySlug } from '@/data/products';

export function CartPageClient() {
  const { items, removeItem, updateQuantity } = useCart();
  const { activePromo, apply, remove, calculateDiscount } = usePromo();
  const { show } = useToast();
  const { trigger } = useHaptics();
  const [promoCode, setPromoCode] = useState('');
  const [affirmed, setAffirmed] = useState(false);

  // Compute "Frequently Bought Together" products from cart items' relatedSlugs
  const cartRecommendations = useMemo(() => {
    const cartSlugs = new Set<string>();
    const relatedSlugs = new Set<string>();

    // Find which product slugs are in the cart
    for (const item of items) {
      for (const p of productPages) {
        if (p.variants.some(v => v.sku === item.sku)) {
          cartSlugs.add(p.slug);
          // Collect related slugs
          if (p.relatedSlugs) {
            for (const rs of p.relatedSlugs) relatedSlugs.add(rs);
          }
        }
      }
    }

    // Remove cart items from related set, then resolve to ProductPage[]
    for (const slug of cartSlugs) relatedSlugs.delete(slug);

    const results: typeof productPages = [];
    for (const slug of relatedSlugs) {
      const p = getProductBySlug(slug);
      if (p) results.push(p);
      if (results.length >= 8) break;
    }

    // Fall back to bestsellers if no related products found
    if (results.length === 0) {
      return productPages
        .filter(p => p.isBestseller && !cartSlugs.has(p.slug))
        .slice(0, 8);
    }

    return results;
  }, [items]);

  const subtotal = calculateSubtotal(items);
  const promoResult = calculateDiscount(subtotal);
  const shipping = subtotal >= FREE_SHIP_THRESHOLD || promoResult.freeShipping ? 0 : STANDARD_SHIPPING;
  const total = subtotal - promoResult.discount + shipping;

  const remaining = FREE_SHIP_THRESHOLD - subtotal;
  const shippingPct = Math.min((subtotal / FREE_SHIP_THRESHOLD) * 100, 100);

  const handleApplyPromo = () => {
    const result = apply(promoCode, subtotal);
    trigger(result.success ? 'success' : 'error');
    show(result.message, result.success ? 'success' : 'error', 3000);
    if (result.success) setPromoCode('');
  };

  if (items.length === 0) {
    return (
      <section className="product-page" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ marginBottom: 16 }}>Your Cart is Empty</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>Add some products to get started.</p>
          <Link href="/products" className="btn btn-primary">Browse Catalog</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="product-page" style={{ padding: '32px 0' }}>
      <div className="container">
        <CheckoutProgress currentStep={1} />
        <h1 style={{ fontSize: '1.5rem', marginBottom: 24 }}>Shopping Cart</h1>

        <div className="page-grid-sidebar">
          {/* Items */}
          <div>
            {items.map(item => {
              const tier = getBulkTier(item.quantity);
              const discountedTotal = tier
                ? item.price * item.quantity * (1 - tier.discount / 100)
                : item.price * item.quantity;
              return (
                <div key={item.sku} className="cart-item">
                  <Image className="cart-item-image" src={item.image} alt={item.name} width={80} height={80} sizes="80px" style={{ objectFit: 'contain', borderRadius: 8, background: 'var(--color-bg-elevated)' }} onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/products/placeholder.svg'; }} />
                  <div className="cart-item-info" style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
                    {item.variant && <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{item.variant}</div>}
                    <div className="cart-item-sku">SKU: {item.sku}</div>
                    {tier && (
                      <span style={{ display: 'inline-block', marginTop: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600, borderRadius: 4, background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>
                        Bulk Save {tier.label}
                      </span>
                    )}
                  </div>
                  <button
                    className="cart-item-remove"
                    onClick={() => { trigger('tap'); removeItem(item.sku); show(`${item.name} removed from cart`, 'info'); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 18 }}
                  >
                    &times;
                  </button>
                  <div className="cart-item-row2">
                    <QuantitySelector value={item.quantity} onChange={qty => updateQuantity(item.sku, qty)} min={0} />
                    <div style={{ fontWeight: 600, minWidth: 80, textAlign: 'right', color: 'var(--color-accent-primary)' }}>
                      {tier && (
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      )}
                      {formatCurrency(discountedTotal)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="cart-summary" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24, height: 'fit-content', position: 'sticky', top: 100 }}>
            {/* Free shipping progress bar */}
            <div className="cart-drawer-shipping-bar" style={{ marginBottom: 16 }}>
              {subtotal >= FREE_SHIP_THRESHOLD ? (
                <>
                  <div className="ship-bar-text ship-bar-success">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
                      <path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="10" />
                    </svg>
                    FREE standard shipping unlocked!
                  </div>
                  <div className="ship-bar-track"><div className="ship-bar-fill" style={{ width: '100%' }} /></div>
                </>
              ) : (
                <>
                  <div className="ship-bar-text">
                    Add {formatCurrency(remaining)} more for <strong>FREE shipping!</strong>
                  </div>
                  <div className="ship-bar-track"><div className="ship-bar-fill" style={{ width: `${shippingPct}%` }} /></div>
                </>
              )}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Order Summary</h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
              <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
            </div>
            {promoResult.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'var(--color-success)' }}>
                <span>{promoResult.label}</span><span>-{formatCurrency(promoResult.discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 14 }}>
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--color-border)', fontWeight: 700, fontSize: 18 }}>
              <span>Total</span><span style={{ color: 'var(--color-accent-primary)' }}>{formatCurrency(total)}</span>
            </div>

            {/* Promo */}
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                placeholder="Promo code"
                className="form-input"
                style={{ flex: 1, padding: '8px 12px', fontSize: 16 }}
              />
              <button className="btn btn-secondary btn-sm" onClick={handleApplyPromo}>Apply</button>
            </div>
            {activePromo && (
              <button onClick={() => { trigger('tap'); remove(); }} style={{ background: 'none', border: 'none', color: 'var(--color-error)', fontSize: 12, cursor: 'pointer', marginTop: 4 }}>
                Remove {activePromo.code}
              </button>
            )}

            {/* Affirmation */}
            <label style={{ display: 'flex', gap: 8, marginTop: 16, fontSize: 12, color: 'var(--color-text-muted)', cursor: 'pointer' }}>
              <input type="checkbox" checked={affirmed} onChange={e => setAffirmed(e.target.checked)} />
              I have read the product safety information and age recommendations.
            </label>

            <Link
              href={affirmed ? '/checkout' : '#'}
              className="btn btn-primary"
              onClick={e => !affirmed && e.preventDefault()}
              style={{ display: 'block', textAlign: 'center', marginTop: 16, opacity: affirmed ? 1 : 0.5, pointerEvents: affirmed ? 'auto' : 'none' }}
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>

        {cartRecommendations.length > 0 && (
          <RecommendationCarousel
            products={cartRecommendations}
            title="Frequently Bought Together"
            context="cart"
          />
        )}
      </div>
    </section>
  );
}
