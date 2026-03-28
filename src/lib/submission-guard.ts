'use client';

import { useState, useRef, useCallback } from 'react';

interface SubmissionGuard {
  /** Unique key for this checkout attempt — send to payment API for dedup */
  idempotencyKey: string;
  /** Whether a submission is currently in-flight */
  isSubmitting: boolean;
  /** Whether a submission has already completed successfully */
  isCompleted: boolean;
  /**
   * Execute the submission callback. Prevents duplicate calls:
   * - Blocks while one is in-flight
   * - Blocks after success
   * - Allows retry after failure (same idempotency key)
   */
  submit: (fn: () => Promise<void> | void) => Promise<void>;
}

function generateKey(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

export function useSubmissionGuard(): SubmissionGuard {
  const [idempotencyKey] = useState(generateKey);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const submittingRef = useRef(false);
  const completedRef = useRef(false);

  const submit = useCallback(async (fn: () => Promise<void> | void) => {
    // Use refs for synchronous guard against rapid double-clicks
    if (submittingRef.current || completedRef.current) return;

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      await fn();
      completedRef.current = true;
      setIsCompleted(true);
    } catch {
      // Allow retry on failure — keep same idempotency key
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, []);

  return { idempotencyKey, isSubmitting, isCompleted, submit };
}
