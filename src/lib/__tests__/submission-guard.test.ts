import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSubmissionGuard } from '@/lib/submission-guard';

describe('useSubmissionGuard', () => {
  it('generates an idempotency key', () => {
    const { result } = renderHook(() => useSubmissionGuard());
    expect(result.current.idempotencyKey).toBeTruthy();
    expect(typeof result.current.idempotencyKey).toBe('string');
  });

  it('idempotency key is stable across re-renders', () => {
    const { result, rerender } = renderHook(() => useSubmissionGuard());
    const key1 = result.current.idempotencyKey;
    rerender();
    expect(result.current.idempotencyKey).toBe(key1);
  });

  it('starts not submitting and not completed', () => {
    const { result } = renderHook(() => useSubmissionGuard());
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isCompleted).toBe(false);
  });

  it('executes the callback on first submit', async () => {
    const { result } = renderHook(() => useSubmissionGuard());
    const fn = vi.fn();
    await act(async () => { await result.current.submit(fn); });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('marks as completed after successful submit', async () => {
    const { result } = renderHook(() => useSubmissionGuard());
    await act(async () => { await result.current.submit(() => {}); });
    expect(result.current.isCompleted).toBe(true);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('blocks subsequent calls after success', async () => {
    const { result } = renderHook(() => useSubmissionGuard());
    const fn = vi.fn();
    await act(async () => { await result.current.submit(fn); });
    await act(async () => { await result.current.submit(fn); });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('blocks concurrent calls while in-flight', async () => {
    const { result } = renderHook(() => useSubmissionGuard());
    let resolve: () => void;
    const slowFn = vi.fn(() => new Promise<void>(r => { resolve = r; }));
    const fastFn = vi.fn();

    // Start slow submission
    let submitPromise: Promise<void>;
    act(() => { submitPromise = result.current.submit(slowFn); });
    expect(result.current.isSubmitting).toBe(true);

    // Try concurrent submission — should be blocked
    await act(async () => { await result.current.submit(fastFn); });
    expect(fastFn).not.toHaveBeenCalled();

    // Resolve the slow one
    await act(async () => { resolve!(); await submitPromise!; });
    expect(slowFn).toHaveBeenCalledTimes(1);
  });

  it('allows retry after failure with same idempotency key', async () => {
    const { result } = renderHook(() => useSubmissionGuard());
    const key = result.current.idempotencyKey;
    const failFn = vi.fn(() => { throw new Error('payment failed'); });
    const successFn = vi.fn();

    await act(async () => { await result.current.submit(failFn); });
    expect(result.current.isCompleted).toBe(false);
    expect(result.current.isSubmitting).toBe(false);

    // Should allow retry
    await act(async () => { await result.current.submit(successFn); });
    expect(successFn).toHaveBeenCalledTimes(1);
    expect(result.current.idempotencyKey).toBe(key); // same key
  });
});
