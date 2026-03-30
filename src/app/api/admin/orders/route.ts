import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { getAdminClient } from '@/lib/supabase/admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { checkOrigin } from '@/lib/origin-check';
import { audit } from '@/lib/audit-log';
import { sanitizeAlphanumeric, sanitizeText, stripProtoPollution } from '@/lib/sanitize';
import type { Database } from '@/lib/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];

// Transform Supabase order to API response format
function transformOrder(order: Order) {
  const shippingAddress = order.shipping_address as {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };

  const items = (order.items as Array<{
    sku: string;
    name: string;
    variant?: string;
    price: number;
    quantity: number;
    image?: string;
  }>) || [];

  return {
    id: order.id,
    orderId: order.id,
    user: order.user_id ? { id: order.user_id, uid: order.user_id, email: order.email } : null,
    userEmail: order.user_id ? order.email : null,
    contactEmail: order.email,
    status: order.status.toUpperCase(),
    subtotal: order.subtotal,
    discount: order.discount,
    promoCode: order.promo_code,
    shipping: order.shipping,
    shippingMethod: 'standard',
    total: order.total,
    shipFirstName: shippingAddress?.firstName || '',
    shipLastName: shippingAddress?.lastName || '',
    shipPhone: order.phone || shippingAddress?.phone || null,
    shipAddress1: shippingAddress?.address1 || '',
    shipAddress2: shippingAddress?.address2 || null,
    shipCity: shippingAddress?.city || '',
    shipState: shippingAddress?.state || '',
    shipZip: shippingAddress?.zip || '',
    shipCountry: shippingAddress?.country || 'US',
    trackingNumber: order.cj_tracking_number,
    estDeliveryDisplay: null,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    cjOrderId: order.cj_order_id,
    cjOrderStatus: order.cj_order_status,
    fulfillmentError: order.fulfillment_error,
    orderItems_on_order: items.map((item, index) => ({
      id: `${order.id}-${index}`,
      sku: item.sku,
      name: item.name,
      variant: item.variant || null,
      price: item.price,
      quantity: item.quantity,
      image: item.image || null,
    })),
  };
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
    const supabase = getAdminClient();

    // If fetching a single order
    if (orderId) {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error || !order) {
        return NextResponse.json({ order: null });
      }
      return NextResponse.json({ order: transformOrder(order) });
    }

    // Fetch all orders
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by status
    if (status && status !== 'all') {
      const validStatus = status.toLowerCase() as 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
      query = query.eq('status', validStatus);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('[Admin Orders] Supabase error:', error);
      return NextResponse.json({ orders: [], total: 0 });
    }

    let transformedOrders = (orders || []).map(transformOrder);

    // Filter by search (order ID or email or name)
    if (search) {
      const term = search.toLowerCase();
      transformedOrders = transformedOrders.filter(o =>
        o.orderId.toLowerCase().includes(term) ||
        o.contactEmail.toLowerCase().includes(term) ||
        `${o.shipFirstName} ${o.shipLastName}`.toLowerCase().includes(term)
      );
    }

    return NextResponse.json({ orders: transformedOrders, total: transformedOrders.length });
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

  const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
  const statusLower = String(body.status).toLowerCase();
  if (!validStatuses.includes(statusLower)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  try {
    const supabase = getAdminClient();

    const updateData: Record<string, unknown> = {
      status: statusLower as 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled',
      updated_at: new Date().toISOString(),
    };

    if (sanitizedTracking) {
      updateData.cj_tracking_number = sanitizedTracking;
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', sanitizedId);

    if (error) {
      throw error;
    }

    audit({ action: 'order.update', actorUid: caller.uid, actorEmail: caller.email, targetId: body.id, detail: body.status, ip });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Orders PATCH]', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
