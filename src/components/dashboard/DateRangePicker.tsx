import styles from './DateRangePicker.module.css';

interface DateRangePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className={styles.wrapper}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`${styles.option} ${value === opt.value ? styles.active : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
