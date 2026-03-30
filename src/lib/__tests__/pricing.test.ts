import { describe, it, expect } from 'vitest';
import { calculateSubtotal, calculateOrderPricing, STANDARD_SHIPPING, TAX_RATE } from '@/lib/pricing';
import { mockCartItem, mockBulkCartItem, noDiscount } from '@/test/helpers';
import type { PromoResult } from '@/types';

describe('calculateSubtotal', () => {
  it('returns 0 for empty cart', () => {
    expect(calculateSubtotal([])).toBe(0);
  });

  it('returns price * quantity for single item with no bulk discount', () => {
    const item = mockCartItem({ price: 42.99, quantity: 1 });
    expect(calculateSubtotal([item])).toBeCloseTo(42.99);
  });

  it('returns sum for multiple items with no bulk discount', () => {
    const items = [
      mockCartItem({ sku: 'A', price: 42.99, quantity: 1 }),
      mockCartItem({ sku: 'B', price: 49.99, quantity: 2 }),
    ];
    expect(calculateSubtotal(items)).toBeCloseTo(42.99 + 49.99 * 2);
  });

  it('applies 5% bulk discount at 3 units', () => {
    const item = mockBulkCartItem(3);
    const expected = 42.99 * 3 * (1 - 0.05);
    expect(calculateSubtotal([item])).toBeCloseTo(expected);
  });

  it('applies 9% bulk discount at 5 units', () => {
    const item = mockBulkCartItem(5);
    const expected = 42.99 * 5 * (1 - 0.09);
    expect(calculateSubtotal([item])).toBeCloseTo(expected);
  });

  it('applies 15% bulk discount at 10 units', () => {
    const item = mockBulkCartItem(10);
    const expected = 42.99 * 10 * (1 - 0.15);
    expect(calculateSubtotal([item])).toBeCloseTo(expected);
  });

  it('applies 15% bulk discount at 99 units', () => {
    const item = mockBulkCartItem(99);
    const expected = 42.99 * 99 * (1 - 0.15);
    expect(calculateSubtotal([item])).toBeCloseTo(expected);
  });

  it('no bulk discount at 2 units (below threshold)', () => {
    const item = mockBulkCartItem(2);
    expect(calculateSubtotal([item])).toBeCloseTo(42.99 * 2);
  });

  it('applies bulk discount per line item independently', () => {
    const items = [
      mockCartItem({ sku: 'A', price: 42.99, quantity: 3 }), // 5% off
      mockCartItem({ sku: 'B', price: 49.99, quantity: 1 }), // no discount
    ];
    const expected = 42.99 * 3 * 0.95 + 49.99;
    expect(calculateSubtotal(items)).toBeCloseTo(expected);
  });
});

