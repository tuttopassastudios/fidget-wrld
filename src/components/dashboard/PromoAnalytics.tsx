import styles from './PromoAnalytics.module.css';

interface PromoStat {
  code: string;
  usageCount: number;
  totalDiscount: number;
  totalRevenue: number;
  avgOrderValue: number;
}

interface PromoAnalyticsProps {
  data: PromoStat[];
}

export function PromoAnalytics({ data }: PromoAnalyticsProps) {
  if (data.length === 0) {
    return <div className={styles.empty}>No promo code usage yet</div>;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Code</th>
            <th className={`${styles.th} ${styles.alignRight}`}>Uses</th>
            <th className={`${styles.th} ${styles.alignRight}`}>Total Discount</th>
            <th className={`${styles.th} ${styles.alignRight}`}>Revenue</th>
            <th className={`${styles.th} ${styles.alignRight}`}>Avg Order</th>
          </tr>
        </thead>
        <tbody>
          {data.map(p => (
            <tr key={p.code} className={styles.tr}>
              <td className={styles.td}>
                <span className={styles.code}>{p.code}</span>
              </td>
              <td className={`${styles.td} ${styles.alignRight}`}>
                {p.usageCount}
              </td>
              <td className={`${styles.td} ${styles.alignRight} ${styles.discount}`}>
                -${p.totalDiscount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
              <td className={`${styles.td} ${styles.alignRight}`}>
                ${p.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
              <td className={`${styles.td} ${styles.alignRight}`}>
                ${p.avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
