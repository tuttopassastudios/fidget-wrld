'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product/ProductCard';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { FilterSidebar } from '@/components/product/FilterSidebar';
import type { FilterState } from '@/components/product/FilterSidebar';
import { useHaptics } from '@/hooks/useHaptics';
import type { ProductPage } from '@/types';
import filterStyles from './FilterSidebar.module.css';
import styles from './ProductsPageClient.module.css';

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
    <section className={`product-page ${styles.productPage}`}>
      <div className="container">
        <div className="reveal-item">
          <Breadcrumb
            items={[{ label: 'Home', href: '/' }, { label: 'All Products' }]}
          />
        </div>
        <div className={`page-grid-sidebar-left ${styles.gridMargin}`}>
          {/* Sidebar */}
          <FilterSidebar
            products={products}
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Main */}
          <div>
            {/* Header */}
            <div className={`reveal-item ${styles.resultsHeader}`}>
              <h1 className={styles.resultsCount}>
                {headingLabel} &mdash;{' '}
                <span aria-live="polite" aria-atomic="true">
                  {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
                </span>
              </h1>
              <div className={styles.sortWrapper}>
                {/* Mobile filter trigger is rendered by FilterSidebar */}
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value as SortOption)}
                  aria-label="Sort products"
                  className={styles.sortSelect}
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
              <div className={filterStyles.filterPills}>
                {activePills.map((pill, i) => (
                  <span key={`${pill.label}-${i}`} className={filterStyles.filterPill}>
                    {pill.label}
                    <button
                      type="button"
                      className={filterStyles.filterPillRemove}
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
              <div className={styles.emptyState}>
                No products found matching your filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
