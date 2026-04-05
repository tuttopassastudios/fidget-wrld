import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { FadeIn } from '@/components/ui/FadeIn';
import { PageReveal } from '@/components/ui/PageReveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EditorialGrid } from '@/components/ui/EditorialGrid';
import { CategoryBubbles } from '@/components/ui/CategoryBubbles';
import { MacWindowFrame } from '@/components/ui/MacWindowFrame';
import { NewsletterSignup } from '@/components/newsletter';
import { BallpitHero } from './BallpitHero';
import { PrintingFeaturesBanner } from './PrintingFeaturesBanner';
import { ProductScrollBanner } from './ProductScrollBanner';
import { getBestSellers, get3DPrintedProducts } from '@/lib/products-db';
import styles from './page.module.css';

const CATEGORY_ITEMS = [
  {
    label: '3D Printed',
    icon: '🖨️',
    href: '/products?fulfillment=3d-printed',
    rotation: -3,
    hoverStyles: { bgColor: '#06B6D4', textColor: '#fff' },
  },
  {
    label: 'Magnetic',
    icon: '🧲',
    href: '/products?category=Magnetic',
    rotation: -6,
    hoverStyles: { bgColor: '#3B82F6', textColor: '#fff' },
  },
  {
    label: 'Squishy',
    icon: '🫧',
    href: '/products?category=Squishy',
    rotation: 5,
    hoverStyles: { bgColor: '#06B6D4', textColor: '#fff' },
  },
  {
    label: 'Clicky',
    icon: '🎯',
    href: '/products?category=Clicky',
    rotation: 4,
    hoverStyles: { bgColor: '#3B82F6', textColor: '#fff' },
  },
  {
    label: 'Stretchy',
    icon: '🌀',
    href: '/products?category=Stretchy',
    rotation: -5,
    hoverStyles: { bgColor: '#06B6D4', textColor: '#fff' },
  },
  {
    label: 'Desk Toys',
    icon: '🖥️',
    href: '/products?category=Desk+Toy',
    rotation: 6,
    hoverStyles: { bgColor: '#3B82F6', textColor: '#fff' },
  },
  {
    label: 'Gift Sets',
    icon: '🎁',
    href: '/products?category=Gift+Set',
    rotation: -4,
    hoverStyles: { bgColor: '#06B6D4', textColor: '#fff' },
  },
];

