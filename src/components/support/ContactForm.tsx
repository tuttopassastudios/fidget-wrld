'use client';

import { useState, useRef } from 'react';
import styles from './SupportCenter.module.css';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const honeypot = form.querySelector<HTMLInputElement>('input[name="website"]');
    if (honeypot?.value) return;

    setStatus('sending');
    const data = new FormData(form);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website: honeypot?.value ?? '',
          firstName: data.get('name'),
          lastName: '',
          email: data.get('email'),
          subject: data.get('subject'),
          message: data.get('message'),
        }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className={styles.successState}>
        <div className={styles.successIcon}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className={styles.successHeading}>Message Sent</h3>
        <p className={styles.successText}>
          Thank you for reaching out. We typically respond within 24&nbsp;hours.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => {
            setStatus('idle');
            formRef.current?.reset();
          }}
          style={{ borderRadius: 9999, fontSize: 'var(--text-sm)', fontWeight: 700 }}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      {/* Honeypot */}
      <input name="website" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className={styles.formField}>
        <label htmlFor="support-name" className={styles.formLabel}>Name</label>
        <input
          id="support-name"
          name="name"
          autoComplete="name"
          className="form-input"
          placeholder="Your name\u2026"
          required
          style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
        />
      </div>

      <div className={styles.formField}>
        <label htmlFor="support-email" className={styles.formLabel}>Email</label>
        <input
          id="support-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          className="form-input"
          placeholder="you@example.com\u2026"
          required
          style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
        />
      </div>

      <div className={styles.formField}>
        <label htmlFor="support-subject" className={styles.formLabel}>Subject</label>
        <select
          id="support-subject"
          name="subject"
          className="form-input"
          required
          defaultValue=""
          style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
        >
          <option value="" disabled>Select a topic\u2026</option>
          <option value="general">General</option>
          <option value="order-issue">Order Issue</option>
          <option value="product-question">Product Question</option>
          <option value="returns">Returns</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className={styles.formField}>
        <label htmlFor="support-message" className={styles.formLabel}>Message</label>
        <textarea
          id="support-message"
          name="message"
          className="form-input"
          placeholder="Tell us more\u2026"
          required
          rows={5}
          style={{ width: '100%', resize: 'vertical', borderRadius: 'var(--radius-md)' }}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
            }
          }}
        />
      </div>

      {status === 'error' && (
        <p role="alert" className={styles.errorMessage}>
          Something went wrong. Please try again.
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={status === 'sending'}
        style={{
          width: '100%',
          borderRadius: 9999,
          fontSize: 'var(--text-sm)',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: status === 'sending' ? 0.7 : 1,
        }}
      >
        {status === 'sending' && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={styles.spinner}>
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="32" />
          </svg>
        )}
        {status === 'sending' ? 'Sending\u2026' : 'Send Message'}
      </button>
    </form>
  );
}
