'use client';

import styles from './AnnouncementBar.module.css';

const MESSAGES = [
  'FREE USA SHIPPING ON ORDERS OVER $50',
  'MADE TO ORDER — SHIPS IN 3–5 BUSINESS DAYS',
  'CUSTOM 3D PRINTS AVAILABLE',
  'N52 MAGNETIC BALLS IN STOCK NOW',
];

const TRACK_TEXT = MESSAGES.join('   ·   ');

export function AnnouncementBar() {
  return (
    <div className={styles.bar} role="region" aria-label="Site announcements">
      <div className={styles.track} aria-hidden="true">
        <span className={styles.text}>{TRACK_TEXT}</span>
        <span className={styles.text}>{TRACK_TEXT}</span>
      </div>
      {/* Accessible static version for screen readers */}
      <p className={styles.sr}>{MESSAGES[0]}</p>
    </div>
  );
}
