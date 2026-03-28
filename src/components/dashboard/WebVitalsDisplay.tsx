'use client';

import { useEffect, useState } from 'react';
import { collectWebVitals, getVitalThresholds, type VitalMetric } from '@/lib/web-vitals';
import styles from './WebVitalsDisplay.module.css';

const RATING_LABELS: Record<string, string> = {
  good: 'Good',
  'needs-improvement': 'Needs Work',
  poor: 'Poor',
};

export function WebVitalsDisplay() {
  const [vitals, setVitals] = useState<VitalMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    collectWebVitals().then((results) => {
      setVitals(results);
      setLoading(false);
    });
  }, []);

  const thresholds = getVitalThresholds();

  if (loading) {
    return <div className={styles.loading}>Measuring performance&hellip;</div>;
  }

  if (vitals.length === 0) {
    return <div className={styles.empty}>Unable to collect Web Vitals in this browser</div>;
  }

  return (
    <div className={styles.grid}>
      {vitals.map((v) => {
        const t = thresholds[v.name];
        return (
          <div key={v.name} className={styles.card}>
            <div className={styles.header}>
              <span className={styles.name}>{v.name}</span>
              <span className={`${styles.badge} ${styles[v.rating]}`}>
                {RATING_LABELS[v.rating]}
              </span>
            </div>
            <div className={styles.value}>
              {v.name === 'CLS' ? v.value.toFixed(3) : v.value}
              {v.unit && <span className={styles.unit}>{v.unit}</span>}
            </div>
            {t && (
              <div className={styles.fullName}>{t.fullName}</div>
            )}
            {t && (
              <div className={styles.thresholds}>
                <span className={styles.thGood}>
                  Good: ≤{v.name === 'CLS' ? t.good : `${t.good}ms`}
                </span>
                <span className={styles.thPoor}>
                  Poor: &gt;{v.name === 'CLS' ? t.poor : `${t.poor}ms`}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
