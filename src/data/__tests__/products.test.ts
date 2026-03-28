import { describe, it, expect } from 'vitest';
import { getBulkTier, getProductBySlug, getVariantBySku, getAllSlugs, getRecommendations, productPages } from '@/data/products';

describe('getBulkTier', () => {
  it('returns null for qty 1', () => {
    expect(getBulkTier(1)).toBeNull();
  });

  it('returns null for qty 2', () => {
    expect(getBulkTier(2)).toBeNull();
  });

  it('returns 5% tier for qty 3', () => {
    const tier = getBulkTier(3);
    expect(tier).not.toBeNull();
    expect(tier!.discount).toBe(5);
  });

  it('returns 5% tier for qty 4', () => {
    expect(getBulkTier(4)!.discount).toBe(5);
  });

  it('returns 9% tier for qty 5', () => {
    expect(getBulkTier(5)!.discount).toBe(9);
  });

  it('returns 9% tier for qty 9', () => {
    expect(getBulkTier(9)!.discount).toBe(9);
  });

  it('returns 15% tier for qty 10', () => {
    expect(getBulkTier(10)!.discount).toBe(15);
  });

  it('returns 15% tier for qty 99', () => {
    expect(getBulkTier(99)!.discount).toBe(15);
  });
});

describe('getProductBySlug', () => {
  it('returns product for valid slug', () => {
    const product = getProductBySlug('bpc-157');
    expect(product).toBeDefined();
    expect(product!.name).toBe('BPC-157');
  });

  it('returns undefined for invalid slug', () => {
    expect(getProductBySlug('nonexistent')).toBeUndefined();
  });

  it('returns product with correct variants', () => {
    const product = getProductBySlug('ghk-cu');
    expect(product!.variants).toHaveLength(2);
    expect(product!.variants[0].sku).toBe('PMX-GHKCU-50');
    expect(product!.variants[1].sku).toBe('PMX-GHKCU-100');
  });
});

describe('getVariantBySku', () => {
  it('returns variant for valid SKU', () => {
    const variant = getVariantBySku('PMX-BPC157-5');
    expect(variant).not.toBeNull();
    expect(variant!.name).toBe('BPC-157');
    expect(variant!.price).toBe(42.99);
  });

  it('returns null for invalid SKU', () => {
    expect(getVariantBySku('INVALID')).toBeNull();
  });
});

describe('getAllSlugs', () => {
  it('returns all product slugs', () => {
    const slugs = getAllSlugs();
    expect(slugs).toHaveLength(productPages.length);
    expect(slugs).toContain('bpc-157');
    expect(slugs).toContain('pm-3rt');
    expect(slugs).toContain('reconstitution-solution');
  });
});

describe('getRecommendations', () => {
  it('returns recommendations for known product', () => {
    const recs = getRecommendations([{ sku: 'PMX-BPC157-5', name: 'BPC-157' }]);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.length).toBeLessThanOrEqual(4);
  });

  it('does not recommend items already in cart', () => {
    const recs = getRecommendations([
      { sku: 'PMX-BPC157-5', name: 'BPC-157' },
      { sku: 'PMX-TB500-5', name: 'TB-500' },
    ]);
    const recSkus = recs.map(r => r.sku);
    expect(recSkus).not.toContain('PMX-BPC157-5');
    expect(recSkus).not.toContain('PMX-TB500-5');
  });

  it('returns max 4 items', () => {
    // Add many items to get lots of recommendations
    const cartItems = [
      { sku: 'PMX-BPC157-5', name: 'BPC-157' },
      { sku: 'PMX-PM3RT-5', name: 'PM-3RT' },
      { sku: 'PMX-GHKCU-50', name: 'GHK-Cu' },
    ];
    const recs = getRecommendations(cartItems);
    expect(recs.length).toBeLessThanOrEqual(4);
  });

  it('returns empty array for unknown product', () => {
    const recs = getRecommendations([{ sku: 'UNKNOWN', name: 'Unknown' }]);
    expect(recs).toHaveLength(0);
  });
});
