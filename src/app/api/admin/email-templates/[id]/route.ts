import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { getAdminClient } from '@/lib/supabase/admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { checkOrigin } from '@/lib/origin-check';
import { sanitizeText, sanitizeSlug, sanitizeMultiline, sanitizeAlphanumeric, stripProtoPollution } from '@/lib/sanitize';

/**
 * GET: Fetch single email template by id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = rateLimit(getClientIp(request.headers), { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const caller = await verifyAdminRequest(request.headers.get('authorization'));
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const safeId = sanitizeAlphanumeric(id, 128);
  if (!safeId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', safeId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ template: data });
  } catch (err) {
    console.error('[Admin Email Templates/:id] GET exception:', err);
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
  }
}

/**
 * PATCH: Update an email template
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(ip, { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const originErr = checkOrigin(request.headers);
  if (originErr) return originErr;

  const caller = await verifyAdminRequest(request.headers.get('authorization'));
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const safeId = sanitizeAlphanumeric(id, 128);
  if (!safeId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const rawBody = await request.json().catch(() => null);
  if (!rawBody) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  const body = stripProtoPollution(rawBody as Record<string, unknown>);

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof body.name === 'string') updates.name = sanitizeText(body.name, 200);
  if (typeof body.slug === 'string') updates.slug = sanitizeSlug(body.slug, 100);
  if (typeof body.subject === 'string') updates.subject = sanitizeText(body.subject, 500);
  if (typeof body.html_body === 'string') updates.html_body = sanitizeMultiline(body.html_body, 100000);
  if (typeof body.text_body === 'string') updates.text_body = sanitizeMultiline(body.text_body, 100000);
  if (typeof body.description === 'string') updates.description = sanitizeText(body.description, 500);
  if (body.description === null) updates.description = null;
  if (typeof body.enabled === 'boolean') updates.enabled = body.enabled;

  try {
    const supabase = getAdminClient();

    // If slug is being updated, check uniqueness
    if (updates.slug) {
      const { data: existing } = await supabase
        .from('email_templates')
        .select('id')
        .eq('slug', updates.slug as string)
        .neq('id', safeId)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ error: `Slug "${updates.slug}" is already in use` }, { status: 409 });
      }
    }

    const { data, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', safeId)
      .select()
      .single();

    if (error || !data) {
      console.error('[Admin Email Templates/:id] PATCH error:', error);
      return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }

    return NextResponse.json({ template: data });
  } catch (err) {
    console.error('[Admin Email Templates/:id] PATCH exception:', err);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

/**
 * DELETE: Delete an email template (checks for automation references first)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(ip, { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  const originErr = checkOrigin(request.headers);
  if (originErr) return originErr;

  const caller = await verifyAdminRequest(request.headers.get('authorization'));
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const safeId = sanitizeAlphanumeric(id, 128);
  if (!safeId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  try {
    const supabase = getAdminClient();

    // Check for automation references
    const { data: refs } = await supabase
      .from('email_automations')
      .select('id, trigger')
      .eq('template_id', safeId);

    if (refs && refs.length > 0) {
      const triggers = refs.map(r => r.trigger).join(', ');
      return NextResponse.json(
        { error: `Template is in use by automation(s): ${triggers}. Unlink them first.` },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', safeId);

    if (error) {
      console.error('[Admin Email Templates/:id] DELETE error:', error);
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Admin Email Templates/:id] DELETE exception:', err);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
