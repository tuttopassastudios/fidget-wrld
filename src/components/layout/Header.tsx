'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { SearchBox } from '@/components/ui/SearchBox';
import { SidebarMenu } from '@/components/layout/SidebarMenu';
import { HolographicLogo } from '@/components/ui/HolographicLogo';
import { useHaptics } from '@/hooks/useHaptics';

export function Header() {
  const { getCount, openDrawer } = useCart();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrollShadow, setScrollShadow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let last = false;
    const handleScroll = () => {
      const next = window.pageYOffset > 100;
      if (next !== last) {
        last = next;
        setScrollShadow(next);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { trigger } = useHaptics();
  const count = mounted ? getCount() : 0;
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header className="header" style={scrollShadow ? { boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' } : undefined}>
        <div className="container">
          <div className="header-inner">
            <Link href="/" className="header-logo" style={{ fontSize: '1.25rem' }} transitionTypes={['navigation']}>
              <HolographicLogo priority />
            </Link>

            <nav className="header-nav" role="navigation" aria-label="Main navigation">
              <div className="nav-dropdown-wrapper">
                <Link href="/products" className={isActive('/products') ? 'active' : undefined} transitionTypes={['navigation']}>
                  Shop
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </Link>
                <div className="nav-dropdown" role="menu">
                  <Link href="/products?category=Magnetic" role="menuitem" transitionTypes={['navigation']}>Magnetic</Link>
                  <Link href="/products?category=Squishy" role="menuitem" transitionTypes={['navigation']}>Squishy</Link>
                  <Link href="/products?category=Clicky" role="menuitem" transitionTypes={['navigation']}>Clicky</Link>
                  <Link href="/products?category=Desk+Toys" role="menuitem" transitionTypes={['navigation']}>Desk Toys</Link>
                </div>
              </div>
              <Link href="/quality" className={isActive('/quality') ? 'active' : undefined} transitionTypes={['navigation']}>Quality</Link>
              <Link href="/about" className={isActive('/about') ? 'active' : undefined} transitionTypes={['navigation']}>About</Link>
              <Link href="/contact" className={isActive('/contact') ? 'active' : undefined} transitionTypes={['navigation']}>Contact&nbsp;Us</Link>
            </nav>

            <SearchBox className="header-search" />

            <div className="header-actions">
              <Link href="/products" className="btn btn-primary btn-header-cta" transitionTypes={['navigation']}>Browse Catalog</Link>
              <Link href="/account" className="header-icon-btn" title="Account">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
              <button
                className="header-icon-btn"
                title="Cart"
                style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => { trigger('tap'); openDrawer(); }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {count > 0 && <span className="cart-count" aria-live="polite" aria-atomic="true">{count}</span>}
              </button>

              <button
                className={`mobile-menu-toggle${sidebarOpen ? ' active' : ''}`}
                onClick={() => { trigger('tap'); setSidebarOpen(!sidebarOpen); }}
                aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={sidebarOpen}
              >
                <span /><span /><span />
              </button>
            </div>
          </div>
        </div>
      </header>

      <SidebarMenu open={sidebarOpen} onClose={closeSidebar} />
    </>
  );
}
