'use client';

import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
import styles from '../page.module.css';

export default function COAsPage() {
  return (
    <div className={styles.dashboardPage}>
      <DashboardTopbar title="Certificates" />
      <div className={styles.content}>
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <h3>Certificates Not Available</h3>
          <p>Certificate management is not configured for this store.</p>
        </div>
      </div>
    </div>
  );
}
