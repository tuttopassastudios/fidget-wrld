'use client';

import { useEffect, useRef } from 'react';

export function PageReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const items = ref.current.querySelectorAll('.reveal-item');
    items.forEach((el, i) => {
      (el as HTMLElement).style.setProperty('--reveal-i', String(i));
    });
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
