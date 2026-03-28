'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product/ProductCard';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { FilterSidebar } from '@/components/product/FilterSidebar';
import type { FilterState } from '@/components/product/FilterSidebar';
import { useHaptics } from '@/hooks/useHaptics';
import type { ProductPage } from '@/types';
import styles from './FilterSidebar.module.css';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name' | 'newest';

function getDefaultPriceRange(products: ProductPage[]): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  products.forEach(p => {
    p.variants.forEach(v => {
      if (v.price < min) min = v.price;
      if (v.price > max) max = v.price;
    });
  });
  return [Math.floor(min), Math.ceil(max)];
}

export function ProductsPageClient({ products }: { products: ProductPage[] }) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || null;
  const { trigger } = useHaptics();
  const [sort, setSort] = useState<SortOption>('featured');

  const defaultPriceRange = useMemo(() => getDefaultPriceRange(products), [products]);

  const [filters, setFilters] = useState<FilterState>({
    category: urlCategory,
    priceRange: defaultPriceRange,
    colors: [],
    moods: [],
    audiences: [],
  });

  // Sync category from URL params
  useEffect(() => {
    setFilters(prev => ({ ...prev, category: urlCategory }));
  }, [urlCategory]);

  const handleFilterChange = useCallback(
    (newFilters: FilterState) => {
      trigger('select');
      setFilters(newFilters);
    },
    [trigger]
  );

  // Active filter pills data
  const activePills = useMemo(() => {
    const pills: { label: string; onRemove: () => void }[] = [];

    if (filters.category !== null) {
      pills.push({
        label: filters.category,
        onRemove: () => setFilters(f => ({ ...f, category: null })),
      });
    }

    if (
      filters.priceRange[0] !== defaultPriceRange[0] ||
      filters.priceRange[1] !== defaultPriceRange[1]
    ) {
      pills.push({
        label: `$${filters.priceRange[0]}\u2013$${filters.priceRange[1]}`,
        onRemove: () => setFilters(f => ({ ...f, priceRange: defaultPriceRange })),
      });
    }

    filters.colors.forEach(hex => {
      const product = products.find(p => p.variants.some(v => v.colorHex === hex));
      const variant = product?.variants.find(v => v.colorHex === hex);
      const label = variant?.color || hex;
      pills.push({
        label,
        onRemove: () =>
          setFilters(f => ({ ...f, colors: f.colors.filter(c => c !== hex) })),
      });
    });

    filters.moods.forEach(mood => {
      pills.push({
        label: mood.charAt(0).toUpperCase() + mood.slice(1),
        onRemove: () =>
          setFilters(f => ({ ...f, moods: f.moods.filter(m => m !== mood) })),
      });
    });

    filters.audiences.forEach(aud => {
      pills.push({
        label: aud.charAt(0).toUpperCase() + aud.slice(1),
        onRemove: () =>
          setFilters(f => ({ ...f, audiences: f.audiences.filter(a => a !== aud) })),
      });
    });

    return pills;
  }, [filters, defaultPriceRange, products]);

  const filtered = useMemo(() => {
    let items = products.map(p => ({
      ...p,
      displayVariant: p.variants[p.defaultVariantIndex],
    }));

    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.variants.some(
            v =>
              v.sku.toLowerCase().includes(q) || v.variant.toLowerCase().includes(q)
          )
      );
    }

    // Category filter
    if (filters.category !== null) {
      items = items.filter(
        p => p.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    // Price range filter — at least one variant in range
    items = items.filter(p =>
      p.variants.some(
        v => v.price >= filters.priceRange[0] && v.price <= filters.priceRange[1]
      )
    );

    // Color filter — at least one variant has a selected color
    if (filters.colors.length > 0) {
      items = items.filter(p =>
        p.variants.some(v => v.colorHex && filters.colors.includes(v.colorHex))
      );
    }

    // Mood filter — product moods include any selected mood
    if (filters.moods.length > 0) {
      items = items.filter(p =>
        filters.moods.some(m => p.moods.includes(m as typeof p.moods[number]))
      );
    }

    // Audience filter — product audiences include any selected audience
    if (filters.audiences.length > 0) {
      items = items.filter(p =>
        filters.audiences.some(a =>
          p.audiences.includes(a as typeof p.audiences[number])
        )
      );
    }

    // Sort
    switch (sort) {
      case 'price-asc':
        items.sort((a, b) => a.displayVariant.price - b.displayVariant.price);
        break;
      case 'price-desc':
        items.sort((a, b) => b.displayVariant.price - a.displayVariant.price);
        break;
      case 'name':
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return items;
  }, [sort, filters, searchQuery, products]);

  // Derive heading label
  const headingLabel = filters.category ?? 'All Products';

  return (
    <section className="product-page" style={{ padding: '32px 0 64px' }}>
      <div className="container">
        <div className="reveal-item">
          <Breadcrumb
            items={[{ label: 'Home', href: '/' }, { label: 'All Products' }]}
          />
        </div>
        <div className="page-grid-sidebar-left" style={{ marginTop: 16 }}>
          {/* Sidebar */}
          <FilterSidebar
            products={products}
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Main */}
          <div>
            {/* Header */}
            <div
              className="reveal-item"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: '1px solid var(--color-border)',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <h1
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {headingLabel} &mdash;{' '}
                <span aria-live="polite" aria-atomic="true">
                  {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
                </span>
              </h1>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {/* Mobile filter trigger is rendered by FilterSidebar */}
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value as SortOption)}
                  aria-label="Sort products"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 4,
                    padding: '8px 12px',
                    minHeight: 44,
                    fontSize: 13,
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Active filter pills */}
            {activePills.length > 0 && (
              <div className={styles.filterPills}>
                {activePills.map((pill, i) => (
                  <span key={`${pill.label}-${i}`} className={styles.filterPill}>
                    {pill.label}
                    <button
                      type="button"
                      className={styles.filterPillRemove}
                      onClick={pill.onRemove}
                      aria-label={`Remove ${pill.label} filter`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Product Grid */}
            <div className="product-grid reveal-item">
              {filtered.map(p => (
                <ProductCard
                  key={p.slug}
                  product={p.displayVariant}
                  slug={p.slug}
                  meta={p.category}
                  variantCount={p.variants.length}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '48px 0',
                  color: 'var(--color-text-muted)',
                }}
              >
                No products found matching your filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
