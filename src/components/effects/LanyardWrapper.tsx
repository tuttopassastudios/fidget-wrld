'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const Lanyard = dynamic(() => import('./Lanyard'), { ssr: false });

const STORAGE_KEY = 'fidget-lanyard-dismissed';

export function LanyardWrapper() {
  const pathname = usePathname();
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setShowPromo(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const dismissPromo = useCallback(() => {
    setShowPromo(false);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
  }, []);

  // Hide persistent lanyard on homepage when promo is not showing
  if (pathname === '/' && !showPromo) return null;

  return (
    <Lanyard
      position={[0, 0, 30]}
      gravity={[0, -40, 0]}
      fov={20}
      transparent
      showPromo={showPromo}
      onDismissPromo={dismissPromo}
    />
  );
}
