import styles from './MacWindowFrame.module.css';

interface MacWindowFrameProps {
  label: string;
  variant?: 'light' | 'dark';
  padding?: string;
  className?: string;
  children: React.ReactNode;
}

export function MacWindowFrame({
  label,
  variant = 'light',
  padding,
  className,
  children,
}: MacWindowFrameProps) {
  return (
    <div className={`${styles.frame} ${styles[variant]}${className ? ` ${className}` : ''}`}>
      <div className={styles.chrome} aria-hidden="true">
        <span className={`${styles.dot} ${styles.red}`} />
        <span className={`${styles.dot} ${styles.yellow}`} />
        <span className={`${styles.dot} ${styles.green}`} />
        <span className={styles.chromeLabel}>{label}</span>
      </div>
      <div className={styles.body} style={padding ? { padding } : undefined}>
        {children}
      </div>
    </div>
  );
}
