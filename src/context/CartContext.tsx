'use client';

import { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { isCartItemArray } from '@/lib/validators';
import type { CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, qty: number) => void;
  getCount: () => number;
  getSubtotal: () => number;
  clear: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<CartItem[]>('fidgetopia_cart', [], isCartItemArray);
  const [isDrawerOpen, setIsDrawerOpen] = useLocalStorage<boolean>('fidgetopia_cart_drawer', false);

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.sku === item.sku);
      if (existing) {
        return prev.map(i =>
          i.sku === item.sku
            ? { ...i, quantity: Math.min(i.quantity + (item.quantity || 1), 99) }
            : i
        );
      }
      return [...prev, {
        sku: item.sku,
        name: item.name,
        variant: item.variant || '',
        price: parseFloat(String(item.price)) || 0,
        image: item.image || '',
        quantity: item.quantity || 1,
      }];
    });
    // Only open drawer on desktop (> 768px)
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      setIsDrawerOpen(true);
    }
  }, [setItems, setIsDrawerOpen]);

  const removeItem = useCallback((sku: string) => {
    setItems(prev => prev.filter(i => i.sku !== sku));
  }, [setItems]);

  const updateQuantity = useCallback((sku: string, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.sku !== sku));
    } else {
      setItems(prev => prev.map(i =>
        i.sku === sku ? { ...i, quantity: Math.min(qty, 99) } : i
      ));
    }
  }, [setItems]);

  const getCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const getSubtotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const clear = useCallback(() => {
    setItems([]);
  }, [setItems]);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), [setIsDrawerOpen]);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [setIsDrawerOpen]);

  const value = useMemo(() => ({
    items, addItem, removeItem, updateQuantity,
    getCount, getSubtotal, clear,
    isDrawerOpen, openDrawer, closeDrawer,
  }), [items, addItem, removeItem, updateQuantity, getCount, getSubtotal, clear, isDrawerOpen, openDrawer, closeDrawer]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
