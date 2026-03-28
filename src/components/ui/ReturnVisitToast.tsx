'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

const LAST_VISIT_KEY = 'fidgetopia_last_visit';
const THIRTY_MINUTES = 30 * 60 * 1000;

export function ReturnVisitToast() {
  const { getCount } = useCart();
  const { show } = useToast();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    const now = Date.now();
    const lastVisit = Number(localStorage.getItem(LAST_VISIT_KEY) || '0');
    localStorage.setItem(LAST_VISIT_KEY, String(now));

    if (lastVisit && now - lastVisit > THIRTY_MINUTES) {
      const count = getCount();
      if (count > 0) {
        show(
          `Welcome back! You have ${count} item${count > 1 ? 's' : ''} in your cart.`,
          'info',
          5000
        );
      }
    }
  }, [getCount, show]);

  return null;
}
