import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken } from '@/lib/firebase-admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const limited = rateLimit(getClientIp(request.headers), { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const token = extractBearerToken(request.headers.get('authorization'));
  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const decoded = await verifyIdToken(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const role = (decoded.role as string) || null;

  return NextResponse.json({
    uid: decoded.uid,
    email: decoded.email,
    role,
    authorized: role === 'admin' || role === 'team',
  });
}
