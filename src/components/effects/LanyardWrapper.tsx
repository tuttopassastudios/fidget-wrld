'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const Lanyard = dynamic(() => import('./Lanyard'), { ssr: false });

const STORAGE_KEY = 'fidget-lanyard-dismissed';

export function LanyardWrapper() {
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

  // Overlay mode — big, centered, with promo text
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
        <div className="lanyard-overlay-content">
          <button
            ref={closeRef}
            className="lanyard-close-btn"
            onClick={dismiss}
            aria-label="Close promotion"
          >
            &#x2715;
          </button>

          <Lanyard position={[0, 0, 30]} gravity={[0, -40, 0]} fov={20} transparent />

          <div className="lanyard-promo">
            <h2>Welcome to Fidget WRLD!</h2>
            <p>Use code</p>
            <span className="lanyard-promo-code">FIDGETFUN</span>
            <p>for 10% off your first order</p>
            <p style={{ opacity: 0.85, fontSize: '0.9em' }}>+ Free shipping on orders over $50</p>
            <button className="lanyard-dismiss-btn" onClick={dismiss}>
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Corner mode — small top-right after dismissal
  return <Lanyard position={[0, 0, 30]} gravity={[0, -40, 0]} fov={20} transparent />;
}
