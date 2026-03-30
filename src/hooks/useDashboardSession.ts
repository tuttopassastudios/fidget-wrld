'use client';

import { useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * Syncs the Supabase access token to a __session cookie for edge-level
 * dashboard route protection. Call this in the DashboardGuard.
 */
export function useDashboardSession() {
  const { user } = useAuth();

  const syncSession = useCallback(async () => {
    if (!user) return;

    try {
      const idToken = await user.getIdToken();
      await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
    } catch {
      // Session sync failure is non-fatal — the client-side guard still works
    }
  }, [user]);

  // Sync on mount and refresh every 50 minutes (token expires at 60)
  useEffect(() => {
    if (!user) return;

    syncSession();

    const interval = setInterval(syncSession, 50 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, syncSession]);
}
