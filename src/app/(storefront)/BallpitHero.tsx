'use client';

import { useEffect, useState } from 'react';
import { BallpitBackground } from '@/components/effects/BallpitBackground';

interface BallpitHeroProps {
  className?: string;
}

export function BallpitHero({ className }: BallpitHeroProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mq.matches) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className={className}>
      <BallpitBackground
        count={200}
        colors={[0x3b82f6, 0x06b6d4, 0x22c55e, 0x06d6a0]}
        followCursor
        gravity={0.5}
        friction={0.9975}
        wallBounce={0.95}
        maxVelocity={0.15}
      />
    </div>
  );
}
