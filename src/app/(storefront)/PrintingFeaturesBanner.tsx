import Link from 'next/link';
import styles from './PrintingFeaturesBanner.module.css';

const FEATURES = [
  {
    label: 'Made to Order',
    title: 'Custom 3D Printing',
    desc: 'Every piece is printed fresh in your chosen filament color — no pre-made inventory, just your order.',
    color: '#0d9488',
    bg: 'rgba(13, 148, 136, 0.18)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="14" width="20" height="6" rx="2" />
        <path d="M6 14V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6" />
        <path d="M6 17h.01M10 17h.01" />
        <path d="M9 8V5M12 8V4M15 8V6" />
      </svg>
    ),
  },
  {
    label: 'Fast Turnaround',
    title: 'Ships in 3–5 Days',
    desc: 'Most printed orders leave our shop in 3–5 business days and land at your door shortly after.',
    color: '#22C55E',
    bg: 'rgba(34, 197, 94, 0.16)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
        <rect x="9" y="11" width="14" height="10" rx="2" />
        <path d="M9 17h.01M19 11V8l-3-3h-4" />
        <path d="M16 8h3" />
        <path d="M13 15l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'Real Humans',
    title: 'Responsive Support',
    desc: 'Questions, issues, or just curious? Our team responds within 24 hours, seven days a week.',
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.16)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 10h.01M12 10h.01M16 10h.01" />
      </svg>
    ),
  },
  {
    label: 'Make It Yours',
    title: 'Full Customization',
    desc: 'Name engravings, model modifications, and premium filament options — make it exactly what you want.',
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.16)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        <path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
      </svg>
    ),
  },
];

export function PrintingFeaturesBanner() {
  return (
    <section className={styles.banner} aria-label="Why shop at Fidget WRLD">
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Why Fidget WRLD</span>
          <h2 className={styles.heading}>Printed fresh.<br />Shipped fast. Built for you.</h2>
        </div>

        <div className={styles.grid}>
          {FEATURES.map(({ label, title, desc, color, bg, icon }) => (
            <div key={title} className={styles.feature}>
              <div
                className={styles.iconWrap}
                style={{ background: bg, color }}
              >
                {icon}
              </div>
              <span className={styles.label} style={{ color }}>
                {label}
              </span>
              <h3 className={styles.title}>{title}</h3>
              <p className={styles.desc}>{desc}</p>
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <Link href="/products?fulfillment=3d-printed" className={styles.ctaLink}>
            Browse 3D Printed Products
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
