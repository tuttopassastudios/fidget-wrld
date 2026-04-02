import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { checkOrigin } from '@/lib/origin-check';
import { sanitizeText, sanitizeMultiline, sanitizeEmail } from '@/lib/sanitize';
import { getAdminClient } from '@/lib/supabase/admin';

const resend = new Resend(process.env.RESEND_API_KEY);

const RECIPIENT = 'grant@fidgetwrld.com';
const FROM = 'Fidget WRLD Contact <noreply@fidgetwrld.com>';

export async function POST(request: NextRequest) {
  // Rate limit: 5 submissions per 5 minutes per IP
  const limited = rateLimit(getClientIp(request.headers), { limit: 5, windowMs: 5 * 60_000 });
  if (limited) return limited;

  // Origin check (CSRF protection)
  const originError = checkOrigin(request.headers);
  if (originError) return originError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;

  // Server-side honeypot check
  if (raw.website) {
    return NextResponse.json({ ok: true });
  }

  const firstName = sanitizeText(String(raw.firstName ?? ''), 100).trim();
  const lastName = sanitizeText(String(raw.lastName ?? ''), 100).trim();
  const email = sanitizeEmail(String(raw.email ?? ''));
  const subject = sanitizeText(String(raw.subject ?? ''), 200).trim();
  const message = sanitizeMultiline(String(raw.message ?? ''), 5000).trim();

  if (!firstName || !email || !subject || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Basic email format check (sanitizeEmail does structural validation, but double-check)
  if (!email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const name = [firstName, lastName].filter(Boolean).join(' ');

  const text = [
    `From: ${name} <${email}>`,
    `Subject: ${subject}`,
    '',
    message,
  ].join('\n');

  const html = `
    <table style="font-family:sans-serif;font-size:14px;color:#1a1a1a;max-width:600px">
      <tr><td style="padding-bottom:8px"><strong>From:</strong> ${escHtml(name)} &lt;${escHtml(email)}&gt;</td></tr>
      <tr><td style="padding-bottom:8px"><strong>Subject:</strong> ${escHtml(subject)}</td></tr>
      <tr><td style="padding-top:16px;border-top:1px solid #eee;white-space:pre-wrap">${escHtml(message)}</td></tr>
    </table>
  `;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: [RECIPIENT],
      replyTo: email,
      subject: `Contact: ${subject}`,
      text,
      html,
    });

    if (error) {
      console.error('[contact] Resend error:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Persist submission for dashboard visibility (best-effort — don't fail the request)
    try {
      const supabase = getAdminClient();
      await supabase.from('contact_submissions').insert({
        name,
        email,
        subject,
        message,
      });
    } catch (dbErr) {
      console.error('[contact] Failed to save submission:', dbErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[contact] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
