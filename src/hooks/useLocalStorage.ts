'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validate?: (value: unknown) => value is T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        const parsed: unknown = JSON.parse(item);
        if (validate && !validate(parsed)) {
          localStorage.removeItem(key);
        } else {
          setStoredValue(parsed as T);
        }
      }
    } catch {
      localStorage.removeItem(key);
    }
    setHasMounted(true);
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
