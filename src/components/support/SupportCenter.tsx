'use client';

import { FaqAccordion } from '@/components/ui/FaqAccordion';
import { FadeIn } from '@/components/ui/FadeIn';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PolkaDots } from '@/components/ui/DecorativePatterns';
import { ContactForm } from './ContactForm';
import { SocialLinks } from './SocialLinks';
import styles from './SupportCenter.module.css';

interface SupportCenterProps {
  faqItems: { question: string; answer: string; category?: string }[];
}

const stats = [
  { value: '16', label: 'Questions' },
  { value: '4', label: 'Categories' },
  { value: 'Free', label: 'Shipping $35+' },
  { value: '30-Day', label: 'Returns' },
];

export function SupportCenter({ faqItems }: SupportCenterProps) {
  return (
    <section className="product-page">
      <div className="container" style={{ maxWidth: 1200 }}>
        {/* Hero */}
        <div className={styles.hero}>
          <PolkaDots pattern="scatter" size="sm" className={styles.heroDecoration} />
          <SectionHeading
            heading="How Can We Help?"
            eyebrow="Support Center"
            align="center"
            dotAccent
            as="h1"
          />
          <p className={styles.intro}>
            Find answers to common questions or reach out to our team.
          </p>
        </div>

        {/* Stats strip */}
        <FadeIn>
          <div className={styles.statsStrip}>
            {stats.map(stat => (
              <div key={stat.label} className={styles.statCard}>
                <p className={styles.statValue}>{stat.value}</p>
                <p className={styles.statLabel}>{stat.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Main grid: FAQ + Contact */}
        <FadeIn>
          <div className={styles.mainGrid}>
            {/* FAQ column */}
            <div className={styles.faqColumn}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-bold)',
                marginBottom: 'var(--space-6)',
                color: 'var(--color-text-primary)',
              }}>
                Frequently Asked Questions
              </h2>
              <FaqAccordion items={faqItems} />
            </div>

            {/* Contact column */}
            <div>
              <div className={styles.contactCard}>
                <h2 className={styles.contactHeading}>Send Us a Message</h2>
                <ContactForm />
              </div>
              <SocialLinks />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
