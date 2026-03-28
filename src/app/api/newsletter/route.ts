import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { sanitizeEmail } from '@/lib/sanitize';

/**
 * POST: Subscribe to newsletter
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);

  // Strict rate limit for newsletter signups (5 per minute per IP)
  const limited = rateLimit(ip, { limit: 5, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const email = sanitizeEmail(body.email);
  if (!email) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  try {
    const db = getAdminFirestore();
    const subscribersRef = db.collection('newsletter_subscribers');

    // Check if email already exists
    const existing = await subscribersRef.where('email', '==', email).limit(1).get();
    if (!existing.empty) {
      // Return success even if already subscribed (don't leak subscription status)
      return NextResponse.json({ success: true, message: 'Subscribed successfully' });
    }

    // Add new subscriber
    await subscribersRef.add({
      email,
      subscribedAt: new Date().toISOString(),
      source: 'homepage',
      status: 'active',
      ip: ip !== 'unknown' ? ip : null,
    });

    return NextResponse.json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    console.error('[Newsletter POST]', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
