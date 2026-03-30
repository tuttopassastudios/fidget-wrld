import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, verifyAdminRequest, type AdminRole } from '@/lib/admin-auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { checkOrigin } from '@/lib/origin-check';
import { audit } from '@/lib/audit-log';
import { sanitizeAlphanumeric } from '@/lib/sanitize';

// Bootstrap UID from env — if unset, bootstrap path is disabled (safe default)
const BOOTSTRAP_ADMIN_UID = process.env.BOOTSTRAP_ADMIN_UID || '';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(ip, { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const originErr = checkOrigin(request.headers);
  if (originErr) return originErr;

  const body = await request.json().catch(() => null);
  if (!body?.targetUid || !body?.role) {
    return NextResponse.json(
      { error: 'Missing targetUid or role' },
      { status: 400 }
    );
  }

  const targetUid = sanitizeAlphanumeric(String(body.targetUid), 128);
  const role = String(body.role);

  // Validate role value
  const validRoles: AdminRole[] = ['admin', 'team'];
  if (!validRoles.includes(role as AdminRole)) {
    return NextResponse.json(
      { error: 'Invalid role. Must be "admin" or "team"' },
      { status: 400 }
    );
  }

  const authHeader = request.headers.get('authorization');

  // Bootstrap path: allow the bootstrap UID to self-promote if they lack admin role
  if (BOOTSTRAP_ADMIN_UID) {
    const bootstrapToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (bootstrapToken && targetUid === BOOTSTRAP_ADMIN_UID) {
      const decoded = await getAdminAuth().verifyIdToken(bootstrapToken).catch(() => null);
      if (decoded?.uid === BOOTSTRAP_ADMIN_UID) {
        await getAdminAuth().setCustomUserClaims(targetUid, { role });
        audit({ action: 'role.bootstrap', actorUid: decoded.uid, actorEmail: decoded.email, targetId: targetUid, detail: role, ip });
        return NextResponse.json({ success: true, bootstrapped: true });
      }
    }
  }

  // Normal path: only admins can set roles
  const caller = await verifyAdminRequest(authHeader, 'admin');
  if (!caller) {
    audit({ action: 'auth.failed', detail: 'set-role POST', ip });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Prevent admins from removing their own admin role
  if (caller.uid === targetUid && role !== 'admin') {
    return NextResponse.json(
      { error: 'Cannot remove your own admin role' },
      { status: 400 }
    );
  }

  await getAdminAuth().setCustomUserClaims(targetUid, { role });
  audit({ action: 'role.set', actorUid: caller.uid, actorEmail: caller.email, targetId: targetUid, detail: role, ip });

  return NextResponse.json({ success: true });
}

/**
 * DELETE: Remove role from a user (admin only)
 */
export async function DELETE(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(ip, { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const originErr = checkOrigin(request.headers);
  if (originErr) return originErr;

  const { searchParams } = new URL(request.url);
  const targetUid = searchParams.get('targetUid')
    ? sanitizeAlphanumeric(searchParams.get('targetUid')!, 128)
    : null;

  if (!targetUid) {
    return NextResponse.json({ error: 'Missing targetUid' }, { status: 400 });
  }

  const caller = await verifyAdminRequest(
    request.headers.get('authorization'),
    'admin'
  );
  if (!caller) {
    audit({ action: 'auth.failed', detail: 'set-role DELETE', ip });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Prevent admins from removing their own role
  if (caller.uid === targetUid) {
    return NextResponse.json(
      { error: 'Cannot remove your own role' },
      { status: 400 }
    );
  }

  await getAdminAuth().setCustomUserClaims(targetUid, { role: null });
  audit({ action: 'role.remove', actorUid: caller.uid, actorEmail: caller.email, targetId: targetUid, ip });

  return NextResponse.json({ success: true });
}
