import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { FadeIn } from '@/components/ui/FadeIn';
import { PageReveal } from '@/components/ui/PageReveal';
import { NewsletterSignup } from '@/components/newsletter';
import { HeroBanner } from '@/components/hero/HeroBanner';
import { RecommendationCarousel } from '@/components/product/RecommendationCarousel';
import { getBestSellers, getProductPagesAsync } from '@/lib/products-db';
import styles from './page.module.css';

export default async function HomePage() {
  const [bestSellersData, allProducts] = await Promise.all([
    getBestSellers(),
    getProductPagesAsync(),
  ]);

  const trendingProducts = allProducts
    .filter(p => p.isBestseller || p.isNew)
    .slice(0, 8);

  const bestSellers = bestSellersData.map(p => {
    const v = p.variants[p.defaultVariantIndex];
    return {
      sku: v.sku,
      name: p.name,
      variant: v.variant,
      price: v.price,
      image: v.image,
      category: p.category,
      slug: p.slug,
      meta: p.category,
      variantCount: p.variants.length,
    };
  });

  return (
    <PageReveal>
      <HeroBanner
        headline="Premium Fidget Toys. Endless Satisfaction."
        subtitle="Discover our curated collection of premium fidget toys designed for focus, calm, and endless fun. From magnetic marvels to squishy stress-busters."
        ctaText="Shop Now"
        ctaHref="/products"
        mediaType="image"
        mediaSrc="/images/products/mag-balls-rainbow.webp"
      />

      <FadeIn><section className={styles.productsSection}>
        <div className="container">
          <div className={styles.sectionTitle}>
            <h2>Best Sellers</h2>
            <Link href="/products" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent-primary)' }}>View All</Link>
          </div>
          <div className={styles.bestsellersGrid}>
            {bestSellers.map((p, i) => (
              <ProductCard key={p.sku} product={p} slug={p.slug} meta={p.meta} priority={i < 3} variantCount={p.variantCount} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link href="/products" className="btn btn-secondary">View Full Catalog</Link>
          </div>
        </div>
      </section></FadeIn>

      {trendingProducts.length > 0 && (
        <FadeIn>
          <div className="container">
            <RecommendationCarousel
              products={trendingProducts}
              title="Trending Now"
              eyebrow="What's Hot"
              context="homepage"
            />
          </div>
        </FadeIn>
      )}

      <FadeIn><section className={styles.newsletterSection}>
        <div className="container">
          <div className={styles.newsletterInner}>
            <div className={styles.newsletterIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h2>Join the Fidget Fam</h2>
            <p>
              Get first access to new arrivals, exclusive discounts, and fidget tips delivered straight to your inbox.
            </p>
            <NewsletterSignup />
            <p className={styles.newsletterDisclaimer}>
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section></FadeIn>
    </PageReveal>
  );
}
