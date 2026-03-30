import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
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
    const supabase = getAdminClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .limit(1)
      .single();

    if (existing) {
      // Return success even if already subscribed (don't leak subscription status)
      return NextResponse.json({ success: true, message: 'Subscribed successfully' });
    }

    // Add new subscriber
    const { error } = await supabase.from('newsletter_subscribers').insert({
      email,
      subscribed_at: new Date().toISOString(),
      source: 'homepage',
      status: 'active',
      ip: ip !== 'unknown' ? ip : null,
    });

    if (error) {
      // Handle unique constraint violation (race condition)
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: 'Subscribed successfully' });
      }
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    console.error('[Newsletter POST]', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
