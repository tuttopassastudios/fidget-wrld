'use client';

import { useState, useRef, type FormEvent } from 'react';
import styles from './NewsletterSignup.module.css';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address');
      inputRef.current?.focus();
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setStatus('success');
      setMessage('You\'re on the list! Watch your inbox for research updates and exclusive offers.');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <div className={styles.wrapper}>
      {status === 'success' ? (
        <div className={styles.successMessage}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <p>{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputWrapper}>
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address…"
              className={styles.input}
              autoComplete="email"
              spellCheck={false}
              disabled={status === 'loading'}
              aria-label="Email address"
              aria-describedby={message ? 'newsletter-message' : undefined}
            />
            <button
              type="submit"
              className={styles.button}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  <span>Subscribing…</span>
                </>
              ) : (
                'Subscribe'
              )}
            </button>
          </div>
          {status === 'error' && message && (
            <p id="newsletter-message" className={styles.errorMessage} role="alert">
              {message}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
