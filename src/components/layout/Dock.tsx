'use client';

import { useRef, useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { GlassSurface } from '@/components/effects/GlassSurface';
import { useHaptics } from '@/hooks/useHaptics';

// Hydration-safe mounted state
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

const BASE_SCALE = 1.5;
const MAGNIFY_RANGE = 150;

const ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/products' },
  { label: 'Cart', href: '/cart' },
  { label: 'Account', href: '/account' },
] as const;

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const ICONS = [HomeIcon, ShopIcon, CartIcon, AccountIcon];

export function Dock() {
  const pathname = usePathname();
  const { getCount } = useCart();
  const dockRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const { trigger } = useHaptics();

  const count = mounted ? getCount() : 0;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const dock = dockRef.current;
    if (!dock) return;

    const mouseX = e.clientX;

    for (const item of itemRefs.current) {
      if (!item) continue;
      const itemRect = item.getBoundingClientRect();
      const itemCenterX = itemRect.left + itemRect.width / 2;
      const distance = Math.abs(mouseX - itemCenterX);
      const scale = distance < MAGNIFY_RANGE
        ? 1 + (BASE_SCALE - 1) * (1 - distance / MAGNIFY_RANGE)
        : 1;
      item.style.setProperty('--scale', scale.toFixed(3));
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    for (const item of itemRefs.current) {
      if (item) item.style.setProperty('--scale', '1');
    }
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      ref={dockRef}
      className="dock"
      role="navigation"
      aria-label="Quick navigation"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <GlassSurface
        width="100%"
        height="100%"
        borderRadius={24}
        blur={14}
        backgroundOpacity={0.25}
        brightness={45}
        saturation={1.3}
        distortionScale={-140}
        className="dock-glass"
        style={{ position: 'absolute', inset: 0 }}
      />
      {ITEMS.map((item, i) => {
        const Icon = ICONS[i];
        const active = isActive(item.href);
        const className = `dock-item${active ? ' dock-item--active' : ''}`;

        const isCart = item.label === 'Cart';

        return (
          <Link
            key={item.label}
            href={item.href}
            ref={(el) => { itemRefs.current[i] = el; }}
            className={className}
            aria-current={active ? 'page' : undefined}
            aria-label={isCart && count > 0 ? `Cart, ${count} items` : undefined}
            onClick={() => trigger('select')}
            transitionTypes={['navigation']}
          >
            <Icon />
            {isCart && count > 0 && (
              <span className="dock-badge" aria-hidden="true">{count}</span>
            )}
            <span className="dock-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
