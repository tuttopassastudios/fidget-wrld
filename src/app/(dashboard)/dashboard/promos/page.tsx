'use client';

import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
import { DataTable, type Column } from '@/components/dashboard/DataTable';
import { PROMO_CODES } from '@/data/promo-codes';
import styles from '../page.module.css';

interface PromoRow {
  code: string;
  type: string;
  value: number;
  min: number;
  label: string;
}

const promoRows: PromoRow[] = Object.entries(PROMO_CODES).map(([code, promo]) => ({
  code,
  type: promo.type,
  value: promo.value,
  min: promo.min,
  label: promo.label,
}));

const columns: Column<PromoRow>[] = [
  {
    key: 'code',
    label: 'Code',
    render: (item) => <code className={styles.mono}>{item.code}</code>,
  },
  { key: 'label', label: 'Description' },
  {
    key: 'type',
    label: 'Type',
    render: (item) =>
      item.type === 'percent' ? 'Percentage' : item.type === 'fixed' ? 'Fixed Amount' : 'Free Shipping',
  },
  {
    key: 'value',
    label: 'Value',
    align: 'right',
    render: (item) =>
      item.type === 'percent' ? `${item.value}%` : item.type === 'fixed' ? `$${item.value}` : '—',
  },
  {
    key: 'min',
    label: 'Min. Order',
    align: 'right',
    render: (item) => (item.min > 0 ? `$${item.min.toFixed(2)}` : 'None'),
  },
];

export default function PromosPage() {
  return (
    <>
      <DashboardTopbar title="Promo Codes" />
      <div className={styles.content}>
        <div className={styles.infoBar}>
          Promo codes are managed in code (<code>src/data/promo-codes.ts</code>).
          This page is read-only.
        </div>

        <DataTable
          columns={columns}
          data={promoRows}
          keyExtractor={(item) => item.code}
          emptyMessage="No promo codes defined"
        />
      </div>
    </>
  );
}
