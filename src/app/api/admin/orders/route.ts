import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/firebase-admin';
import { dcQuery, dcMutation } from '@/lib/data-connect-admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { checkOrigin } from '@/lib/origin-check';
import { audit } from '@/lib/audit-log';
import { sanitizeAlphanumeric, sanitizeText, stripProtoPollution } from '@/lib/sanitize';

interface OrderListData {
  orders: Array<{
    id: string;
    orderId: string;
    user: { id: string; uid: string; email: string } | null;
    userEmail: string | null;
    contactEmail: string;
    status: string;
    subtotal: number;
    discount: number;
    promoCode: string | null;
    shipping: number;
    shippingMethod: string;
    total: number;
    shipFirstName: string;
    shipLastName: string;
    shipPhone: string | null;
    shipAddress1: string;
    shipAddress2: string | null;
    shipCity: string;
    shipState: string;
    shipZip: string;
    shipCountry: string;
    trackingNumber: string | null;
    estDeliveryDisplay: string | null;
    createdAt: string;
    updatedAt: string;
    orderItems_on_order: Array<{
      id: string;
      sku: string;
      name: string;
      variant: string | null;
      price: number;
      quantity: number;
      image: string | null;
    }>;
  }>;
}

/**
 * GET: List all orders with optional filtering
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(getClientIp(request.headers), { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const caller = await verifyAdminRequest(request.headers.get('authorization'));
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search') ? sanitizeText(searchParams.get('search')!, 200) : null;
  const orderId = searchParams.get('orderId') ? sanitizeAlphanumeric(searchParams.get('orderId')!, 128) : null;

  try {
    // If fetching a single order
    if (orderId) {
      try {
        const result = await dcQuery<OrderListData>('GetOrderByOrderId', { orderId });
        const order = result?.orders?.[0] || null;
        return NextResponse.json({ order });
      } catch {
        return NextResponse.json({ order: null });
      }
    }

    // Fetch all orders — gracefully handle missing query
    let orders: OrderListData['orders'] = [];
    try {
      const result = await dcQuery<OrderListData>('ListAllOrders', {});
      orders = result?.orders || [];
    } catch {
      // Query not deployed or Data Connect unavailable
    }

    // Filter by status
    if (status && status !== 'all') {
      orders = orders.filter(o => o.status === status.toUpperCase());
    }

    // Filter by search (order ID or email)
    if (search) {
      const term = search.toLowerCase();
      orders = orders.filter(o =>
        o.orderId.toLowerCase().includes(term) ||
        o.contactEmail.toLowerCase().includes(term) ||
        `${o.shipFirstName} ${o.shipLastName}`.toLowerCase().includes(term)
      );
    }

    // Sort by creation date (newest first)
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ orders, total: orders.length });
  } catch (error) {
    console.error('[Admin Orders]', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

/**
 * PATCH: Update order status (admin only)
 */
export async function PATCH(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(ip, { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const originErr = checkOrigin(request.headers);
  if (originErr) return originErr;

  const caller = await verifyAdminRequest(request.headers.get('authorization'), 'admin');
  if (!caller) {
    audit({ action: 'auth.failed', detail: 'orders PATCH', ip });
    return NextResponse.json({ error: 'Unauthorized — admin role required' }, { status: 403 });
  }

  const rawBody = await request.json().catch(() => null);
  const body = rawBody ? stripProtoPollution(rawBody) : null;
  if (!body?.id || !body?.status) {
    return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
  }

  const sanitizedId = sanitizeAlphanumeric(String(body.id), 128);
  const sanitizedTracking = body.trackingNumber
    ? sanitizeAlphanumeric(String(body.trackingNumber), 100)
    : null;

  const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  try {
    await dcMutation('UpdateOrderStatus', {
      id: sanitizedId,
      status: body.status,
      trackingNumber: sanitizedTracking,
    });

    audit({ action: 'order.update', actorUid: caller.uid, actorEmail: caller.email, targetId: body.id, detail: body.status, ip });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Orders PATCH]', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
