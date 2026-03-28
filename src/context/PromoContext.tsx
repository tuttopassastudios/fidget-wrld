'use client';

import { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { ActivePromo, PromoResult } from '@/types';
import { PROMO_CODES } from '@/data/promo-codes';
import { sanitizeAlphanumeric } from '@/lib/sanitize';

interface PromoContextType {
  activePromo: ActivePromo | null;
  apply: (code: string, subtotal: number) => { success: boolean; message: string };
  remove: () => void;
  calculateDiscount: (subtotal: number) => PromoResult;
}

const PromoContext = createContext<PromoContextType | null>(null);

export function PromoProvider({ children }: { children: ReactNode }) {
  const [activePromo, setActivePromo] = useLocalStorage<ActivePromo | null>('fidgetopia_promo', null);

  const apply = useCallback((code: string, subtotal: number) => {
    const upper = sanitizeAlphanumeric(code, 20).toUpperCase();
    const def = PROMO_CODES[upper];
    if (!def) return { success: false, message: 'Invalid promo code.' };
    if (def.min > 0 && subtotal < def.min) {
      return { success: false, message: `Minimum order of $${def.min.toFixed(2)} required for this code.` };
    }
    setActivePromo({ code: upper, type: def.type, value: def.value, label: def.label, min: def.min });
    return { success: true, message: `${def.label} applied!` };
  }, [setActivePromo]);

  const remove = useCallback(() => setActivePromo(null), [setActivePromo]);

  const calculateDiscount = useCallback((subtotal: number): PromoResult => {
    if (!activePromo) return { discount: 0, freeShipping: false, label: '' };
    if (activePromo.min > 0 && subtotal < activePromo.min) {
      return { discount: 0, freeShipping: false, label: `${activePromo.label} (min $${activePromo.min} not met)` };
    }
    if (activePromo.type === 'percent') {
      return { discount: subtotal * (activePromo.value / 100), freeShipping: false, label: `${activePromo.label} (${activePromo.code})` };
    }
    if (activePromo.type === 'fixed') {
      return { discount: Math.min(activePromo.value, subtotal), freeShipping: false, label: `${activePromo.label} (${activePromo.code})` };
    }
    if (activePromo.type === 'freeship') {
      return { discount: 0, freeShipping: true, label: `${activePromo.label} (${activePromo.code})` };
    }
    return { discount: 0, freeShipping: false, label: '' };
  }, [activePromo]);

  const value = useMemo(() => ({ activePromo, apply, remove, calculateDiscount }), [activePromo, apply, remove, calculateDiscount]);

  return (
    <PromoContext.Provider value={value}>
      {children}
    </PromoContext.Provider>
  );
}

export function usePromo() {
  const context = useContext(PromoContext);
  if (!context) throw new Error('usePromo must be used within PromoProvider');
  return context;
}
