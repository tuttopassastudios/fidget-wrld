'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useHaptics } from '@/hooks/useHaptics';

const NAV_ITEMS = [
  { label: 'Shop', href: '/products' },
  { label: 'Quality', href: '/quality' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

const FOOTER_LINKS = [
  { label: 'FAQ', href: '/faq' },
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
] as const;

interface SidebarMenuProps {
  open: boolean;
  onClose: () => void;
}

export function SidebarMenu({ open, onClose }: SidebarMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { trigger } = useHaptics();

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Focus trap + initial focus
  useEffect(() => {
    if (!open) return;

    // Focus the close button when menu opens
    requestAnimationFrame(() => {
      closeRef.current?.focus();
    });

    const panel = panelRef.current;
    if (!panel) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div
      className="sidebar-overlay"
      data-open={open ? 'true' : undefined}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div className="sidebar-backdrop" onClick={handleBackdropClick} />

      {/* Pre-layers for stagger effect */}
      <div className="sidebar-prelayers">
        <div className="sidebar-prelayer" />
        <div className="sidebar-prelayer" />
        <div className="sidebar-prelayer" />
      </div>

      {/* Main panel */}
      <div
        ref={panelRef}
        className="sidebar-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Close button */}
        <button
          ref={closeRef}
          className="sidebar-close"
          onClick={() => { trigger('tap'); onClose(); }}
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Nav items */}
        <nav aria-label="Sidebar navigation">
          <ul className="sidebar-nav">
            {NAV_ITEMS.map((item, i) => (
              <li key={item.href} className="sidebar-item-wrap">
                <Link
                  href={item.href}
                  className="sidebar-item"
                  style={{ '--i': i } as React.CSSProperties}
                  tabIndex={open ? 0 : -1}
                  onClick={() => { trigger('select'); onClose(); }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer links */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-label">Quick Links</div>
          <ul className="sidebar-footer-links">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  tabIndex={open ? 0 : -1}
                  onClick={onClose}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
