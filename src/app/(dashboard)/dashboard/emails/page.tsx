'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
import styles from './page.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface SentEmail {
  id: string;
  from: string;
  to: string[];
  subject: string;
  created_at: string;
  last_event: string;
}

type Tab = 'submissions' | 'sent';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

function statusClass(event: string) {
  switch (event?.toLowerCase()) {
    case 'delivered': return styles.statusDelivered;
    case 'bounced':
    case 'complained': return styles.statusBounced;
    case 'sent':
    case 'email.sent': return styles.statusSent;
    default: return styles.statusDefault;
  }
}

// ─── Contact Submissions tab ──────────────────────────────────────────────────

function SubmissionsTab({ token }: { token: string }) {
  const [rows, setRows] = useState<ContactSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const LIMIT = 50;

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/emails?tab=submissions&page=${p}&limit=${LIMIT}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setRows(data.submissions);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchPage(page); }, [fetchPage, page]);

  const toggleExpand = async (id: string, isUnread: boolean) => {
    setExpanded(prev => prev === id ? null : id);
    if (isUnread) {
      // Mark as read optimistically
      setRows(prev => prev.map(r => r.id === id ? { ...r, read: true } : r));
      await fetch('/api/admin/emails', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, read: true }),
      });
    }
  };

  const toggleRead = async (e: React.MouseEvent, sub: ContactSubmission) => {
    e.stopPropagation();
    const newRead = !sub.read;
    setRows(prev => prev.map(r => r.id === sub.id ? { ...r, read: newRead } : r));
    await fetch('/api/admin/emails', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: sub.id, read: newRead }),
    });
  };

  const unread = rows.filter(r => !r.read).length;

  if (loading) return <div className={styles.loading}>Loading submissions&hellip;</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (rows.length === 0) return <div className={styles.empty}>No contact submissions yet.</div>;

  return (
    <>
      {unread > 0 && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
          {unread} unread
        </p>
      )}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}></th>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Subject</th>
              <th className={styles.th}>Preview</th>
              <th className={styles.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(sub => (
              <>
                <tr
                  key={sub.id}
                  className={`${styles.tr} ${!sub.read ? styles.trUnread : ''} ${expanded === sub.id ? styles.trExpanded : ''}`}
                  onClick={() => toggleExpand(sub.id, !sub.read)}
                  aria-expanded={expanded === sub.id}
                >
                  <td className={styles.td} style={{ width: 20, paddingRight: 0 }}>
                    {!sub.read && <span className={styles.unreadDot} aria-label="Unread" />}
                  </td>
                  <td className={`${styles.td} ${styles.tdName} ${!sub.read ? styles.tdUnread : ''}`}>
                    {sub.name}
                  </td>
                  <td className={styles.td}>{sub.email}</td>
                  <td className={`${styles.td} ${styles.tdSubject}`}>{sub.subject}</td>
                  <td className={`${styles.td} ${styles.tdPreview}`}>{sub.message}</td>
                  <td className={`${styles.td} ${styles.tdDate}`}>{fmtDate(sub.created_at)}</td>
                </tr>
                {expanded === sub.id && (
                  <tr className={styles.expandedRow}>
                    <td colSpan={6}>
                      <div className={styles.messagePanel}>
                        <div className={styles.messageHeader}>
                          <div className={styles.messageMeta}>
                            <p className={styles.metaRow}><strong>From:</strong> {sub.name} &lt;{sub.email}&gt;</p>
                            <p className={styles.metaRow}><strong>Subject:</strong> {sub.subject}</p>
                            <p className={styles.metaRow}><strong>Received:</strong> {fmtDate(sub.created_at)}</p>
                          </div>
                          <div className={styles.messageActions}>
                            <a
                              href={`mailto:${sub.email}?subject=Re: ${encodeURIComponent(sub.subject)}`}
                              className={styles.replyBtn}
                              onClick={e => e.stopPropagation()}
                            >
                              Reply
                            </a>
                            <button
                              type="button"
                              className={styles.toggleReadBtn}
                              onClick={e => toggleRead(e, sub)}
                            >
                              {sub.read ? 'Mark unread' : 'Mark read'}
                            </button>
                          </div>
                        </div>
                        <p className={styles.messageBody}>{sub.message}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
      {total > LIMIT && (
        <div className={styles.pagination}>
          <span>Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}</span>
          <div className={styles.pageButtons}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={page * LIMIT >= total}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Sent Emails tab ──────────────────────────────────────────────────────────

function SentEmailsTab({ token }: { token: string }) {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/emails?tab=sent', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load');
        setEmails(data.emails ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) return <div className={styles.loading}>Loading sent emails&hellip;</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (emails.length === 0) return <div className={styles.empty}>No sent emails found.</div>;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Date</th>
            <th className={styles.th}>To</th>
            <th className={styles.th}>Subject</th>
            <th className={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {emails.map(email => (
            <tr key={email.id} className={styles.tr} style={{ cursor: 'default' }}>
              <td className={`${styles.td} ${styles.tdDate}`}>{fmtDate(email.created_at)}</td>
              <td className={styles.td}>{Array.isArray(email.to) ? email.to.join(', ') : email.to}</td>
              <td className={`${styles.td} ${styles.tdSubject}`}>{email.subject}</td>
              <td className={styles.td}>
                <span className={`${styles.statusBadge} ${statusClass(email.last_event)}`}>
                  {email.last_event?.replace('email.', '') || 'unknown'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmailsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('submissions');
  const [token, setToken] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    user.getIdToken().then(setToken);
  }, [user]);

  // Fetch unread count for the badge on the Submissions tab
  useEffect(() => {
    if (!token) return;
    fetch('/api/admin/emails?tab=submissions&limit=100', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        const count = (d.submissions as ContactSubmission[] | undefined)?.filter(s => !s.read).length ?? 0;
        setUnreadCount(count);
      })
      .catch(() => {});
  }, [token]);

  if (!token) {
    return (
      <>
        <DashboardTopbar title="E-Mails" />
        <div className={styles.content}>
          <div className={styles.loading}>Loading&hellip;</div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardTopbar title="E-Mails" />
      <div className={styles.content}>
        <div className={styles.tabs} role="tablist" aria-label="Email sections">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'submissions'}
            className={`${styles.tab} ${tab === 'submissions' ? styles.activeTab : ''}`}
            onClick={() => setTab('submissions')}
          >
            Contact Submissions
            {unreadCount > 0 && (
              <span className={styles.unreadBadge} aria-label={`${unreadCount} unread`}>
                {unreadCount}
              </span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'sent'}
            className={`${styles.tab} ${tab === 'sent' ? styles.activeTab : ''}`}
            onClick={() => setTab('sent')}
          >
            Sent Emails
          </button>
        </div>

        {tab === 'submissions' && <SubmissionsTab token={token} />}
        {tab === 'sent' && <SentEmailsTab token={token} />}
      </div>
    </>
  );
}
