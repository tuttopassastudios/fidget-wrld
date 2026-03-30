/**
 * Newsletter Signup Tests
 *
 * Tests the newsletter API route handler logic including:
 * - Email validation & sanitization
 * - Rate limiting
 * - Supabase integration (mocked)
 * - Error handling
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sanitizeEmail } from '@/lib/sanitize';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// ─── sanitizeEmail tests ────────────────────────────────────────────────────

describe('sanitizeEmail', () => {
  it('returns a valid trimmed lowercase email', () => {
    expect(sanitizeEmail('  User@Example.COM  ')).toBe('user@example.com');
  });

  it('rejects empty input', () => {
    expect(sanitizeEmail('')).toBe('');
  });

  it('rejects input without @', () => {
    expect(sanitizeEmail('notanemail')).toBe('');
  });

  it('rejects input without domain dot', () => {
    expect(sanitizeEmail('user@localhost')).toBe('');
  });

  it('strips control characters', () => {
    expect(sanitizeEmail('us\x00er@example.com')).toBe('user@example.com');
  });

  it('strips zero-width characters', () => {
    expect(sanitizeEmail('user\u200B@example.com')).toBe('user@example.com');
  });

  it('enforces 254-char max length', () => {
    const longLocal = 'a'.repeat(250);
    const email = `${longLocal}@example.com`;
    const result = sanitizeEmail(email);
    expect(result.length).toBeLessThanOrEqual(254);
  });

  it('rejects non-string input', () => {
    expect(sanitizeEmail(null as unknown as string)).toBe('');
    expect(sanitizeEmail(undefined as unknown as string)).toBe('');
    expect(sanitizeEmail(123 as unknown as string)).toBe('');
  });

  it('handles emails with subdomains', () => {
    expect(sanitizeEmail('user@sub.domain.example.com')).toBe('user@sub.domain.example.com');
  });

  it('handles emails with + tags', () => {
    expect(sanitizeEmail('user+tag@example.com')).toBe('user+tag@example.com');
  });

  it('rejects emails with spaces', () => {
    expect(sanitizeEmail('user @example.com')).toBe('');
  });
});

// ─── Rate limiting tests ────────────────────────────────────────────────────

describe('rateLimit', () => {
  it('allows requests within the limit', () => {
    const result = rateLimit('test-ip-1', { limit: 5, windowMs: 60_000 });
    expect(result).toBeNull();
  });

  it('blocks after exceeding the limit', () => {
    const ip = 'test-ip-block-' + Date.now();
    for (let i = 0; i < 5; i++) {
      rateLimit(ip, { limit: 5, windowMs: 60_000 });
    }
    const blocked = rateLimit(ip, { limit: 5, windowMs: 60_000 });
    expect(blocked).not.toBeNull();
    expect(blocked!.status).toBe(429);
  });

  it('returns 429 with Retry-After header', async () => {
    const ip = 'test-ip-header-' + Date.now();
    for (let i = 0; i < 5; i++) {
      rateLimit(ip, { limit: 5, windowMs: 60_000 });
    }
    const blocked = rateLimit(ip, { limit: 5, windowMs: 60_000 });
    expect(blocked!.headers.get('Retry-After')).toBe('60');
  });

  it('allows requests from different IPs independently', () => {
    const ip1 = 'test-ip-indep-a-' + Date.now();
    const ip2 = 'test-ip-indep-b-' + Date.now();
    for (let i = 0; i < 5; i++) {
      rateLimit(ip1, { limit: 5, windowMs: 60_000 });
    }
    const result = rateLimit(ip2, { limit: 5, windowMs: 60_000 });
    expect(result).toBeNull();
  });
});

// ─── getClientIp tests ──────────────────────────────────────────────────────

describe('getClientIp', () => {
  it('extracts IP from x-forwarded-for header', () => {
    const headers = new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
    expect(getClientIp(headers)).toBe('1.2.3.4');
  });

  it('returns "unknown" when no header present', () => {
    const headers = new Headers();
    expect(getClientIp(headers)).toBe('unknown');
  });

  it('trims whitespace from IP', () => {
    const headers = new Headers({ 'x-forwarded-for': '  1.2.3.4  ' });
    expect(getClientIp(headers)).toBe('1.2.3.4');
  });
});

// ─── Newsletter API route tests (mocked Supabase) ──────────────────────────

describe('Newsletter API route', () => {
  const mockSingle = vi.fn();
  const mockInsert = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    mockSingle.mockResolvedValue({ data: null, error: null });
    mockInsert.mockResolvedValue({ data: null, error: null });
  });

  function mockSupabase() {
    vi.doMock('@/lib/supabase/admin', () => ({
      getAdminClient: () => ({
        from: (table: string) => ({
          select: () => ({
            eq: () => ({
              limit: () => ({
                single: mockSingle,
              }),
            }),
          }),
          insert: mockInsert,
        }),
      }),
    }));
  }

  async function callRoute(body: unknown, ip = '127.0.0.1') {
    mockSupabase();
    const { POST } = await import('@/app/api/newsletter/route');
    const request = new Request('http://localhost/api/newsletter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': ip,
      },
      body: JSON.stringify(body),
    });
    // NextRequest is essentially a Request in the test context
    return POST(request as any);
  }

  it('returns success for a valid email', async () => {
    const res = await callRoute({ email: 'test@example.com' }, 'route-valid-' + Date.now());
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Subscribed successfully');
  });

  it('returns 400 for missing email', async () => {
    const res = await callRoute({}, 'route-missing-' + Date.now());
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Email is required');
  });

  it('returns 400 for invalid email format', async () => {
    const res = await callRoute({ email: 'notanemail' }, 'route-invalid-' + Date.now());
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid email address');
  });

  it('returns 400 for non-string email', async () => {
    const res = await callRoute({ email: 123 }, 'route-nonstring-' + Date.now());
    expect(res.status).toBe(400);
  });

  it('handles already-subscribed emails gracefully', async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: 'existing-uuid' }, error: null });
    const res = await callRoute({ email: 'existing@example.com' }, 'route-existing-' + Date.now());
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('handles unique constraint race condition', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: null });
    mockInsert.mockResolvedValueOnce({ data: null, error: { code: '23505', message: 'duplicate' } });
    const res = await callRoute({ email: 'race@example.com' }, 'route-race-' + Date.now());
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('returns 500 on unexpected database error', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: null });
    mockInsert.mockResolvedValueOnce({ data: null, error: { code: '50000', message: 'db error' } });
    const res = await callRoute({ email: 'error@example.com' }, 'route-dberr-' + Date.now());
    expect(res.status).toBe(500);
  });

  it('returns 400 for invalid JSON body', async () => {
    mockSupabase();
    const { POST } = await import('@/app/api/newsletter/route');
    const request = new Request('http://localhost/api/newsletter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': 'route-badjson-' + Date.now(),
      },
      body: 'not json',
    });
    const res = await POST(request as any);
    expect(res.status).toBe(400);
  });
});
