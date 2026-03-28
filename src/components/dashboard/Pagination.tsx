'use client';

import styles from './Pagination.module.css';
import { useHaptics } from '@/hooks/useHaptics';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const { trigger } = useHaptics();

  if (totalPages <= 1) return null;

  return (
    <div className={styles.pagination}>
      <button
        className={styles.btn}
        onClick={() => { trigger('select'); onPageChange(page - 1); }}
        disabled={page <= 1}
        type="button"
      >
        ← Previous
      </button>
      <span className={styles.info}>
        Page {page} of {totalPages}
      </span>
      <button
        className={styles.btn}
        onClick={() => { trigger('select'); onPageChange(page + 1); }}
        disabled={page >= totalPages}
        type="button"
      >
        Next →
      </button>
    </div>
  );
}
