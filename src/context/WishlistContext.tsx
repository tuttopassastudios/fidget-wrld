'use client';

import { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { isWishlistItemArray } from '@/lib/validators';
import type { WishlistItem } from '@/types';

interface WishlistContextType {
  items: WishlistItem[];
  toggle: (product: Omit<WishlistItem, 'addedAt'>) => boolean;
  isWishlisted: (sku: string) => boolean;
  remove: (sku: string) => void;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<WishlistItem[]>('fidgetopia_wishlist', [], isWishlistItemArray);

  const toggle = useCallback((product: Omit<WishlistItem, 'addedAt'>) => {
    let added = false;
    setItems(prev => {
      const idx = prev.findIndex(i => i.sku === product.sku);
      if (idx >= 0) {
        added = false;
        return prev.filter((_, i) => i !== idx);
      }
      added = true;
      return [...prev, { ...product, addedAt: Date.now() }];
    });
    return added;
  }, [setItems]);

  const isWishlisted = useCallback((sku: string) => {
    return items.some(i => i.sku === sku);
  }, [items]);

  const remove = useCallback((sku: string) => {
    setItems(prev => prev.filter(i => i.sku !== sku));
  }, [setItems]);

  const clear = useCallback(() => setItems([]), [setItems]);

  const value = useMemo(() => ({ items, toggle, isWishlisted, remove, clear }), [items, toggle, isWishlisted, remove, clear]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