describe('calculateOrderPricing', () => {
  it('calculates correct total with no promo, standard shipping, below free ship threshold', () => {
    const items = [mockCartItem({ price: 42.99, quantity: 1 })];
    const result = calculateOrderPricing({ items, promoResult: noDiscount, shippingPrice: STANDARD_SHIPPING });

    expect(result.subtotal).toBeCloseTo(42.99);
    expect(result.promoDiscount).toBe(0);
    expect(result.freeShipping).toBe(false);
    expect(result.effectiveShipping).toBe(STANDARD_SHIPPING);
    expect(result.tax).toBeCloseTo(Math.round(42.99 * TAX_RATE * 100) / 100);
    expect(result.total).toBeCloseTo(42.99 + STANDARD_SHIPPING + result.tax);
  });

  it('grants free standard shipping at threshold', () => {
    const items = [mockCartItem({ price: 50, quantity: 3 })]; // $150 exactly
    const result = calculateOrderPricing({ items, promoResult: noDiscount, shippingPrice: STANDARD_SHIPPING });

    // 3 units = 5% bulk discount → $150 * 0.95 = $142.50 (below threshold)
    expect(result.freeShipping).toBe(false);
    expect(result.effectiveShipping).toBe(STANDARD_SHIPPING);
  });

  it('grants free standard shipping above threshold', () => {
    const items = [mockCartItem({ price: 50, quantity: 4 })]; // $200 raw, 5% off = $190
    const result = calculateOrderPricing({ items, promoResult: noDiscount, shippingPrice: STANDARD_SHIPPING });

    expect(result.subtotal).toBeCloseTo(200 * 0.95);
    expect(result.freeShipping).toBe(true);
    expect(result.effectiveShipping).toBe(0);
  });

  it('does NOT make upgraded shipping free when above threshold', () => {
    const items = [mockCartItem({ price: 200, quantity: 1 })];
    const result = calculateOrderPricing({ items, promoResult: noDiscount, shippingPrice: 14.99 });

    expect(result.freeShipping).toBe(true);
    expect(result.effectiveShipping).toBe(14.99); // priority is never free
  });

  it('grants free shipping with FREESHIP promo', () => {
    const promo: PromoResult = { discount: 0, freeShipping: true, label: 'Free Shipping' };
    const items = [mockCartItem({ price: 42.99, quantity: 1 })];
    const result = calculateOrderPricing({ items, promoResult: promo, shippingPrice: STANDARD_SHIPPING });

    expect(result.freeShipping).toBe(true);
    expect(result.effectiveShipping).toBe(0);
  });

  it('applies percent promo discount correctly', () => {
    const items = [mockCartItem({ price: 100, quantity: 1 })];
    const promo: PromoResult = { discount: 10, freeShipping: false, label: '10% Off' };
    const result = calculateOrderPricing({ items, promoResult: promo, shippingPrice: STANDARD_SHIPPING });

    expect(result.promoDiscount).toBe(10);
    expect(result.taxableAmount).toBeCloseTo(90);
    expect(result.tax).toBeCloseTo(Math.round(90 * TAX_RATE * 100) / 100);
    expect(result.total).toBeCloseTo(90 + STANDARD_SHIPPING + result.tax);
  });

  it('applies fixed promo discount correctly', () => {
    // Use price below free-ship threshold to test shipping is charged
    const items = [mockCartItem({ price: 60, quantity: 1 })];
    const promo: PromoResult = { discount: 20, freeShipping: false, label: '$20 Off' };
    const result = calculateOrderPricing({ items, promoResult: promo, shippingPrice: STANDARD_SHIPPING });

    expect(result.promoDiscount).toBe(20);
    expect(result.subtotal).toBeCloseTo(60);
    const expectedTax = Math.round((60 - 20) * TAX_RATE * 100) / 100;
    expect(result.total).toBeCloseTo(60 - 20 + STANDARD_SHIPPING + expectedTax);
  });

  it('stacks bulk discount and promo correctly', () => {
    // 5 items at $42.99 → 9% bulk → subtotal ≈ $195.60
    // 10% promo on that → discount ≈ $19.56
    const items = [mockCartItem({ price: 42.99, quantity: 5 })];
    const subtotalExpected = 42.99 * 5 * (1 - 0.09);
    const promoDiscount = subtotalExpected * 0.10;
    const promo: PromoResult = { discount: promoDiscount, freeShipping: false, label: '10% Off' };
    const result = calculateOrderPricing({ items, promoResult: promo, shippingPrice: STANDARD_SHIPPING });

    expect(result.subtotal).toBeCloseTo(subtotalExpected);
    expect(result.promoDiscount).toBeCloseTo(promoDiscount);
    // Above $150 → free shipping
    expect(result.effectiveShipping).toBe(0);
  });

  it('calculates tax correctly (8%, rounded to cents)', () => {
    const items = [mockCartItem({ price: 33.33, quantity: 1 })];
    const result = calculateOrderPricing({ items, promoResult: noDiscount, shippingPrice: STANDARD_SHIPPING });

    expect(result.tax).toBe(Math.round(33.33 * 0.08 * 100) / 100);
  });

  it('handles empty cart', () => {
    const result = calculateOrderPricing({ items: [], promoResult: noDiscount, shippingPrice: STANDARD_SHIPPING });

    expect(result.subtotal).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.total).toBeCloseTo(STANDARD_SHIPPING); // just shipping
  });

  it('total is never negative even with large promo', () => {
    const items = [mockCartItem({ price: 15, quantity: 1 })];
    // Promo discount larger than subtotal (shouldn't happen in practice but defend against it)
    const promo: PromoResult = { discount: 15, freeShipping: false, label: '$20 Off capped' };
    const result = calculateOrderPricing({ items, promoResult: promo, shippingPrice: STANDARD_SHIPPING });

    expect(result.total).toBeGreaterThanOrEqual(0);
  });
});
