import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ProductCard } from '@/components/product/ProductCard';
import { FadeIn } from '@/components/ui/FadeIn';
import { PageReveal } from '@/components/ui/PageReveal';
import { GlassSurface } from '@/components/effects/GlassSurface';
import { FidgetWrldLogo } from '@/components/ui/FidgetWrldLogo';
import { NewsletterSignup } from '@/components/newsletter';
import { getBestSellers } from '@/lib/products-db';
import styles from './page.module.css';

const LiquidGlassProvider = dynamic(
  () => import('@/components/effects/LiquidGlass').then(m => m.LiquidGlassProvider)
);

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
    };
  });
  return (
    <PageReveal>
      <section className={styles.hero} id="top">
        <div className={styles.heroInner}>
          <FidgetWrldLogo className={styles.heroLogo} size="lg" />
          <h1 className={styles.heroTitle}>Premium Fidget Toys.<br />Endless Satisfaction.</h1>
          <p className={styles.heroSubtitle}>
            Discover magnetic balls, squishy toys, clicky cubes, and more. Quality fidgets for focus, calm, and play.
          </p>
          <Link href="/products" className="btn btn-primary">Shop Fidgets</Link>
        </div>
        <div className={styles.scrollIndicator} aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      <section className={`${styles.statStrip} reveal-item`}>
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
      </section>

      <FadeIn><section className={styles.infoSection}>
        <div className="container">
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h4>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.85 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
                Safe &amp; Durable
              </h4>
              <p>Non-toxic materials that pass strict safety testing. Built to last through endless fidgeting.</p>
            </div>
            <div className={styles.infoCard}>
              <h4>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.85 }}><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
                Sensory Satisfaction
              </h4>
              <p>Carefully designed textures and feedback for the most satisfying fidget experience.</p>
            </div>
            <div className={styles.infoCard}>
              <h4>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.85 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                Friendly Support
              </h4>
              <p>Questions? Our team is here to help you find the perfect fidget for your needs.</p>
            </div>
            <div className={styles.infoCard}>
              <h4>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.85 }}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                Secure Checkout
              </h4>
              <p>Safe payments with 256-bit SSL encryption. Shop with confidence.</p>
            </div>
          </div>
        </div>
      </section></FadeIn>

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

      {/* Why Fidget WRLD Banner */}
      <FadeIn><section className={styles.qualityBanner}>
        <div className="container">
          <div className={styles.qualityBannerInner}>
            <div className={styles.qualityBannerContent}>
              <h2>Why Choose Fidget WRLD?</h2>
              <p>
                We handpick every fidget toy in our collection for quality, durability, and that perfect satisfying feel. From magnetic desk toys to squishy stress relievers, we have something for every fidgeter.
              </p>
              <div className={styles.qualityBannerFeatures}>
                <div className={styles.qualityFeature}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Premium Materials</span>
                </div>
                <div className={styles.qualityFeature}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Safety Tested</span>
                </div>
                <div className={styles.qualityFeature}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

      <LiquidGlassProvider targets={[
        {
          selector: '[data-liquid-glass="hero-stat"]',
          options: { thickness: 50, bezel: 35, ior: 1.6, blur: 0.4, specular: 0.5, radius: 10, surface: 'convex_squircle' },
        },
        {
          selector: '.product-card-image',
          options: { thickness: 30, bezel: 20, ior: 1.8, blur: 0.5, specular: 0.3, radius: 8, surface: 'convex_squircle' },
          hover: true,
        },
      ]} />
    </PageReveal>
  );
}
