'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

/**
 * User interface that mirrors the shape the rest of the app expects.
 * Adapts Supabase user/session data to the Firebase-like interface
 * used by login, signup, account, and dashboard guard pages.
 */
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  getIdToken: () => Promise<string>;
  getIdTokenResult: () => Promise<{ claims: Record<string, unknown> }>;
  reload: () => Promise<void>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/** Map a Supabase user + session into the app's User interface. */
function mapUser(supabaseUser: SupabaseUser, session: Session | null): User {
  const meta = supabaseUser.user_metadata ?? {};
  return {
    uid: supabaseUser.id,
    email: supabaseUser.email ?? null,
    displayName: meta.full_name ?? meta.display_name ?? meta.name ?? null,
    photoURL: meta.avatar_url ?? meta.picture ?? null,
    phoneNumber: supabaseUser.phone ?? null,
    emailVerified: !!supabaseUser.email_confirmed_at,
    getIdToken: async () => {
      if (session?.access_token) return session.access_token;
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? '';
    },
    getIdTokenResult: async () => {
      // Roles are stored in app_metadata (set server-side via Supabase dashboard or service role)
      const appMeta = supabaseUser.app_metadata ?? {};
      return {
        claims: {
          role: appMeta.role ?? null,
          ...appMeta,
        },
      };
    },
    reload: async () => {
      const supabase = createClient();
      await supabase.auth.refreshSession();
    },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapUser(session.user, session));
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapUser(session.user, session));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Map Supabase error codes to Firebase-like codes for compatibility with existing error handling
      const code = error.message.includes('Invalid login')
        ? 'auth/invalid-credential'
        : error.message.includes('not found')
          ? 'auth/user-not-found'
          : 'auth/unknown';
      throw Object.assign(new Error(error.message), { code });
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName ?? '',
          display_name: displayName ?? '',
        },
      },
    });
    if (error) {
      const code = error.message.includes('already registered')
        ? 'auth/email-already-in-use'
        : 'auth/unknown';
      throw Object.assign(new Error(error.message), { code });
    }
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Clear any dashboard session cookie
    await fetch('/api/admin/session', { method: 'DELETE' }).catch(() => {});
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      throw Object.assign(new Error(error.message), { code: 'auth/popup-blocked' });
    }
    // OAuth redirects — the page will navigate away
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
