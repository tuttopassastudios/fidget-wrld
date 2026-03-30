/**
 * Admin auth utilities — backed by Supabase
 *
 * This module replaces the Firebase Admin SDK stubs with real Supabase
 * admin client calls. All admin API routes import from here.
 */

import { getAdminClient } from '@/lib/supabase/admin';

export type AdminRole = 'admin' | 'editor' | 'viewer' | 'team';

/* ------------------------------------------------------------------ */
/*  getAdminAuth() — drop-in for routes that call Firebase-style APIs  */
/* ------------------------------------------------------------------ */

export function getAdminAuth() {
  const supabase = getAdminClient();

  return {
    /** Verify a Supabase access token and return uid + email. */
    verifyIdToken: async (token: string): Promise<{ uid: string; email?: string }> => {
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user) throw new Error('Invalid token');
      return { uid: data.user.id, email: data.user.email };
    },

    /** Get a user record by UID. */
    getUser: async (uid: string) => {
      const { data, error } = await supabase.auth.admin.getUserById(uid);
      if (error || !data.user) throw new Error('User not found');
      const u = data.user;
      return {
        uid: u.id,
        email: u.email,
        displayName: u.user_metadata?.full_name ?? u.user_metadata?.display_name ?? null,
        photoURL: u.user_metadata?.avatar_url ?? null,
        disabled: u.banned_until ? new Date(u.banned_until) > new Date() : false,
        emailVerified: !!u.email_confirmed_at,
        metadata: {
          creationTime: u.created_at,
          lastSignInTime: u.last_sign_in_at ?? undefined,
        },
        customClaims: u.app_metadata ?? {},
        providerData: (u.app_metadata?.providers ?? []).map((p: string) => ({ providerId: p })),
      };
    },

    /** Set custom claims (role) on a user via app_metadata. */
    setCustomUserClaims: async (uid: string, claims: Record<string, unknown>) => {
      const { error } = await supabase.auth.admin.updateUserById(uid, {
        app_metadata: claims,
      });
      if (error) throw new Error(`Failed to set claims: ${error.message}`);
    },

    /** List users with pagination. */
    listUsers: async (maxResults = 1000, pageToken?: string) => {
      const page = pageToken ? parseInt(pageToken, 10) : 1;
      const perPage = Math.min(maxResults, 1000);
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
      if (error) throw new Error(`Failed to list users: ${error.message}`);

      const users = (data.users ?? []).map((u) => ({
        uid: u.id,
        email: u.email,
        displayName: u.user_metadata?.full_name ?? u.user_metadata?.display_name ?? null,
        photoURL: u.user_metadata?.avatar_url ?? null,
        disabled: u.banned_until ? new Date(u.banned_until) > new Date() : false,
        emailVerified: !!u.email_confirmed_at,
        metadata: {
          creationTime: u.created_at,
          lastSignInTime: u.last_sign_in_at ?? undefined,
        },
        customClaims: u.app_metadata ?? {},
        providerData: (u.app_metadata?.providers ?? []).map((p: string) => ({ providerId: p })),
      }));

      // Supabase doesn't use pageToken; synthesise one if there are more pages
      const nextPage = users.length === perPage ? String(page + 1) : undefined;
      return { users, pageToken: nextPage };
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Standalone helpers used by individual routes                       */
/* ------------------------------------------------------------------ */

/** Verify a Supabase access token and return uid, email, and role. */
export async function verifyIdToken(
  token: string,
): Promise<{ uid: string; email?: string; role?: string } | null> {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return null;

    const role = (data.user.app_metadata?.role as string) ?? undefined;
    return { uid: data.user.id, email: data.user.email, role };
  } catch {
    return null;
  }
}

/** Extract the Bearer token from an Authorization header. */
export function extractBearerToken(header: string | null): string | null {
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7);
}

/**
 * Verify that the request comes from an authenticated user with the
 * required admin/team role. Returns the caller info or null.
 */
export async function verifyAdminRequest(
  authHeader: string | null,
  requiredRole?: AdminRole,
): Promise<{ uid: string; role: AdminRole; email?: string } | null> {
  const token = extractBearerToken(authHeader);
  if (!token) return null;

  const decoded = await verifyIdToken(token);
  if (!decoded) return null;

  const role = decoded.role as AdminRole | undefined;
  if (!role) return null;

  // If a specific role is required, enforce it
  if (requiredRole) {
    // 'admin' satisfies any requirement; 'team' only satisfies 'team'
    if (requiredRole === 'admin' && role !== 'admin') return null;
  }

  return { uid: decoded.uid, role, email: decoded.email };
}

/* ------------------------------------------------------------------ */
/*  Firestore stub — kept so product-db.ts falls through to static    */
/* ------------------------------------------------------------------ */

export function getAdminFirestore() {
  type QueryRef = {
    get: () => Promise<{ empty: boolean; docs: never[]; forEach: () => void }>;
    where: (_f: string, _o: string, _v: unknown) => QueryRef;
    orderBy: (_f: string, _d?: string) => QueryRef;
    limit: (_n: number) => QueryRef;
  };

  const mockQuery: QueryRef = {
    get: async () => { throw new Error('Firestore not configured — using static data'); },
    where: () => mockQuery,
    orderBy: () => mockQuery,
    limit: () => mockQuery,
  };

  return {
    collection: (_name: string) => ({
      ...mockQuery,
      doc: (_id?: string) => ({
        get: async () => { throw new Error('Firestore not configured'); },
        set: async () => { throw new Error('Firestore not configured'); },
        update: async () => { throw new Error('Firestore not configured'); },
        delete: async () => { throw new Error('Firestore not configured'); },
      }),
      add: async (_data: Record<string, unknown>) => { throw new Error('Firestore not configured'); },
    }),
  };
}

/** Storage stub */
export function getAdminStorage() {
  return {
    bucket: () => ({
      file: (_path: string) => ({
        save: async () => { throw new Error('Storage not configured'); },
        getSignedUrl: async () => [''],
        delete: async () => { throw new Error('Storage not configured'); },
      }),
    }),
  };
}
