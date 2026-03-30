import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import type { CartItem } from '@/types';

interface CheckoutRequest {
  items: CartItem[];
  shippingPrice: number;
  promoDiscount: number;
  customerEmail?: string;
  customerName?: string;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export async function POST(request: Request) {
  try {
    const body: CheckoutRequest = await request.json();

    // Get base URL from request headers for correct redirect
    const origin = request.headers.get('origin') || request.headers.get('referer')?.replace(/\/[^/]*$/, '') || getBaseUrl();
    const { items, shippingPrice, promoDiscount, customerEmail, shippingAddress } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    // Build line items for Stripe
    // Note: Images must be publicly accessible URLs, so we skip them in development
    const isProduction = origin.startsWith('https://');

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.variant || undefined,
          // Only include images in production with valid HTTPS URLs
          images: isProduction && item.image ? [`${origin}${item.image}`] : undefined,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if > 0
    if (shippingPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
            description: getShippingLabel(shippingPrice),
            images: undefined,
          },
          unit_amount: Math.round(shippingPrice * 100),
        },
        quantity: 1,
      });
    }

    // Build SKU data for fulfillment (needed by webhook to create CJ orders)
    const skuData = items.map(item => ({
      sku: item.sku,
      qty: item.quantity,
    }));

    // Create Stripe checkout session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      customer_email: customerEmail || undefined,
      phone_number_collection: {
        enabled: true, // Required for CJ Dropshipping fulfillment
      },
      metadata: {
        promoDiscount: promoDiscount.toString(),
        itemCount: items.length.toString(),
        skus: JSON.stringify(skuData), // Pass SKUs for fulfillment
      },
      shipping_address_collection: shippingAddress ? undefined : {
        allowed_countries: ['US', 'CA'],
      },
      automatic_tax: {
        enabled: false, // We calculate tax ourselves
      },
    };

    // Apply discount if any
    if (promoDiscount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(promoDiscount * 100),
        currency: 'usd',
        duration: 'once',
        name: 'Promo Discount',
      });
      sessionConfig.discounts = [{ coupon: coupon.id }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

function getBaseUrl() {
  // Use NEXT_PUBLIC_SITE_URL if available, otherwise construct from headers
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  // Fallback for local development
  return process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://fidgetwrld.com';
}

function getShippingLabel(price: number): string {
  switch (price) {
    case 9.99: return 'Standard (5-7 business days)';
    case 14.99: return 'Priority (3-4 business days)';
    case 24.99: return 'Express (1-2 business days)';
    default: return 'Shipping';
  }
}
