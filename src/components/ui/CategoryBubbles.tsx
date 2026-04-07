'use client';

import type { CSSProperties } from 'react';
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';

import './CategoryBubbles.css';

interface CategoryItem {
  label: string;
  icon?: string;
  href: string;
  rotation?: number;
  hoverStyles?: {
    bgColor?: string;
    textColor?: string;
  };
}

interface CategoryBubblesProps {
  items: CategoryItem[];
  className?: string;
}

export function CategoryBubbles({ items, className }: CategoryBubblesProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0 }
    );
    observer.observe(el);

    // Fallback: show after 2s if observer never fires
    const fallback = setTimeout(() => setVisible(true), 2000);

    return () => {
      clearTimeout(fallback);
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className={`categoryBubbles ${className ?? ''}`}>
      <div className="categoryBubblesHeading">
        <h2>Shop by Category</h2>
        <p>Find your perfect fidget</p>
      </div>
      <ul className="pillList" role="list" aria-label="Product categories">
        {items.map((item, idx) => (
          <li key={item.label} role="listitem" className="pillCol">
            <Link
              href={item.href}
              className={`pillLink ${visible ? 'pillLink--visible' : ''}`}
              style={
                {
                  '--item-rot': `${item.rotation ?? 0}deg`,
                  '--hover-bg': item.hoverStyles?.bgColor || '#f3f4f6',
                  '--hover-color': item.hoverStyles?.textColor || '#111',
                  '--stagger-delay': `${idx * 0.1}s`,
                } as CSSProperties
              }
              ref={() => {}}
            >
              <span className="pillLabel">
                {item.icon && <span className="pillIcon" aria-hidden="true">{item.icon}</span>}
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
