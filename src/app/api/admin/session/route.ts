import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase-admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { checkOrigin } from '@/lib/origin-check';
import { audit } from '@/lib/audit-log';

/**
 * POST: Set the __session cookie with the Firebase ID token.
 * Called client-side after login when the user has a dashboard role.
 * The proxy reads this cookie to gate /dashboard routes at the edge.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(ip, { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  const originErr = checkOrigin(request.headers);
  if (originErr) return originErr;

  const body = await request.json().catch(() => null);
  const idToken = body?.idToken;

  if (!idToken) {
    return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
  }

  // Verify the token is valid before setting it as a cookie
  const decoded = await verifyIdToken(idToken);
  if (!decoded) {
    audit({ action: 'auth.failed', detail: 'session POST — invalid token', ip });
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const role = decoded.role as string | undefined;
  if (!role || (role !== 'admin' && role !== 'team')) {
    audit({ action: 'auth.failed', actorUid: decoded.uid, actorEmail: decoded.email, detail: 'session POST — no dashboard role', ip });
    return NextResponse.json({ error: 'No dashboard role' }, { status: 403 });
  }

  const response = NextResponse.json({ success: true, role });

  // Set the session cookie — httpOnly, secure, sameSite strict
  // Firebase ID tokens expire after 1 hour, so set max age accordingly
  response.cookies.set('__session', idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 3600, // 1 hour — matches Firebase ID token expiry
  });

  audit({ action: 'session.create', actorUid: decoded.uid, actorEmail: decoded.email, ip });
  return response;
}

/**
 * DELETE: Clear the __session cookie (sign out from dashboard).
 */
export async function DELETE(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(ip, { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  audit({ action: 'session.delete', ip });
  const response = NextResponse.json({ success: true });
  response.cookies.delete('__session');
  return response;
}
