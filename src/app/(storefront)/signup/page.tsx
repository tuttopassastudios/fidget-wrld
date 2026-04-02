'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sanitizeText } from '@/lib/sanitize';

export default function SignupPage() {
  const { signUp, signInWithGoogle, user } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    router.push('/account');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must contain at least one letter and one number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the Terms of Service.');
      return;
    }

    setLoading(true);

    try {
      const displayName = `${sanitizeText(firstName, 100)} ${sanitizeText(lastName, 100)}`;
      await signUp(email, password, displayName);

      // Fire welcome email (best-effort, don't block navigation)
      fetch('/api/email/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger: 'welcome',
          to: email,
          vars: { first_name: sanitizeText(firstName, 100), email },
        }),
      }).catch(() => {});

      router.push('/account');
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/email-already-in-use' || error.code === 'auth/weak-password') {
        setError('Unable to create account. Please check your details and try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.push('/account');
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups for this site and try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Another popup was already open — ignore
      } else if (error.code !== 'auth/popup-closed-by-user') {
        setError(error.message || 'Google sign-up failed.');
      }
      setGoogleLoading(false);
    }
  };

  return (
    <section className="product-page" style={{ padding: '48px 0', minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: 420 }}>
        <div style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: 32
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>Create Account</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
            Join PepMax to track orders and checkout faster
          </p>

          {error && (
            <div style={{
              background: 'rgba(248, 113, 113, 0.1)',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
              color: 'var(--color-error)',
              fontSize: 14,
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label htmlFor="signup-first-name" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6, color: 'var(--color-text-secondary)' }}>
                  First Name
                </label>
                <input
                  id="signup-first-name"
                  name="given-name"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  maxLength={100}
                  placeholder="Jane..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    color: 'var(--color-text-primary)',
                    fontSize: 14
                  }}
                />
              </div>
              <div>
                <label htmlFor="signup-last-name" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6, color: 'var(--color-text-secondary)' }}>
                  Last Name
                </label>
                <input
                  id="signup-last-name"
                  name="family-name"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  maxLength={100}
                  placeholder="Doe..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    color: 'var(--color-text-primary)',
                    fontSize: 14
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label htmlFor="signup-email" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6, color: 'var(--color-text-secondary)' }}>
                Email Address
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={254}
                placeholder="you@example.com..."
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  color: 'var(--color-text-primary)',
                  fontSize: 14
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label htmlFor="signup-password" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6, color: 'var(--color-text-secondary)' }}>
                Password
              </label>
              <input
                id="signup-password"
                name="new-password"
                type="password"
                autoComplete="new-password"
                spellCheck={false}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a password..."
                minLength={8}
                aria-describedby="signup-password-hint"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  color: 'var(--color-text-primary)',
                  fontSize: 14
                }}
              />
              <p id="signup-password-hint" style={{ fontSize: 12, color: password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password) ? 'var(--color-success)' : 'var(--color-text-muted)', marginTop: 4 }}>
                {password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password) ? 'Password strength: Good' : 'At least 8 characters with letters and numbers'}
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label htmlFor="signup-confirm-password" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6, color: 'var(--color-text-secondary)' }}>
                Confirm Password
              </label>
              <input
                id="signup-confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                spellCheck={false}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password..."
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  color: 'var(--color-text-primary)',
                  fontSize: 14
                }}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 24, fontSize: 12, color: 'var(--color-text-muted)', cursor: 'pointer', minHeight: 44 }}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={{ marginTop: 2, accentColor: 'var(--color-accent-primary)', width: 20, height: 20, cursor: 'pointer' }}
              />
              <span>
                I agree to the <Link href="/terms" style={{ color: 'var(--color-accent-primary)' }}>Terms of Service</Link> and{' '}
                <Link href="/privacy" style={{ color: 'var(--color-accent-primary)' }}>Privacy Policy</Link>, and confirm these products are for{' '}
                <strong>research purposes only</strong>.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || googleLoading}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--color-accent-primary)',
                border: 'none',
                borderRadius: 8,
                color: 'var(--color-bg-dark)',
                fontSize: 14,
                fontWeight: 600,
                cursor: loading || googleLoading ? 'not-allowed' : 'pointer',
                opacity: loading || googleLoading ? 0.7 : 1
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '20px 0', color: 'var(--color-text-muted)', fontSize: 14 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            <span>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          </div>

          <button
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '12px',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              color: 'var(--color-text-primary)',
              fontSize: 14,
              fontWeight: 500,
              cursor: googleLoading || loading ? 'not-allowed' : 'pointer',
              opacity: googleLoading || loading ? 0.7 : 1
            }}
          >
            {googleLoading ? (
              <div style={{
                width: 18,
                height: 18,
                border: '2px solid var(--color-border)',
                borderTopColor: 'var(--color-accent-primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? 'Signing in\u2026' : 'Sign up with Google'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--color-border)', fontSize: 14, color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--color-accent-primary)', fontWeight: 500 }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
