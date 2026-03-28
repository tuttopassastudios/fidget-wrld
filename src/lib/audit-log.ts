type AuditAction =
  | 'session.create'
  | 'session.delete'
  | 'role.set'
  | 'role.remove'
  | 'role.bootstrap'
  | 'product.create'
  | 'product.update'
  | 'product.delete'
  | 'coa.create'
  | 'coa.delete'
  | 'order.update'
  | 'auth.failed';

interface AuditEntry {
  action: AuditAction;
  actorUid?: string;
  actorEmail?: string;
  targetId?: string;
  detail?: string;
  ip?: string;
}

/**
 * Log a security-relevant admin action.
 * On Vercel, console.warn flows to function logs and is searchable.
 */
export function audit(entry: AuditEntry) {
  const log = {
    _audit: true,
    ts: new Date().toISOString(),
    ...entry,
  };
  console.warn('[AUDIT]', JSON.stringify(log));
}
