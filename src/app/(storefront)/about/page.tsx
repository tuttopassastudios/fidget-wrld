import type { Metadata } from 'next';
import { designers } from '@/data/designers';
import { productPages } from '@/data/products';
import { FadeIn } from '@/components/ui/FadeIn';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { DesignerCard } from '@/components/about/DesignerCard';
import { DesignerSpotlight } from '@/components/about/DesignerSpotlight';
import dsStyles from '@/components/about/DesignerSpotlight.module.css';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Fidget WRLD brings you premium fidget toys for focus, calm, and play. Quality materials, endless satisfaction.',
};

export default function AboutPage() {
  return (
    <section className={`product-page ${styles.pageSection}`}>
      <div className={`container ${styles.contentContainer}`}>
        <h1 className={styles.pageTitle}>About Fidget WRLD</h1>
        <p className={styles.bodyText}>
          Welcome to Fidget WRLD - your destination for premium fidget toys that deliver endless satisfaction. We believe everyone deserves access to quality sensory tools that help with focus, stress relief, and just plain fun.
        </p>
        <p className={styles.bodyText}>
          Our carefully curated collection features the best fidget toys from around the world. From ultra-strong N52 magnetic balls to satisfying pop-its and premium desk toys, every product is selected for quality, durability, and that perfect fidget feel.
        </p>
        <p className={styles.bodyText}>
          Whether you are looking for something to keep your hands busy during meetings, help your kids focus, or just want a fun desk companion, we have got you covered.
        </p>
        <FadeIn><div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" className={styles.featureIcon}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <h3 className={styles.featureTitle}>Safe Materials</h3>
            <p className={styles.featureDescription}>All products are made from non-toxic, durable materials that pass strict safety testing.</p>
          </div>
          <div className={styles.featureCard}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" className={styles.featureIcon}>
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
            <h3 className={styles.featureTitle}>Satisfaction First</h3>
            <p className={styles.featureDescription}>We test every product ourselves to ensure it delivers that perfect, satisfying fidget experience.</p>
          </div>
          <div className={styles.featureCard}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" className={styles.featureIcon}>
              <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <h3 className={styles.featureTitle}>Fast Shipping</h3>
            <p className={styles.featureDescription}>Same-day processing on orders placed before 2pm. Get your fidgets fast!</p>
          </div>
          <div className={styles.featureCard}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" className={styles.featureIcon}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <h3 className={styles.featureTitle}>Friendly Support</h3>
            <p className={styles.featureDescription}>Questions? Our team is here to help you find the perfect fidget for your needs.</p>
          </div>
        </div></FadeIn>

        <div className={styles.missionBanner}>
          <h2 className={styles.missionTitle}>Our Mission</h2>
          <p className={styles.missionText}>
            To bring joy and focus to fidgeters everywhere through quality products, exceptional service, and a genuine passion for all things fidget.
          </p>
        </div>
      </div>

      {/* Meet the Makers */}
      <div className={`container ${styles.makersContainer}`}>
        <SectionHeading
          heading="Meet the Makers"
          eyebrow="The Team"
          align="center"
          dotAccent
        />
        <p className={dsStyles.introText}>
          The creative minds behind every click, squish, and spin.
        </p>
        <FadeIn><div className={dsStyles.designersGrid}>
          {designers.map((designer) => (
            <DesignerCard key={designer.id} designer={designer} />
          ))}
        </div></FadeIn>

        <div className={dsStyles.spotlightsContainer}>
          {designers.map((designer, i) => (
            <FadeIn key={designer.id}>
              <DesignerSpotlight
                designer={designer}
                products={productPages}
                layout={i % 2 === 0 ? 'left' : 'right'}
              />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
