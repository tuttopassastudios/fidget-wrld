import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { FadeIn } from '@/components/ui/FadeIn';
import { PageReveal } from '@/components/ui/PageReveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EditorialGrid } from '@/components/ui/EditorialGrid';
import { PolkaDots } from '@/components/ui/DecorativePatterns';
import { GlassSurface } from '@/components/effects/GlassSurface';
import { NewsletterSignup } from '@/components/newsletter';
import { HeroBanner } from '@/components/hero/HeroBanner';
import { RecommendationCarousel } from '@/components/product/RecommendationCarousel';
import { DesignerSpotlight } from '@/components/about/DesignerSpotlight';
import { designers } from '@/data/designers';
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

  const featuredDesigner = designers[0];

  return (
    <PageReveal>
      {/* 1. Hero Banner */}
      <HeroBanner
        headline="Premium Fidget Toys. Endless Satisfaction."
        subtitle="Discover the world's most satisfying fidget toys — designed for focus, calm, and endless play."
        ctaText="Shop Now"
        ctaHref="/products"
        mediaType="image"
        mediaSrc="/images/products/mag-balls-rainbow.webp"
      />

      {/* 2. Stats Strip */}
      <FadeIn><section className={`${styles.statStrip} reveal-item`}>
        <div className="container">
          <div className={styles.statRow}>
            <GlassSurface width="100%" height="100%" borderRadius={10} blur={8} backgroundOpacity={0.06} distortionScale={-120} className={styles.statGlass}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>100+</div>
                <div className={styles.statLabel}>Unique Fidgets</div>
              </div>
            </GlassSurface>
            <GlassSurface width="100%" height="100%" borderRadius={10} blur={8} backgroundOpacity={0.06} distortionScale={-120} className={styles.statGlass}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>Premium</div>
                <div className={styles.statLabel}>Quality Materials</div>
              </div>
            </GlassSurface>
            <GlassSurface width="100%" height="100%" borderRadius={10} blur={8} backgroundOpacity={0.06} distortionScale={-120} className={styles.statGlass}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>Fast</div>
                <div className={styles.statLabel}>Same-Day Shipping</div>
              </div>
            </GlassSurface>
            <GlassSurface width="100%" height="100%" borderRadius={10} blur={8} backgroundOpacity={0.06} distortionScale={-120} className={styles.statGlass}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>Free</div>
                <div className={styles.statLabel}>Returns &amp; Exchanges</div>
              </div>
            </GlassSurface>
          </div>
        </div>
      </section></FadeIn>

      {/* 3. Polka-dot section divider */}
      <div className={styles.sectionDivider} aria-hidden="true">
        <PolkaDots pattern="border" size="sm" />
      </div>

      {/* 4. Info Cards Grid */}
      <FadeIn><section className={styles.infoSection}>
        <div className="container">
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
                Safe &amp; Durable
              </h3>
              <p>Non-toxic materials that pass strict safety testing. Built to last through endless fidgeting.</p>
            </div>
            <div className={styles.infoCard}>
              <h3>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
                Sensory Satisfaction
              </h3>
              <p>Carefully designed textures and feedback for the most satisfying fidget experience.</p>
            </div>
            <div className={styles.infoCard}>
              <h3>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                Friendly Support
              </h3>
              <p>Questions? Our team is here to help you find the perfect fidget for your needs.</p>
            </div>
            <div className={styles.infoCard}>
              <h3>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                Secure Checkout
              </h3>
              <p>Safe payments with 256-bit SSL encryption. Shop with confidence.</p>
            </div>
          </div>
        </div>
      </section></FadeIn>

      {/* 5. Polka-dot section divider */}
      <div className={styles.sectionDivider} aria-hidden="true">
        <PolkaDots pattern="border" size="sm" />
      </div>

      {/* 6. Best Sellers — EditorialGrid with featured layout */}
      <FadeIn><section className={styles.productsSection}>
        <div className="container">
          <div className={styles.bestSellersHeader}>
            <SectionHeading heading="Best Sellers" eyebrow="Fan Favorites" dotAccent />
            <Link href="/products" className={styles.viewAllLink}>View All &rarr;</Link>
          </div>
          <EditorialGrid layout="featured">
            {bestSellers.map((p, i) => (
              <ProductCard key={p.sku} product={p} slug={p.slug} meta={p.meta} priority={i < 3} variantCount={p.variantCount} />
            ))}
          </EditorialGrid>
        </div>
      </section></FadeIn>

      {/* 7. Trending Now Carousel */}
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

      {/* 8. Polka-dot section divider */}
      <div className={styles.sectionDivider} aria-hidden="true">
        <PolkaDots pattern="border" size="sm" />
      </div>

      {/* 9. Designer Spotlight Teaser */}
      <FadeIn><section className={styles.designerTeaser}>
        <div className="container">
          <SectionHeading heading="Behind the Design" eyebrow="Meet the Makers" dotAccent />
          <DesignerSpotlight designer={featuredDesigner} products={allProducts} layout="left" />
          <Link href="/about" className={styles.designerTeaserLink}>Meet All Designers &rarr;</Link>
        </div>
      </section></FadeIn>

      {/* 10. Polka-dot section divider */}
      <div className={styles.sectionDivider} aria-hidden="true">
        <PolkaDots pattern="border" size="sm" />
      </div>

      {/* 11. Quality Banner */}
      <FadeIn><section className={styles.qualityBanner}>
        <div className="container">
          <div className={styles.qualityBannerInner}>
            <div className={styles.qualityBannerContent}>
              <SectionHeading heading="Why Choose Fidget WRLD?" align="center" />
              <p>
                We handpick every fidget toy in our collection for quality, durability, and that perfect satisfying feel. From magnetic desk toys to squishy stress relievers, we have something for every fidgeter.
              </p>
              <div className={styles.qualityBannerFeatures}>
                <div className={styles.qualityFeature}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Premium Materials</span>
                </div>
                <div className={styles.qualityFeature}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Safety Tested</span>
                </div>
                <div className={styles.qualityFeature}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Satisfaction Guaranteed</span>
                </div>
              </div>
              <Link href="/about" className="btn btn-secondary" style={{ marginTop: 24 }}>Learn More About Us</Link>
            </div>
          </div>
        </div>
      </section></FadeIn>

      {/* 12. Newsletter Signup */}
      <FadeIn><section className={styles.newsletterSection}>
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
      </section></FadeIn>
    </PageReveal>
  );
}
