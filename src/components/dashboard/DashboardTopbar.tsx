'use client';

import { useAuth } from '@/context/AuthContext';
import { useDashboardRole } from './DashboardGuard';
import styles from './DashboardTopbar.module.css';

interface DashboardTopbarProps {
  title: string;
}

export function DashboardTopbar({ title }: DashboardTopbarProps) {
  const { user, signOut } = useAuth();
  const role = useDashboardRole();

  return (
    <header className={styles.topbar}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.actions}>
        {role && (
          <span className={styles.roleBadge} data-role={role}>
            {role}
          </span>
        )}
        <span className={styles.userEmail}>{user?.email}</span>
        <button
          className={styles.signOutBtn}
          onClick={() => signOut()}
          type="button"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
