'use client';

import { useLayoutEffect, useRef, useState, useCallback, useSyncExternalStore } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useHaptics } from '@/hooks/useHaptics';

// Hydration-safe mounted state
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

interface NavCardLink {
  label: string;
  href: string;
}

interface NavCardItem {
  label: string;
  bgColor: string;
  textColor: string;
  links: NavCardLink[];
}

const NAV_ITEMS: NavCardItem[] = [
  {
    label: 'Best Sellers',
    bgColor: '#3B82F6',
    textColor: '#fff',
    links: [
      { label: 'Top Picks', href: '/products' },
      { label: 'N52 Magnetic Balls', href: '/products/magnet-balls' },
      { label: 'Gift Sets', href: '/products?category=Gift+Set' },
    ],
  },
  {
    label: 'Fidget Toys',
    bgColor: '#8B5CF6',
    textColor: '#fff',
    links: [
      { label: 'Fidget Cubes', href: '/products?category=Clicky' },
      { label: 'Desk Toys', href: '/products?category=Desk+Toy' },
      { label: 'Magnetic Toys', href: '/products?category=Magnetic' },
    ],
  },
  {
    label: 'Stress-Relief Toys',
    bgColor: '#22C55E',
    textColor: '#fff',
    links: [
      { label: 'Stress Balls', href: '/products?category=Squishy' },
      { label: 'Squishy Toys', href: '/products?category=Squishy' },
      { label: 'Stretchy Toys', href: '/products?category=Stretchy' },
    ],
  },
];

const BAR_HEIGHT = 60;
const EXTRA_ROW_HEIGHT = 36;

