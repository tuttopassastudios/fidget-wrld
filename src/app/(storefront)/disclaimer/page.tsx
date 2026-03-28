import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Fidget WRLD product safety and usage disclaimer. Important information about our products.',
};

export default function DisclaimerPage() {
  return (
    <section className="product-page" style={{ padding: '48px 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 style={{ marginBottom: 24 }}>Disclaimer</h1>
        <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>

          <div style={{ background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)', borderRadius: 8, padding: 24, marginBottom: 24 }}>
            <h3 style={{ color: 'var(--color-warning-text)', marginBottom: 12, fontSize: 16 }}>IMPORTANT SAFETY INFORMATION</h3>
            <p>Some products contain small parts and strong magnets. Please observe all age recommendations and safety guidelines for each product. Adult supervision is recommended for children.</p>
          </div>

          <h2 style={{ fontSize: 18, marginBottom: 12, marginTop: 32, color: 'var(--color-text-primary)' }}>Product Safety</h2>
          <p style={{ marginBottom: 16 }}>
            All Fidget WRLD products are designed with safety in mind and are made from non-toxic materials. However, some products have specific safety considerations:
          </p>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li style={{ marginBottom: 8 }}><strong>Magnetic products</strong> (N52 Magnetic Balls, Magnetic Putty): Contain strong neodymium magnets. Keep away from children under 14, pacemakers, credit cards, and electronic devices. Swallowing magnets can cause serious injury.</li>
            <li style={{ marginBottom: 8 }}><strong>Small parts</strong>: Many fidget toys contain small parts that may pose a choking hazard for children under 3 years old.</li>
            <li style={{ marginBottom: 8 }}><strong>Squishy toys</strong>: Not intended to be bitten or chewed. Keep away from pets.</li>
          </ul>

          <h2 style={{ fontSize: 18, marginBottom: 12, marginTop: 32, color: 'var(--color-text-primary)' }}>Intended Use</h2>
          <p style={{ marginBottom: 16 }}>
            Fidget WRLD products are designed for recreational use, stress relief, and sensory stimulation. They are not medical devices and are not intended to diagnose, treat, cure, or prevent any medical condition.
          </p>

          <h2 style={{ fontSize: 18, marginBottom: 12, marginTop: 32, color: 'var(--color-text-primary)' }}>Age Recommendations</h2>
          <p style={{ marginBottom: 16 }}>
            Please observe the age recommendation listed on each product page. These recommendations are based on:
          </p>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li style={{ marginBottom: 8 }}>Small parts and choking hazard considerations</li>
            <li style={{ marginBottom: 8 }}>Magnet strength and safety</li>
            <li style={{ marginBottom: 8 }}>Required dexterity and understanding for safe use</li>
          </ul>

          <h2 style={{ fontSize: 18, marginBottom: 12, marginTop: 32, color: 'var(--color-text-primary)' }}>Limitation of Liability</h2>
          <p style={{ marginBottom: 16 }}>
            Fidget WRLD is not responsible for any injury, damage, or loss resulting from misuse of products or failure to follow safety guidelines. By purchasing our products, you agree to use them responsibly and in accordance with the intended purpose and age recommendations.
          </p>

          <h2 style={{ fontSize: 18, marginBottom: 12, marginTop: 32, color: 'var(--color-text-primary)' }}>Product Accuracy</h2>
          <p style={{ marginBottom: 16 }}>
            We strive to display product colors and images as accurately as possible. However, actual colors may vary slightly due to monitor settings and photography. Product dimensions and weights are approximate.
          </p>

          <p style={{ marginTop: 32, fontSize: 14, color: 'var(--color-text-muted)' }}>
            Last updated: March 2026
          </p>
        </div>
      </div>
    </section>
  );
}
