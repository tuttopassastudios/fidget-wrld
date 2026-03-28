'use client';

import styles from './DecorativePatterns.module.css';

interface PolkaDotsProps {
  className?: string;
  density?: 'sparse' | 'medium' | 'dense';
  colors?: string[];
}

export function PolkaDots({ className = '', density = 'medium', colors }: PolkaDotsProps) {
  const defaultColors = ['#FF6B9D', '#FFD93D', '#00B4D8', '#FF8B6A', '#B794F6'];
  const dotColors = colors || defaultColors;

  return (
    <div
      className={`${styles.polkaDots} ${styles[density]} ${className}`}
      style={{ '--dot-colors': dotColors.join(', ') } as React.CSSProperties}
      aria-hidden="true"
    />
  );
}

interface FloatingShapesProps {
  className?: string;
}

export function FloatingShapes({ className = '' }: FloatingShapesProps) {
  return (
    <div className={`${styles.floatingShapes} ${className}`} aria-hidden="true">
      <div className={styles.shape} style={{ '--shape-color': '#FF6B9D', '--delay': '0s', '--x': '10%', '--y': '20%' } as React.CSSProperties} />
      <div className={styles.shape} style={{ '--shape-color': '#FFD93D', '--delay': '1s', '--x': '80%', '--y': '15%' } as React.CSSProperties} />
      <div className={styles.shape} style={{ '--shape-color': '#00B4D8', '--delay': '2s', '--x': '25%', '--y': '70%' } as React.CSSProperties} />
      <div className={styles.shape} style={{ '--shape-color': '#FF8B6A', '--delay': '3s', '--x': '70%', '--y': '60%' } as React.CSSProperties} />
      <div className={styles.shape} style={{ '--shape-color': '#B794F6', '--delay': '4s', '--x': '50%', '--y': '85%' } as React.CSSProperties} />
    </div>
  );
}

interface GradientBlobProps {
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

export function GradientBlob({ className = '', position = 'center' }: GradientBlobProps) {
  return (
    <div
      className={`${styles.gradientBlob} ${styles[position]} ${className}`}
      aria-hidden="true"
    />
  );
}
