import { describe, it, expect } from 'vitest';
import { isCartItemArray, isWishlistItemArray } from '@/lib/validators';

describe('isCartItemArray', () => {
  it('returns true for empty array', () => {
    expect(isCartItemArray([])).toBe(true);
  });

  it('returns true for valid cart items', () => {
    const items = [
      { sku: 'PMX-BPC157-5', name: 'BPC-157', variant: '5mg', price: 42.99, image: '/img.webp', quantity: 1 },
    ];
    expect(isCartItemArray(items)).toBe(true);
  });

  it('returns true for multiple valid items', () => {
    const items = [
      { sku: 'A', name: 'A', variant: '', price: 10, image: '', quantity: 1 },
      { sku: 'B', name: 'B', variant: '', price: 20, image: '', quantity: 5 },
    ];
    expect(isCartItemArray(items)).toBe(true);
  });

  it('returns false for non-array', () => {
    expect(isCartItemArray('not an array')).toBe(false);
    expect(isCartItemArray(null)).toBe(false);
    expect(isCartItemArray(42)).toBe(false);
    expect(isCartItemArray({})).toBe(false);
  });

  it('returns false when sku is missing', () => {
    expect(isCartItemArray([{ name: 'A', price: 10, quantity: 1 }])).toBe(false);
  });

  it('returns false when name is missing', () => {
    expect(isCartItemArray([{ sku: 'A', price: 10, quantity: 1 }])).toBe(false);
  });

  it('returns false for negative price', () => {
    expect(isCartItemArray([{ sku: 'A', name: 'A', price: -1, quantity: 1 }])).toBe(false);
  });

  it('returns false for quantity 0', () => {
    expect(isCartItemArray([{ sku: 'A', name: 'A', price: 10, quantity: 0 }])).toBe(false);
  });

  it('returns false when item is null', () => {
    expect(isCartItemArray([null])).toBe(false);
  });
});

describe('isWishlistItemArray', () => {
  it('returns true for empty array', () => {
    expect(isWishlistItemArray([])).toBe(true);
  });

  it('returns true for valid wishlist items', () => {
    const items = [
      { sku: 'A', name: 'A', variant: '', price: 10, image: '', url: '/a', addedAt: Date.now() },
    ];
    expect(isWishlistItemArray(items)).toBe(true);
  });

  it('returns false for missing addedAt', () => {
    expect(isWishlistItemArray([{ sku: 'A', name: 'A' }])).toBe(false);
  });
});
