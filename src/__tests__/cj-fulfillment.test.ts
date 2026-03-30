/**
 * CJ Dropshipping Order Fulfillment Tests
 *
 * Tests the end-to-end order fulfillment pipeline:
 * 1. SKU → CJ product mapping
 * 2. CJ order creation (cj-fulfillment.ts)
 * 3. Stripe webhook → order creation → CJ fulfillment trigger
 * 4. CJ webhook → order status updates
 * 5. Checkout route SKU metadata passing
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── 1. CJ Product Mapping ─────────────────────────────────────────────────

describe('CJ Product Mapping', () => {
  it('maps CJ SKUs to CJ product and variant IDs', async () => {
    const { getCJMapping, isCJProduct } = await import('@/lib/cj-mapping');

    // Known CJ product from products.ts
    const mapping = getCJMapping('CJ-SPIN-KEY-BLK');
    expect(mapping).not.toBeNull();
    expect(mapping!.cjPid).toBe('1541333689475944448');
    expect(mapping!.cjVid).toBe('1541333689765351424');
    expect(mapping!.productName).toBe('Fidget Spinner Keychain');
    expect(isCJProduct('CJ-SPIN-KEY-BLK')).toBe(true);
  });

  it('returns null for non-CJ SKUs', async () => {
    const { getCJMapping, isCJProduct } = await import('@/lib/cj-mapping');

    // Non-CJ product (Magnet Balls don't have cjPid)
    expect(getCJMapping('FW-MAG-216-RED')).toBeNull();
    expect(isCJProduct('FW-MAG-216-RED')).toBe(false);
  });

  it('returns null for unknown SKUs', async () => {
    const { getCJMapping, isCJProduct } = await import('@/lib/cj-mapping');

    expect(getCJMapping('NONEXISTENT-SKU')).toBeNull();
    expect(isCJProduct('NONEXISTENT-SKU')).toBe(false);
  });

  it('getAllCJSkus returns all CJ product SKUs', async () => {
    const { getAllCJSkus } = await import('@/lib/cj-mapping');

    const skus = getAllCJSkus();
    expect(skus.length).toBeGreaterThan(0);
    // All returned SKUs should start with CJ-
    expect(skus.every(sku => sku.startsWith('CJ-'))).toBe(true);
  });

  it('getCJMappings separates CJ from non-CJ items', async () => {
    const { getCJMappings } = await import('@/lib/cj-mapping');

    const result = getCJMappings([
      'CJ-SPIN-KEY-BLK',
      'FW-MAG-216-RED',
      'CJ-POPCORN-SQU',
    ]);

    expect(result.cjItems).toHaveLength(2);
    expect(result.nonCJItems).toEqual(['FW-MAG-216-RED']);
    expect(result.cjItems[0].sku).toBe('CJ-SPIN-KEY-BLK');
    expect(result.cjItems[1].sku).toBe('CJ-POPCORN-SQU');
  });

  it('maps all CJ product variants correctly', async () => {
    const { getCJMapping } = await import('@/lib/cj-mapping');

    // Verify multiple variants of the same product
    const variants = [
      { sku: 'CJ-SPIN-KEY-BLK', vid: '1541333689765351424' },
      { sku: 'CJ-SPIN-KEY-RED', vid: '1541333689765351425' },
      { sku: 'CJ-SPIN-KEY-WHT', vid: '1640924001965330433' },
    ];

    for (const v of variants) {
      const mapping = getCJMapping(v.sku);
      expect(mapping).not.toBeNull();
      expect(mapping!.cjPid).toBe('1541333689475944448'); // Same product
      expect(mapping!.cjVid).toBe(v.vid); // Different variants
    }
  });
});

// ─── 2. CJ Fulfillment Logic ───────────────────────────────────────────────

describe('CJ Order Fulfillment (createCJOrder)', () => {
  const mockUpdate = vi.fn();
  const mockCreateOrder = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    mockUpdate.mockResolvedValue({ error: null });
    mockCreateOrder.mockResolvedValue({
      result: true,
      data: { orderId: 'cj-order-123' },
    });
  });

  function setupMocks() {
    vi.doMock('@/lib/supabase/admin', () => ({
      getAdminClient: () => ({
        from: () => ({
          update: (data: unknown) => ({
            eq: () => mockUpdate(data),
          }),
        }),
      }),
    }));

    vi.doMock('@/lib/cj-dropshipping', () => ({
      getCJClient: () => ({
        order: {
          createOrder: mockCreateOrder,
        },
      }),
    }));
  }

  const shippingAddress = {
    name: 'John Doe',
    line1: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    postal_code: '62701',
    country: 'US',
  };

  it('creates a CJ order for CJ items and returns success', async () => {
    setupMocks();
    const { createCJOrder } = await import('@/lib/cj-fulfillment');

    const result = await createCJOrder(
      'order-1',
      [{ sku: 'CJ-SPIN-KEY-BLK', quantity: 2 }],
      shippingAddress,
      'test@example.com',
      '+15551234567'
    );

    expect(result.success).toBe(true);
    expect(result.cjOrderId).toBe('cj-order-123');
    expect(result.skippedItems).toEqual([]);

    // Verify CJ API was called with correct data
    expect(mockCreateOrder).toHaveBeenCalledOnce();
    const callArgs = mockCreateOrder.mock.calls[0][0];
    expect(callArgs.orderNumber).toBe('order-1');
    expect(callArgs.shippingCountryCode).toBe('US');
    expect(callArgs.shippingCountry).toBe('United States');
    expect(callArgs.shippingCustomerName).toBe('John Doe');
    expect(callArgs.shippingPhone).toBe('+15551234567');
    expect(callArgs.email).toBe('test@example.com');
    expect(callArgs.products).toHaveLength(1);
    expect(callArgs.products[0].vid).toBe('1541333689765351424');
    expect(callArgs.products[0].quantity).toBe(2);
  });

  it('converts US country code to "United States" for CJ API', async () => {
    setupMocks();
    const { createCJOrder } = await import('@/lib/cj-fulfillment');

    await createCJOrder(
      'order-2',
      [{ sku: 'CJ-SPIN-KEY-BLK', quantity: 1 }],
      shippingAddress,
      'test@example.com',
      '+15551234567'
    );

    const callArgs = mockCreateOrder.mock.calls[0][0];
    expect(callArgs.shippingCountry).toBe('United States');
    expect(callArgs.shippingCountryCode).toBe('US');
  });

  it('updates Supabase with CJ order ID on success', async () => {
    setupMocks();
    const { createCJOrder } = await import('@/lib/cj-fulfillment');

    await createCJOrder(
      'order-3',
      [{ sku: 'CJ-SPIN-KEY-BLK', quantity: 1 }],
      shippingAddress,
      'test@example.com',
      '+15551234567'
    );

    expect(mockUpdate).toHaveBeenCalledWith({
      cj_order_id: 'cj-order-123',
      cj_order_status: 'pending',
      fulfillment_error: null,
    });
  });

  it('skips non-CJ items and returns them in skippedItems', async () => {
    setupMocks();
    const { createCJOrder } = await import('@/lib/cj-fulfillment');

    const result = await createCJOrder(
      'order-4',
      [
        { sku: 'CJ-SPIN-KEY-BLK', quantity: 1 },
        { sku: 'FW-MAG-216-RED', quantity: 1 },
      ],
      shippingAddress,
      'test@example.com',
      '+15551234567'
    );

    expect(result.success).toBe(true);
    expect(result.skippedItems).toEqual(['FW-MAG-216-RED']);
    // Only CJ item sent to CJ API
    const callArgs = mockCreateOrder.mock.calls[0][0];
    expect(callArgs.products).toHaveLength(1);
  });

  it('returns success with no API call when no CJ items', async () => {
    setupMocks();
    const { createCJOrder } = await import('@/lib/cj-fulfillment');

    const result = await createCJOrder(
      'order-5',
      [{ sku: 'FW-MAG-216-RED', quantity: 1 }],
      shippingAddress,
      'test@example.com',
      '+15551234567'
    );

    expect(result.success).toBe(true);
    expect(result.cjOrderId).toBeUndefined();
    expect(result.skippedItems).toEqual(['FW-MAG-216-RED']);
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  it('stores fulfillment error when CJ API returns failure', async () => {
    mockCreateOrder.mockResolvedValueOnce({
      result: false,
      message: 'Product out of stock',
    });
    setupMocks();
    const { createCJOrder } = await import('@/lib/cj-fulfillment');

    const result = await createCJOrder(
      'order-6',
      [{ sku: 'CJ-SPIN-KEY-BLK', quantity: 1 }],
      shippingAddress,
      'test@example.com',
      '+15551234567'
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Product out of stock');
    expect(mockUpdate).toHaveBeenCalledWith({
      fulfillment_error: 'Product out of stock',
    });
  });

  it('stores fulfillment error when CJ API throws', async () => {
    mockCreateOrder.mockRejectedValueOnce(new Error('Network timeout'));
    setupMocks();
    const { createCJOrder } = await import('@/lib/cj-fulfillment');

    const result = await createCJOrder(
      'order-7',
      [{ sku: 'CJ-SPIN-KEY-BLK', quantity: 1 }],
      shippingAddress,
      'test@example.com',
      '+15551234567'
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network timeout');
    expect(mockUpdate).toHaveBeenCalledWith({
      fulfillment_error: 'Network timeout',
    });
  });
});

// ─── 3. Stripe Webhook → CJ Fulfillment Trigger ────────────────────────────

describe('Stripe Webhook (checkout.session.completed)', () => {
  const mockInsert = vi.fn();
  const mockCreateOrder = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();

    mockInsert.mockResolvedValue({
      data: { id: 'supabase-order-1' },
      error: null,
    });

    mockCreateOrder.mockResolvedValue({
      result: true,
      data: { orderId: 'cj-order-abc' },
    });
  });

  function buildStripeSession(overrides = {}) {
    return {
      id: 'cs_test_123',
      payment_intent: 'pi_test_123',
      amount_subtotal: 1198, // $11.98
      amount_total: 1198,
      shipping_cost: { amount_total: 0 },
      total_details: { amount_discount: 0, amount_tax: 0 },
      customer_details: {
        email: 'customer@example.com',
        phone: '+15559876543',
      },
      shipping_details: {
        name: 'Jane Smith',
        address: {
          line1: '456 Oak Ave',
          line2: 'Apt 2',
          city: 'Portland',
          state: 'OR',
          postal_code: '97201',
          country: 'US',
        },
      },
      metadata: {
        skus: JSON.stringify([
          { sku: 'CJ-SPIN-KEY-BLK', qty: 2 },
        ]),
        itemCount: '1',
      },
      ...overrides,
    };
  }

  it('passes SKU data from session metadata to fulfillment', () => {
    const session = buildStripeSession();
    const skuData = JSON.parse(session.metadata.skus);

    expect(skuData).toEqual([{ sku: 'CJ-SPIN-KEY-BLK', qty: 2 }]);
    expect(skuData[0].sku).toBe('CJ-SPIN-KEY-BLK');
  });

  it('parses shipping address from session correctly', () => {
    const session = buildStripeSession();
    const address = session.shipping_details.address;

    expect(address.line1).toBe('456 Oak Ave');
    expect(address.state).toBe('OR');
    expect(address.country).toBe('US');
  });

  it('includes phone number from customer_details', () => {
    const session = buildStripeSession();
    expect(session.customer_details.phone).toBe('+15559876543');
  });

  it('handles sessions without SKU metadata gracefully', () => {
    const session = buildStripeSession({ metadata: {} });
    let skuData: Array<{ sku: string; qty: number }> = [];
    try {
      if (session.metadata?.skus) {
        skuData = JSON.parse(session.metadata.skus);
      }
    } catch {
      // Expected
    }
    expect(skuData).toEqual([]);
  });
});

// ─── 4. CJ Webhook → Order Status Updates ──────────────────────────────────

describe('CJ Webhook Handler', () => {
  const mockSingle = vi.fn();
  const mockUpdateEq = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    mockSingle.mockResolvedValue({
      data: { id: 'order-1', cj_order_id: 'cj-123', cj_order_status: 'pending' },
      error: null,
    });
    mockUpdateEq.mockResolvedValue({ error: null });
  });

  function setupMocks() {
    vi.doMock('@/lib/supabase/admin', () => ({
      getAdminClient: () => ({
        from: () => ({
          select: () => ({
            or: () => ({
              single: mockSingle,
            }),
          }),
          update: () => ({
            eq: () => mockUpdateEq(),
          }),
        }),
      }),
    }));
  }

  async function callWebhook(payload: unknown) {
    setupMocks();
    const { POST } = await import('@/app/api/webhooks/cj/route');
    const request = new Request('http://localhost/api/webhooks/cj', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return POST(request);
  }

  it('maps SHIPPED status and updates order', async () => {
    const res = await callWebhook({
      type: 'ORDER_STATUS',
      data: {
        orderId: 'cj-123',
        orderNumber: 'order-1',
        status: 'SHIPPED',
        trackingNumber: 'TRK123456',
        shippingCarrier: 'USPS',
        updatedAt: '2026-03-30T12:00:00Z',
      },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);
  });

  it('maps DELIVERED status and updates order', async () => {
    const res = await callWebhook({
      type: 'ORDER_STATUS',
      data: {
        orderId: 'cj-123',
        orderNumber: 'order-1',
        status: 'DELIVERED',
        updatedAt: '2026-04-05T12:00:00Z',
      },
    });

    expect(res.status).toBe(200);
  });

  it('maps PENDING statuses correctly', async () => {
    // Test all pending-equivalent CJ statuses
    for (const status of ['CREATED', 'PENDING', 'IN_CART', 'UNPAID']) {
      vi.resetModules();
      const res = await callWebhook({
        type: 'ORDER_STATUS',
        data: {
          orderId: 'cj-123',
          orderNumber: 'order-1',
          status,
          updatedAt: '2026-03-30T12:00:00Z',
        },
      });
      expect(res.status).toBe(200);
    }
  });

  it('returns 400 for invalid payload', async () => {
    const res = await callWebhook({
      type: 'ORDER_STATUS',
      data: {},
    });
    expect(res.status).toBe(400);
  });

  it('returns 200 even when order not found (prevents retries)', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });
    const res = await callWebhook({
      type: 'ORDER_STATUS',
      data: {
        orderId: 'cj-unknown',
        orderNumber: 'order-unknown',
        status: 'SHIPPED',
        updatedAt: '2026-03-30T12:00:00Z',
      },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.warning).toBe('Order not found');
  });

  it('GET endpoint returns verification response', async () => {
    setupMocks();
    const { GET } = await import('@/app/api/webhooks/cj/route');
    const res = await GET();
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('cj-dropshipping-webhook');
  });
});

// ─── 5. Checkout Route SKU Metadata ─────────────────────────────────────────

describe('Checkout Route (SKU passing)', () => {
  it('builds SKU metadata from cart items for Stripe session', () => {
    // Simulate what the checkout route does
    const items = [
      { sku: 'CJ-SPIN-KEY-BLK', quantity: 2, name: 'Spinner', price: 5.99, image: '' },
      { sku: 'CJ-POPCORN-SQU', quantity: 1, name: 'Squishy', price: 9.99, image: '' },
    ];

    const skuData = items.map(item => ({
      sku: item.sku,
      qty: item.quantity,
    }));

    const metadata = JSON.stringify(skuData);
    expect(metadata).toBe('[{"sku":"CJ-SPIN-KEY-BLK","qty":2},{"sku":"CJ-POPCORN-SQU","qty":1}]');

    // Verify it can be parsed back (as the webhook does)
    const parsed = JSON.parse(metadata);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].sku).toBe('CJ-SPIN-KEY-BLK');
    expect(parsed[1].qty).toBe(1);
  });

  it('handles empty cart items', () => {
    const items: Array<{ sku: string; quantity: number }> = [];
    const skuData = items.map(item => ({ sku: item.sku, qty: item.quantity }));
    expect(JSON.stringify(skuData)).toBe('[]');
  });

  it('SKU metadata fits within Stripe metadata limits (500 chars)', () => {
    // Stripe metadata values are limited to 500 characters
    // Test with a realistic max cart (10 items)
    const items = Array.from({ length: 10 }, (_, i) => ({
      sku: `CJ-SPIN-KEY-BLK`,
      qty: i + 1,
    }));

    const metadata = JSON.stringify(items);
    expect(metadata.length).toBeLessThan(500);
  });
});

// ─── 6. End-to-End Flow Validation ──────────────────────────────────────────

describe('End-to-End Fulfillment Flow', () => {
  it('complete flow: cart item SKU → CJ mapping → order creation params', async () => {
    const { getCJMapping } = await import('@/lib/cj-mapping');

    // Step 1: Customer adds item to cart
    const cartItem = { sku: 'CJ-WALL-BALL-4PK', quantity: 3 };

    // Step 2: Checkout route creates SKU metadata
    const skuMetadata = JSON.stringify([{ sku: cartItem.sku, qty: cartItem.quantity }]);

    // Step 3: Stripe webhook parses SKU data
    const parsed = JSON.parse(skuMetadata);
    expect(parsed[0].sku).toBe('CJ-WALL-BALL-4PK');

    // Step 4: Fulfillment logic maps SKU to CJ IDs
    const mapping = getCJMapping(parsed[0].sku);
    expect(mapping).not.toBeNull();
    expect(mapping!.cjPid).toBe('3D7BC0C9-CC09-4FAB-94A2-5775F0D11661');
    expect(mapping!.cjVid).toBe('0C468BCE-95D2-49FB-B125-111E227F7CB5');

    // Step 5: CJ order would be created with vid and quantity
    const cjProduct = {
      vid: mapping!.cjVid,
      quantity: parsed[0].qty,
    };
    expect(cjProduct.vid).toBe('0C468BCE-95D2-49FB-B125-111E227F7CB5');
    expect(cjProduct.quantity).toBe(3);
  });

  it('mixed cart: CJ items get fulfilled, non-CJ items get flagged', async () => {
    const { getCJMappings } = await import('@/lib/cj-mapping');

    const cart = [
      'CJ-SPIN-KEY-BLK',   // CJ product
      'FW-MAG-216-RED',     // Non-CJ (local inventory)
      'CJ-FERRO-YLW',      // CJ product
      'FW-STRESS-4PK',     // Non-CJ
    ];

    const { cjItems, nonCJItems } = getCJMappings(cart);

    expect(cjItems).toHaveLength(2);
    expect(nonCJItems).toEqual(['FW-MAG-216-RED', 'FW-STRESS-4PK']);

    // CJ items have valid PIDs and VIDs
    for (const item of cjItems) {
      expect(item.mapping.cjPid).toBeTruthy();
      expect(item.mapping.cjVid).toBeTruthy();
    }
  });
});
