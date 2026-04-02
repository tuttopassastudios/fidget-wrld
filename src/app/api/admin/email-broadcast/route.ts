import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { getAdminClient } from '@/lib/supabase/admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { checkOrigin } from '@/lib/origin-check';
import { sanitizeText, sanitizeAlphanumeric, stripProtoPollution } from '@/lib/sanitize';
import { renderTemplate, EMAIL_FROM } from '@/lib/email';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * GET: Return subscriber count for the broadcast preview
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(getClientIp(request.headers), { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const caller = await verifyAdminRequest(request.headers.get('authorization'));
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const supabase = getAdminClient();
    const { count, error } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (error) {
      console.error('[Admin Email Broadcast] GET count error:', error);
      return NextResponse.json({ subscriberCount: 0 });
    }

    return NextResponse.json({ subscriberCount: count ?? 0 });
  } catch (err) {
    console.error('[Admin Email Broadcast] GET exception:', err);
    return NextResponse.json({ subscriberCount: 0 });
  }
}

/**
 * POST: Send a broadcast email to all active newsletter subscribers
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(ip, { limit: 2, windowMs: 3_600_000 }); // 2 per hour
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

  const templateId = typeof body.template_id === 'string' ? sanitizeAlphanumeric(body.template_id, 128) : '';
  if (!templateId) return NextResponse.json({ error: 'template_id is required' }, { status: 400 });

  const subjectOverride = typeof body.subject_override === 'string'
    ? sanitizeText(body.subject_override, 500)
    : null;

  try {
    const supabase = getAdminClient();

    // Fetch template
    const { data: tpl, error: tplError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (tplError || !tpl) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (!tpl.enabled) {
      return NextResponse.json({ error: 'Template is disabled' }, { status: 400 });
    }

    // Fetch active subscribers
    const { data: subscribers, error: subsError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('status', 'active');

    if (subsError) {
      console.error('[Admin Email Broadcast] subscriber fetch error:', subsError);
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }

    const emails = (subscribers ?? []).map(s => s.email).filter(Boolean);

    if (emails.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0 });
    }

    let sent = 0;
    let failed = 0;

    // Send in batches of 50
    const BATCH_SIZE = 50;
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(async (email) => {
          const vars: Record<string, string> = { email };
          const subject = renderTemplate(subjectOverride || tpl.subject, vars);
          const html = renderTemplate(tpl.html_body, vars);
          const text = tpl.text_body ? renderTemplate(tpl.text_body, vars) : undefined;

          const { error } = await resend.emails.send({
            from: EMAIL_FROM,
            to: [email],
            subject,
            html,
            ...(text ? { text } : {}),
          });

          if (error) throw error;
        })
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          sent++;
        } else {
          failed++;
          console.error('[Admin Email Broadcast] send error:', result.reason);
        }
      }
    }

    console.log(`[Admin Email Broadcast] Sent: ${sent}, Failed: ${failed}, Template: ${tpl.name}`);
    return NextResponse.json({ sent, failed });
  } catch (err) {
    console.error('[Admin Email Broadcast] POST exception:', err);
    return NextResponse.json({ error: 'Broadcast failed' }, { status: 500 });
  }
}
