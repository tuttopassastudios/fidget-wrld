'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

/**
 * Validate redirect target to prevent open-redirect attacks.
 * Only allows relative paths starting with '/'.
 */
function getSafeRedirect(param: string | null): string {
  if (!param) return '/account';
  // Must be a relative path — block protocol-relative (//evil.com) and absolute URLs
  if (!param.startsWith('/') || param.startsWith('//')) return '/account';
  return param;
}

/**
 * If the redirect target requires a __session cookie (dashboard routes),
 * sync it before navigating so the proxy doesn't bounce us back.
 */
async function syncSessionIfNeeded(_redirectTo: string): Promise<void> {
  // Session sync is handled by useDashboardSession hook
  return;
}

function LoginForm() {
  const { signIn, signInWithGoogle, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get('redirect'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Navigate after ensuring session cookie is set for dashboard routes.
  // Dashboard routes use window.location.href (full page load) to bypass
  // the Next.js Router Cache, which may have cached the proxy's redirect.
  const navigateAfterAuth = useCallback(async (target: string) => {
    if (target.startsWith('/dashboard')) {
      try {
        await syncSessionIfNeeded(target);
        window.location.href = target;
      } catch {
        // Session sync failed — go to /account to avoid redirect loop
        router.push('/account');
      }
    } else {
      router.push(target);
    }
  }, [router]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigateAfterAuth(redirectTo);
    }
  }, [user, navigateAfterAuth, redirectTo]);

  // Don't show the form if the user is already authenticated or auth is loading
  if (authLoading) {
    return (
      <section className="product-page" style={{ padding: '48px 0', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-accent-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </section>
    );
  }

  if (user) {
    return (
      <section className="product-page" style={{ padding: '48px 0', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-accent-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </section>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      await navigateAfterAuth(redirectTo);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (error.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else {
        setError(error.message || 'An error occurred. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      await navigateAfterAuth(redirectTo);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups for this site and try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Another popup was already open — ignore
      } else if (error.code !== 'auth/popup-closed-by-user') {
        setError(error.message || 'Google sign-in failed.');
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
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>Welcome Back</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
            Sign in to your Fidget WRLD account
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
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="login-email" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6, color: 'var(--color-text-secondary)' }}>
                Email Address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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

            <div style={{ marginBottom: 24 }}>
              <label htmlFor="login-password" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6, color: 'var(--color-text-secondary)' }}>
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                spellCheck={false}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password..."
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
              {loading ? 'Signing in\u2026' : 'Sign In'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '20px 0', color: 'var(--color-text-muted)', fontSize: 14 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            <span>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          </div>

          <button
            onClick={handleGoogleSignIn}
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
            {googleLoading ? 'Signing in\u2026' : 'Continue with Google'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--color-border)', fontSize: 14, color: 'var(--color-text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--color-accent-primary)', fontWeight: 500 }}>
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <section className="product-page" style={{ padding: '48px 0', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-accent-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </section>
    }>
      <LoginForm />
    </Suspense>
  );
}
