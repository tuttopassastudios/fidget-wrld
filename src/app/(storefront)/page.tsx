import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { FadeIn } from '@/components/ui/FadeIn';
import { PageReveal } from '@/components/ui/PageReveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EditorialGrid } from '@/components/ui/EditorialGrid';
import { CategoryBubbles } from '@/components/ui/CategoryBubbles';
import { NewsletterSignup } from '@/components/newsletter';
import { RecommendationCarousel } from '@/components/product/RecommendationCarousel';
import { BallpitHero } from './BallpitHero';
import { getBestSellers, getProductPagesAsync } from '@/lib/products-db';
import styles from './page.module.css';

const CATEGORY_ITEMS = [
  {
    label: 'Magnetic',
    href: '/products?category=Magnetic',
    rotation: -6,
    hoverStyles: { bgColor: '#B794F6', textColor: '#fff' },
  },
  {
    label: 'Squishy',
    href: '/products?category=Squishy',
    rotation: 5,
    hoverStyles: { bgColor: '#FF6B9D', textColor: '#fff' },
  },
  {
    label: 'Clicky',
    href: '/products?category=Clicky',
    rotation: 4,
    hoverStyles: { bgColor: '#00D4AA', textColor: '#fff' },
  },
  {
    label: 'Stretchy',
    href: '/products?category=Stretchy',
    rotation: -5,
    hoverStyles: { bgColor: '#FFD93D', textColor: '#1a1a1a' },
  },
  {
    label: 'Desk Toys',
    href: '/products?category=Desk+Toy',
    rotation: 6,
    hoverStyles: { bgColor: '#FF8B6A', textColor: '#fff' },
  },
  {
    label: 'Gift Sets',
    href: '/products?category=Gift+Set',
    rotation: -4,
    hoverStyles: { bgColor: '#3b82f6', textColor: '#fff' },
  },
];

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
      {/* 1. Hero — Ballpit + Logo */}
      <section className={styles.hero}>
        <BallpitHero className={styles.heroBallpit} />
        <noscript>
          <div className={styles.heroFallback} />
        </noscript>

        <div className={styles.heroContent}>
          <Image
            src="/images/fidget-wrld-logo-main.png"
            alt="Fidget WRLD"
            width={600}
            height={400}
            priority
            className={styles.heroLogo}
          />
          <Link href="/products" className={styles.heroCta}>
            Shop Now
          </Link>
        </div>

        <div className={styles.scrollHint} aria-hidden="true">
          <span>Scroll</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* 2. Category Bubbles */}
      <FadeIn>
        <CategoryBubbles items={CATEGORY_ITEMS} />
      </FadeIn>

      {/* 3. Best Sellers */}
      <FadeIn>
        <section className={styles.productsSection}>
          <div className="container">
            <div className={styles.bestSellersHeader}>
              <SectionHeading heading="Best Sellers" eyebrow="Fan Favorites" dotAccent />
              <Link href="/products" className={styles.viewAllLink}>View All &rarr;</Link>
            </div>
            <EditorialGrid layout="row">
              {bestSellers.map((p, i) => (
                <ProductCard key={p.sku} product={p} slug={p.slug} meta={p.meta} priority={i < 4} variantCount={p.variantCount} />
              ))}
            </EditorialGrid>
          </div>
        </section>
      </FadeIn>

      {/* 4. Trending Carousel */}
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

      {/* 5. Newsletter */}
      <FadeIn>
        <section className={styles.newsletterSection}>
          <div className="container">
            <div className={styles.newsletterInner}>
              <div className={styles.newsletterIcon} aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <SectionHeading heading="Join the Fidget Fam" align="center" />
              <p>
                Get first access to new arrivals, exclusive discounts, and fidget tips delivered straight to your inbox.
              </p>
              <NewsletterSignup />
              <p className={styles.newsletterDisclaimer}>
                We respect your privacy. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>
      </FadeIn>
    </PageReveal>
  );
}
