'use client';

import { useSyncExternalStore } from 'react';
import { useDeviceTier } from '@/hooks/useDeviceTier';
import { BallpitBackground } from '@/components/effects/BallpitBackground';

interface BallpitHeroProps {
  className?: string;
  fallbackClassName?: string;
}

function getCoarsePointerSnapshot() {
  return window.matchMedia('(pointer: coarse)').matches;
}

function subscribeToCoarsePointer(callback: () => void) {
  const mq = window.matchMedia('(pointer: coarse)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
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

export function BallpitHero({ className, fallbackClassName }: BallpitHeroProps) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => true // Server: assume reduced motion to avoid hydration mismatch
  );

  const isCoarsePointer = useSyncExternalStore(
    subscribeToCoarsePointer,
    getCoarsePointerSnapshot,
    () => false // Server: assume desktop
  );

  const tier = useDeviceTier();

  // Skip ballpit entirely on: reduced motion, mobile (touch), or low-end devices
  const skipBallpit = prefersReducedMotion || isCoarsePointer || tier === 'low';

  if (skipBallpit) {
    // Render a lightweight CSS gradient fallback instead of WebGL
    return <div className={fallbackClassName} />;
  }

  return (
    <div className={className}>
      <BallpitBackground
        count={tier === 'mid' ? 120 : 200}
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
