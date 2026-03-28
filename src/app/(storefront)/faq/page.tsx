import type { Metadata } from 'next';
import { FadeIn } from '@/components/ui/FadeIn';
import { FaqAccordion } from '@/components/ui/FaqAccordion';
import styles from './faq.module.css';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Fidget WRLD products, ordering, shipping, and returns.',
};

const faqItems = [
  // ── Products ──
  { question: 'Are your fidget toys safe for kids?', answer: 'Yes! All our products are made from non-toxic materials and undergo safety testing. However, some products like magnetic balls contain small parts and are recommended for ages 14+. Always check the age recommendation on each product page.', category: 'Products' },
  { question: 'What are N52 magnetic balls made of?', answer: 'Our magnetic balls are made from N52 grade neodymium iron boron (NdFeB), the strongest permanent magnet material available. They feature a triple-layer nickel-copper-nickel coating for durability and a smooth finish.', category: 'Products' },
  { question: 'How do I clean my fidget toys?', answer: 'Most of our silicone products (Pop Its, Simple Dimples) can be cleaned with mild soap and water. For magnetic products, wipe with a dry cloth. Stress balls and squishy toys should be wiped with a damp cloth and air dried.', category: 'Products' },
  { question: 'What if my fidget toy breaks?', answer: 'We stand behind our products! If your fidget toy breaks within 30 days of purchase under normal use, contact us for a free replacement. We want you to be completely satisfied with your purchase.', category: 'Products' },
  { question: 'Are the magnetic balls strong enough to hold shapes?', answer: 'Absolutely! Our N52 grade magnets are the strongest available and can hold complex 3D structures. Each 5mm sphere has a pull force of approximately 0.9 lbs, providing secure connections for intricate builds.', category: 'Products' },

  // ── Ordering ──
  { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) and PayPal. All transactions are processed securely with 256-bit SSL encryption.', category: 'Ordering' },
  { question: 'Do you offer bulk or wholesale pricing?', answer: 'Yes! We offer automatic bulk discounts: 10% off 3+ items, 15% off 5+ items, and 20% off 10+ items. For larger wholesale orders, please contact us directly.', category: 'Ordering' },
  { question: 'Can I modify or cancel my order?', answer: 'Orders can be modified or cancelled within 1 hour of placement before they enter processing. Contact our support team immediately if you need to make changes.', category: 'Ordering' },
  { question: 'Do you offer gift wrapping?', answer: 'Yes! You can add gift wrapping to individual items during checkout for a small fee. We will include a gift receipt without pricing and add festive packaging.', category: 'Ordering' },

  // ── Shipping & Delivery ──
  { question: 'How much is shipping?', answer: 'Standard shipping is $5.99 (5-7 business days), or FREE on orders over $35! Priority shipping (2-3 business days) is $9.99, and express shipping (1-2 business days) is $14.99.', category: 'Shipping & Delivery' },
  { question: 'Do you provide tracking?', answer: 'Yes! Once your order ships, you will receive an email with tracking information. You can also track your order status from your account dashboard.', category: 'Shipping & Delivery' },
  { question: 'Do you ship internationally?', answer: 'Currently, we ship within the United States only. We are working to expand our shipping to select international markets soon. Sign up for our newsletter to be notified!', category: 'Shipping & Delivery' },
  { question: 'How long does processing take?', answer: 'Orders placed before 2pm EST are processed same-day! Orders placed after 2pm are processed the next business day.', category: 'Shipping & Delivery' },

  // ── Returns & Support ──
  { question: 'What is your return policy?', answer: 'We offer hassle-free returns within 30 days of delivery. Items must be in original condition with packaging. Contact us to start a return and we will provide a prepaid shipping label.', category: 'Returns & Support' },
  { question: 'What if my order arrives damaged?', answer: 'If your order arrives damaged, contact us within 48 hours with photos of the damage. We will arrange a replacement or full refund at no additional cost to you.', category: 'Returns & Support' },
  { question: 'How can I contact support?', answer: 'You can reach us via the Contact page or email hello@fidgetwrld.com. We respond to all inquiries within 24 hours during business days (Monday-Friday, 9AM-5PM EST).', category: 'Returns & Support' },
  { question: 'Do you have a satisfaction guarantee?', answer: 'Yes! If you are not completely satisfied with your purchase, contact us within 30 days for a full refund or exchange. We want you to love your fidgets!', category: 'Returns & Support' },
];

export default function FaqPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section className={`product-page ${styles.pageSection}`}>
      <div className={`container ${styles.pageContainer}`}>

        {/* ── Hero / Intro ── */}
        <div className={styles.heroSection}>
          <p className={styles.heroBadge}>
            Support
          </p>
          <h1 className={styles.heroTitle}>
            Frequently Asked Questions
          </h1>
          <p className={styles.heroDescription}>
            Everything you need to know about our fidget toys, ordering, shipping, and returns. Can&apos;t find what you&apos;re looking for? Reach out through our Contact page.
          </p>
          <span className={`badge-primary ${styles.heroTag}`}>
            {faqItems.length} Questions Answered
          </span>
        </div>

        {/* ── Stats Strip ── */}
        <FadeIn><div className={styles.statsStrip}>
          {[
            { value: `${faqItems.length}`, label: 'Questions' },
            { value: '4', label: 'Categories' },
            { value: 'Free', label: 'Shipping $35+' },
            { value: '30-Day', label: 'Returns' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`${styles.statItem} ${i !== 0 ? styles.statItemBorder : ''}`}
            >
              <p className={styles.statValue}>
                {stat.value}
              </p>
              <p className={styles.statLabel}>
                {stat.label}
              </p>
            </div>
          ))}
        </div></FadeIn>

        {/* ── FAQ Accordion ── */}
        <div className={styles.faqSection}>
          <p className={styles.faqSectionLabel}>
            Browse Questions
          </p>
          <FaqAccordion items={faqItems} />
        </div>

        {/* ── Still Have Questions? ── */}
        <FadeIn><div className={styles.ctaSection}>
          <div className={`card ${styles.ctaCard}`}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={styles.ctaIcon}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <h3 className={styles.ctaTitle}>
              Still have questions?
            </h3>
            <p className={styles.ctaDescription}>
              Our team is here to help with product questions and order support. We respond within 24 hours on business days.
            </p>
            <a
              href="/contact"
              className={`btn btn-primary ${styles.ctaButton}`}
            >
              Contact Us
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div></FadeIn>

      </div>
    </section>
    </>
  );
}
