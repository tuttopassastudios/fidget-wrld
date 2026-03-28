import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quality & Safety',
  description: 'Learn about Fidget WRLD quality standards: safety testing, material quality, durability testing, and our commitment to premium fidget toys.',
};

export default function QualityPage() {
  return (
    <section className="product-page" style={{ padding: '0 0 64px' }}>
      <div className="container" style={{ maxWidth: 900 }}>

        {/* ── 1. Hero / Intro ── */}
        <div style={{ padding: '64px 0 48px', borderBottom: '1px solid var(--color-border)' }}>
          <p style={{
            fontSize: 'var(--text-xs)',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: 'var(--color-accent-primary)',
            marginBottom: 16,
            fontWeight: 700,
          }}>
            Quality & Safety
          </p>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>
            Premium Quality. Rigorously Tested.
          </h1>
          <p style={{
            color: 'var(--color-text-secondary)',
            lineHeight: 1.7,
            maxWidth: 700,
            marginBottom: 20,
            fontSize: 'var(--text-base)',
          }}>
            Every fidget toy in our collection undergoes thorough quality and safety testing. We partner with certified testing facilities to ensure our products meet the highest standards for durability, safety, and sensory satisfaction.
          </p>
          <span className="badge-primary" style={{ fontSize: 'var(--text-xs)', padding: '6px 14px', borderRadius: 9999 }}>
            Safety Certified
          </span>
        </div>

        {/* ── 2. Stats Strip ── */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          padding: '48px 0',
          borderBottom: '1px solid var(--color-border)',
        }}>
          {[
            { value: '100%', label: 'Safety Tested' },
            { value: '10K+', label: 'Click Cycles' },
            { value: '100+', label: 'Unique Products' },
            { value: '30-Day', label: 'Returns' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              style={{
                flex: '1 1 140px',
                textAlign: 'center',
                padding: '16px 0',
                borderLeft: i === 0 ? 'none' : '1px solid var(--color-border)',
              }}
            >
              <p style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 700,
                color: 'var(--color-accent-primary)',
                letterSpacing: '-1px',
                lineHeight: 1,
                marginBottom: 8,
              }}>
                {stat.value}
              </p>
              <p style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: 'var(--color-text-muted)',
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── 3. Testing Methods ── */}
        <div style={{ padding: '48px 0', borderBottom: '1px solid var(--color-border)' }}>
          <p style={{
            fontSize: 'var(--text-xs)',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: 'var(--color-text-muted)',
            marginBottom: 32,
            fontWeight: 700,
          }}>
            Our Testing Standards
          </p>

          <div className="testing-methods-grid">
            {/* Safety Testing */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 2 L4 5 L4 9 C4 13 6.5 16 10 18 C13.5 16 16 13 16 9 L16 5 Z" />
                  <path d="M7 10 L9 12 L13 8" />
                </svg>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Safety Testing</h3>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: 'var(--text-sm)' }}>
                All products are tested for compliance with ASTM F963 toy safety standards. We verify materials are lead-free, phthalate-free, and meet all applicable safety regulations for toys.
              </p>
            </div>

            {/* Durability Testing */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="10" cy="10" r="7" />
                  <path d="M10 6 L10 10 L13 12" />
                </svg>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Durability Testing</h3>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: 'var(--text-sm)' }}>
                Our fidget toys undergo extensive durability testing including 10,000+ click cycles, drop tests, and stress tests. We ensure every product can withstand thousands of hours of satisfying fidgeting.
              </p>
            </div>

            {/* Material Quality */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="14" height="14" rx="2" />
                  <path d="M7 7 L13 7 M7 10 L13 10 M7 13 L10 13" />
                </svg>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Material Quality</h3>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: 'var(--text-sm)' }}>
                We source only premium materials: N52 grade neodymium magnets, medical-grade silicone, aircraft-grade aluminum, and high-quality ABS plastics. Every material is chosen for safety, durability, and that perfect sensory feel.
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. Safety Standards ── */}
        <div style={{ padding: '48px 0', borderBottom: '1px solid var(--color-border)' }} id="safety">
          <p style={{
            fontSize: 'var(--text-xs)',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: 'var(--color-text-muted)',
            marginBottom: 32,
            fontWeight: 700,
          }}>
            Safety Standards
          </p>

          <div className="card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 12 }}>
              Certified Safe Materials
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 24, fontSize: 'var(--text-sm)' }}>
              Every product meets or exceeds safety standards for toys sold in the United States, European Union, and other major markets.
            </p>

            <div style={{ display: 'grid', gap: 14 }}>
              {[
                'Lead-free and phthalate-free materials',
                'Non-toxic coatings and finishes',
                'ASTM F963 toy safety compliant',
                'Small parts warnings where applicable',
                'Age recommendations clearly labeled',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="9" cy="9" r="8" stroke="#34D399" strokeWidth="1.5" />
                    <path d="M6 9 L8 11 L12 7" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 5. Care Instructions ── */}
        <div style={{ padding: '48px 0', borderBottom: '1px solid var(--color-border)' }} id="care">
          <p style={{
            fontSize: 'var(--text-xs)',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: 'var(--color-text-muted)',
            marginBottom: 32,
            fontWeight: 700,
          }}>
            Care Instructions
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {/* General Care */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="10" cy="10" r="7" />
                  <path d="M10 6 v8 M6 10 h8" />
                </svg>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>General Care</h3>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: 'var(--text-sm)', marginBottom: 16 }}>
                Keep your fidget toys in top condition with these simple care tips.
              </p>
              <div style={{ display: 'grid', gap: 8 }}>
                {[
                  'Clean with mild soap and water',
                  'Dry thoroughly before storage',
                  'Store in a cool, dry place',
                  'Keep away from extreme heat',
                ].map((item) => (
                  <p key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-accent-primary)', flexShrink: 0 }} />
                    {item}
                  </p>
                ))}
              </div>
            </div>

            {/* Magnetic Products */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 8 C4 4.5 6.5 2 10 2 C13.5 2 16 4.5 16 8" />
                  <path d="M4 8 L4 14 M16 8 L16 14" />
                  <rect x="2" y="14" width="4" height="4" rx="1" />
                  <rect x="14" y="14" width="4" height="4" rx="1" />
                </svg>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Magnetic Products</h3>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: 'var(--text-sm)', marginBottom: 16 }}>
                Special care for magnetic balls and magnetic putty products.
              </p>
              <div style={{ display: 'grid', gap: 8 }}>
                {[
                  'Keep away from electronics and credit cards',
                  'Not for children under 14',
                  'Keep away from pacemakers',
                  'Store in provided container',
                ].map((item) => (
                  <p key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-accent-primary)', flexShrink: 0 }} />
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 6. Our Promise ── */}
        <div style={{ padding: '48px 0', borderBottom: '1px solid var(--color-border)' }}>
          <p style={{
            fontSize: 'var(--text-xs)',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: 'var(--color-text-muted)',
            marginBottom: 12,
            fontWeight: 700,
          }}>
            Our Promise
          </p>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 32, fontSize: 'var(--text-sm)', maxWidth: 640 }}>
            We stand behind every product we sell with our satisfaction guarantee.
          </p>

          <div style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '8px 24px',
          }}>
            {[
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 2 L4 5 L4 9 C4 12.5 6 15.5 9 17 C12 15.5 14 12.5 14 9 L14 5 Z" />
                  </svg>
                ),
                text: '30-day satisfaction guarantee on all products',
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="14" height="10" rx="2" />
                    <path d="M6 8 L8 10 L12 6" />
                  </svg>
                ),
                text: 'Free returns and exchanges for defective products',
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="9" r="7" />
                    <path d="M9 5 v4 l3 2" />
                  </svg>
                ),
                text: 'Fast shipping on all orders',
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                ),
                text: 'Responsive customer support team',
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="8" width="10" height="8" rx="2" />
                    <path d="M6 8 L6 5 C6 3 7.5 1.5 9 1.5 C10.5 1.5 12 3 12 5 L12 8" />
                  </svg>
                ),
                text: '256-bit SSL encryption secures all transactions',
              },
            ].map((item, i, arr) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '16px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                  color: 'var(--color-accent-primary)',
                }}
              >
                <span style={{ flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. Safety Notice ── */}
        <div style={{ padding: '48px 0 0' }}>
          <div className="disclaimer-box">
            <div className="disclaimer-box-title">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 14 L9 3 L15 14 Z" />
                <line x1="9" y1="8" x2="9" y2="10.5" />
                <circle cx="9" cy="12" r="0.5" fill="currentColor" />
              </svg>
              Important Safety Information
            </div>
            <p style={{ marginBottom: 12 }}>
              Some products contain small parts or strong magnets. Always observe the age recommendations and safety guidelines listed on each product page. Adult supervision is recommended for children.
            </p>
            <p>
              Magnetic products should be kept away from pacemakers, credit cards, and electronic devices. If magnets are swallowed, seek immediate medical attention.
            </p>
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 24 }}>
            <a href="/disclaimer" style={{ color: 'var(--color-accent-primary)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
              Full Disclaimer →
            </a>
            <a href="/terms" style={{ color: 'var(--color-accent-primary)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
              Terms & Conditions →
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
