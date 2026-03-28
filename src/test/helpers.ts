import type { CartItem, PromoResult } from '@/types';

export function mockCartItem(overrides?: Partial<CartItem>): CartItem {
  return {
    sku: 'PMX-BPC157-5',
    name: 'BPC-157',
    variant: '5mg',
    price: 42.99,
    image: '/images/bpc-157-5mg.webp',
    quantity: 1,
    ...overrides,
  };
}

export function mockCartItems(count: number): CartItem[] {
  const products: Partial<CartItem>[] = [
    { sku: 'PMX-BPC157-5', name: 'BPC-157', variant: '5mg', price: 42.99 },
    { sku: 'PMX-PM3RT-5', name: 'PM-3RT', variant: '5mg', price: 44.99 },
    { sku: 'PMX-GHKCU-50', name: 'GHK-Cu', variant: '50mg', price: 34.99 },
    { sku: 'PMX-TB500-5', name: 'TB-500', variant: '5mg', price: 39.99 },
    { sku: 'PMX-MT2-10', name: 'Melanotan 2', variant: '10mg', price: 34.99 },
  ];
  return products.slice(0, count).map(p => mockCartItem(p));
}

export function mockBulkCartItem(qty: number): CartItem {
  return mockCartItem({ quantity: qty });
}

export const noDiscount: PromoResult = { discount: 0, freeShipping: false, label: '' };
