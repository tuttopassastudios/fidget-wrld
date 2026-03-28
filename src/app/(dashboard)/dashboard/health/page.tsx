'use client';

import { PageReveal } from '@/components/ui/PageReveal';
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
import { WebVitalsDisplay } from '@/components/dashboard/WebVitalsDisplay';
import { UptimeCheck } from '@/components/dashboard/UptimeCheck';
import { IntegrationPlaceholder } from '@/components/dashboard/IntegrationPlaceholder';
import styles from './page.module.css';

export default function HealthPage() {
  return (
    <PageReveal>
      <div className="reveal-item">
        <DashboardTopbar title="Site Health" />
      </div>
      <div className={styles.content}>
        <div className={`${styles.section} reveal-item`}>
          <h2 className={styles.sectionTitle}>Uptime Status</h2>
          <UptimeCheck />
        </div>

        <div className={`${styles.section} reveal-item`}>
          <h2 className={styles.sectionTitle}>Core Web Vitals</h2>
          <p className={styles.sectionDesc}>
            Measured from this browser session. For aggregate field data, connect Google Analytics or use Vercel Speed Insights.
          </p>
          <WebVitalsDisplay />
        </div>

        <div className={`${styles.section} reveal-item`}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>Vercel Analytics Active</h3>
            <p className={styles.infoDesc}>
              Page views and Web Vitals are being collected automatically via Vercel Analytics and Speed Insights.
              View aggregate data in your{' '}
              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                Vercel Dashboard
              </a>.
            </p>
          </div>
        </div>

        <div className={`${styles.section} reveal-item`}>
          <h2 className={styles.sectionTitle}>Available Integrations</h2>
          <p className={styles.sectionDesc}>
            Connect external services to unlock traffic, marketing, and campaign analytics.
          </p>
          <div className={styles.placeholderGrid}>
            <IntegrationPlaceholder
              title="Traffic Sources"
              description="See where visitors come from — organic, paid, social, email, direct."
              requirements={['Google Analytics API key', 'GA4 property ID']}
            />
            <IntegrationPlaceholder
              title="Mobile vs. Desktop"
              description="Device breakdown and browser usage split for UX prioritization."
              requirements={['Google Analytics API key']}
            />
            <IntegrationPlaceholder
              title="Ad Performance (ROAS)"
              description="Return on ad spend across Google Ads, Meta, and other platforms."
              requirements={['Google Ads API', 'Meta Marketing API']}
            />
            <IntegrationPlaceholder
              title="Email Campaigns"
              description="Open rates, click-through rates, and conversions from email marketing."
              requirements={['Email platform API (Mailchimp, SendGrid, etc.)']}
            />
          </div>
        </div>
      </div>
    </PageReveal>
  );
}
