'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Ballpit = dynamic(() => import('./Ballpit'), {
  ssr: false,
});

interface BallpitBackgroundProps {
  count?: number;
  colors?: number[];
  followCursor?: boolean;
  gravity?: number;
  friction?: number;
  wallBounce?: number;
  maxVelocity?: number;
  minSize?: number;
  maxSize?: number;
  size0?: number;
  className?: string;
}

export function BallpitBackground({
  count = 370,
  colors = [0x3b82f6, 0x22c55e, 0x06b6d4, 0x8b5cf6],
  followCursor = true,
  gravity = 0.5,
  friction = 0.9975,
  wallBounce = 0.95,
  maxVelocity = 0.15,
  minSize = 0.5,
  maxSize = 1,
  size0 = 1,
  className,
}: BallpitBackgroundProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  return (
    <Ballpit
      className={className}
      count={count}
      colors={colors}
      followCursor={followCursor}
      gravity={gravity}
      friction={friction}
      wallBounce={wallBounce}
      maxVelocity={maxVelocity}
      minSize={minSize}
      maxSize={maxSize}
      size0={size0}
      interactive={!isMobile}
    />
  );
}
