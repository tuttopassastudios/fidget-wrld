import { NextResponse } from 'next/server';

interface WindowEntry {
  timestamps: number[];
  lastCleanup: number;
}

const store = new Map<string, WindowEntry>();

// Clean up stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastGlobalCleanup = Date.now();

function globalCleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastGlobalCleanup < CLEANUP_INTERVAL) return;
  lastGlobalCleanup = now;

  for (const [key, entry] of store) {
    if (now - entry.lastCleanup > windowMs * 2) {
      store.delete(key);
    }
  }
}

/**
 * In-memory sliding-window rate limiter.
 * Returns null if allowed, or a 429 NextResponse if rate-limited.
 */
export function rateLimit(
  ip: string,
  { limit = 60, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): NextResponse | null {
  const now = Date.now();
  globalCleanup(windowMs);

  const key = ip || 'unknown';
  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [now], lastCleanup: now };
    store.set(key, entry);
    return null;
  }

  // Remove timestamps outside the window
  const cutoff = now - windowMs;
  entry.timestamps = entry.timestamps.filter(t => t > cutoff);
  entry.lastCleanup = now;

  if (entry.timestamps.length >= limit) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(windowMs / 1000)),
        },
      }
    );
  }

  entry.timestamps.push(now);
  return null;
}

/** Extract client IP from request headers. */
export function getClientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}
