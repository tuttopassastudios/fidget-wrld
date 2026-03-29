'use client';

import { useSyncExternalStore } from 'react';
import { BallpitBackground } from '@/components/effects/BallpitBackground';

interface BallpitHeroProps {
  className?: string;
}

// Check reduced motion preference without triggering setState in effect
function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function subscribeToReducedMotion(callback: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

export function BallpitHero({ className }: BallpitHeroProps) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => true // Server: assume reduced motion to avoid hydration mismatch
  );

  if (prefersReducedMotion) return null;

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
