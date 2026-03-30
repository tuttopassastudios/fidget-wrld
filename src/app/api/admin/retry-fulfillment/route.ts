import { NextResponse } from 'next/server';
import { retryFailedOrders } from '@/lib/cj-fulfillment';

// Simple admin API key check (in production, use proper auth)
function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    console.warn('ADMIN_API_KEY not configured');
    return false;
  }

  return authHeader === `Bearer ${adminKey}`;
}

/**
 * POST /api/admin/retry-fulfillment
 * Retry CJ order creation for failed orders
 *
 * Headers:
 *   Authorization: Bearer <ADMIN_API_KEY>
 *
 * Response:
 *   { retried: number, failed: number, errors: string[] }
 */
export async function POST(request: Request) {
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await retryFailedOrders();

    console.log(`Retry fulfillment: ${result.retried} succeeded, ${result.failed} failed`);

    return NextResponse.json({
      success: true,
      retried: result.retried,
      failed: result.failed,
      errors: result.errors,
    });
  } catch (error) {
    console.error('Retry fulfillment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Retry failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/retry-fulfillment
 * Check status of failed orders
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { getAdminClient } = await import('@/lib/supabase/admin');
    const supabase = getAdminClient();

    // Count orders needing retry
    const { count: failedCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .is('cj_order_id', null)
      .not('fulfillment_error', 'is', null);

    // Count orders pending CJ processing
    const { count: pendingCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .not('cj_order_id', 'is', null)
      .eq('cj_order_status', 'pending');

    // Count orders shipped
    const { count: shippedCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('cj_order_status', 'shipped');

    return NextResponse.json({
      failedOrders: failedCount || 0,
      pendingOrders: pendingCount || 0,
      shippedOrders: shippedCount || 0,
    });
  } catch (error) {
    console.error('Get fulfillment status error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get status' },
      { status: 500 }
    );
  }
}
