import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { getAdminClient } from '@/lib/supabase/admin';

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

  // Build order items array
  const items = lineItems.data
    .filter(item => item.description !== 'Shipping') // Exclude shipping line item
    .map(item => ({
      name: item.description || 'Unknown Product',
      quantity: item.quantity || 1,
      price: (item.amount_total || 0) / 100 / (item.quantity || 1),
      total: (item.amount_total || 0) / 100,
    }));

  // Extract shipping info
  const shippingDetails = session.shipping_details || session.customer_details;
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

  const { data, error } = await supabase
    .from('orders')
    .insert({
      email: session.customer_details?.email || session.customer_email || '',
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

  // TODO: Send confirmation email
  // TODO: Update inventory
  // TODO: Notify admin

  return data;
}
