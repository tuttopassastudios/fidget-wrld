import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { FadeIn } from '@/components/ui/FadeIn';
import { PageReveal } from '@/components/ui/PageReveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EditorialGrid } from '@/components/ui/EditorialGrid';
import { CategoryBubbles } from '@/components/ui/CategoryBubbles';
import { NewsletterSignup } from '@/components/newsletter';
import { BallpitHero } from './BallpitHero';
import { getBestSellers } from '@/lib/products-db';
import styles from './page.module.css';

const CATEGORY_ITEMS = [
  {
    label: 'Magnetic',
    href: '/products?category=Magnetic',
    rotation: -6,
    hoverStyles: { bgColor: '#8B5CF6', textColor: '#fff' },
  },
  {
    label: 'Squishy',
    href: '/products?category=Squishy',
    rotation: 5,
    hoverStyles: { bgColor: '#EC4899', textColor: '#fff' },
  },
  {
    label: 'Clicky',
    href: '/products?category=Clicky',
    rotation: 4,
    hoverStyles: { bgColor: '#06B6D4', textColor: '#fff' },
  },
  {
    label: 'Stretchy',
    href: '/products?category=Stretchy',
    rotation: -5,
    hoverStyles: { bgColor: '#22C55E', textColor: '#fff' },
  },
  {
    label: 'Desk Toys',
    href: '/products?category=Desk+Toy',
    rotation: 6,
    hoverStyles: { bgColor: '#F59E0B', textColor: '#fff' },
  },
  {
    label: 'Gift Sets',
    href: '/products?category=Gift+Set',
    rotation: -4,
    hoverStyles: { bgColor: '#3B82F6', textColor: '#fff' },
  },
];

export default async function HomePage() {
  const bestSellersData = await getBestSellers();

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
      allOutOfStock: !!p.isOutOfStock,
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
                <ProductCard key={p.sku} product={p} slug={p.slug} meta={p.meta} priority={i < 4} variantCount={p.variantCount} allOutOfStock={p.allOutOfStock} />
              ))}
            </EditorialGrid>
          </div>
        </section>
      </FadeIn>

      {/* 4. Newsletter */}
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

      {/* 5. Support Banner */}
      <FadeIn>
        <section className={styles.supportBanner}>
          <div className="container">
            <div className={styles.supportBannerInner}>
              <div className={styles.supportBannerIcon} aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className={styles.supportBannerContent}>
                <h2 className={styles.supportBannerTitle}>Need Help? We&apos;re Here for You</h2>
                <p className={styles.supportBannerText}>Our friendly support team responds within 24 hours</p>
              </div>
              <Link href="/contact" className={styles.supportBannerLink}>
                Contact Us
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>
    </PageReveal>
  );
}
