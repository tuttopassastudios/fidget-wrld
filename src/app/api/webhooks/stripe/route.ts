import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { getAdminClient } from '@/lib/supabase/admin';
import { createCJOrder, type OrderItem, type ShippingAddress } from '@/lib/cj-fulfillment';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('Missing Stripe signature');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout session expired: ${session.id}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${paymentIntent.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  console.log('Processing completed checkout:', session.id);

  // Get line items from the session
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ['data.price.product'],
  });

  // Parse SKUs from session metadata (added by checkout API)
  let skuData: Array<{ sku: string; qty: number; name?: string }> = [];
  try {
    if (session.metadata?.skus) {
      skuData = JSON.parse(session.metadata.skus);
    }
  } catch (e) {
    console.error('Failed to parse SKU metadata:', e);
  }

  // Build a lookup map from product name to SKU for reliable matching
  const skuByName = new Map<string, string>();
  for (const item of skuData) {
    if (item.name && item.sku) {
      skuByName.set(item.name, item.sku);
    }
  }

  // Build order items array with SKUs
  // Match by product name (from skuData.name) rather than index for reliability
  const items = lineItems.data
    .filter(item => item.description !== 'Shipping') // Exclude shipping line item
    .map((item, index) => {
      // Get product name from Stripe (stored in price.product.name)
      const product = item.price?.product as { name?: string } | undefined;
      const productName = product?.name || item.description || 'Unknown Product';

      // Try to find SKU by name first, fall back to index-based matching
      const sku = skuByName.get(productName) || skuData[index]?.sku || '';

      return {
        name: productName,
        quantity: item.quantity || 1,
        price: (item.amount_total || 0) / 100 / (item.quantity || 1),
        total: (item.amount_total || 0) / 100,
        sku,
      };
    });

  // Extract shipping info
  // Stripe puts the address in collected_information.shipping_details (newer API),
  // falling back to session.shipping_details, then customer_details as last resort.
  const collectedShipping = (session as unknown as {
    collected_information?: { shipping_details?: { name?: string; address?: Record<string, string | null> } }
  }).collected_information?.shipping_details;
  const shippingDetails = collectedShipping || session.shipping_details || session.customer_details;
  const shippingAddress = shippingDetails?.address ? {
    name: shippingDetails.name || '',
    line1: shippingDetails.address.line1 || '',
    line2: shippingDetails.address.line2 || '',
    city: shippingDetails.address.city || '',
    state: shippingDetails.address.state || '',
    postal_code: shippingDetails.address.postal_code || '',
    country: shippingDetails.address.country || 'US',
  } : {};

  // Calculate amounts
  const subtotal = (session.amount_subtotal || 0) / 100;
  const total = (session.amount_total || 0) / 100;
  const shipping = (session.shipping_cost?.amount_total || 0) / 100;
  const discount = session.total_details?.amount_discount
    ? session.total_details.amount_discount / 100
    : 0;
  const tax = session.total_details?.amount_tax
    ? session.total_details.amount_tax / 100
    : 0;

  // Insert order into Supabase
  const supabase = getAdminClient();

  // Get phone number from customer details (enabled via phone_number_collection)
  const customerPhone = session.customer_details?.phone || '';

  const { data, error } = await supabase
    .from('orders')
    .insert({
      email: session.customer_details?.email || session.customer_email || '',
      phone: customerPhone,
      status: 'paid',
      items: items,
      subtotal: subtotal,
      shipping: shipping,
      tax: tax,
      total: total,
      discount: discount,
      shipping_address: shippingAddress,
      stripe_payment_intent_id: session.payment_intent as string,
      promo_code: session.metadata?.promoCode || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create order:', error);
    throw error;
  }

  console.log('Order created:', data.id);

  // Trigger CJ Dropshipping fulfillment - MUST await in serverless to prevent early termination
  await triggerCJFulfillment(
    data.id,
    items,
    shippingAddress as ShippingAddress,
    session.customer_details?.email || session.customer_email || '',
    customerPhone
  );

  // Send order confirmation email (best-effort)
  try {
    const { triggerEmail } = await import('@/lib/email');
    const firstName = (shippingAddress as { name?: string }).name?.split(' ')[0] || 'there';
    const itemsSummary = items.map(i => `${i.name} × ${i.quantity}`).join(', ');
    await triggerEmail('order_confirmation', session.customer_details?.email || session.customer_email || '', {
      first_name: firstName,
      email: session.customer_details?.email || session.customer_email || '',
      order_id: data.id.slice(0, 8).toUpperCase(),
      order_total: `$${total.toFixed(2)}`,
      items: itemsSummary,
    });
  } catch {}

  // TODO: Update inventory
  // TODO: Notify admin

  return data;
}

/**
 * Trigger CJ fulfillment in the background
 * This runs async so we don't delay the webhook response to Stripe
 */
async function triggerCJFulfillment(
  orderId: string,
  items: Array<{ name: string; quantity: number; sku: string }>,
  shippingAddress: ShippingAddress,
  email: string,
  phone: string
) {
  // Convert items to OrderItem format
  const orderItems: OrderItem[] = items
    .filter(item => item.sku) // Only items with SKUs
    .map(item => ({
      sku: item.sku,
      quantity: item.quantity,
    }));

  if (orderItems.length === 0) {
    console.log(`Order ${orderId}: No items with SKUs, skipping CJ fulfillment`);
    return;
  }

  try {
    const result = await createCJOrder(orderId, orderItems, shippingAddress, email, phone);

    if (result.success) {
      console.log(`Order ${orderId}: CJ fulfillment initiated (CJ ID: ${result.cjOrderId || 'pending'})`);
      if (result.skippedItems.length > 0) {
        console.log(`Order ${orderId}: Non-CJ items need manual fulfillment:`, result.skippedItems);
      }
    } else {
      console.error(`Order ${orderId}: CJ fulfillment failed:`, result.error);
    }
  } catch (error) {
    console.error(`Order ${orderId}: CJ fulfillment error:`, error);
  }
}
