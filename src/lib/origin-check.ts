import { NextResponse } from 'next/server';

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || '';

/**
 * Derive the expected origin from the Host header when NEXT_PUBLIC_SITE_URL
 * is not configured. Uses x-forwarded-proto (set by Vercel/proxies) to
 * determine the scheme, defaulting to https in production.
 */
function deriveOriginFromHost(headers: Headers): string | null {
  const host = headers.get('host');
  if (!host) return null;
  const proto = headers.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}

/**
 * Normalize an origin by stripping the "www." prefix so that
 * https://www.pepmax.bio and https://pepmax.bio are treated as equivalent.
 */
function normalizeOrigin(origin: string): string {
  try {
    const url = new URL(origin);
    url.hostname = url.hostname.replace(/^www\./, '');
    return url.origin;
  } catch {
    return origin;
  }
}

/**
 * Validate that a state-changing request originates from the expected site.
 * Returns null if valid, or a 403 NextResponse if the origin is suspicious.
 *
 * Uses NEXT_PUBLIC_SITE_URL if set, otherwise derives from Host header.
 * Skips validation in development.
 */
export function checkOrigin(headers: Headers): NextResponse | null {
  if (process.env.NODE_ENV !== 'production') return null;

  const rawAllowed = ALLOWED_ORIGIN
    ? new URL(ALLOWED_ORIGIN).origin
    : deriveOriginFromHost(headers);

  // If we can't determine the allowed origin at all, skip (shouldn't happen)
  if (!rawAllowed) return null;

  const allowed = normalizeOrigin(rawAllowed);
  const origin = headers.get('origin');
  const referer = headers.get('referer');

  // At least one must be present for state-changing requests
  if (!origin && !referer) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  if (origin && normalizeOrigin(origin) !== allowed) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  if (!origin && referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (normalizeOrigin(refOrigin) !== allowed) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
  }

  return null;
}
