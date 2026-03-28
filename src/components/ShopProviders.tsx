'use client';

import type { ReactNode } from 'react';
import { WishlistProvider } from '@/context/WishlistContext';
import { PromoProvider } from '@/context/PromoContext';
import { RecentlyViewedProvider } from '@/context/RecentlyViewedContext';

export function ShopProviders({ children }: { children: ReactNode }) {
  return (
    <WishlistProvider>
      <PromoProvider>
        <RecentlyViewedProvider>
          {children}
        </RecentlyViewedProvider>
      </PromoProvider>
    </WishlistProvider>
  );
}
