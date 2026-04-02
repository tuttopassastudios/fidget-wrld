import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { checkOrigin } from '@/lib/origin-check';
import { sanitizeText, sanitizeEmail, stripProtoPollution } from '@/lib/sanitize';
import { triggerEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(ip, { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  const originErr = checkOrigin(request.headers);
  if (originErr) return originErr;

  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) return NextResponse.json({ ok: true });

    const body = stripProtoPollution(rawBody as Record<string, unknown>);

    const trigger = typeof body.trigger === 'string' ? sanitizeText(body.trigger, 100) : '';
    const to = typeof body.to === 'string' ? sanitizeEmail(body.to) : '';
    const rawVars = (body.vars && typeof body.vars === 'object' && !Array.isArray(body.vars))
      ? body.vars as Record<string, unknown>
      : {};

    // Sanitize all var values
    const vars: Record<string, string> = {};
    for (const [k, v] of Object.entries(rawVars)) {
      if (typeof v === 'string') {
        vars[sanitizeText(k, 50)] = sanitizeText(v, 500);
      }
    }

    if (trigger && to) {
      // Fire and forget — do not await
      triggerEmail(trigger, to, vars).catch(() => {});
    }
  } catch {
    // Swallow all errors — don't leak info
  }

  return NextResponse.json({ ok: true });
}
