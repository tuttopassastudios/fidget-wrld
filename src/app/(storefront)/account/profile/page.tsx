'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sanitizeText, sanitizePhone } from '@/lib/sanitize';

const DC_API = 'https://firebasedataconnect.googleapis.com/v1beta/projects/pepmax-ac025/locations/us-central1/services/pepmax-service/connectors/default';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      try {
        const res = await fetch(`${DC_API}:executeQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operationName: 'GetUserByUid',
            variables: { uid: user.uid }
          })
        });
        const data = await res.json();
        const profile = data.data?.users?.[0];

        if (profile) {
          setDbUserId(profile.id);
          setDisplayName(profile.displayName || '');
          setPhone(profile.phone || '');
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      setDisplayName(user.displayName || '');
      fetchProfile();
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      let currentDbUserId = dbUserId;

      const cleanName = sanitizeText(displayName, 100);
      const cleanPhone = sanitizePhone(phone);

      // If no db user exists, create one first
      if (!currentDbUserId) {
        const createRes = await fetch(`${DC_API}:executeMutation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operationName: 'CreateUser',
            variables: {
              uid: user.uid,
              email: user.email,
              displayName: cleanName || user.displayName || null,
              photoURL: user.photoURL || null,
              phone: cleanPhone || null,
              authProvider: 'EMAIL'
            }
          })
        });

        const createData = await createRes.json();

        // Fetch the user's ID
        const res = await fetch(`${DC_API}:executeQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operationName: 'GetUserByUid',
            variables: { uid: user.uid }
          })
        });
        const data = await res.json();

        currentDbUserId = data.data?.users?.[0]?.id;
        setDbUserId(currentDbUserId);
      }

      if (!currentDbUserId) {
        throw new Error('Could not find or create user profile. Check browser console for details.');
      }

      const updateRes = await fetch(`${DC_API}:executeMutation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operationName: 'UpdateUserProfile',
          variables: {
            id: currentDbUserId,
            displayName: cleanName || null,
            phone: cleanPhone || null
          }
        })
      });

      const updateData = await updateRes.json();
      if (updateData.error) {
        throw new Error(updateData.error.message || 'Update failed');
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: `Failed to update profile: ${errorMessage}` });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <section className="product-page" style={{ padding: '48px 0', minHeight: '60vh' }}>
        <div className="container" style={{ maxWidth: 600, textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-accent-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto'
          }} />
          <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </section>
    );
  }

  if (!user) return null;

  return (
    <section className="product-page" style={{ padding: '48px 0' }}>
      <div className="container" style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <Link href="/account" style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 style={{ margin: 0 }}>Profile Settings</h1>
        </div>

        {message && (
          <div style={{
            background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(248, 113, 113, 0.1)',
            border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
            borderRadius: 8,
            padding: 12,
            marginBottom: 24,
            color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
            fontSize: 14
          }}>
            {message.text}
          </div>
        )}

        <div style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          padding: 24
        }}>
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 20 }}>
              <label htmlFor="profile-email" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6, color: 'var(--color-text-secondary)' }}>
                Email Address
              </label>
              <input
                id="profile-email"
                name="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                value={user.email || ''}
                disabled
                aria-describedby="profile-email-hint"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  color: 'var(--color-text-muted)',
                  fontSize: 14,
                  cursor: 'not-allowed'
                }}
              />
              <p id="profile-email-hint" style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                Email cannot be changed
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label htmlFor="profile-name" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6, color: 'var(--color-text-secondary)' }}>
                Full Name
              </label>
              <input
                id="profile-name"
                name="name"
                type="text"
                autoComplete="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={100}
                placeholder="Jane Doe..."
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
              <label htmlFor="profile-phone" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6, color: 'var(--color-text-secondary)' }}>
                Phone Number
              </label>
              <input
                id="profile-phone"
                name="tel"
                type="tel"
                autoComplete="tel"
                spellCheck={false}
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
                placeholder="+1 (555) 123-4567..."
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
              disabled={saving}
              style={{
                padding: '12px 24px',
                background: 'var(--color-accent-primary)',
                border: 'none',
                borderRadius: 8,
                color: 'var(--color-bg-dark)',
                fontSize: 14,
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
