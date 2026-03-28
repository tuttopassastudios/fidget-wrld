'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';
import { VariantSelector } from './VariantSelector';
import { QuantitySelector } from './QuantitySelector';
import { ProductTabs } from './ProductTabs';
import { ProductCard } from './ProductCard';
import { AboutCarousel } from './AboutCarousel';
import { formatCurrency } from '@/lib/utils';
import { useHaptics } from '@/hooks/useHaptics';
import { getRecommendations, bulkTiers } from '@/data/products';
import { getModelComponent } from './models';
import type { ProductPage } from '@/types';
import './AboutCarousel.css';

export function ProductPageClient({ product }: { product: ProductPage }) {
  const ModelComponent = getModelComponent(product.slug);
  const hasModel = ModelComponent !== null;
  const [variantIdx, setVariantIdx] = useState(product.defaultVariantIndex);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { show } = useToast();
  const { toggle, isWishlisted } = useWishlist();
  const { track } = useRecentlyViewed();
  const { trigger } = useHaptics();

  const variant = product.variants[variantIdx];
  const wishlisted = isWishlisted(variant.sku);
  const related = getRecommendations([{ sku: variant.sku, name: product.name }]);

  useEffect(() => {
    track({
      sku: variant.sku,
      name: variant.name,
      variant: variant.variant,
      price: variant.price,
      image: variant.image,
      url: `/products/${product.slug}`,
    });
  }, [product.slug, variant, track]);

  const handleAddToCart = () => {
    addItem({
      sku: variant.sku,
      name: variant.name,
      variant: variant.variant,
      price: variant.price,
      image: variant.image,
      quantity,
    });
    trigger('success');
    // Only show toast on mobile (cart drawer opens on desktop)
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      show(`${variant.name} (${variant.variant}) added to cart`, 'success', 3000);
    }
  };

  const handleWishlist = () => {
    trigger('tap');
    const added = toggle({
      sku: variant.sku,
      name: variant.name,
      variant: variant.variant,
      price: variant.price,
      image: variant.image,
      url: `/products/${product.slug}`,
    });
    show(
      added ? `${variant.name} added to wishlist` : `${variant.name} removed from wishlist`,
      added ? 'success' : 'info',
      2000
    );
  };

  return (
    <>
      <div className="product-layout">
        <div className="product-gallery reveal-item">
          <div className="product-main-image">
            <img
              src={variant.image}
              alt={variant.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              loading="eager"
            />
          </div>
        </div>

        <div className="product-info reveal-item">
          <h1>{product.name}</h1>

          <div className="product-meta">
            <span>SKU: {variant.sku}</span>
            <span>Category: {product.category}</span>
            <span className="product-availability">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6" /></svg>
              In Stock
            </span>
          </div>

          <div className="product-price">{formatCurrency(variant.price)}</div>

          <VariantSelector
            variants={product.variants}
            selectedIndex={variantIdx}
            onSelect={setVariantIdx}
          />

          <div className="product-quantity">
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Quantity:</label>
            <QuantitySelector value={quantity} onChange={setQuantity} />
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 8, marginBottom: 16 }}>
            {bulkTiers.map((t, i) => (
              <span key={t.qty}>
                <span style={{
                  color: quantity >= t.qty ? 'var(--color-accent-primary)' : undefined,
                  fontWeight: quantity >= t.qty ? 600 : 400,
                }}>
                  {t.qty}+ units: {t.label}
                </span>
                {i < bulkTiers.length - 1 && <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>}
              </span>
            ))}
          </div>

          {quantity >= 25 && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              padding: '10px 14px',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 6,
              fontSize: '0.8125rem',
              lineHeight: 1.5,
              color: 'var(--color-warning, #F59E0B)',
              marginBottom: 12,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" /><path d="M12 17h.01" />
              </svg>
              <span>
                <strong>Wholesale inquiry recommended.</strong> For orders of 25+ units we offer custom pricing and priority fulfillment.{' '}
                <a href="/contact" style={{ color: 'inherit', textDecoration: 'underline' }}>Contact our sales team</a> for a quote.
              </span>
            </div>
          )}

          {quantity >= 10 && quantity < 25 && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              padding: '10px 14px',
              background: 'rgba(94,234,212,0.06)',
              border: '1px solid rgba(94,234,212,0.25)',
              borderRadius: 6,
              fontSize: '0.8125rem',
              lineHeight: 1.5,
              color: 'var(--color-accent-primary, #5EEAD4)',
              marginBottom: 12,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" /><path d="M12 8h.01" />
              </svg>
              <span>
                Large order — bulk discount applied! Contact us for wholesale pricing on orders of 25+.
              </span>
            </div>
          )}

          <div className="product-actions">
            <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>Add to Cart</button>
            <button
              className={`btn-wishlist${wishlisted ? ' active' : ''}`}
              onClick={handleWishlist}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={wishlisted}
              style={wishlisted ? { borderColor: '#EF4444', color: '#EF4444' } : undefined}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlisted ? '#EF4444' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>
          </div>

          <div className="product-features">
            <div className="product-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="10" />
              </svg>
              Third-party lab tested
            </div>
            <div className="product-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              COA included with order
            </div>
            <div className="product-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="20" x="2" y="2" rx="5" />
                <path d="M5 12h14" /><path d="M12 5v14" />
              </svg>
              Ships within 24-48 hours
            </div>
          </div>

        </div>
      </div>

      {hasModel && ModelComponent && product.about && (
        <section
          className="reveal-item model-carousel-row"
          aria-label={`About ${product.name} and interactive 3D molecular structure`}
        >
          <div className="model-carousel-row__carousel">
            <AboutCarousel about={product.about} productName={product.name} />
          </div>
          <div className="model-carousel-row__model">
            <ModelComponent />
          </div>
        </section>
      )}

      <div className="reveal-item">
        <ProductTabs
          description={product.description}
          about={product.about}
          specifications={product.specifications}
          careInstructions={product.careInstructions}
          hideDescription={hasModel}
        />
      </div>

      {related.length > 0 && (
        <section className="reveal-item" style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 24, textAlign: 'center' }}>You May Also Like</h2>
          <div className="product-grid">
            {related.map(rec => (
              <ProductCard
                key={rec.sku}
                product={rec}
                slug={rec.slug}
                variantCount={rec.variantCount}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
