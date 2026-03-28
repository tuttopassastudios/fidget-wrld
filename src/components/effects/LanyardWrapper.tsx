'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const Lanyard = dynamic(() => import('./Lanyard'), { ssr: false });

const STORAGE_KEY = 'fidget-lanyard-dismissed';

export function LanyardWrapper() {
  const pathname = usePathname();
  const [showOverlay, setShowOverlay] = useState(false);
  const [closing, setClosing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Check localStorage on mount — show overlay only if not previously dismissed
  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setShowOverlay(true);
      }
    } catch {
      // localStorage unavailable — skip overlay
    }
  }, []);

  // Focus the close button when overlay opens
  useEffect(() => {
    if (showOverlay && closeRef.current) {
      closeRef.current.focus();
    }
  }, [showOverlay]);

  // ESC key handler
  useEffect(() => {
    if (!showOverlay) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showOverlay]);

  // Lock body scroll while overlay is open
  useEffect(() => {
    if (showOverlay) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [showOverlay]);

  const dismiss = useCallback(() => {
    setClosing(true);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
    setTimeout(() => {
      setShowOverlay(false);
      setClosing(false);
    }, 400);
  }, []);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) dismiss();
  }, [dismiss]);

  // Overlay mode — centered modal with promo
  if (showOverlay) {
    return (
      <div
        ref={overlayRef}
        className="lanyard-overlay"
        data-closing={closing}
        role="dialog"
        aria-modal="true"
        aria-label="Welcome discount"
        onClick={handleBackdropClick}
      >
        <div className="lanyard-overlay-card">
          <button
            ref={closeRef}
            className="lanyard-close-btn"
            onClick={dismiss}
            aria-label="Close promotion"
          >
            &#x2715;
          </button>

          <div className="lanyard-canvas-area">
            <Lanyard position={[0, 0, 30]} gravity={[0, -40, 0]} fov={30} transparent />
          </div>

          <div className="lanyard-promo">
            <h2>Get 10% Off Your First Order</h2>
            <p className="lanyard-promo-sub">Use the code below at checkout</p>
            <span className="lanyard-promo-code">FIDGETFUN</span>
            <p className="lanyard-promo-shipping">+ Free shipping on orders over $50</p>
            <button className="lanyard-dismiss-btn" onClick={dismiss}>
              Shop Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Corner mode — small top-right after dismissal (hidden on homepage)
  if (pathname === '/') return null;
  return <Lanyard position={[0, 0, 30]} gravity={[0, -40, 0]} fov={20} transparent />;
}
