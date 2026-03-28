'use client';

import { motion } from 'motion/react';
import { useEffect, useRef, useState, useMemo } from 'react';

type AnimationValue = string | number;
type AnimationState = Record<string, AnimationValue>;

const buildKeyframes = (from: AnimationState, steps: AnimationState[]) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap(s => Object.keys(s))]);
  const keyframes: Record<string, AnimationValue[]> = {};
  keys.forEach(k => {
    keyframes[k] = [from[k], ...steps.map(s => s[k])];
  });
  return keyframes;
};

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  stepDuration?: number;
  threshold?: number;
  rootMargin?: string;
}

export function BlurText({
  text,
  delay = 50,
  className = '',
  stepDuration = 0.35,
  threshold = 0.1,
  rootMargin = '0px',
}: BlurTextProps) {
  const characters = text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Respect prefers-reduced-motion
  const prefersReducedMotion = useRef(false);
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion.current) setInView(true);
  }, []);

  useEffect(() => {
    if (!ref.current || prefersReducedMotion.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const fromSnapshot = useMemo(
    () => ({ filter: 'blur(10px)', opacity: 0, y: 50 }),
    []
  );

  const toSnapshots = useMemo(
    () => [
      { filter: 'blur(5px)', opacity: 0.5, y: -5 },
      { filter: 'blur(0px)', opacity: 1, y: 0 },
    ],
    []
  );

  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) => i / (stepCount - 1));

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: 'inline-flex', flexWrap: 'wrap' }}
    >
      {characters.map((char, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);
        const spanTransition = {
          duration: totalDuration,
          times,
          delay: (index * delay) / 1000,
        };

        return (
          <motion.span
            key={index}
            style={{ display: 'inline-block', willChange: 'transform, filter, opacity' }}
            initial={prefersReducedMotion.current ? false : fromSnapshot}
            animate={inView ? animateKeyframes : fromSnapshot}
            transition={spanTransition}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        );
      })}
    </span>
  );
}

export default BlurText;
