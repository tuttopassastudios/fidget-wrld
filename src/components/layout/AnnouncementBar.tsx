'use client';

import Link from 'next/link';
import styles from './AnnouncementBar.module.css';

export function AnnouncementBar() {
  return (
    <div className={styles.announcementBar}>
      <div className={styles.announcementContent}>
        <span className={styles.emoji}>✨</span>
        <span><strong>Free Shipping</strong> on orders over $50!</span>
        <span className={styles.divider}>|</span>
        <span>Use code <strong className={styles.promoCode}>FIDGETFUN</strong> for 10% off</span>
        <span className={styles.emoji}>🎉</span>
      </div>
    </div>
  );
}
