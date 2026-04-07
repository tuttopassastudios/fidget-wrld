'use client';

import { useSyncExternalStore, useState } from 'react';
import dynamic from 'next/dynamic';
import { useDeviceTier } from '@/hooks/useDeviceTier';

// Lazy-load the entire BallpitBackground + Ballpit + Three.js chunk.
// On mobile/low-end this import is never triggered, so zero Three.js JS is downloaded.
const BallpitBackground = dynamic(
  () => import('@/components/effects/BallpitBackground').then(m => ({ default: m.BallpitBackground })),
  { ssr: false }
);

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
