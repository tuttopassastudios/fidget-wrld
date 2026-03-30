import { getCJClient, type CJShippingAddress, type CJOrderItem } from './cj-dropshipping';
import { getCJMapping, isCJProduct } from './cj-mapping';
import { getAdminClient } from './supabase/admin';

export interface OrderItem {
  sku: string;
  quantity: number;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface FulfillmentResult {
  success: boolean;
  cjOrderId?: string;
  error?: string;
  skippedItems: string[];  // Non-CJ items that need manual fulfillment
}

/**
 * Create a CJ Dropshipping order for the given items
 * @param orderId Supabase order ID
 * @param items Order items with SKUs and quantities
 * @param shippingAddress Customer shipping address
 * @param email Customer email
 * @param phone Customer phone (required by CJ)
 */
export async function createCJOrder(
  orderId: string,
  items: OrderItem[],
  shippingAddress: ShippingAddress,
  email: string,
  phone: string
): Promise<FulfillmentResult> {
  const supabase = getAdminClient();

  // Separate CJ items from non-CJ items
  const cjItems: CJOrderItem[] = [];
  const skippedItems: string[] = [];

  for (const item of items) {
    if (isCJProduct(item.sku)) {
      const mapping = getCJMapping(item.sku);
      if (mapping) {
        cjItems.push({
          vid: mapping.cjVid,
          quantity: item.quantity,
        });
      }
    } else {
      skippedItems.push(item.sku);
    }
  }

  // If no CJ items, nothing to fulfill via CJ
  if (cjItems.length === 0) {
    console.log(`Order ${orderId}: No CJ items to fulfill`);
    return {
      success: true,
      skippedItems,
    };
  }

  try {
    const cj = getCJClient();

    // Build CJ shipping address
    const cjAddress: CJShippingAddress = {
      name: shippingAddress.name,
      phone: phone,
      email: email,
      country: shippingAddress.country === 'US' ? 'United States' : shippingAddress.country,
      province: shippingAddress.state,
      city: shippingAddress.city,
      address: shippingAddress.line1,
      address2: shippingAddress.line2,
      zip: shippingAddress.postal_code,
    };

    // Get country code for the shipping address
    const countryCode = shippingAddress.country === 'United States' || shippingAddress.country === 'US' ? 'US' :
                        shippingAddress.country === 'Canada' || shippingAddress.country === 'CA' ? 'CA' :
                        shippingAddress.country;

    // Create order via CJ API (uses the order module)
    const response = await cj.order.createOrder({
      orderNumber: orderId,
      shippingCountryCode: countryCode,
      shippingCountry: cjAddress.country,
      shippingProvince: cjAddress.province,
      shippingCity: cjAddress.city,
      shippingAddress: cjAddress.address,
      shippingAddress2: cjAddress.address2 || '',
      shippingZip: cjAddress.zip,
      shippingCustomerName: cjAddress.name,
      shippingPhone: cjAddress.phone,
      email: cjAddress.email,
      products: cjItems.map(item => ({
        vid: item.vid,
        quantity: item.quantity,
      })),
    });

    // Check if CJ accepted the order
    if (response.result && response.data?.orderId) {
      const cjOrderId = response.data.orderId;

      // Update order in Supabase with CJ order ID
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          cj_order_id: cjOrderId,
          cj_order_status: 'pending',
          fulfillment_error: null,
        })
        .eq('id', orderId);

      if (updateError) {
        console.error(`Failed to update order ${orderId} with CJ ID:`, updateError);
      }

      console.log(`Order ${orderId}: CJ order created successfully (CJ ID: ${cjOrderId})`);

      return {
        success: true,
        cjOrderId,
        skippedItems,
      };
    } else {
      // CJ API returned an error
      const errorMessage = response.message || 'Unknown CJ API error';
      console.error(`Order ${orderId}: CJ order creation failed:`, errorMessage);

      // Store the error in Supabase
      await supabase
        .from('orders')
        .update({
          fulfillment_error: errorMessage,
        })
        .eq('id', orderId);

      return {
        success: false,
        error: errorMessage,
        skippedItems,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Order ${orderId}: CJ fulfillment error:`, errorMessage);

    // Store the error in Supabase
    await supabase
      .from('orders')
      .update({
        fulfillment_error: errorMessage,
      })
      .eq('id', orderId);

    return {
      success: false,
      error: errorMessage,
      skippedItems,
    };
  }
}

/**
 * Retry CJ order creation for failed orders
 * @param maxAttempts Maximum retry attempts (default: 3)
 * @returns Number of orders successfully retried
 */
export async function retryFailedOrders(maxAttempts: number = 3): Promise<{
  retried: number;
  failed: number;
  errors: string[];
}> {
  const supabase = getAdminClient();

  // Find orders that failed CJ fulfillment and haven't exceeded retry limit
  const { data: failedOrders, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .is('cj_order_id', null)
    .not('fulfillment_error', 'is', null)
    .order('created_at', { ascending: true })
    .limit(10);

  if (fetchError || !failedOrders) {
    console.error('Failed to fetch failed orders:', fetchError);
    return { retried: 0, failed: 0, errors: [fetchError?.message || 'Unknown error'] };
  }

  let retried = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const order of failedOrders) {
    // Extract items from order (items is stored as Json type in Supabase)
    const orderItems = Array.isArray(order.items) ? order.items : [];
    const items: OrderItem[] = orderItems.map((item: unknown) => {
      const orderItem = item as { sku?: string; name?: string; quantity?: number };
      return {
        sku: orderItem.sku || orderItem.name || '',
        quantity: orderItem.quantity || 1,
      };
    });

    // Skip if no items with SKUs
    const cjItems = items.filter(i => isCJProduct(i.sku));
    if (cjItems.length === 0) {
      continue;
    }

    // Build shipping address from order (stored as Json type in Supabase)
    const addressData = order.shipping_address as {
      name?: string;
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    } || {};

    const shippingAddress: ShippingAddress = {
      name: addressData.name || '',
      line1: addressData.line1 || '',
      line2: addressData.line2,
      city: addressData.city || '',
      state: addressData.state || '',
      postal_code: addressData.postal_code || '',
      country: addressData.country || 'US',
    };

    const result = await createCJOrder(
      order.id,
      items,
      shippingAddress,
      order.email || '',
      order.phone || ''
    );

    if (result.success && result.cjOrderId) {
      retried++;
    } else {
      failed++;
      if (result.error) {
        errors.push(`Order ${order.id}: ${result.error}`);
      }
    }
  }

  return { retried, failed, errors };
}
