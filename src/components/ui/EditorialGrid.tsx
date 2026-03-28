import styles from './EditorialGrid.module.css';

interface EditorialGridProps {
  layout: 'even' | 'featured' | 'magazine';
  children: React.ReactNode;
  gap?: string;
  className?: string;
}

export function EditorialGrid({ layout, children, gap, className }: EditorialGridProps) {
  return (
    <div
      className={`${styles.grid} ${styles[layout]}${className ? ` ${className}` : ''}`}
      style={gap ? { gap } : undefined}
    >
      {children}
    </div>
  );
}

export default EditorialGrid;
