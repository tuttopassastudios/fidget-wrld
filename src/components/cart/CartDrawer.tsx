'use client';

import { useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency } from '@/lib/utils';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useHaptics } from '@/hooks/useHaptics';
import { productPages } from '@/data/products';
import recStyles from '@/components/product/RecommendationCarousel.module.css';

const FREE_SHIP_THRESHOLD = 150;

export function CartDrawer() {
  const { items, addItem, getCount, getSubtotal, isDrawerOpen, closeDrawer, removeItem } = useCart();
  const { show } = useToast();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { trigger } = useHaptics();
  const count = getCount();
  const subtotal = getSubtotal();

  // Pick 2 recommended products not already in cart
  const drawerRecs = useMemo(() => {
    const cartSkus = new Set(items.map(i => i.sku));
    const cartSlugs = new Set<string>();
    for (const p of productPages) {
      for (const v of p.variants) {
        if (cartSkus.has(v.sku)) cartSlugs.add(p.slug);
      }
    }
    return productPages
      .filter(p => !cartSlugs.has(p.slug) && (p.isBestseller || p.isNew))
      .slice(0, 2);
  }, [items]);

  useFocusTrap(drawerRef, isDrawerOpen, { initialFocusRef: closeRef });

  useEffect(() => {
    if (isDrawerOpen) {
      timerRef.current = setTimeout(closeDrawer, 5000);
      return () => clearTimeout(timerRef.current);
    }
  }, [isDrawerOpen, closeDrawer]);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  const remaining = FREE_SHIP_THRESHOLD - subtotal;
  const pct = Math.min((subtotal / FREE_SHIP_THRESHOLD) * 100, 100);

  return (
    <div id="cartDrawer" className={isDrawerOpen ? 'open' : ''} role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="cart-drawer-content" ref={drawerRef} aria-live="polite">
        <div className="cart-drawer-header">
          <span className="cart-drawer-title">
            Cart{count > 0 ? ` (${count} item${count !== 1 ? 's' : ''})` : ''}
            <span aria-hidden="true" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent-primary)', marginLeft: 6, flexShrink: 0 }} />
          </span>
          <button ref={closeRef} className="cart-drawer-close" onClick={() => { trigger('tap'); closeDrawer(); }} aria-label="Close cart">&times;</button>
        </div>

        <div className="cart-drawer-shipping-bar">
          {subtotal >= FREE_SHIP_THRESHOLD ? (
            <>
              <div className="ship-bar-text ship-bar-success">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
                  <path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="10" />
                </svg>
                FREE standard shipping unlocked!
              </div>
              <div className="ship-bar-track"><div className="ship-bar-fill" style={{ '--fill-pct': '1' } as React.CSSProperties} /></div>
            </>
          ) : items.length > 0 ? (
            <>
              <div className="ship-bar-text">
                Add {formatCurrency(remaining)} more for <strong>FREE shipping!</strong>
              </div>
              <div className="ship-bar-track"><div className="ship-bar-fill" style={{ '--fill-pct': String(pct / 100) } as React.CSSProperties} /></div>
            </>
          ) : null}
        </div>

        <div className="cart-drawer-items">
          {items.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--color-text-muted, #94A3B8)', fontSize: 13 }}>
              Your cart is empty
            </div>
          ) : (
            items.map(item => (
              <div key={item.sku} className="cart-drawer-item-inner" style={{ position: 'relative' }}>
                <button
                  className="cart-drawer-remove"
                  onClick={() => { trigger('tap'); removeItem(item.sku); }}
                  aria-label={`Remove ${item.name} from cart`}
                  style={{ position: 'absolute', top: 4, right: 0 }}
                >
                  &times;
                </button>
                {item.image ? (
                  <Image src={item.image} alt={item.name} width={60} height={60} sizes="60px" style={{ objectFit: 'contain' }} onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/products/placeholder.svg'; }} />
                ) : (
                  <div style={{ width: 60, height: 60, background: 'var(--color-bg-elevated,#001428)', borderRadius: 'var(--radius-md, 6px)' }} />
                )}
                <div className="cart-drawer-item-info">
                  <strong>{item.name}</strong>
                  {item.variant && <span className="cart-drawer-variant">{item.variant}</span>}
                  <span className="cart-drawer-qty">Qty: {item.quantity}</span>
                </div>
                <span className="cart-drawer-price">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && drawerRecs.length > 0 && (
          <div className={recStyles.drawerRecs}>
            <div className={recStyles.drawerRecsTitle}>You might also like</div>
            <div className={recStyles.drawerRecsGrid}>
              {drawerRecs.map(p => {
                const v = p.variants[p.defaultVariantIndex];
                return (
                  <div key={p.slug} className={recStyles.drawerRecCard}>
                    <Image
                      className={recStyles.drawerRecImage}
                      src={v.image}
                      alt={v.name}
                      width={48}
                      height={48}
                      sizes="48px"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/products/placeholder.svg'; }}
                      loading="lazy"
                    />
                    <div className={recStyles.drawerRecInfo}>
                      <div className={recStyles.drawerRecName}>{p.name}</div>
                      <div className={recStyles.drawerRecPrice}>{formatCurrency(v.price)}</div>
                    </div>
                    <button
                      className={`btn btn-primary btn-sm ${recStyles.drawerRecAdd}`}
                      style={{ fontSize: 10, padding: '2px 8px' }}
                      onClick={() => {
                        addItem({
                          sku: v.sku,
                          name: v.name,
                          variant: v.variant,
                          price: v.price,
                          image: v.image,
                          quantity: 1,
                        });
                        trigger('success');
                        show(`${v.name} added`, 'success', 2000);
                      }}
                      aria-label={`Add ${p.name} to cart`}
                    >
                      Add
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="cart-drawer-footer">
          <div className="cart-drawer-subtotal">
            <span>Subtotal</span>
            <span className="cart-drawer-subtotal-value">{formatCurrency(subtotal)}</span>
          </div>
          <Link href="/cart" className="btn btn-primary btn-sm cart-drawer-view" onClick={closeDrawer}>
            View Cart
          </Link>
          <button className="btn btn-sm cart-drawer-continue" onClick={closeDrawer}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
