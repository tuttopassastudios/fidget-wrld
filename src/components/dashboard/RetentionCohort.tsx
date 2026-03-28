import styles from './RetentionCohort.module.css';

interface CohortData {
  cohortMonth: string;
  customerCount: number;
  retention: Record<string, number>; // month -> retention %
}

interface RetentionCohortProps {
  data: CohortData[];
}

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[Number(month) - 1]} ${year.slice(2)}`;
}

function getColor(pct: number): string {
  if (pct >= 80) return 'rgba(34, 197, 94, 0.4)';
  if (pct >= 60) return 'rgba(34, 197, 94, 0.3)';
  if (pct >= 40) return 'rgba(34, 197, 94, 0.2)';
  if (pct >= 20) return 'rgba(34, 197, 94, 0.12)';
  if (pct > 0) return 'rgba(34, 197, 94, 0.06)';
  return 'transparent';
}

export function RetentionCohort({ data }: RetentionCohortProps) {
  if (data.length === 0) {
    return <div className={styles.empty}>No cohort data yet</div>;
  }

  // Collect all months across all cohorts
  const allMonths = Array.from(
    new Set(data.flatMap(c => Object.keys(c.retention)))
  ).sort();

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Cohort</th>
              <th className={styles.th}>Users</th>
              {allMonths.map(m => (
                <th key={m} className={`${styles.th} ${styles.monthTh}`}>
                  {formatMonth(m)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(cohort => (
              <tr key={cohort.cohortMonth}>
                <td className={styles.td}>{formatMonth(cohort.cohortMonth)}</td>
                <td className={`${styles.td} ${styles.countTd}`}>{cohort.customerCount}</td>
                {allMonths.map(m => {
                  const pct = cohort.retention[m];
                  const isBeforeCohort = m < cohort.cohortMonth;
                  return (
                    <td
                      key={m}
                      className={`${styles.td} ${styles.cellTd}`}
                      style={{
                        background: isBeforeCohort ? 'transparent' : getColor(pct ?? 0),
                      }}
                    >
                      {isBeforeCohort ? '' : pct !== undefined ? `${pct}%` : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
