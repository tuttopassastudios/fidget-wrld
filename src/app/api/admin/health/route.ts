import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const limited = rateLimit(getClientIp(request.headers), { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  const caller = await verifyAdminRequest(request.headers.get('authorization'));
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pepmax.bio';
  const checks: Array<{
    name: string;
    url: string;
    status: 'up' | 'down' | 'slow';
    responseTime: number;
    statusCode: number | null;
  }> = [];

  // Check storefront homepage
  try {
    const start = Date.now();
    const res = await fetch(siteUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(8000),
    });
    const responseTime = Date.now() - start;
    checks.push({
      name: 'Storefront',
      url: siteUrl,
      status: res.ok ? (responseTime > 3000 ? 'slow' : 'up') : 'down',
      responseTime,
      statusCode: res.status,
    });
  } catch {
    checks.push({
      name: 'Storefront',
      url: siteUrl,
      status: 'down',
      responseTime: 0,
      statusCode: null,
    });
  }

  // Check API health (self-ping)
  try {
    const apiUrl = `${siteUrl}/api/admin/session`;
    const start = Date.now();
    const res = await fetch(apiUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(8000),
    });
    const responseTime = Date.now() - start;
    checks.push({
      name: 'API',
      url: apiUrl,
      status: responseTime > 3000 ? 'slow' : 'up',
      responseTime,
      statusCode: res.status,
    });
  } catch {
    checks.push({
      name: 'API',
      url: `${siteUrl}/api/admin/session`,
      status: 'down',
      responseTime: 0,
      statusCode: null,
    });
  }

  const allUp = checks.every(c => c.status === 'up');
  const anyDown = checks.some(c => c.status === 'down');

  return NextResponse.json({
    overall: anyDown ? 'degraded' : allUp ? 'healthy' : 'slow',
    timestamp: new Date().toISOString(),
    checks,
  });
}
