import styles from './AlertsBanner.module.css';

interface PrevPeriod {
  totalOrders: number;
  totalRevenue: number;
  aov: number;
}

interface AlertsBannerProps {
  currentRevenue: number;
  currentOrders: number;
  prevPeriod: PrevPeriod;
}

interface Alert {
  type: 'warning' | 'info';
  message: string;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function AlertsBanner({ currentRevenue, currentOrders, prevPeriod }: AlertsBannerProps) {
  const alerts: Alert[] = [];

  // Only generate alerts if we have previous period data
  if (prevPeriod.totalRevenue > 0 || prevPeriod.totalOrders > 0) {
    const revChange = pctChange(currentRevenue, prevPeriod.totalRevenue);
    const orderChange = pctChange(currentOrders, prevPeriod.totalOrders);

    if (revChange <= -20) {
      alerts.push({
        type: 'warning',
        message: `Revenue is down ${Math.abs(revChange)}% vs. previous period ($${prevPeriod.totalRevenue.toFixed(2)} → $${currentRevenue.toFixed(2)})`,
      });
    }

    if (orderChange <= -20) {
      alerts.push({
        type: 'warning',
        message: `Order volume is down ${Math.abs(orderChange)}% vs. previous period (${prevPeriod.totalOrders} → ${currentOrders})`,
      });
    }

    if (revChange >= 50) {
      alerts.push({
        type: 'info',
        message: `Revenue is up ${revChange}% vs. previous period`,
      });
    }

    if (orderChange >= 50) {
      alerts.push({
        type: 'info',
        message: `Order volume is up ${orderChange}% vs. previous period`,
      });
    }
  }

  if (alerts.length === 0) return null;

  return (
    <div className={styles.banner}>
      {alerts.map((alert, i) => (
        <div key={i} className={`${styles.alert} ${styles[alert.type]}`}>
          <span className={styles.icon}>
            {alert.type === 'warning' ? '⚠' : 'ℹ'}
          </span>
          <span className={styles.message}>{alert.message}</span>
        </div>
      ))}
    </div>
  );
}