export default async function HomePage() {
  const bestSellersData = await getBestSellers();
  const printedProductsData = await get3DPrintedProducts();

  const bestSellers = bestSellersData.filter(p => p.fulfillmentType === '3d-printed').map(p => {
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

  const printedProducts = printedProductsData.map(p => {
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
      fulfillmentType: p.fulfillmentType,
    };
  });

  return (
    <PageReveal>
      {/* 1. Hero — three-panel windowed layout */}
      <section className={styles.hero}>
        <div className={styles.heroStage}>

          {/* Left panel — tagline */}
          <div className={styles.heroSidePanel}>
            <div className={styles.heroWindowChrome} aria-hidden="true">
              <span className={styles.heroDot} style={{ background: '#ff5f57' }} />
              <span className={styles.heroDot} style={{ background: '#febc2e' }} />
              <span className={styles.heroDot} style={{ background: '#28c840' }} />
              <span className={styles.heroWindowLabel}>fidget-wrld &mdash; about</span>
            </div>
            <div className={styles.heroSidePanelBody}>
              <p className={styles.heroSideLabel}>The Fidget Shop</p>
              <p className={styles.heroTagline}>
                Built different.<br />Fidgeted everywhere.
              </p>
              <p className={styles.heroSub}>
                Custom 3D-printed toys, N52 magnetic balls, and more &mdash; made to order and shipped in days.
              </p>
            </div>
          </div>

          {/* Center — ball pit */}
          <div className={styles.heroWindow}>
            <div className={styles.heroWindowChrome} aria-hidden="true">
              <span className={styles.heroDot} style={{ background: '#ff5f57' }} />
              <span className={styles.heroDot} style={{ background: '#febc2e' }} />
              <span className={styles.heroDot} style={{ background: '#28c840' }} />
              <span className={styles.heroWindowLabel}>fidget-wrld &mdash; interactive</span>
            </div>
            <div className={styles.heroWindowCanvas}>
              <BallpitHero className={styles.heroBallpit} />
              <noscript><div className={styles.heroFallback} /></noscript>
              <div className={styles.heroLogoOverlay}>
                <Image
                  src="/images/fidget-wrld-logo-main.png"
                  alt="Fidget WRLD"
                  width={600}
                  height={400}
                  priority
                  className={styles.heroLogo}
                />
              </div>
            </div>
          </div>

          {/* Right panel — CTA + features */}
          <div className={styles.heroSidePanel}>
            <div className={styles.heroWindowChrome} aria-hidden="true">
              <span className={styles.heroDot} style={{ background: '#ff5f57' }} />
              <span className={styles.heroDot} style={{ background: '#febc2e' }} />
              <span className={styles.heroDot} style={{ background: '#28c840' }} />
              <span className={styles.heroWindowLabel}>fidget-wrld &mdash; shop</span>
            </div>
            <div className={styles.heroSidePanelBody}>
              <p className={styles.heroSideLabel}>Ready to order</p>
              <Link href="/products" className={styles.heroCta}>
                Shop Now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <ul className={styles.heroFeatures} aria-label="Key features">
                <li className={styles.heroFeatureItem}>
                  <span className={styles.heroFeatureIcon} aria-hidden="true">🚚</span>
                  <span>Free USA shipping over $50</span>
                </li>
                <li className={styles.heroFeatureItem}>
                  <span className={styles.heroFeatureIcon} aria-hidden="true">🖨️</span>
                  <span>Made to order</span>
                </li>
                <li className={styles.heroFeatureItem}>
                  <span className={styles.heroFeatureIcon} aria-hidden="true">📦</span>
                  <span>Ships in 3–5 business days</span>
                </li>
                <li className={styles.heroFeatureItem}>
                  <span className={styles.heroFeatureIcon} aria-hidden="true">✦</span>
                  <span>Custom 3D prints available</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Category Bubbles */}
      <FadeIn>
        <section style={{ padding: 'var(--space-10) 0' }}>
          <div className="container">
            <MacWindowFrame label="fidget-wrld — categories">
              <CategoryBubbles items={CATEGORY_ITEMS} />
            </MacWindowFrame>
          </div>
        </section>
      </FadeIn>

      {/* 3. Product scroll showcase */}
      <ProductScrollBanner />

      {/* 4. Custom 3D-Printed Section */}
      {printedProducts.length > 0 && (
        <FadeIn>
          <section className={styles.printedSection}>
            <div className="container">
              <MacWindowFrame label="fidget-wrld — 3d-printed">
                <div className={styles.printedInner}>
                  <div className={styles.printedHeader}>
                    <div>
                      <SectionHeading
                        heading="Custom 3D-Printed Fidgets"
                        eyebrow="Made to Order"
                      />
                      <p className={styles.printedSubheading}>
                        Designed by you. Printed by us. Shipped in 3&ndash;5 days.
                      </p>
                    </div>
                    <Link href="/products?fulfillment=3d-printed" className={styles.printedCta}>
                      Shop 3D Printed &rarr;
                    </Link>
                  </div>
                  <EditorialGrid layout="row">
                    {printedProducts.slice(0, 3).map((p, i) => (
                      <ProductCard
                        key={p.sku}
                        product={p}
                        slug={p.slug}
                        meta={p.meta}
                        priority={i < 4}
                        variantCount={p.variantCount}
                        allOutOfStock={p.allOutOfStock}
                        badges={{ isNew: true }}
                        fulfillmentType={p.fulfillmentType}
                      />
                    ))}
                  </EditorialGrid>
                </div>
              </MacWindowFrame>
            </div>
          </section>
        </FadeIn>
      )}

      {/* 5. Best Sellers */}
      {bestSellers.length > 0 && (
        <FadeIn>
          <section className={styles.productsSection}>
            <div className="container">
              <MacWindowFrame label="fidget-wrld — best-sellers">
                <div className={styles.sectionWindowBody}>
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
              </MacWindowFrame>
            </div>
          </section>
        </FadeIn>
      )}

      {/* 6. Features Banner — 3D printing, shipping, support, customization */}
      <FadeIn>
        <PrintingFeaturesBanner />
      </FadeIn>

      {/* 5. Newsletter */}
      <FadeIn>
        <section className={styles.newsletterSection}>
          <div className="container">
            <MacWindowFrame label="fidget-wrld — newsletter">
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
            </MacWindowFrame>
          </div>
        </section>
      </FadeIn>

      {/* 7. Support Banner */}
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
