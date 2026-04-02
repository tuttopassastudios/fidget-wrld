import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { getAdminClient } from '@/lib/supabase/admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { Resend } from 'resend';
import { sanitizeAlphanumeric } from '@/lib/sanitize';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * GET /api/admin/emails
 * ?tab=submissions|sent  (default: submissions)
 * ?page=1&limit=50
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(getClientIp(request.headers), { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const caller = await verifyAdminRequest(request.headers.get('authorization'));
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const tab = searchParams.get('tab') === 'sent' ? 'sent' : 'submissions';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
  const offset = (page - 1) * limit;

  if (tab === 'sent') {
    try {
      const { data, error } = await resend.emails.list();
      if (error) throw new Error(error.message);
      return NextResponse.json({ emails: data?.data ?? [] });
    } catch (err) {
      console.error('[Admin Emails] Resend list error:', err);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Failed to fetch sent emails' },
        { status: 500 }
      );
    }
  }

  // Contact submissions
  try {
    const supabase = getAdminClient();
    const { data, error, count } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      submissions: data ?? [],
      total: count ?? 0,
      page,
      limit,
    });
  } catch (err) {
    console.error('[Admin Emails] Supabase error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/emails
 * Body: { id: string, read: boolean }
 * Mark a contact submission as read/unread
 */
export async function PATCH(request: NextRequest) {
  const limited = rateLimit(getClientIp(request.headers), { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const caller = await verifyAdminRequest(request.headers.get('authorization'));
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  let body: { id?: unknown; read?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const id = body.id ? sanitizeAlphanumeric(String(body.id), 64) : null;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  if (typeof body.read !== 'boolean') return NextResponse.json({ error: 'read must be boolean' }, { status: 400 });

  try {
    const supabase = getAdminClient();
    const { error } = await supabase
      .from('contact_submissions')
      .update({ read: body.read })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Admin Emails] PATCH error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update submission' },
      { status: 500 }
    );
  }
}
