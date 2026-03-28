'use client';

import type { Designer } from '@/data/designers';
import type { ProductPage } from '@/types';
import { PolkaDots } from '@/components/ui/DecorativePatterns';
import { RecommendationCarousel } from '@/components/product/RecommendationCarousel';
import styles from './DesignerSpotlight.module.css';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

interface DesignerSpotlightProps {
  designer: Designer;
  products: ProductPage[];
  layout?: 'left' | 'right';
}

export function DesignerSpotlight({
  designer,
  products,
  layout = 'left',
}: DesignerSpotlightProps) {
  const featuredProducts = products.filter((p) =>
    designer.featuredProductSlugs.includes(p.slug)
  );

  const firstName = designer.name.split(' ')[0];
  const isReversed = layout === 'right';

  return (
    <div
      className={styles.spotlight}
      style={{ '--avatar-accent': designer.accentColor } as React.CSSProperties}
    >
      <div className={styles.polkaBackground}>
        <PolkaDots
          pattern="grid"
          size="md"
          colors={[designer.accentColor]}
        />
      </div>

      <div
        className={`${styles.contentGrid} ${isReversed ? styles.contentGridReversed : ''}`}
      >
        <div
          className={`${styles.avatarArea} ${isReversed ? styles.avatarAreaReversed : ''}`}
        >
          <div className={styles.avatarFrame}>
            <div className={styles.avatarFallback} aria-hidden="true">
              {getInitials(designer.name)}
            </div>
          </div>
        </div>

        <div className={styles.infoArea}>
          <h3 className={styles.designerName}>{designer.name}</h3>
          <p className={styles.designerRole}>{designer.role}</p>
          <p className={styles.designerBio}>{designer.bio}</p>

          {featuredProducts.length > 0 && (
            <>
              <p className={styles.featuredHeading}>
                Designs by {firstName}
              </p>
              <RecommendationCarousel
                products={featuredProducts}
                title=""
                context="cart"
                maxItems={3}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
