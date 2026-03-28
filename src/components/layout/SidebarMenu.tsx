'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useHaptics } from '@/hooks/useHaptics';
import { PolkaDots } from '@/components/ui/DecorativePatterns';

const NAV_ITEMS = [
  { label: 'Shop', href: '/products' },
  { label: 'Quality', href: '/quality' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

const CATEGORY_ITEMS = [
  { label: 'Magnetic', color: 'var(--color-magnetic, #B794F6)' },
  { label: 'Squishy', color: 'var(--color-squishy, #FF6B9D)' },
  { label: 'Clicky', color: 'var(--color-clicky, #00D4AA)' },
  { label: 'Stretchy', color: 'var(--color-stretchy, #FFD93D)' },
  { label: 'Desk Toys', color: 'var(--color-desk, #FF8B6A)' },
  { label: 'Gift Sets', color: 'var(--color-collectible, #FF4757)' },
] as const;

const FOOTER_LINKS = [
  { label: 'FAQ', href: '/faq' },
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
] as const;

// Preview color configs for each nav item
const PREVIEW_CONFIGS: Record<string, string[]> = {
  Shop: [
    'var(--color-magnetic, #B794F6)',
    'var(--color-squishy, #FF6B9D)',
    'var(--color-clicky, #00D4AA)',
    'var(--color-stretchy, #FFD93D)',
    'var(--color-desk, #FF8B6A)',
  ],
  Quality: [
    'var(--color-accent-secondary, #00B4D8)',
    'var(--color-accent-primary, #FF6B9D)',
  ],
  About: [
    'var(--color-dot-pink, #FF6B9D)',
    'var(--color-dot-violet, #B794F6)',
    'var(--color-dot-cyan, #00B4D8)',
  ],
  Contact: [
    'var(--color-dot-coral, #FF8B6A)',
    'var(--color-dot-yellow, #FFD93D)',
  ],
};

interface SidebarMenuProps {
  open: boolean;
  onClose: () => void;
}

export function SidebarMenu({ open, onClose }: SidebarMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { trigger } = useHaptics();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [shopExpanded, setShopExpanded] = useState(false);

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

  // Reset state when menu closes
  useEffect(() => {
    if (!open) {
      setHoveredItem(null);
      setShopExpanded(false);
    }
  }, [open]);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleShopToggle = useCallback(() => {
    setShopExpanded((prev) => !prev);
  }, []);

  const handleNavItemInteraction = useCallback(
    (label: string) => {
      setHoveredItem(label);
      if (label === 'Shop') {
        setShopExpanded(true);
      } else {
        setShopExpanded(false);
      }
    },
    []
  );

  const handleNavItemLeave = useCallback(() => {
    setHoveredItem(null);
    // Don't collapse shop on mouse leave — only collapse when another item is hovered
  }, []);

  const handleShopKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleShopToggle();
      }
    },
    [handleShopToggle]
  );

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
        {/* Subtle polka-dot background */}
        <PolkaDots
          className="sidebar-bg-dots"
          pattern="grid"
          size="sm"
          density="sparse"
        />

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

        {/* Left zone: Navigation */}
        <div className="sidebar-nav-zone">
          <nav aria-label="Sidebar navigation">
            <ul className="sidebar-nav">
              {NAV_ITEMS.map((item, i) => (
                <li key={item.href} className="sidebar-item-wrap">
                  {item.label === 'Shop' ? (
                    <>
                      <button
                        className="sidebar-item sidebar-item--shop"
                        style={{ '--i': i } as React.CSSProperties}
                        tabIndex={open ? 0 : -1}
                        onClick={() => { trigger('select'); handleShopToggle(); }}
                        onKeyDown={handleShopKeyDown}
                        onMouseEnter={() => handleNavItemInteraction('Shop')}
                        onFocus={() => handleNavItemInteraction('Shop')}
                        aria-expanded={shopExpanded}
                        aria-controls="sidebar-subnav"
                      >
                        <span className="sidebar-item-number" aria-hidden="true">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {item.label}
                      </button>
                      <ul
                        id="sidebar-subnav"
                        className={`sidebar-subnav ${shopExpanded ? 'sidebar-subnav--open' : ''}`}
                        role="list"
                      >
                        {CATEGORY_ITEMS.map((cat, ci) => (
                          <li key={cat.label}>
                            <Link
                              href={`/products?category=${encodeURIComponent(cat.label)}`}
                              className="sidebar-subitem"
                              style={{ '--i': ci } as React.CSSProperties}
                              tabIndex={open && shopExpanded ? 0 : -1}
                              onClick={() => { trigger('select'); onClose(); }}
                            >
                              <span
                                className="sidebar-subitem-dot"
                                style={{ backgroundColor: cat.color }}
                                aria-hidden="true"
                              />
                              {cat.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className="sidebar-item"
                      style={{ '--i': i } as React.CSSProperties}
                      tabIndex={open ? 0 : -1}
                      onClick={() => { trigger('select'); onClose(); }}
                      onMouseEnter={() => handleNavItemInteraction(item.label)}
                      onFocus={() => handleNavItemInteraction(item.label)}
                      onMouseLeave={handleNavItemLeave}
                      onBlur={handleNavItemLeave}
                    >
                      <span className="sidebar-item-number" aria-hidden="true">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {item.label}
                    </Link>
                  )}
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

        {/* Right zone: Category preview */}
        <div className="sidebar-preview" aria-hidden="true">
          {/* Default preview */}
          <div
            className={`sidebar-preview-content ${hoveredItem ? 'sidebar-preview-content--hidden' : ''}`}
          >
            <PolkaDots pattern="grid" size="lg" density="medium" />
          </div>
          {/* Item-specific previews */}
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className={`sidebar-preview-content ${hoveredItem === item.label ? '' : 'sidebar-preview-content--hidden'}`}
            >
              <PolkaDots
                pattern={item.label === 'Shop' ? 'scatter' : 'grid'}
                size={item.label === 'Shop' ? 'lg' : 'md'}
                density={item.label === 'Shop' ? 'dense' : 'medium'}
                colors={PREVIEW_CONFIGS[item.label]}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
