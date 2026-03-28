import styles from './IntegrationPlaceholder.module.css';

interface IntegrationPlaceholderProps {
  title: string;
  description: string;
  requirements: string[];
}

export function IntegrationPlaceholder({ title, description, requirements }: IntegrationPlaceholderProps) {
  return (
    <div className={styles.card}>
      <div className={styles.iconArea}>
        <span className={styles.icon} aria-hidden="true">⊘</span>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.desc}>{description}</p>
      <div className={styles.reqList}>
        <span className={styles.reqLabel}>Requires:</span>
        <ul className={styles.reqs}>
          {requirements.map((r) => (
            <li key={r} className={styles.req}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
