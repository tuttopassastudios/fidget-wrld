'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useDashboardSession } from '@/hooks/useDashboardSession';
import styles from './DashboardGuard.module.css';

interface DashboardGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'team' | ('admin' | 'team')[];
}

export function DashboardGuard({ children, requiredRole = ['admin', 'team'] }: DashboardGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  // Sync Firebase ID token to __session cookie for edge protection
  useDashboardSession();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Full navigation to break out of any stale Router Cache entries
      window.location.href = '/login?redirect=/dashboard';
      return;
    }

    user.getIdTokenResult().then(result => {
      const userRole = (result.claims.role as string) || null;
      setRole(userRole);
      setChecking(false);
    }).catch(() => {
      setChecking(false);
    });
  }, [user, authLoading, router]);

  if (authLoading || checking) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Verifying access&hellip;</p>
      </div>
    );
  }

  if (!user || !role) {
    return (
      <div className={styles.denied}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
        <a href="/" className={styles.backLink}>Back to home</a>
      </div>
    );
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  if (!roles.includes(role as 'admin' | 'team')) {
    return (
      <div className={styles.denied}>
        <h2>Insufficient Permissions</h2>
        <p>Your role ({role}) does not have access to this section.</p>
        <a href="/dashboard" className={styles.backLink}>Back to dashboard</a>
      </div>
    );
  }

  return <>{children}</>;
}

export function useDashboardRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    user.getIdTokenResult().then(result => {
      setRole((result.claims.role as string) || null);
    });
  }, [user]);

  return role;
}
