import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { getCJClient } from '@/lib/cj-dropshipping';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { sanitizeAlphanumeric } from '@/lib/sanitize';

export async function GET(request: NextRequest) {
  const limited = rateLimit(getClientIp(request.headers), { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const caller = await verifyAdminRequest(request.headers.get('authorization'));
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('trackingNumber');
  if (!raw) {
    return NextResponse.json({ error: 'trackingNumber is required' }, { status: 400 });
  }

  const trackingNumber = sanitizeAlphanumeric(raw, 100);
  if (!trackingNumber) {
    return NextResponse.json({ error: 'Invalid tracking number' }, { status: 400 });
  }

  try {
    const cj = getCJClient();
    const result = await cj.logistics.getTrackingInfo(trackingNumber);
    return NextResponse.json({ tracking: result.data ?? result });
  } catch (error) {
    console.error('[Admin Tracking]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tracking' },
      { status: 500 }
    );
  }
}
