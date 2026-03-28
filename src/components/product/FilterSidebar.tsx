'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { PriceRangeSlider } from './PriceRangeSlider';
import { ColorSwatchFilter } from './ColorSwatchFilter';
import type { ProductPage } from '@/types';
import styles from './FilterSidebar.module.css';

export interface FilterState {
  category: string | null;
  priceRange: [number, number];
  colors: string[];
  moods: string[];
  audiences: string[];
}

export interface FilterSidebarProps {
  products: ProductPage[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const FULL_CATEGORIES = [
  { key: 'all', label: 'All Products' },
  { key: 'Magnetic', label: 'Magnetic' },
  { key: 'Squishy', label: 'Squishy' },
  { key: 'Clicky', label: 'Clicky' },
  { key: 'Stretchy', label: 'Stretchy' },
  { key: 'Desk Toy', label: 'Desk Toy' },
  { key: 'Collectible', label: 'Collectible' },
  { key: 'Gift Set', label: 'Gift Set' },
];

const MOODS = [
  { key: 'calm', label: 'Calm' },
  { key: 'focus', label: 'Focus' },
  { key: 'play', label: 'Play' },
  { key: 'collect', label: 'Collect' },
];

const AUDIENCES = [
  { key: 'kids', label: 'Kids' },
  { key: 'adults', label: 'Adults' },
  { key: 'office', label: 'Office' },
];

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={styles.section}>
      <button
        type="button"
        className={styles.sectionHeader}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {title}
        <ChevronIcon className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} />
      </button>
      <div className={`${styles.sectionContent} ${open ? styles.sectionContentOpen : ''}`}>
        {children}
      </div>
    </div>
  );
}

