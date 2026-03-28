'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency } from '@/lib/utils';
import { ReflectiveCard } from '@/components/ui/ReflectiveCard';
import { useHaptics } from '@/hooks/useHaptics';
import type { ProductVariant } from '@/types';

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
}

export function ProductCard({ product, slug, meta, priority, variantCount = 1, badges }: ProductCardProps) {
  const { addItem } = useCart();
  const { show } = useToast();
  const { trigger } = useHaptics();

  const hasMultipleVariants = variantCount > 1;

  const handleButtonClick = (e: React.MouseEvent) => {
    if (hasMultipleVariants) {
      // Let the link navigate to product page
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
    // Only show toast on mobile (cart drawer opens on desktop)
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      show(`${product.name}${product.variant ? ` (${product.variant})` : ''} added to cart`, 'success', 3000);
    }
  };

  return (
    <ReflectiveCard className="product-card" enableTilt={false}>
      <Link href={`/products/${slug}`} className="product-card-link" prefetch={true}>
        <div className="product-card-image">
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            loading={priority ? 'eager' : 'lazy'}
          />
          {badges && (badges.isNew || badges.isBestseller || badges.isHot) && (
            <div className="product-card-badges">
              {badges.isNew && <span className="badge badge-new">NEW</span>}
              {badges.isBestseller && <span className="badge badge-bestseller">BEST</span>}
              {badges.isHot && <span className="badge badge-hot">HOT</span>}
            </div>
          )}
        </div>
        <div className="product-card-body">
          <div className="product-card-name">{product.name}</div>
          {meta && <div className="product-card-meta">{meta}</div>}
          <div className="product-card-footer">
            <span className="product-card-price">{formatCurrency(product.price)}</span>
          </div>
          <button
            className="btn btn-primary btn-sm product-card-atc"
            onClick={handleButtonClick}
          >
            {hasMultipleVariants ? 'See Options' : 'Add to Cart'}
          </button>
        </div>
      </Link>
    </ReflectiveCard>
  );
}
