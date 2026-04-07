'use client';

import { useSyncExternalStore } from 'react';

export type DeviceTier = 'low' | 'mid' | 'high';

/**
 * Detects device capability tier for progressive enhancement.
 *
 * - 'low':  ≤4 logical cores OR ≤4GB RAM OR prefers-reduced-motion
 * - 'high': ≥8 cores AND ≥8GB RAM AND no reduced-motion
 * - 'mid':  everything else
 *
 * SSR returns 'mid' (safe default — no heavy effects, no degraded fallback).
 */

function computeTier(): DeviceTier {
  const cores = navigator.hardwareConcurrency ?? 4;
  // deviceMemory is Chrome-only; undefined elsewhere → treat as mid
  const mem = (navigator as { deviceMemory?: number }).deviceMemory ?? 8;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion || cores <= 4 || mem <= 4) return 'low';
  if (cores >= 8 && mem >= 8) return 'high';
  return 'mid';
}

let cachedTier: DeviceTier | null = null;

function getSnapshot(): DeviceTier {
  if (cachedTier === null) cachedTier = computeTier();
  return cachedTier;
}

function getServerSnapshot(): DeviceTier {
  return 'mid';
}

function subscribe(callback: () => void) {
  // Re-evaluate if user toggles reduced-motion
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = () => {
    cachedTier = computeTier();
    callback();
  };
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}

export function useDeviceTier(): DeviceTier {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
