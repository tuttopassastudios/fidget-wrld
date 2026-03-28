'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useHaptics } from '@/hooks/useHaptics';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { formatCurrency } from '@/lib/utils';
import type { ProductPage } from '@/types';
import styles from './RecommendationCarousel.module.css';

interface CompleteTheSetProps {
  currentProduct: ProductPage;
  allProducts: ProductPage[];
}

export function CompleteTheSet({ currentProduct, allProducts }: CompleteTheSetProps) {
  const { addItem } = useCart();
  const { show } = useToast();
  const { trigger } = useHaptics();

  const relatedProducts = useMemo(() => {
    if (!currentProduct.relatedSlugs || currentProduct.relatedSlugs.length === 0) return [];
    const slugSet = new Set(currentProduct.relatedSlugs);
    return allProducts
      .filter((p) => slugSet.has(p.slug))
      .slice(0, 4);
  }, [currentProduct.relatedSlugs, allProducts]);

  if (relatedProducts.length === 0) return null;

  const handleAdd = (product: ProductPage) => {
    const v = product.variants[product.defaultVariantIndex];
    addItem({
      sku: v.sku,
      name: v.name,
      variant: v.variant,
      price: v.price,
      image: v.image,
      quantity: 1,
    });
    trigger('success');
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      show(`${v.name} added to cart`, 'success', 3000);
    }
  };

  return (
    <section className={styles.completePanel} aria-label="Complete the Set">
      <SectionHeading heading="Complete the Set" eyebrow="Goes great with" dotAccent as="h2" />
      <div className={styles.completeGrid}>
        {relatedProducts.map((p) => {
          const v = p.variants[p.defaultVariantIndex];
          return (
            <div key={p.slug} className={styles.miniCard}>
              <Image
                className={styles.miniCardImage}
                src={v.image}
                alt={v.name}
                width={120}
                height={120}
                sizes="120px"
                loading="lazy"
              />
              <span className={styles.miniCardName}>{p.name}</span>
              <span className={styles.miniCardPrice}>{formatCurrency(v.price)}</span>
              <button
                className="btn btn-primary btn-sm"
                style={{ fontSize: 'var(--text-xs)' }}
                onClick={() => handleAdd(p)}
                aria-label={`Add ${p.name} to cart`}
              >
                Add to Cart
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CompleteTheSet;
