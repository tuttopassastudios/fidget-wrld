import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

// CJ Dropshipping webhook payload types
interface CJWebhookPayload {
  type: string;
  data: {
    orderId: string;
    orderNumber: string;
    status: string;
    trackingNumber?: string;
    trackingUrl?: string;
    shippingCarrier?: string;
    updatedAt: string;
  };
}

// Map CJ statuses to our internal statuses
const STATUS_MAP: Record<string, string> = {
  CREATED: 'pending',
  PENDING: 'pending',
  IN_CART: 'pending',
  UNPAID: 'pending',
  UNSHIPPED: 'processing',
  IN_PROCESS: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

export async function POST(request: Request) {
  try {
    const payload: CJWebhookPayload = await request.json();

    console.log('CJ Webhook received:', JSON.stringify(payload, null, 2));

    // Validate payload
    if (!payload.data?.orderId || !payload.data?.orderNumber) {
      console.error('Invalid CJ webhook payload: missing orderId or orderNumber');
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { orderId: cjOrderId, orderNumber, status, trackingNumber } = payload.data;

    // Map CJ status to our internal status
    const mappedStatus = STATUS_MAP[status?.toUpperCase()] || 'processing';

    const supabase = getAdminClient();

    // Find the order by CJ order ID or order number (which is our order ID)
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, cj_order_id, cj_order_status')
      .or(`cj_order_id.eq.${cjOrderId},id.eq.${orderNumber}`)
      .single();

    if (fetchError || !order) {
      console.error(`Order not found for CJ order ${cjOrderId}:`, fetchError);
      // Return 200 to prevent CJ from retrying
      return NextResponse.json({ received: true, warning: 'Order not found' });
    }

    // Build update object
    const updateData: Record<string, string | null> = {
      cj_order_status: mappedStatus,
    };

    // Add tracking info if provided
    if (trackingNumber) {
      updateData.cj_tracking_number = trackingNumber;
    }

    // Update the main order status for shipped/delivered
    if (mappedStatus === 'shipped' || mappedStatus === 'delivered') {
      updateData.status = mappedStatus;
    }

    // Update the order
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order.id);

    if (updateError) {
      console.error(`Failed to update order ${order.id}:`, updateError);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    console.log(`Order ${order.id} updated: status=${mappedStatus}, tracking=${trackingNumber || 'none'}`);

    return NextResponse.json({ received: true, orderId: order.id });
  } catch (error) {
    console.error('CJ Webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Allow GET for webhook verification (some services use this)
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'cj-dropshipping-webhook' });
}
