'use client';

import { useState } from 'react';
import { BlurText } from '@/components/effects/BlurText';
import styles from './contact.module.css';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const honeypot = form.querySelector<HTMLInputElement>('input[name="website"]');
    if (honeypot?.value) return;

    setError(null);
    setSending(true);

    const data = new FormData(form);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website: honeypot?.value ?? '',
          firstName: data.get('given-name'),
          lastName: data.get('family-name'),
          email: data.get('email'),
          subject: data.get('subject'),
          message: data.get('message'),
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError((json as { error?: string }).error ?? 'Something went wrong. Please try again.');
        setSending(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <section className={`product-page ${styles.pageSection}`} style={{ textAlign: 'center' }}>
        <div className={`container ${styles.successContainer}`}>
          <div className={styles.successIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-on-accent, #fff)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className={styles.successTitle}><BlurText text="Message Sent" /></h1>
          <p className={styles.successText}>
            Thank you for reaching out. We typically respond within 24 hours.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setSubmitted(false)}
          >
            Send Another Message
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={`product-page ${styles.formPageSection}`}>
      <div className="container">
        <p className={styles.eyebrow}>
          Get in Touch
        </p>
        <h1 className={styles.pageTitle}><BlurText text="Contact Us" /></h1>
        <p className={styles.pageDescription}>
          Have a question about our fidgets or need help with an order? We&apos;re here to help!
        </p>
        <div className={`page-grid-sidebar ${styles.gridGap}`}>
          <form onSubmit={handleSubmit}>
            <input name="website" className={styles.honeypot} tabIndex={-1} autoComplete="off" />
            <div className={styles.formGrid}>
              <div>
                <label htmlFor="contact-first" className={styles.formLabel}>First Name</label>
                <input id="contact-first" name="given-name" autoComplete="given-name" className={`form-input ${styles.formInputFull}`} placeholder="Jane…" required />
              </div>
              <div>
                <label htmlFor="contact-last" className={styles.formLabel}>Last Name</label>
                <input id="contact-last" name="family-name" autoComplete="family-name" className={`form-input ${styles.formInputFull}`} placeholder="Doe…" required />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="contact-email" className={styles.formLabel}>Email Address</label>
              <input id="contact-email" name="email" autoComplete="email" spellCheck={false} className={`form-input ${styles.formInputFull}`} placeholder="you@example.com…" type="email" required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="contact-subject" className={styles.formLabel}>Subject</label>
              <input id="contact-subject" name="subject" className={`form-input ${styles.formInputFull}`} placeholder="Product inquiry…" required />
            </div>
            <div className={styles.formGroupLast}>
              <label htmlFor="contact-message" className={styles.formLabel}>Message</label>
              <textarea
                id="contact-message"
                name="message"
                className={`form-input ${styles.textareaFull}`}
                placeholder="Tell us more…"
                required
                rows={6}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
                  }
                }}
              />
            </div>
            {error && (
              <p role="alert" style={{ color: 'var(--color-error, #dc2626)', marginBottom: '1rem', fontSize: 'var(--text-sm)' }}>
                {error}
              </p>
            )}
            <button type="submit" className={`btn btn-primary ${styles.submitButton}`} disabled={sending} style={sending ? { opacity: 0.7 } : undefined}>
              {sending ? 'Sending…' : 'Send Message'}
            </button>
          </form>

          <div className={styles.infoCards}>
            <div className={styles.infoCard}>
              <div className={styles.infoCardHeader}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2">
                  <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span className={styles.infoCardLabel}>Email</span>
              </div>
              <p className={styles.infoCardText}>support@fidgetwrld.com</p>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoCardHeader}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                <span className={styles.infoCardLabel}>Fidget Experts</span>
              </div>
              <p className={styles.infoCardText}>Our friendly team is ready to help you find the perfect fidget, answer product questions, or assist with your order. Expect a response within 24 hours!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
