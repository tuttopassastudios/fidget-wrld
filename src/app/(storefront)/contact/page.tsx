'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const honeypot = form.querySelector<HTMLInputElement>('input[name="website"]');
    if (honeypot?.value) return;
    setSending(true);
    setSubmitted(true);
  };

  const cardStyle = {
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 20,
  } as const;

  const cardHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  } as const;

  const cardLabelStyle = {
    fontWeight: 600,
    fontSize: 14,
  } as const;

  const cardTextStyle = {
    fontSize: 13,
    color: 'var(--color-text-muted)',
  } as const;

  if (submitted) {
    return (
      <section className="product-page" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 480 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--color-accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 style={{ marginBottom: 8 }}>Message Sent</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
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
    <section className="product-page" style={{ padding: '48px 0' }}>
      <div className="container">
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          Get in Touch
        </p>
        <h1 style={{ marginBottom: 8 }}>Contact Us</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32, maxWidth: 520 }}>
          Have a question about our fidgets or need help with an order? We&apos;re here to help!
        </p>
        <div className="page-grid-sidebar" style={{ gap: 40 }}>
          <form onSubmit={handleSubmit}>
            <input name="website" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label htmlFor="contact-first" style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>First Name</label>
                <input id="contact-first" name="given-name" autoComplete="given-name" className="form-input" placeholder="Jane..." required style={{ width: '100%' }} />
              </div>
              <div>
                <label htmlFor="contact-last" style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Last Name</label>
                <input id="contact-last" name="family-name" autoComplete="family-name" className="form-input" placeholder="Doe..." required style={{ width: '100%' }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="contact-email" style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Email Address</label>
              <input id="contact-email" name="email" autoComplete="email" spellCheck={false} className="form-input" placeholder="you@example.com..." type="email" required style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="contact-subject" style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Subject</label>
              <input id="contact-subject" name="subject" className="form-input" placeholder="Product inquiry..." required style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label htmlFor="contact-message" style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Message</label>
              <textarea
                id="contact-message"
                name="message"
                className="form-input"
                placeholder="Tell us more..."
                required
                rows={6}
                style={{ width: '100%', resize: 'vertical' }}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
                  }
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={sending} style={{ width: '100%', opacity: sending ? 0.7 : 1 }}>
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2">
                  <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span style={cardLabelStyle}>Email</span>
              </div>
              <p style={cardTextStyle}>hello@fidgetwrld.com</p>
            </div>
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                <span style={cardLabelStyle}>Fidget Experts</span>
              </div>
              <p style={cardTextStyle}>Our friendly team is ready to help you find the perfect fidget, answer product questions, or assist with your order. Expect a response within 24 hours!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
