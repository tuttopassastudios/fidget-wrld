import styles from './StatusBadge.module.css';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

interface StatusBadgeProps {
  status: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase() as OrderStatus;
  return (
    <span className={styles.badge} data-status={normalized}>
      {STATUS_LABELS[normalized] || status}
    </span>
  );
}
