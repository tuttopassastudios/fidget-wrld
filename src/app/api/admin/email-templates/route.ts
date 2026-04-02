import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { getAdminClient } from '@/lib/supabase/admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { checkOrigin } from '@/lib/origin-check';
import { sanitizeText, sanitizeSlug, sanitizeMultiline, stripProtoPollution } from '@/lib/sanitize';

/**
 * GET: List all email templates ordered by created_at desc
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
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Admin Email Templates] GET error:', error);
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }

    return NextResponse.json({ templates: data ?? [] });
  } catch (err) {
    console.error('[Admin Email Templates] GET exception:', err);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

/**
 * POST: Create a new email template
 */
export async function POST(request: NextRequest) {
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
  if (!rawBody) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const body = stripProtoPollution(rawBody as Record<string, unknown>);

  const name = typeof body.name === 'string' ? sanitizeText(body.name, 200) : '';
  const slug = typeof body.slug === 'string' ? sanitizeSlug(body.slug, 100) : '';
  const subject = typeof body.subject === 'string' ? sanitizeText(body.subject, 500) : '';
  const html_body = typeof body.html_body === 'string' ? sanitizeMultiline(body.html_body, 100000) : '';
  const description = typeof body.description === 'string' ? sanitizeText(body.description, 500) : null;
  const text_body = typeof body.text_body === 'string' ? sanitizeMultiline(body.text_body, 100000) : '';
  const enabled = typeof body.enabled === 'boolean' ? body.enabled : true;

  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });
  if (!slug) return NextResponse.json({ error: 'slug is required and must be alphanumeric with dashes' }, { status: 400 });
  if (!subject) return NextResponse.json({ error: 'subject is required' }, { status: 400 });
  if (!html_body) return NextResponse.json({ error: 'html_body is required' }, { status: 400 });

  try {
    const supabase = getAdminClient();

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('email_templates')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: `Slug "${slug}" is already in use` }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('email_templates')
      .insert({ name, slug, subject, html_body, text_body, description, enabled })
      .select()
      .single();

    if (error) {
      console.error('[Admin Email Templates] POST insert error:', error);
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }

    return NextResponse.json({ template: data }, { status: 201 });
  } catch (err) {
    console.error('[Admin Email Templates] POST exception:', err);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
