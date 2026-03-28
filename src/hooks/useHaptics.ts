'use client';

import { useCallback, useEffect, useRef } from 'react';
import { WebHaptics, defaultPatterns } from 'web-haptics';
import type { HapticInput } from 'web-haptics';

type HapticPattern = 'tap' | 'success' | 'error' | 'select';

const PATTERN_MAP: Record<HapticPattern, HapticInput | undefined> = {
  tap: undefined,
  success: defaultPatterns.success,
  error: defaultPatterns.error,
  select: defaultPatterns.selection,
};

export function useHaptics() {
  const hapticsRef = useRef<WebHaptics | null>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mql.matches;
    const handler = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mql.addEventListener('change', handler);

    hapticsRef.current = new WebHaptics();

    return () => {
      mql.removeEventListener('change', handler);
      hapticsRef.current?.destroy();
      hapticsRef.current = null;
    };
  }, []);

  const trigger = useCallback((pattern: HapticPattern = 'tap') => {
    if (reducedMotionRef.current || !hapticsRef.current) return;
    hapticsRef.current.trigger(PATTERN_MAP[pattern]);
  }, []);

  return { trigger };
}
