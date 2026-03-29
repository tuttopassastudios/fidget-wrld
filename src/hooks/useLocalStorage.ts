'use client';

import { useState, useCallback, useSyncExternalStore, useRef, useLayoutEffect } from 'react';

// Hydration-safe mounted state
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validate?: (value: unknown) => value is T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const hasMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const initializedRef = useRef(false);

  const [storedValue, setStoredValue] = useState<T>(() => {
    // Only read from localStorage on client after mount
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        const parsed: unknown = JSON.parse(item);
        if (validate && !validate(parsed)) {
          localStorage.removeItem(key);
          return initialValue;
        }
        return parsed as T;
      }
    } catch {
      localStorage.removeItem(key);
    }
    return initialValue;
  });

  // Re-sync if key changes (rare but possible)
  useLayoutEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        const parsed: unknown = JSON.parse(item);
        if (validate && !validate(parsed)) {
          localStorage.removeItem(key);
        } else {
          queueMicrotask(() => setStoredValue(parsed as T));
        }
      }
    } catch {
      localStorage.removeItem(key);
    }
  }, [key, validate]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const newValue = value instanceof Function ? value(prev) : value;
      try {
        localStorage.setItem(key, JSON.stringify(newValue));
      } catch {
        // Storage full or unavailable
      }
      return newValue;
    });
  }, [key]);

  // Return initial value until mounted to avoid hydration mismatch
  if (!hasMounted) {
    return [initialValue, setValue];
  }

  return [storedValue, setValue];
}
