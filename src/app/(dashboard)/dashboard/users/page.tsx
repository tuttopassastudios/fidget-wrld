'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDashboardRole } from '@/components/dashboard/DashboardGuard';
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
import { DataTable, type Column } from '@/components/dashboard/DataTable';
import styles from '../page.module.css';

interface UserRecord {
  uid: string;
  email: string | null;
  displayName: string | null;
  disabled: boolean;
  emailVerified: boolean;
  provider: string;
  role: string | null;
  createdAt: string | null;
  lastSignIn: string | null;
}

const columns: Column<UserRecord>[] = [
  { key: 'email', label: 'Email' },
  {
    key: 'displayName',
    label: 'Name',
    render: (item) => item.displayName || '—',
  },
  {
    key: 'provider',
    label: 'Provider',
    render: (item) => item.provider === 'google.com' ? 'Google' : 'Email',
  },
  {
    key: 'role',
    label: 'Role',
    render: (item) => item.role ? (
      <span className={styles.roleBadge} data-role={item.role}>{item.role}</span>
    ) : '—',
  },
  {
    key: 'createdAt',
    label: 'Joined',
    render: (item) => item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—',
  },
  {
    key: 'lastSignIn',
    label: 'Last Sign In',
    render: (item) => item.lastSignIn ? new Date(item.lastSignIn).toLocaleDateString() : '—',
  },
];

export default function UsersPage() {
  const { user } = useAuth();
  const role = useDashboardRole();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  const fetchUsers = useCallback(async (pageToken?: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams({ limit: '50' });
      if (pageToken) params.set('pageToken', pageToken);

      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(pageToken ? (prev) => [...prev, ...data.users] : data.users);
      setNextPageToken(data.nextPageToken);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const setUserRole = async (targetUid: string, newRole: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUid, role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to set role');
        return;
      }
      // Refresh user list
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const columnsWithActions: Column<UserRecord>[] = role === 'admin'
    ? [
        ...columns,
        {
          key: 'actions',
          label: 'Actions',
          render: (item) => (
            <select
              value={item.role || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val) setUserRole(item.uid, val);
              }}
              className={styles.roleSelect}
              aria-label={`Set role for ${item.email}`}
            >
              <option value="">No role</option>
              <option value="team">Team</option>
              <option value="admin">Admin</option>
            </select>
          ),
        },
      ]
    : columns;

  return (
    <>
      <DashboardTopbar title="Users" />
      <div className={styles.content}>
        {loading && users.length === 0 ? (
          <div className={styles.loading}>Loading users&hellip;</div>
        ) : (
          <>
            <DataTable
              columns={columnsWithActions}
              data={users}
              keyExtractor={(item) => item.uid}
              emptyMessage="No registered users"
            />
            {nextPageToken && (
              <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                <button
                  onClick={() => fetchUsers(nextPageToken)}
                  disabled={loading}
                  className={styles.loadMoreBtn}
                  type="button"
                >
                  {loading ? 'Loading\u2026' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
