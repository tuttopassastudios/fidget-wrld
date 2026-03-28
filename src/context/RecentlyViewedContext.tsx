'use client';

import { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface RecentlyViewedItem {
  sku: string;
  name: string;
  variant: string;
  price: number;
  image: string;
  url: string;
  viewedAt: number;
}

interface RecentlyViewedContextType {
  items: RecentlyViewedItem[];
  track: (product: Omit<RecentlyViewedItem, 'viewedAt'>) => void;
  clear: () => void;
}

const MAX_ITEMS = 8;
const RecentlyViewedContext = createContext<RecentlyViewedContextType | null>(null);

function isRecentlyViewedArray(value: unknown): value is RecentlyViewedItem[] {
  return Array.isArray(value) && value.every(item =>
    typeof item === 'object' && item !== null &&
    typeof (item as RecentlyViewedItem).sku === 'string' &&
    typeof (item as RecentlyViewedItem).name === 'string' &&
    typeof (item as RecentlyViewedItem).viewedAt === 'number'
  );
}

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<RecentlyViewedItem[]>('fidgetopia_recently_viewed', [], isRecentlyViewedArray);

  const track = useCallback((product: Omit<RecentlyViewedItem, 'viewedAt'>) => {
    if (!product.sku) return;
    setItems(prev => {
      const filtered = prev.filter(p => p.sku !== product.sku);
      return [{ ...product, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
    });
  }, [setItems]);

  const clear = useCallback(() => setItems([]), [setItems]);

  const value = useMemo(() => ({ items, track, clear }), [items, track, clear]);

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context) throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider');
  return context;
}
