'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useDashboardRole } from './DashboardGuard';
import styles from './DashboardSidebar.module.css';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: '◎' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: '▤' },
  { href: '/dashboard/customers', label: 'Customers', icon: '♟' },
  { href: '/dashboard/orders', label: 'Orders', icon: '☰' },
  { href: '/dashboard/users', label: 'Users', icon: '◉' },
  { href: '/dashboard/products', label: 'Products', icon: '◆' },
  { href: '/dashboard/promos', label: 'Promos', icon: '✦' },
  { href: '/dashboard/health', label: 'Site Health', icon: '♡' },
];

const ADMIN_ITEMS = [
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙' },
];

function NavContents({
  role,
  isActive,
  onNavigate,
}: {
  role: string | null;
  isActive: (href: string) => boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      <ul className={styles.navList}>
        {NAV_ITEMS.map(item => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
              aria-current={isActive(item.href) ? 'page' : undefined}
              onClick={onNavigate}
            >
              <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      {role === 'admin' && (
        <>
          <div className={styles.divider} />
          <ul className={styles.navList}>
            {ADMIN_ITEMS.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  onClick={onNavigate}
                >
                  <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const role = useDashboardRole();
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setMenuOpen(false);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [menuOpen, handleKeyDown]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Desktop sidebar — unchanged */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Link href="/dashboard" className={styles.logo}>
            <span className={styles.logoMark}>PM</span>
            <span className={styles.logoText}>Dashboard</span>
          </Link>
        </div>

        <nav className={styles.nav} aria-label="Dashboard navigation">
          <NavContents role={role} isActive={isActive} />
        </nav>

        <div className={styles.footer}>
          <Link href="/" className={styles.backToSite}>
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Mobile header bar + hamburger drawer */}
      <div className={styles.mobileHeader}>
        <Link href="/dashboard" className={styles.logo}>
          <span className={styles.logoMark}>PM</span>
        </Link>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(prev => !prev)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          type="button"
        >
          <span className={`${styles.hamburgerBar} ${menuOpen ? styles.hamburgerOpen : ''}`} />
          <span className={`${styles.hamburgerBar} ${menuOpen ? styles.hamburgerOpen : ''}`} />
          <span className={`${styles.hamburgerBar} ${menuOpen ? styles.hamburgerOpen : ''}`} />
        </button>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div
          className={styles.backdrop}
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        id="mobile-nav-drawer"
        ref={drawerRef}
        className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal={menuOpen}
        aria-label="Navigation menu"
      >
        <nav className={styles.drawerNav} aria-label="Dashboard navigation">
          <NavContents role={role} isActive={isActive} onNavigate={closeMenu} />
        </nav>
        <div className={styles.drawerFooter}>
          <Link href="/" className={styles.backToSite} onClick={closeMenu}>
            ← Back to site
          </Link>
        </div>
      </div>
    </>
  );
}
