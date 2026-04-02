import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { getAdminClient } from '@/lib/supabase/admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { checkOrigin } from '@/lib/origin-check';
import { sanitizeAlphanumeric, stripProtoPollution } from '@/lib/sanitize';

/**
 * GET: List all automations with their linked template (name/subject). Order by trigger alphabetically.
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(getClientIp(request.headers), { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const caller = await verifyAdminRequest(request.headers.get('authorization'));
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('email_automations')
      .select('*, email_templates(id, name, subject)')
      .order('trigger', { ascending: true });

    if (error) {
      console.error('[Admin Email Automations] GET error:', error);
      return NextResponse.json({ error: 'Failed to fetch automations' }, { status: 500 });
    }

    return NextResponse.json({ automations: data ?? [] });
  } catch (err) {
    console.error('[Admin Email Automations] GET exception:', err);
    return NextResponse.json({ error: 'Failed to fetch automations' }, { status: 500 });
  }
}

/**
 * PATCH: Update automation — template_id and/or enabled
 */
export async function PATCH(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(ip, { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const originErr = checkOrigin(request.headers);
  if (originErr) return originErr;

  const caller = await verifyAdminRequest(request.headers.get('authorization'));
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const rawBody = await request.json().catch(() => null);
  if (!rawBody) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  const body = stripProtoPollution(rawBody as Record<string, unknown>);

  const id = typeof body.id === 'string' ? sanitizeAlphanumeric(body.id, 128) : '';
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof body.template_id === 'string' && body.template_id) {
    updates.template_id = sanitizeAlphanumeric(body.template_id, 128);
  } else if (body.template_id === null) {
    updates.template_id = null;
  }

  if (typeof body.enabled === 'boolean') {
    updates.enabled = body.enabled;
  }

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('email_automations')
      .update(updates)
      .eq('id', id)
      .select('*, email_templates(id, name, subject)')
      .single();

    if (error || !data) {
      console.error('[Admin Email Automations] PATCH error:', error);
      return NextResponse.json({ error: 'Failed to update automation' }, { status: 500 });
    }

    return NextResponse.json({ automation: data });
  } catch (err) {
    console.error('[Admin Email Automations] PATCH exception:', err);
    return NextResponse.json({ error: 'Failed to update automation' }, { status: 500 });
  }
}
