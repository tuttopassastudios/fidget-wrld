import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '@/context/CartContext';
import { mockCartItem } from '@/test/helpers';
import type { ReactNode } from 'react';

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

describe('CartContext', () => {
  it('starts with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.getCount()).toBe(0);
    expect(result.current.getSubtotal()).toBe(0);
  });

  it('addItem adds a new item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockCartItem()));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].sku).toBe('PMX-BPC157-5');
  });

  it('addItem merges quantity for same SKU', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockCartItem({ quantity: 2 })));
    act(() => result.current.addItem(mockCartItem({ quantity: 3 })));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(5);
  });

  it('addItem caps quantity at 99', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockCartItem({ quantity: 95 })));
    act(() => result.current.addItem(mockCartItem({ quantity: 10 })));
    expect(result.current.items[0].quantity).toBe(99);
  });

  it('removeItem removes by SKU', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockCartItem()));
    act(() => result.current.removeItem('PMX-BPC157-5'));
    expect(result.current.items).toHaveLength(0);
  });

  it('removeItem does nothing for unknown SKU', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockCartItem()));
    act(() => result.current.removeItem('UNKNOWN'));
    expect(result.current.items).toHaveLength(1);
  });

  it('updateQuantity changes quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockCartItem()));
    act(() => result.current.updateQuantity('PMX-BPC157-5', 5));
    expect(result.current.items[0].quantity).toBe(5);
  });

  it('updateQuantity to 0 removes item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockCartItem()));
    act(() => result.current.updateQuantity('PMX-BPC157-5', 0));
    expect(result.current.items).toHaveLength(0);
  });

  it('updateQuantity caps at 99', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockCartItem()));
    act(() => result.current.updateQuantity('PMX-BPC157-5', 150));
    expect(result.current.items[0].quantity).toBe(99);
  });

  it('getCount returns total quantity across items', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockCartItem({ sku: 'A', quantity: 3 })));
    act(() => result.current.addItem(mockCartItem({ sku: 'B', quantity: 2 })));
    expect(result.current.getCount()).toBe(5);
  });

  it('getSubtotal returns sum of price * quantity (no bulk discount)', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockCartItem({ sku: 'A', price: 10, quantity: 2 })));
    act(() => result.current.addItem(mockCartItem({ sku: 'B', price: 20, quantity: 1 })));
    expect(result.current.getSubtotal()).toBeCloseTo(40);
  });

  it('clear empties the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockCartItem()));
    act(() => result.current.clear());
    expect(result.current.items).toHaveLength(0);
  });

  it('throws when used outside provider', () => {
    expect(() => {
      renderHook(() => useCart());
    }).toThrow('useCart must be used within CartProvider');
  });
});
