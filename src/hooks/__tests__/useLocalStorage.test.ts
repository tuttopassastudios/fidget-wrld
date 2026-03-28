import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

beforeEach(() => {
  localStorage.clear();
});

describe('useLocalStorage', () => {
  it('returns initial value before mount', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    // On first render (before useEffect), returns initialValue
    expect(result.current[0]).toBe('initial');
  });

  it('writes to localStorage on set', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    act(() => result.current[1]('updated'));
    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('test-key')).toBe('"updated"');
  });

  it('reads from localStorage on mount', () => {
    localStorage.setItem('test-key', '"stored-value"');
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    // After effect runs, should read stored value
    expect(result.current[0]).toBe('stored-value');
  });

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage<number>('counter', 0));
    act(() => result.current[1](prev => prev + 1));
    expect(result.current[0]).toBe(1);
  });

  it('validates stored data and removes invalid', () => {
    localStorage.setItem('test-key', '"bad-data"');
    const validator = (v: unknown): v is number => typeof v === 'number';
    const { result } = renderHook(() => useLocalStorage('test-key', 42, validator));
    // Invalid data removed, returns initial
    expect(result.current[0]).toBe(42);
    expect(localStorage.getItem('test-key')).toBeNull();
  });

  it('handles JSON parse errors gracefully', () => {
    localStorage.setItem('test-key', 'not-json{{{');
    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('handles objects', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', { a: 1 }));
    act(() => result.current[1]({ a: 2 }));
    expect(result.current[0]).toEqual({ a: 2 });
    expect(JSON.parse(localStorage.getItem('test-key')!)).toEqual({ a: 2 });
  });

  it('handles arrays', () => {
    const { result } = renderHook(() => useLocalStorage<number[]>('test-key', []));
    act(() => result.current[1]([1, 2, 3]));
    expect(result.current[0]).toEqual([1, 2, 3]);
  });
});
