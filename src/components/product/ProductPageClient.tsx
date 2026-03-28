'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';
import { VariantSelector } from './VariantSelector';
import { QuantitySelector } from './QuantitySelector';
import { ProductTabs } from './ProductTabs';
import { ProductCard } from './ProductCard';
import { AboutCarousel } from './AboutCarousel';
import { RecommendationCarousel } from './RecommendationCarousel';
import { CompleteTheSet } from './CompleteTheSet';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PolkaDots } from '@/components/ui/DecorativePatterns';
import { formatCurrency } from '@/lib/utils';
import { useHaptics } from '@/hooks/useHaptics';
import { getRecommendations, bulkTiers, productPages } from '@/data/products';
import { getModelComponent } from './models';
import type { ProductPage } from '@/types';
import styles from './ProductPageClient.module.css';
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

  // Get full ProductPage objects for related products (for RecommendationCarousel)
  const relatedProductPages = useMemo(() => {
    const relatedSlugs = new Set(related.map(r => r.slug));
    return productPages.filter(p => relatedSlugs.has(p.slug));
  }, [related]);

  // Determine if thumbnail strip should show (only if variants have distinct images)
  const uniqueImages = useMemo(() => {
    const images = new Set(product.variants.map(v => v.image));
    return images.size > 1;
  }, [product.variants]);

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
      <div className={styles.layout}>
        <div className="reveal-item">
          <div className={styles.gallery}>
            <img
              className={styles.galleryImage}
              src={variant.image}
              alt={variant.name}
              loading="eager"
            />
            <div className={styles.galleryDecor} aria-hidden="true">
              <PolkaDots pattern="corner" size="sm" cornerPosition="top-right" />
            </div>
          </div>

          {uniqueImages && (
            <div className={styles.thumbnails}>
              {product.variants.map((v, i) => (
                <button
                  key={v.sku}
                  className={`${styles.thumbnail}${i === variantIdx ? ` ${styles.thumbnailActive}` : ''}`}
                  onClick={() => { trigger('select'); setVariantIdx(i); }}
                  aria-label={`View ${v.variant}`}
                >
                  <img className={styles.thumbnailImg} src={v.image} alt={v.variant} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`${styles.info} reveal-item`}>
          <SectionHeading heading={product.name} as="h1" dotAccent />

          <div className={styles.meta}>
            <span>SKU: {variant.sku}</span>
            <span>Category: {product.category}</span>
            <span className={styles.availability}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="6" /></svg>
              In Stock
            </span>
          </div>

          <div className={styles.price}>
            {formatCurrency(variant.price)}
            {variant.compareAtPrice && (
              <span className={styles.comparePrice}>{formatCurrency(variant.compareAtPrice)}</span>
            )}
          </div>

          <VariantSelector
            variants={product.variants}
            selectedIndex={variantIdx}
            onSelect={setVariantIdx}
          />

          <div className={styles.quantityRow}>
            <label className={styles.quantityLabel}>Quantity:</label>
            <QuantitySelector value={quantity} onChange={setQuantity} />
          </div>

          <div className={styles.bulkTier}>
            {bulkTiers.map((t, i) => (
              <span key={t.qty}>
                <span className={quantity >= t.qty ? styles.bulkTierActive : undefined}>
                  {t.qty}+ units: {t.label}
                </span>
                {i < bulkTiers.length - 1 && <span className={styles.bulkTierDivider}>&middot;</span>}
              </span>
            ))}
          </div>

          {quantity >= 25 && (
            <div className={styles.quantityWarningAmber}>
              <svg className={styles.warningIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" /><path d="M12 17h.01" />
              </svg>
              <span>
                <strong>Wholesale inquiry recommended.</strong> For orders of 25+ units we offer custom pricing and priority fulfillment.{' '}
                <a href="/contact" className={styles.warningLink}>Contact our sales team</a> for a quote.
              </span>
            </div>
          )}

          {quantity >= 10 && quantity < 25 && (
            <div className={styles.quantityWarningTeal}>
              <svg className={styles.warningIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" /><path d="M12 8h.01" />
              </svg>
              <span>
                Large order — bulk discount applied! Contact us for wholesale pricing on orders of 25+.
              </span>
            </div>
          )}

          <div className={styles.actions}>
            <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>Add to Cart</button>
            <button
              className={`btn-wishlist${wishlisted ? ' active' : ''}`}
              onClick={handleWishlist}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={wishlisted}
              style={wishlisted ? { borderColor: '#EF4444', color: '#EF4444' } : undefined}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlisted ? '#EF4444' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>
          </div>

          <div className={styles.features}>
            <div className={styles.feature}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="10" />
              </svg>
              Third-party lab tested
            </div>
            <div className={styles.feature}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              COA included with order
            </div>
            <div className={styles.feature}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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

      <div className="reveal-item">
        <CompleteTheSet currentProduct={product} allProducts={productPages} />
      </div>

      {relatedProductPages.length > 0 && (
        <div className="reveal-item">
          <RecommendationCarousel
            products={relatedProductPages}
            title="You May Also Like"
            context="pdp"
          />
        </div>
      )}
    </>
  );
}
