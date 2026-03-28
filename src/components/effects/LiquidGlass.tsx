'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    LiquidGlass?: {
      isSupported: () => boolean;
      create: (el: Element, opts: Record<string, unknown>) => { destroy: () => void };
      createOnHover: (el: Element, opts: Record<string, unknown>) => { destroy: () => void };
      applyFallback: (el: Element) => void;
    };
  }
}

interface LiquidGlassInit {
  selector: string;
  options: Record<string, unknown>;
  hover?: boolean;
  lazy?: boolean;
}

export function LiquidGlassProvider({ targets }: { targets: LiquidGlassInit[] }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    function init() {
      const LG = window.LiquidGlass;
      if (!LG) return;

      const supported = LG.isSupported();
      const screenWidth = window.innerWidth;

      // No glass below 768px
      if (screenWidth < 768) return;

      initialized.current = true;

      targets.forEach(({ selector, options, hover, lazy }) => {
        const elements = document.querySelectorAll(selector);
        if (!elements.length) return;

        elements.forEach(el => {
          if (lazy && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver(entries => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  if (supported) {
                    LG.create(entry.target, options);
                  } else {
                    LG.applyFallback(entry.target);
                  }
                  observer.unobserve(entry.target);
                }
              });
            }, { rootMargin: '100px' });
            observer.observe(el);
          } else if (hover) {
            if (supported) {
              LG.createOnHover(el, options);
            }
          } else {
            if (supported) {
              LG.create(el, options);
            } else {
              LG.applyFallback(el);
            }
          }
        });
      });
    }

    // Try immediately, or poll briefly for script load
    if (window.LiquidGlass) {
      init();
    } else {
      let attempts = 0;
      const interval = setInterval(() => {
        if (window.LiquidGlass || attempts > 40) {
          clearInterval(interval);
          init();
        }
        attempts++;
      }, 50);
      return () => clearInterval(interval);
    }
  }, [targets]);

  return (
    <Script src="/js/liquid-glass.js" strategy="lazyOnload" />
  );
}
