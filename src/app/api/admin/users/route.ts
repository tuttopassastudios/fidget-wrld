import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, verifyAdminRequest } from '@/lib/firebase-admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * GET: List all Firebase Auth users with pagination
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(getClientIp(request.headers), { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const caller = await verifyAdminRequest(request.headers.get('authorization'));
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const pageToken = searchParams.get('pageToken') || undefined;
  const limit = Math.min(parseInt(searchParams.get('limit') || '25', 10), 100);

  try {
    const auth = getAdminAuth();
    const listResult = await auth.listUsers(limit, pageToken);

    const users = listResult.users.map(user => ({
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      disabled: user.disabled,
      emailVerified: user.emailVerified,
      provider: user.providerData[0]?.providerId || 'unknown',
      role: (user.customClaims?.role as string) || null,
      createdAt: user.metadata.creationTime || null,
      lastSignIn: user.metadata.lastSignInTime || null,
    }));

    return NextResponse.json({
      users,
      nextPageToken: listResult.pageToken || null,
    });
  } catch (error) {
    console.error('[Admin Users]', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
