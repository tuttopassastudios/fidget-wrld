'use client';

import { useMemo } from 'react';
import { Carousel } from '@/components/ui/Carousel';
import { ProductCard } from './ProductCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { ProductPage } from '@/types';
import type { CarouselItem } from '@/components/ui/Carousel';
import styles from './RecommendationCarousel.module.css';

interface RecommendationCarouselProps {
  products: ProductPage[];
  title: string;
  context: 'pdp' | 'cart' | 'homepage';
  eyebrow?: string;
  maxItems?: number;
  className?: string;
}

const CAROUSEL_CONFIG = {
  homepage: { baseWidth: 280, autoplay: true, autoplayDelay: 4000, pauseOnHover: true, loop: true },
  pdp: { baseWidth: 260, autoplay: false, loop: true },
  cart: { baseWidth: 200, autoplay: false, loop: false },
} as const;

export function RecommendationCarousel({
  products,
  title,
  context,
  eyebrow,
  maxItems = 8,
  className,
}: RecommendationCarouselProps) {
  const displayProducts = useMemo(() => products.slice(0, maxItems), [products, maxItems]);

  const carouselItems: CarouselItem[] = useMemo(
    () =>
      displayProducts.map((p) => {
        const v = p.variants[p.defaultVariantIndex];
        return {
          id: p.slug,
          title: p.name,
          content: (
            <ProductCard
              product={{ ...v, sku: v.sku }}
              slug={p.slug}
              variantCount={p.variants.length}
              badges={{
                isNew: p.isNew,
                isBestseller: p.isBestseller,
              }}
              enableViewTransition={false}
              allOutOfStock={p.isOutOfStock}
            />
          ),
        };
      }),
    [displayProducts]
  );

  if (displayProducts.length === 0) return null;

  const config = CAROUSEL_CONFIG[context];
  const sectionClass = [
    styles.section,
    context === 'homepage' ? styles.sectionHomepage : '',
    context === 'cart' ? styles.sectionCart : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={sectionClass} aria-label={title}>
      <SectionHeading
        heading={title}
        eyebrow={eyebrow}
        as={context === 'cart' ? 'h3' : 'h2'}
        dotAccent
      />
      <div className={styles.carouselWrap}>
        <Carousel items={carouselItems} {...config} />
      </div>
    </section>
  );
}

export default RecommendationCarousel;
