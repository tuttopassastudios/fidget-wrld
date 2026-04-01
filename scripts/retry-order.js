#!/usr/bin/env node
/**
 * Retry CJ fulfillment for a specific failed order
 * Usage: node scripts/retry-order.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    process.env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
  }
}

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const CJ_API_BASE = 'https://developers.cjdropshipping.com/api2.0/v1';

// SKU → CJ VID mapping (US warehouse)
const SKU_MAP = {
  'CJ-COTTON-SLIME-PKB': { vid: '1604670736529108992', warehouse: 'US' },
  'CJ-SLIME-BLPNK':      { vid: '3C5A4838-93A7-4260-A36F-6138BDE52885', warehouse: 'US' },
  'CJ-MAGPUTTY-PNK':     { vid: '032B016D-2656-4C3F-A7A6-6ABADB1B5694', warehouse: 'US' },
};

async function getToken() {
  const res = await fetch(`${CJ_API_BASE}/authentication/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: process.env.CJ_API_KEY }),
  });
  const json = await res.json();
  if (!json.result) throw new Error('CJ auth failed: ' + JSON.stringify(json));
  return json.data.accessToken;
}

async function main() {
  const orderId = '45e8fe7f-792b-4892-99a6-80513b11e49e';

  // Fetch the order from Supabase
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    console.error('Failed to fetch order:', error?.message);
    process.exit(1);
  }

  console.log('Order:', order.id, '|', order.email, '| status:', order.status);
  console.log('Shipping:', JSON.stringify(order.shipping_address));

  const addr = order.shipping_address;
  if (!addr?.line1) {
    console.error('No shipping address on order');
    process.exit(1);
  }

  const token = await getToken();

  // Build products list
  const products = order.items
    .filter(i => SKU_MAP[i.sku])
    .map(i => ({ vid: SKU_MAP[i.sku].vid, quantity: i.quantity }));

  console.log('Sending to CJ:', JSON.stringify(products));

  const payload = {
    orderNumber: orderId,
    fromCountryCode: 'US',
    logisticName: 'USPS+',
    shippingCountryCode: 'US',
    shippingCountry: 'United States',
    shippingProvince: addr.state,
    shippingCity: addr.city,
    shippingAddress: addr.line1,
    shippingAddress2: addr.line2 || '',
    shippingZip: addr.postal_code,
    shippingCustomerName: addr.name,
    shippingPhone: order.phone || '',
    email: order.email,
    products,
  };

  const res = await fetch(`${CJ_API_BASE}/shopping/order/createOrder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CJ-Access-Token': token,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  console.log('CJ response:', JSON.stringify(json, null, 2));

  // CJ returns either { data: { orderId } } or { data: "<orderNumber>" }
  const cjOrderId = json.data?.orderId || (typeof json.data === 'string' ? json.data : null);
  if (json.result && cjOrderId) {
    const { error: updateError } = await supabase
      .from('orders')
      .update({ cj_order_id: cjOrderId, cj_order_status: 'pending', fulfillment_error: null })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to update Supabase:', updateError.message);
    } else {
      console.log(`\nSuccess! CJ Order ID: ${cjOrderId} saved to Supabase.`);
    }
  } else {
    console.error('\nCJ order creation failed:', json.message || json);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
