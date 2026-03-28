import type { Designer } from '@/data/designers';
import styles from './DesignerSpotlight.module.css';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

interface DesignerCardProps {
  designer: Designer;
}

export function DesignerCard({ designer }: DesignerCardProps) {
  return (
    <div
      className={styles.card}
      style={{ '--avatar-accent': designer.accentColor } as React.CSSProperties}
    >
      <div className={styles.cardAvatar}>
        <div className={styles.cardAvatarFallback} aria-hidden="true">
          {getInitials(designer.name)}
        </div>
      </div>
      <div className={styles.cardInfo}>
        <p className={styles.cardName}>{designer.name}</p>
        <p className={styles.cardRole}>{designer.role}</p>
      </div>
    </div>
  );
}
