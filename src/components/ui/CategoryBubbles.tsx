'use client';

import type { CSSProperties } from 'react';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
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
  const bubblesRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      hasAnimated.current = true;
      return;
    }

    const bubbles = bubblesRef.current.filter(Boolean) as HTMLAnchorElement[];
    const labels = labelRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (!bubbles.length) return;

    gsap.set(bubbles, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(labels, { y: 24, autoAlpha: 0 });

    const runAnimation = () => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;

      bubbles.forEach((bubble, i) => {
        const delay = i * 0.1 + gsap.utils.random(-0.03, 0.03);
        const tl = gsap.timeline({ delay });
        tl.to(bubble, { scale: 1, duration: 0.5, ease: 'back.out(1.5)' });
        if (labels[i]) {
          tl.to(labels[i], { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' }, '-=0.45');
        }
      });
    };

    // Fallback: if observer never fires, show after 2s
    const fallback = setTimeout(() => {
      gsap.set(bubbles, { scale: 1 });
      gsap.set(labels, { y: 0, autoAlpha: 1 });
      hasAnimated.current = true;
    }, 2000);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          clearTimeout(fallback);
          observer.disconnect();
          runAnimation();
        }
      },
      { threshold: 0 }
    );

    // Observe the section container so scroll position is reliable
    if (sectionRef.current) observer.observe(sectionRef.current);

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
              className="pillLink"
              style={
                {
                  '--item-rot': `${item.rotation ?? 0}deg`,
                  '--hover-bg': item.hoverStyles?.bgColor || '#f3f4f6',
                  '--hover-color': item.hoverStyles?.textColor || '#111',
                } as CSSProperties
              }
              ref={(el) => {
                bubblesRef.current[idx] = el;
              }}
            >
              <span
                className="pillLabel"
                ref={(el) => {
                  labelRefs.current[idx] = el;
                }}
              >
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