const ArrowIcon = () => (
  <svg
    className="nav-card-link-arrow"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

export function CardNav() {
  const { getCount, openDrawer } = useCart();
  const { trigger } = useHaptics();
  const [isExpanded, setIsExpanded] = useState(false);
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const navRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const extraLinksRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const prefersReducedMotion = useRef(false);

  useLayoutEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const count = mounted ? getCount() : 0;

  const calculateHeight = useCallback(() => {
    const navEl = navRef.current;
    if (!navEl) return 280;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      const contentEl = navEl.querySelector('.card-nav-content') as HTMLElement | null;
      if (contentEl) {
        const savedVis = contentEl.style.visibility;
        const savedPtr = contentEl.style.pointerEvents;
        const savedPos = contentEl.style.position;
        const savedH = contentEl.style.height;

        contentEl.style.visibility = 'visible';
        contentEl.style.pointerEvents = 'auto';
        contentEl.style.position = 'static';
        contentEl.style.height = 'auto';
        void contentEl.offsetHeight; // force reflow

        const contentHeight = contentEl.scrollHeight;

        contentEl.style.visibility = savedVis;
        contentEl.style.pointerEvents = savedPtr;
        contentEl.style.position = savedPos;
        contentEl.style.height = savedH;

        return BAR_HEIGHT + contentHeight + EXTRA_ROW_HEIGHT + 16;
      }
    }
    return 280;
  }, []);

  const createTimeline = useCallback(() => {
    const navEl = navRef.current;
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    if (!navEl || cards.length === 0) return null;

    gsap.set(navEl, { height: BAR_HEIGHT, overflow: 'hidden' });
    gsap.set(cards, { y: 40, opacity: 0 });
    if (extraLinksRef.current) {
      gsap.set(extraLinksRef.current, { opacity: 0 });
    }

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease: 'power3.out',
    });

    tl.to(cards, {
      y: 0,
      opacity: 1,
      duration: 0.35,
      ease: 'power3.out',
      stagger: 0.07,
    }, '-=0.15');

    if (extraLinksRef.current) {
      tl.to(extraLinksRef.current, {
        opacity: 1,
        duration: 0.25,
        ease: 'power2.out',
      }, '-=0.1');
    }

    return tl;
  }, [calculateHeight]);

  useLayoutEffect(() => {
    if (prefersReducedMotion.current) return;

    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [createTimeline]);

  useLayoutEffect(() => {
    if (prefersReducedMotion.current) return;

    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded, calculateHeight, createTimeline]);

  const closeMenu = useCallback(() => {
    if (!isExpanded) return;

    if (prefersReducedMotion.current) {
      setIsExpanded(false);
      if (navRef.current) navRef.current.style.height = `${BAR_HEIGHT}px`;
      return;
    }

    const tl = tlRef.current;
    if (!tl) return;
    tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
    tl.reverse();
  }, [isExpanded]);

  const toggleMenu = useCallback(() => {
    trigger('tap');

    if (prefersReducedMotion.current) {
      setIsExpanded(prev => !prev);
      if (navRef.current) {
        if (!isExpanded) {
          navRef.current.style.height = `${calculateHeight()}px`;
        } else {
          navRef.current.style.height = `${BAR_HEIGHT}px`;
        }
      }
      return;
    }

    const tl = tlRef.current;
    if (!tl) return;

    if (!isExpanded) {
      setIsExpanded(true);
      tl.play(0);
    } else {
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
      tl.reverse();
    }
  }, [isExpanded, trigger, calculateHeight]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isExpanded) {
      toggleMenu();
    }
  }, [isExpanded, toggleMenu]);

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    cardsRef.current[i] = el;
  };

  return (
    <>
      <div className="card-nav-spacer" />
      <div className="card-nav-container" onKeyDown={handleKeyDown}>
        <nav
          ref={navRef}
          className={`card-nav${isExpanded ? ' open' : ''}`}
          aria-label="Main navigation"
        >
          <div className="card-nav-top">
            <button
              type="button"
              className={`card-nav-hamburger${isExpanded ? ' open' : ''}`}
              onClick={toggleMenu}
              aria-label={isExpanded ? 'Close menu' : 'Open menu'}
              aria-expanded={isExpanded}
            >
              <div className="card-nav-hamburger-line" />
              <div className="card-nav-hamburger-line" />
            </button>

            <Link href="/" className="card-nav-logo" transitionTypes={['navigation']}>
              <span className="card-nav-logo-text">FIDGET WRLD</span>
            </Link>

            <div className="card-nav-actions">
              <Link href="/account" className="card-nav-icon-btn" title="Account">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
              <button
                type="button"
                className="card-nav-icon-btn"
                title="Cart"
                onClick={() => { trigger('tap'); openDrawer(); }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {count > 0 && (
                  <span className="card-nav-cart-count" aria-live="polite" aria-atomic="true">
                    {count}
                  </span>
                )}
              </button>

            </div>
          </div>

          <div className="card-nav-content" aria-hidden={!isExpanded}>
            {NAV_ITEMS.map((item, idx) => (
              <div
                key={item.label}
                className="nav-card"
                ref={setCardRef(idx)}
                style={{ backgroundColor: item.bgColor, color: item.textColor }}
              >
                <div className="nav-card-label">{item.label}</div>
                <div className="nav-card-links">
                  {item.links.map((lnk) => (
                    <Link
                      key={lnk.label}
                      className="nav-card-link"
                      href={lnk.href}
                      tabIndex={isExpanded ? 0 : -1}
                      transitionTypes={['navigation']}
                      onClick={closeMenu}
                    >
                      <ArrowIcon />
                      {lnk.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div
            className="card-nav-extra-links"
            ref={extraLinksRef}
            aria-hidden={!isExpanded}
          >
            <Link
              href="/about"
              className="card-nav-extra-link"
              tabIndex={isExpanded ? 0 : -1}
              transitionTypes={['navigation']}
              onClick={closeMenu}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="card-nav-extra-link"
              tabIndex={isExpanded ? 0 : -1}
              transitionTypes={['navigation']}
              onClick={closeMenu}
            >
              Contact&nbsp;Us
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
