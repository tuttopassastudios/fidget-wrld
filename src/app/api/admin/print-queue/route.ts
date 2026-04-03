import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { getAdminClient } from '@/lib/supabase/admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { checkOrigin } from '@/lib/origin-check';
import { audit } from '@/lib/audit-log';
import { sanitizeAlphanumeric, stripProtoPollution } from '@/lib/sanitize';

const VALID_PRINT_STATUSES = [
  'pending_review',
  'approved',
  'printing',
  'ready_to_ship',
  'shipped',
] as const;
type PrintStatus = (typeof VALID_PRINT_STATUSES)[number];

interface RawItem {
  sku?: string;
  name?: string;
  variant?: string | null;
  price?: number;
  quantity?: number;
  image?: string | null;
  customization?: {
    filamentColorId?: string;
    engravingText?: string;
    keychainHole?: boolean;
  } | null;
}

function is3DPItem(item: RawItem): boolean {
  return typeof item.sku === 'string' && item.sku.startsWith('3DP-');
}

function transformOrder(order: Record<string, unknown>) {
  const shippingAddress = (order.shipping_address as {
    firstName?: string;
    lastName?: string;
  }) || {};

  const allItems = ((order.items as RawItem[]) || []);
  const printItems = allItems.filter(is3DPItem);

  // Use items that already have IDs if present; fall back to index-based ID
  const mappedItems = printItems.map((item, index) => ({
    id: `${order.id}-3dp-${index}`,
    sku: item.sku ?? '',
    name: item.name ?? '',
    variant: item.variant ?? null,
    quantity: item.quantity ?? 1,
    customization: item.customization ?? null,
  }));

  return {
    id: order.id as string,
    orderId: order.id as string,
    contactEmail: (order.email as string) ?? '',
    shipFirstName: shippingAddress.firstName ?? '',
    shipLastName: shippingAddress.lastName ?? '',
    status: ((order.status as string) ?? '').toUpperCase(),
    printStatus: (order.print_status as string) ?? 'pending_review',
    createdAt: (order.created_at as string) ?? '',
    items: mappedItems,
  };
}

/**
 * GET: Return all orders containing 3D-printed items (SKU starts with '3DP-')
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(getClientIp(request.headers), { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const caller = await verifyAdminRequest(request.headers.get('authorization'));
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const supabase = getAdminClient();

    // Fetch all orders — items are stored as JSONB in the orders table
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[PrintQueue GET] Supabase error:', error);
      return NextResponse.json({ orders: [] });
    }

    // Filter to orders that have at least one 3DP- item
    const printOrders = (orders ?? [])
      .filter((order) => {
        const items = (order.items as RawItem[]) || [];
        return items.some(is3DPItem);
      })
      .map((order) => transformOrder(order as unknown as Record<string, unknown>));

    return NextResponse.json({ orders: printOrders, total: printOrders.length });
  } catch (err) {
    console.error('[PrintQueue GET]', err);
    return NextResponse.json({ error: 'Failed to fetch print queue' }, { status: 500 });
  }
}

/**
 * PATCH: Update print_status on an order (admin only)
 */
export async function PATCH(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(ip, { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const originErr = checkOrigin(request.headers);
  if (originErr) return originErr;

  const caller = await verifyAdminRequest(request.headers.get('authorization'), 'admin');
  if (!caller) {
    audit({ action: 'auth.failed', detail: 'print-queue PATCH', ip });
    return NextResponse.json({ error: 'Unauthorized \u2014 admin role required' }, { status: 403 });
  }

  const rawBody = await request.json().catch(() => null);
  const body = rawBody ? stripProtoPollution(rawBody) : null;

  if (!body?.id || !body?.printStatus) {
    return NextResponse.json({ error: 'Missing id or printStatus' }, { status: 400 });
  }

  const sanitizedId = sanitizeAlphanumeric(String(body.id), 128);
  const printStatus = String(body.printStatus) as PrintStatus;

  if (!VALID_PRINT_STATUSES.includes(printStatus)) {
    return NextResponse.json(
      { error: `Invalid printStatus. Must be one of: ${VALID_PRINT_STATUSES.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const supabase = getAdminClient();

    const { error } = await supabase
      .from('orders')
      .update({
        print_status: printStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sanitizedId);

    if (error) {
      // If the column doesn't exist yet, surface a clear message
      if (error.code === '42703') {
        console.error('[PrintQueue PATCH] print_status column not found in orders table:', error);
        return NextResponse.json(
          { error: 'print_status column not found — run migration to add it' },
          { status: 500 }
        );
      }
      throw error;
    }

    audit({
      action: 'order.update',
      actorUid: caller.uid,
      actorEmail: caller.email,
      targetId: sanitizedId,
      detail: `print_status=${printStatus}`,
      ip,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PrintQueue PATCH]', err);
    return NextResponse.json({ error: 'Failed to update print status' }, { status: 500 });
  }
}
