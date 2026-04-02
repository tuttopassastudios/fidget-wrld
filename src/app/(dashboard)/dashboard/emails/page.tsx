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

interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  subject: string;
  html_body: string;
  text_body: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface EmailAutomation {
  id: string;
  trigger: string;
  label: string;
  description: string | null;
  template_id: string | null;
  enabled: boolean;
  updated_at: string;
  email_templates: { id: string; name: string; subject: string } | null;
}

type Tab = 'submissions' | 'sent' | 'templates' | 'automations' | 'broadcasts';

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

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

function detectVars(template: string): string[] {
  const matches = template.match(/\{\{(\w+)\}\}/g) ?? [];
  const unique = new Set(matches.map(m => m.slice(2, -2)));
  return Array.from(unique);
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
          <span>Showing {(page - 1) * LIMIT + 1}&ndash;{Math.min(page * LIMIT, total)} of {total}</span>
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

// ─── Templates tab ────────────────────────────────────────────────────────────

const TRIGGER_VARS: Record<string, string[]> = {
  welcome: ['first_name', 'email'],
  order_confirmation: ['first_name', 'email', 'order_id', 'order_total', 'items'],
  shipping_notification: ['first_name', 'email', 'order_id', 'tracking_number'],
  broadcast: ['email'],
};

function TemplatesTab({ token }: { token: string }) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [textBody, setTextBody] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [showTextBody, setShowTextBody] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [slugAutoGen, setSlugAutoGen] = useState(true);

  // Preview vars
  const [previewVars, setPreviewVars] = useState<Record<string, string>>({});

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/email-templates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setTemplates(data.templates ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const openNew = () => {
    setEditingTemplate(null);
    setName(''); setSlug(''); setDescription(''); setSubject('');
    setHtmlBody(''); setTextBody(''); setEnabled(true);
    setShowTextBody(false); setFormError(null); setPreviewVars({});
    setSlugAutoGen(true);
    setView('edit');
  };

  const openEdit = (tpl: EmailTemplate) => {
    setEditingTemplate(tpl);
    setName(tpl.name); setSlug(tpl.slug); setDescription(tpl.description ?? '');
    setSubject(tpl.subject); setHtmlBody(tpl.html_body); setTextBody(tpl.text_body);
    setEnabled(tpl.enabled); setShowTextBody(!!tpl.text_body);
    setFormError(null); setPreviewVars({}); setSlugAutoGen(false);
    setView('edit');
  };

  const handleNameChange = (v: string) => {
    setName(v);
    if (slugAutoGen) setSlug(generateSlug(v));
  };

  const detectedVars = detectVars(htmlBody + ' ' + subject);

  const renderedPreview = htmlBody.replace(/\{\{(\w+)\}\}/g, (_, key) => previewVars[key] ?? `[${key}]`);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) { setFormError('Name is required'); return; }
    if (!slug.trim()) { setFormError('Slug is required'); return; }
    if (!subject.trim()) { setFormError('Subject is required'); return; }
    if (!htmlBody.trim()) { setFormError('HTML Body is required'); return; }

    setSaving(true);
    try {
      const payload = { name, slug, description: description || null, subject, html_body: htmlBody, text_body: textBody, enabled };
      const url = editingTemplate ? `/api/admin/email-templates/${editingTemplate.id}` : '/api/admin/email-templates';
      const method = editingTemplate ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      await fetchTemplates();
      setView('list');
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTemplate) return;
    if (!confirm(`Delete template "${editingTemplate.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/email-templates/${editingTemplate.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      await fetchTemplates();
      setView('list');
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading templates&hellip;</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  if (view === 'edit') {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
          <button type="button" className={styles.pageBtn} onClick={() => setView('list')}>
            &larr; Back
          </button>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
            {editingTemplate ? `Edit: ${editingTemplate.name}` : 'New Template'}
          </h2>
        </div>

        {formError && <div className={styles.error} style={{ minHeight: 'auto', padding: 'var(--space-3)', marginBottom: 'var(--space-4)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.3)' }}>{formError}</div>}

        <form onSubmit={handleSave}>
          <div className={styles.editorLayout}>
            <div className={styles.editorForm}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="tpl-name">Name</label>
                <input
                  id="tpl-name"
                  type="text"
                  className={styles.fieldInput}
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  maxLength={200}
                  placeholder="Welcome Email…"
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="tpl-slug">Slug</label>
                <input
                  id="tpl-slug"
                  type="text"
                  className={styles.fieldInput}
                  value={slug}
                  onChange={e => { setSlug(e.target.value); setSlugAutoGen(false); }}
                  maxLength={100}
                  placeholder="welcome-email…"
                  pattern="[a-z0-9\-]+"
                  title="Lowercase letters, numbers, and dashes only"
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="tpl-description">Description <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span></label>
                <input
                  id="tpl-description"
                  type="text"
                  className={styles.fieldInput}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  maxLength={500}
                  placeholder="Sent when a new user signs up…"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="tpl-subject">Subject</label>
                <input
                  id="tpl-subject"
                  type="text"
                  className={styles.fieldInput}
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  maxLength={500}
                  placeholder="Welcome to Fidget WRLD, {{first_name}}!…"
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="tpl-html">HTML Body</label>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                  Use <code style={{ fontFamily: 'monospace' }}>{'{{variable}}'}</code> for dynamic content.
                  {' '}Known vars: {Object.entries(TRIGGER_VARS).map(([t, v]) => `${t}: ${v.map(x => `{{${x}}}`).join(', ')}`).join(' | ')}
                </p>
                <textarea
                  id="tpl-html"
                  className={`${styles.fieldInput} ${styles.codeArea}`}
                  value={htmlBody}
                  onChange={e => setHtmlBody(e.target.value)}
                  maxLength={100000}
                  placeholder="<p>Hello {{first_name}},</p>…"
                  spellCheck={false}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <button
                  type="button"
                  className={styles.toggleReadBtn}
                  onClick={() => setShowTextBody(v => !v)}
                  style={{ marginBottom: 'var(--space-2)' }}
                >
                  {showTextBody ? 'Hide' : 'Add'} Plain Text Body
                </button>
                {showTextBody && (
                  <textarea
                    className={`${styles.fieldInput} ${styles.codeArea}`}
                    style={{ minHeight: 150 }}
                    value={textBody}
                    onChange={e => setTextBody(e.target.value)}
                    maxLength={100000}
                    placeholder="Hello {{first_name}},…"
                    spellCheck={false}
                    aria-label="Plain text body"
                  />
                )}
              </div>

              <div className={styles.fieldGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--space-3)' }}>
                <label className={styles.fieldLabel} style={{ margin: 0 }} htmlFor="tpl-enabled">Enabled</label>
                <label className={styles.toggle} aria-label="Template enabled">
                  <input
                    id="tpl-enabled"
                    type="checkbox"
                    checked={enabled}
                    onChange={e => setEnabled(e.target.checked)}
                  />
                  <span className={styles.toggleTrack}><span className={styles.toggleThumb} /></span>
                </label>
                <span className={`${styles.chip} ${enabled ? styles.chipEnabled : styles.chipDisabled}`}>
                  {enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  className={styles.replyBtn}
                  disabled={saving || deleting}
                  style={{ minWidth: 100 }}
                >
                  {saving ? 'Saving\u2026' : 'Save Template'}
                </button>
                {editingTemplate && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving || deleting}
                    style={{
                      padding: 'var(--space-1) var(--space-3)',
                      background: 'transparent',
                      border: '1px solid rgba(248,113,113,0.4)',
                      borderRadius: 6,
                      color: '#f87171',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    {deleting ? 'Deleting\u2026' : 'Delete'}
                  </button>
                )}
              </div>
            </div>

            {/* Preview panel */}
            <div className={styles.previewPanel}>
              <p className={styles.fieldLabel} style={{ marginBottom: 'var(--space-3)' }}>Preview</p>

              {detectedVars.length > 0 && (
                <div className={styles.previewVars}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                    Sample values for detected variables:
                  </p>
                  {detectedVars.map(v => (
                    <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', minWidth: 100, fontFamily: 'monospace' }}>{`{{${v}}}`}</label>
                      <input
                        type="text"
                        className={styles.fieldInput}
                        style={{ fontSize: '0.75rem', padding: '4px 8px', flex: 1 }}
                        value={previewVars[v] ?? ''}
                        onChange={e => setPreviewVars(prev => ({ ...prev, [v]: e.target.value }))}
                        placeholder={`Sample ${v}…`}
                        aria-label={`Preview value for ${v}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.previewHtml}>
                {htmlBody
                  ? <div dangerouslySetInnerHTML={{ __html: renderedPreview }} />
                  : <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Enter HTML body to see preview&hellip;</p>
                }
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // List view
  return (
    <div className={styles.templateList}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          {templates.length} template{templates.length !== 1 ? 's' : ''}
        </p>
        <button type="button" className={styles.replyBtn} onClick={openNew}>
          + New Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className={styles.empty}>No templates yet. Create your first template.</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Name</th>
                <th className={styles.th}>Slug</th>
                <th className={styles.th}>Subject</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {templates.map(tpl => (
                <tr key={tpl.id} className={styles.tr} style={{ cursor: 'default' }}>
                  <td className={`${styles.td} ${styles.tdName}`}>{tpl.name}</td>
                  <td className={`${styles.td} ${styles.mono}`}>{tpl.slug}</td>
                  <td className={`${styles.td} ${styles.tdSubject}`}>{tpl.subject}</td>
                  <td className={styles.td}>
                    <span className={`${styles.chip} ${tpl.enabled ? styles.chipEnabled : styles.chipDisabled}`}>
                      {tpl.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <button type="button" className={styles.toggleReadBtn} onClick={() => openEdit(tpl)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Automations tab ──────────────────────────────────────────────────────────

function AutomationsTab({ token }: { token: string }) {
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [autoRes, tplRes] = await Promise.all([
        fetch('/api/admin/email-automations', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/email-templates', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const autoData = await autoRes.json();
      const tplData = await tplRes.json();
      if (!autoRes.ok) throw new Error(autoData.error || 'Failed to load automations');
      setAutomations(autoData.automations ?? []);
      setTemplates(tplData.templates ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const patch = async (id: string, update: Record<string, unknown>) => {
    setUpdating(id);
    try {
      const res = await fetch('/api/admin/email-automations', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...update }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      setAutomations(prev => prev.map(a => a.id === id ? data.automation : a));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className={styles.loading}>Loading automations&hellip;</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Trigger</th>
            <th className={styles.th}>Label</th>
            <th className={styles.th}>Description</th>
            <th className={styles.th}>Template</th>
            <th className={styles.th}>Enabled</th>
          </tr>
        </thead>
        <tbody>
          {automations.map(a => (
            <tr key={a.id} className={`${styles.tr} ${styles.automationRow}`} style={{ cursor: 'default' }}>
              <td className={`${styles.td} ${styles.mono}`}>{a.trigger}</td>
              <td className={`${styles.td} ${styles.tdName}`}>{a.label}</td>
              <td className={`${styles.td} ${styles.tdPreview}`}>{a.description ?? '—'}</td>
              <td className={styles.td}>
                <select
                  className={styles.fieldSelect}
                  value={a.template_id ?? ''}
                  disabled={updating === a.id}
                  onChange={e => patch(a.id, { template_id: e.target.value || null })}
                  aria-label={`Template for ${a.trigger}`}
                >
                  <option value="">— No template —</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </td>
              <td className={styles.td}>
                <label className={styles.toggle} aria-label={`Enable ${a.trigger}`}>
                  <input
                    type="checkbox"
                    checked={a.enabled}
                    disabled={updating === a.id}
                    onChange={e => patch(a.id, { enabled: e.target.checked })}
                  />
                  <span className={styles.toggleTrack}><span className={styles.toggleThumb} /></span>
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Broadcasts tab ───────────────────────────────────────────────────────────

function BroadcastsTab({ token }: { token: string }) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [subjectOverride, setSubjectOverride] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [tplRes, countRes] = await Promise.all([
          fetch('/api/admin/email-templates', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/email-broadcast', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const tplData = await tplRes.json();
        const countData = await countRes.json();
        setTemplates((tplData.templates ?? []).filter((t: EmailTemplate) => t.enabled));
        setSubscriberCount(countData.subscriberCount ?? 0);
      } catch {
        setError('Failed to load broadcast data');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  const handleSend = async () => {
    if (!selectedTemplateId) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/email-broadcast', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: selectedTemplateId, subject_override: subjectOverride || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Broadcast failed');
      setResult(data);
      setConfirmed(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Broadcast failed');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading&hellip;</div>;

  return (
    <div className={styles.broadcastForm}>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel} htmlFor="bc-template">Template</label>
        <select
          id="bc-template"
          className={styles.fieldSelect}
          value={selectedTemplateId}
          onChange={e => { setSelectedTemplateId(e.target.value); setConfirmed(false); setResult(null); }}
        >
          <option value="">— Select a template —</option>
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {selectedTemplate && (
        <div className={styles.fieldGroup}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            <strong style={{ color: 'var(--color-text-secondary)' }}>Default subject:</strong>{' '}
            {selectedTemplate.subject}
          </p>
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel} htmlFor="bc-subject">Subject Override <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span></label>
        <input
          id="bc-subject"
          type="text"
          className={styles.fieldInput}
          value={subjectOverride}
          onChange={e => setSubjectOverride(e.target.value)}
          maxLength={500}
          placeholder="Leave blank to use template subject…"
        />
      </div>

      <div className={styles.fieldGroup}>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          <strong>Subscribers:</strong>{' '}
          {subscriberCount === null ? '…' : subscriberCount.toLocaleString()} active
        </p>
      </div>

      {error && (
        <div className={styles.error} style={{ minHeight: 'auto', padding: 'var(--space-3)', marginBottom: 'var(--space-4)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.3)' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ padding: 'var(--space-3)', borderRadius: 8, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', marginBottom: 'var(--space-4)', fontSize: '0.875rem' }}>
          <strong style={{ color: '#34d399' }}>Broadcast sent!</strong>{' '}
          {result.sent} delivered, {result.failed} failed.
        </div>
      )}

      {!confirmed && !result && (
        <button
          type="button"
          className={styles.replyBtn}
          disabled={!selectedTemplateId || sending}
          onClick={() => setConfirmed(true)}
        >
          Send Broadcast&hellip;
        </button>
      )}

      {confirmed && !result && (
        <div className={styles.confirmBanner}>
          <p>
            <strong>Are you sure?</strong> This will send an email to{' '}
            <strong>{subscriberCount?.toLocaleString() ?? '?'} active subscriber{subscriberCount !== 1 ? 's' : ''}</strong>.
            This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
            <button
              type="button"
              className={styles.replyBtn}
              disabled={sending}
              onClick={handleSend}
            >
              {sending ? 'Sending\u2026' : 'Confirm — Send Now'}
            </button>
            <button
              type="button"
              className={styles.toggleReadBtn}
              disabled={sending}
              onClick={() => setConfirmed(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
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

  const tabs: { key: Tab; label: string }[] = [
    { key: 'submissions', label: 'Contact Submissions' },
    { key: 'sent', label: 'Sent' },
    { key: 'templates', label: 'Templates' },
    { key: 'automations', label: 'Automations' },
    { key: 'broadcasts', label: 'Broadcasts' },
  ];

  return (
    <>
      <DashboardTopbar title="E-Mails" />
      <div className={styles.content}>
        <div className={styles.tabs} role="tablist" aria-label="Email sections">
          {tabs.map(t => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={`${styles.tab} ${tab === t.key ? styles.activeTab : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.key === 'submissions' && unreadCount > 0 && (
                <span className={styles.unreadBadge} aria-label={`${unreadCount} unread`}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'submissions' && <SubmissionsTab token={token} />}
        {tab === 'sent' && <SentEmailsTab token={token} />}
        {tab === 'templates' && <TemplatesTab token={token} />}
        {tab === 'automations' && <AutomationsTab token={token} />}
        {tab === 'broadcasts' && <BroadcastsTab token={token} />}
      </div>
    </>
  );
}
