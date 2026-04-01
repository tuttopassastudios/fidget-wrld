'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency } from '@/lib/utils';
import { ReflectiveCard } from '@/components/ui/ReflectiveCard';
import { useHaptics } from '@/hooks/useHaptics';
import { QuickViewModal } from '@/components/product/QuickViewModal';
import type { ProductVariant, ProductPage } from '@/types';

interface ProductBadges {
  isNew?: boolean;
  isBestseller?: boolean;
  isHot?: boolean;
}

interface ProductCardProps {
  product: ProductVariant & { sku: string };
  slug: string;
  meta?: string;
  priority?: boolean;
  variantCount?: number;
  badges?: ProductBadges;
  size?: 'standard' | 'featured' | 'compact';
  tags?: string[];
  description?: string;
  onQuickView?: () => void;
  productData?: ProductPage;
  enableViewTransition?: boolean;
  allOutOfStock?: boolean;
}

export function ProductCard({
  product,
  slug,
  meta,
  priority,
  variantCount = 1,
  badges,
  size = 'standard',
  tags,
  description,
  onQuickView,
  productData,
  enableViewTransition = true,
  allOutOfStock = false,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { show } = useToast();
  const { trigger } = useHaptics();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const hasMultipleVariants = variantCount > 1;

  const handleButtonClick = (e: React.MouseEvent) => {
    if (hasMultipleVariants) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    addItem({
      sku: product.sku,
      name: product.name,
      variant: product.variant,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
    trigger('success');
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      show(`${product.name}${product.variant ? ` (${product.variant})` : ''} added to cart`, 'success', 3000);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView();
    } else if (productData) {
      setIsQuickViewOpen(true);
    }
  };

  const imageAspect = size === 'featured' ? '3 / 4' : '1';
  const nameClass = size === 'featured'
    ? 'product-card-name product-card-name--featured'
    : size === 'compact'
      ? 'product-card-name product-card-name--compact'
      : 'product-card-name';

  const visibleTags = tags?.slice(0, 3);

  return (
    <>
      <ReflectiveCard className={`product-card${allOutOfStock ? ' product-card--out-of-stock' : ''}`} enableTilt={false}>
        <Link href={`/products/${slug}`} className="product-card-link" prefetch={true} style={enableViewTransition ? { viewTransitionName: `product-${slug}` } : undefined}>
          <div className="product-card-image" style={size !== 'standard' ? { aspectRatio: imageAspect } : undefined}>
            <img
              src={product.image}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              loading={priority ? 'eager' : 'lazy'}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/products/placeholder.svg'; }}
            />
            {/* Polka-dot hover overlay */}
            <div className="product-card-dot-overlay" aria-hidden="true" />
            {badges && (badges.isNew || badges.isBestseller || badges.isHot) && (
              <div className="product-card-badges">
                {badges.isNew && <span className="badge badge-new">NEW</span>}
                {badges.isBestseller && <span className="badge badge-bestseller">BEST</span>}
                {badges.isHot && <span className="badge badge-hot">HOT</span>}
              </div>
            )}
            {allOutOfStock && (
              <div className="product-card-oos-badge" aria-label="Out of Stock">
                <span className="product-card-oos-dot" aria-hidden="true" />
                Out of Stock
              </div>
            )}
            {/* Quick View button (desktop hover) */}
            {(onQuickView || productData) && (
              <button
                className="product-card-quickview"
                onClick={handleQuickView}
                aria-label={`Quick view ${product.name}`}
              >
                Quick View
              </button>
            )}
          </div>
          <div className="product-card-body">
            <div className={nameClass}>{product.name}</div>
            {size === 'featured' && description && (
              <div className="product-card-description">{description}</div>
            )}
            {size !== 'compact' && meta && <div className="product-card-meta">{meta}</div>}
            {size !== 'compact' && visibleTags && visibleTags.length > 0 && (
              <div className="product-card-tags">
                {visibleTags.map(tag => (
                  <span key={tag} className="product-card-tag">{tag}</span>
                ))}
              </div>
            )}
            <div className="product-card-footer">
              <span className="product-card-price">{formatCurrency(product.price)}</span>
            </div>
            <button
              className={`btn btn-primary ${size === 'compact' ? 'btn-xs' : 'btn-sm'} product-card-atc`}
              onClick={handleButtonClick}
              disabled={allOutOfStock}
              aria-disabled={allOutOfStock}
            >
              {allOutOfStock ? 'Out of Stock' : hasMultipleVariants ? 'See Options' : 'Add to Cart'}
            </button>
          </div>
        </Link>
      </ReflectiveCard>

      {/* QuickView modal (Option A: self-contained) */}
      {productData && (
        <QuickViewModal
          product={productData}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
        />
      )}
    </>
  );
}
