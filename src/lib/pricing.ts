import type { CartItem, PromoResult } from '@/types';
import { getBulkTier } from '@/data/products';

export const FREE_SHIP_THRESHOLD = 150;
export const STANDARD_SHIPPING = 9.99;
export const TAX_RATE = 0.08;

/**
 * Calculate subtotal with bulk discounts applied per line item.
 */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const tier = getBulkTier(item.quantity);
    const discount = tier ? tier.discount / 100 : 0;
    return sum + item.price * item.quantity * (1 - discount);
  }, 0);
}

export interface OrderPricingInput {
  items: CartItem[];
  promoResult: PromoResult;
  shippingPrice: number; // selected shipping method price (9.99, 14.99, or 24.99)
}

export interface OrderPricing {
  subtotal: number;
  promoDiscount: number;
  freeShipping: boolean;
  effectiveShipping: number;
  taxableAmount: number;
  tax: number;
  total: number;
}

/**
 * Single source of truth for all order pricing calculations.
 */
export function calculateOrderPricing(input: OrderPricingInput): OrderPricing {
  const { items, promoResult, shippingPrice } = input;

  const subtotal = calculateSubtotal(items);
  const promoDiscount = promoResult.discount;
  const freeShipping = subtotal >= FREE_SHIP_THRESHOLD || promoResult.freeShipping;

  // Standard shipping becomes free; upgraded shipping methods are always charged
  const effectiveShipping = shippingPrice === STANDARD_SHIPPING && freeShipping ? 0 : shippingPrice;

  const taxableAmount = subtotal - promoDiscount;
  const tax = Math.round(taxableAmount * TAX_RATE * 100) / 100;
  const total = subtotal - promoDiscount + effectiveShipping + tax;

  return {
    subtotal,
    promoDiscount,
    freeShipping,
    effectiveShipping,
    taxableAmount,
    tax,
    total,
  };
}