function SidebarContent({
  products,
  filters,
  onFilterChange,
  defaultSectionsOpen,
}: FilterSidebarProps & { defaultSectionsOpen: boolean }) {
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const priceRange = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    products.forEach(p => {
      p.variants.forEach(v => {
        if (v.price < min) min = v.price;
        if (v.price > max) max = v.price;
      });
    });
    return [Math.floor(min), Math.ceil(max)] as [number, number];
  }, [products]);

  const uniqueColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    products.forEach(p => {
      p.variants.forEach(v => {
        if (v.colorHex && v.color && !colorMap.has(v.colorHex)) {
          colorMap.set(v.colorHex, v.color);
        }
      });
    });
    return Array.from(colorMap.entries()).map(([hex, label]) => ({ hex, label }));
  }, [products]);

  const hasFilters =
    filters.category !== null ||
    filters.colors.length > 0 ||
    filters.moods.length > 0 ||
    filters.audiences.length > 0 ||
    filters.priceRange[0] !== priceRange[0] ||
    filters.priceRange[1] !== priceRange[1];

  const clearAll = useCallback(() => {
    onFilterChange({
      category: null,
      priceRange,
      colors: [],
      moods: [],
      audiences: [],
    });
  }, [onFilterChange, priceRange]);

  const toggleCheckbox = useCallback(
    (field: 'moods' | 'audiences', value: string) => {
      const current = filters[field];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      onFilterChange({ ...filters, [field]: next });
    },
    [filters, onFilterChange]
  );

  return (
    <>
      {/* Categories */}
      <FilterSection title="Category" defaultOpen={true}>
        <ul className={styles.categoryList}>
          {FULL_CATEGORIES.map(cat => {
            const isActive =
              (cat.key === 'all' && filters.category === null) ||
              cat.key === filters.category;
            return (
              <li key={cat.key}>
                <button
                  type="button"
                  className={`${styles.categoryButton} ${isActive ? styles.categoryButtonActive : ''}`}
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      category: cat.key === 'all' ? null : cat.key,
                    })
                  }
                >
                  {cat.label}
                  <span className={styles.categoryCount}>
                    {categoryCounts[cat.key] || 0}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price" defaultOpen={defaultSectionsOpen}>
        <PriceRangeSlider
          min={priceRange[0]}
          max={priceRange[1]}
          value={filters.priceRange}
          onChange={range => onFilterChange({ ...filters, priceRange: range })}
        />
      </FilterSection>

      {/* Colors */}
      {uniqueColors.length > 0 && (
        <FilterSection title="Color" defaultOpen={defaultSectionsOpen}>
          <ColorSwatchFilter
            colors={uniqueColors}
            selected={filters.colors}
            onChange={colors => onFilterChange({ ...filters, colors })}
          />
        </FilterSection>
      )}

      {/* Mood */}
      <FilterSection title="Mood" defaultOpen={defaultSectionsOpen}>
        <div className={styles.checkboxGroup}>
          {MOODS.map(mood => (
            <label key={mood.key} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkboxInput}
                checked={filters.moods.includes(mood.key)}
                onChange={() => toggleCheckbox('moods', mood.key)}
              />
              {mood.label}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Audience */}
      <FilterSection title="Audience" defaultOpen={defaultSectionsOpen}>
        <div className={styles.checkboxGroup}>
          {AUDIENCES.map(aud => (
            <label key={aud.key} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkboxInput}
                checked={filters.audiences.includes(aud.key)}
                onChange={() => toggleCheckbox('audiences', aud.key)}
              />
              {aud.label}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Clear all */}
      {hasFilters && (
        <button type="button" className={styles.clearButton} onClick={clearAll}>
          Clear All Filters
        </button>
      )}
    </>
  );
}

export function FilterSidebar({ products, filters, onFilterChange }: FilterSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== null) count++;
    if (filters.colors.length > 0) count++;
    if (filters.moods.length > 0) count++;
    if (filters.audiences.length > 0) count++;
    // Check if price range differs from data range
    const prices = products.flatMap(p => p.variants.map(v => v.price));
    const dataMin = Math.floor(Math.min(...prices));
    const dataMax = Math.ceil(Math.max(...prices));
    if (filters.priceRange[0] !== dataMin || filters.priceRange[1] !== dataMax) count++;
    return count;
  }, [filters, products]);

  // Focus trap + ESC close for mobile panel
  useEffect(() => {
    if (!mobileOpen) return;

    const panel = panelRef.current;
    if (!panel) return;

    // Focus the close button when panel opens
    const closeBtn = panel.querySelector<HTMLButtonElement>('[data-panel-close]');
    closeBtn?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusable = panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`${styles.sidebar} reveal-item`}>
        <SidebarContent
          products={products}
          filters={filters}
          onFilterChange={onFilterChange}
          defaultSectionsOpen={true}
        />
      </aside>

      {/* Mobile filter trigger */}
      <button
        ref={triggerRef}
        type="button"
        className={styles.mobileFilterButton}
        onClick={() => setMobileOpen(true)}
        aria-label={`Filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M1 3h14M3 8h10M5 13h6" strokeLinecap="round" />
        </svg>
        Filters
        {activeFilterCount > 0 && (
          <span className={styles.filterBadge}>{activeFilterCount}</span>
        )}
      </button>

      {/* Mobile panel overlay */}
      <div
        className={`${styles.panelOverlay} ${mobileOpen ? styles.panelOverlayOpen : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile panel */}
      <div
        ref={panelRef}
        className={`${styles.mobilePanel} ${mobileOpen ? styles.mobilePanelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Product filters"
      >
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Filters</span>
          <button
            type="button"
            className={styles.panelClose}
            data-panel-close
            onClick={() => {
              setMobileOpen(false);
              triggerRef.current?.focus();
            }}
            aria-label="Close filters"
          >
            &times;
          </button>
        </div>
        <div className={styles.mobilePanelSidebar}>
          <SidebarContent
            products={products}
            filters={filters}
            onFilterChange={onFilterChange}
            defaultSectionsOpen={false}
          />
        </div>
        <div className={styles.panelApply}>
          <button
            type="button"
            className={styles.applyButton}
            onClick={() => {
              setMobileOpen(false);
              triggerRef.current?.focus();
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
