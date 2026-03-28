import type { Metadata } from 'next';
import { designers } from '@/data/designers';
import { productPages } from '@/data/products';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { DesignerCard } from '@/components/about/DesignerCard';
import { DesignerSpotlight } from '@/components/about/DesignerSpotlight';
import styles from '@/components/about/DesignerSpotlight.module.css';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Fidget WRLD brings you premium fidget toys for focus, calm, and play. Quality materials, endless satisfaction.',
};

export default function AboutPage() {
  return (
    <section className="product-page" style={{ padding: '48px 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 style={{ marginBottom: 24 }}>About Fidget WRLD</h1>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
          Welcome to Fidget WRLD - your destination for premium fidget toys that deliver endless satisfaction. We believe everyone deserves access to quality sensory tools that help with focus, stress relief, and just plain fun.
        </p>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
          Our carefully curated collection features the best fidget toys from around the world. From ultra-strong N52 magnetic balls to satisfying pop-its and premium desk toys, every product is selected for quality, durability, and that perfect fidget feel.
        </p>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
          Whether you are looking for something to keep your hands busy during meetings, help your kids focus, or just want a fun desk companion, we have got you covered.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 32 }}>
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" style={{ marginBottom: 12 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Safe Materials</h4>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>All products are made from non-toxic, durable materials that pass strict safety testing.</p>
          </div>
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" style={{ marginBottom: 12 }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
            <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Satisfaction First</h4>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>We test every product ourselves to ensure it delivers that perfect, satisfying fidget experience.</p>
          </div>
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" style={{ marginBottom: 12 }}>
              <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Fast Shipping</h4>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>Same-day processing on orders placed before 2pm. Get your fidgets fast!</p>
          </div>
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" style={{ marginBottom: 12 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Friendly Support</h4>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>Questions? Our team is here to help you find the perfect fidget for your needs.</p>
          </div>
        </div>

        <div style={{ marginTop: 48, padding: 32, background: 'var(--color-bg-elevated)', borderRadius: 16, textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>Our Mission</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
            To bring joy and focus to fidgeters everywhere through quality products, exceptional service, and a genuine passion for all things fidget.
          </p>
        </div>
      </div>

      {/* Meet the Makers */}
      <div className="container" style={{ maxWidth: 900, marginTop: 'var(--space-16)' }}>
        <SectionHeading
          heading="Meet the Makers"
          eyebrow="The Team"
          align="center"
          dotAccent
        />
        <p className={styles.introText}>
          The creative minds behind every click, squish, and spin.
        </p>
        <div className={styles.designersGrid}>
          {designers.map((designer) => (
            <DesignerCard key={designer.id} designer={designer} />
          ))}
        </div>

        <div className={styles.spotlightsContainer}>
          {designers.map((designer, i) => (
            <DesignerSpotlight
              key={designer.id}
              designer={designer}
              products={productPages}
              layout={i % 2 === 0 ? 'left' : 'right'}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
