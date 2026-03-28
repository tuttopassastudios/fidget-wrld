'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DashboardGuard } from '@/components/dashboard/DashboardGuard';
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
import styles from '../page.module.css';
import settingsStyles from './page.module.css';
import { sanitizeEmail } from '@/lib/sanitize';

function SettingsContent() {
  const { user } = useAuth();
  const [targetEmail, setTargetEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'team'>('team');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSetRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !targetEmail.trim()) return;

    const cleanEmail = sanitizeEmail(targetEmail);
    if (!cleanEmail) {
      setResult({ success: false, message: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const token = await user.getIdToken();

      // First, find the user by email using Firebase Admin
      // We'll look up the UID from the users API
      const usersRes = await fetch('/api/admin/users?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData = await usersRes.json();
      const targetUser = usersData.users?.find(
        (u: { email: string }) => u.email === cleanEmail
      );

      if (!targetUser) {
        setResult({ success: false, message: `No user found with email: ${targetEmail}` });
        setLoading(false);
        return;
      }

      const res = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUid: targetUser.uid, role: selectedRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        setResult({ success: false, message: data.error || 'Failed to set role' });
      } else {
        setResult({
          success: true,
          message: `Set ${targetEmail} as ${selectedRole}. They must sign out and back in for the role to take effect.`,
        });
        setTargetEmail('');
      }
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DashboardTopbar title="Settings" />
      <div className={styles.content}>
        <div className={settingsStyles.card}>
          <h2 className={settingsStyles.cardTitle}>Manage Team Roles</h2>
          <p className={settingsStyles.description}>
            Assign dashboard access roles to team members. Users must sign out
            and back in after a role change.
          </p>

          <form onSubmit={handleSetRole} className={settingsStyles.form}>
            <label className={settingsStyles.label}>
              User Email
              <input
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="team@example.com"
                required
                className={settingsStyles.input}
              />
            </label>

            <label className={settingsStyles.label}>
              Role
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'team')}
                className={settingsStyles.select}
              >
                <option value="team">Team (read-only dashboard access)</option>
                <option value="admin">Admin (full dashboard + role management)</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={loading || !targetEmail.trim()}
              className={settingsStyles.submitBtn}
            >
              {loading ? 'Setting role\u2026' : 'Set Role'}
            </button>
          </form>

          {result && (
            <div
              className={`${settingsStyles.result} ${result.success ? settingsStyles.success : settingsStyles.error}`}
            >
              {result.message}
            </div>
          )}
        </div>

        <div className={settingsStyles.card}>
          <h2 className={settingsStyles.cardTitle}>Role Descriptions</h2>
          <dl className={settingsStyles.dl}>
            <dt>Admin</dt>
            <dd>Full dashboard access. Can view all data, update orders, and manage team roles.</dd>
            <dt>Team</dt>
            <dd>Read-only dashboard access. Can view orders, users, products, and stats but cannot make changes.</dd>
          </dl>
        </div>
      </div>
    </>
  );
}

export default function SettingsPage() {
  return (
    <DashboardGuard requiredRole="admin">
      <SettingsContent />
    </DashboardGuard>
  );
}
