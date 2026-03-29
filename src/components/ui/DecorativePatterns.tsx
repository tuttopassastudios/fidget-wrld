'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import styles from './DecorativePatterns.module.css';

type PatternVariant = 'scatter' | 'grid' | 'border' | 'corner';
type DotSize = 'sm' | 'md' | 'lg';
type CornerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface PolkaDotsProps {
  className?: string;
  density?: 'sparse' | 'medium' | 'dense';
  colors?: string[];
  pattern?: PatternVariant;
  size?: DotSize;
  animated?: boolean;
  cornerPosition?: CornerPosition;
}

const DOT_RADIUS: Record<DotSize, number> = { sm: 4, md: 8, lg: 12 };

export function PolkaDots({
  className = '',
  density = 'medium',
  colors,
  pattern = 'scatter',
  size = 'md',
  animated = false,
  cornerPosition = 'top-right',
}: PolkaDotsProps) {
  const defaultColors = [
    'var(--color-dot-pink, #FF6B9D)',
    'var(--color-dot-yellow, #FFD93D)',
    'var(--color-dot-cyan, #00B4D8)',
    'var(--color-dot-coral, #FF8B6A)',
    'var(--color-dot-violet, #B794F6)',
  ];
  const dotColors = colors || defaultColors;
  const ref = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState(0);
  // Initialize revealed state based on animated prop (avoid effect for initial state)
  const [revealed, setRevealed] = useState(() => {
    if (!animated) return true;
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const revealedRef = useRef(revealed);

  useLayoutEffect(() => {
    if (!animated || revealedRef.current) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      revealedRef.current = true;
      queueMicrotask(() => setRevealed(true));
      return;
    }

    // Scroll-triggered fade-in via IntersectionObserver
    const el = ref.current;
    if (el) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !revealedRef.current) {
            revealedRef.current = true;
            queueMicrotask(() => setRevealed(true));
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(el);
      // Cleanup
      const cleanup = () => observer.disconnect();

      // Parallax scroll effect
      let ticking = false;
      const onScroll = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            setOffsetY(Math.sin(scrollY * 0.005) * 10);
            ticking = false;
          });
        }
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      return () => {
        cleanup();
        window.removeEventListener('scroll', onScroll);
      };
    }

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          setOffsetY(Math.sin(scrollY * 0.005) * 10);
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [animated]);

  const radius = DOT_RADIUS[size];
  const patternClass = pattern !== 'scatter' ? styles[pattern] : '';
  const cornerClass = pattern === 'corner' ? styles[`corner-${cornerPosition}`] : '';

  const cssVars: Record<string, string | number> = {
    '--dot-colors': dotColors.join(', '),
    '--dot-radius': `${radius}px`,
  };

  if (pattern === 'grid') {
    const spacing = radius * 6;
    cssVars['--dot-spacing'] = `${spacing}px`;
    cssVars['--dot-bg'] = dotColors
      .map((c, i) => {
        const offset = i * spacing;
        return `radial-gradient(circle, ${c} ${radius}px, transparent ${radius}px)`;
      })
      .join(', ');
    cssVars['--dot-bg-size'] = dotColors
      .map(() => `${spacing}px ${spacing}px`)
      .join(', ');
    cssVars['--dot-bg-position'] = dotColors
      .map((_, i) => {
        const offset = Math.floor(i / 2) * spacing + (i % 2 ? spacing / 2 : 0);
        const yOffset = i % 2 ? spacing / 2 : 0;
        return `${offset}px ${yOffset}px`;
      })
      .join(', ');
  }

  if (pattern === 'border') {
    cssVars['--dot-border-color'] = dotColors[0] || 'var(--color-dot-pink, #FF6B9D)';
  }

  const animStyle = animated
    ? {
        transform: `translateY(${offsetY}px)`,
        opacity: revealed ? undefined : 0,
        transition: 'opacity 600ms ease-out',
      }
    : {};

  return (
    <div
      ref={ref}
      className={`${styles.polkaDots} ${styles[density]} ${patternClass} ${cornerClass} ${className}`.trim()}
      style={{ ...cssVars, ...animStyle } as React.CSSProperties}
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
