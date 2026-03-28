'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product/ProductCard';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useHaptics } from '@/hooks/useHaptics';
import type { ProductPage } from '@/types';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name' | 'newest';

const categories = [
  { key: 'all', label: 'All Products' },
  { key: 'Magnetic', label: 'Magnetic' },
  { key: 'Squishy', label: 'Squishy' },
  { key: 'Clicky', label: 'Clicky' },
  { key: 'Desk Toys', label: 'Desk Toys' },
];


export function ProductsPageClient({ products }: { products: ProductPage[] }) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || 'all';
  const { trigger } = useHaptics();
  const [sort, setSort] = useState<SortOption>('featured');
  const [category, setCategory] = useState<string>(urlCategory);

  // Sync category state with URL params when they change
  useEffect(() => {
    setCategory(urlCategory);
  }, [urlCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach(p => {
      const cat = p.category;
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    let items = products.map(p => ({
      ...p,
      displayVariant: p.variants[p.defaultVariantIndex],
    }));

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.variants.some(v => v.sku.toLowerCase().includes(q) || v.variant.toLowerCase().includes(q))
      );
    }

    if (category !== 'all') {
      items = items.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

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
  }, [sort, category, searchQuery, products]);

  return (
    <section className="product-page" style={{ padding: '32px 0 64px' }}>
      <div className="container">
        <div className="reveal-item">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'All Products' }]} />
        </div>
        <div className="page-grid-sidebar-left" style={{ marginTop: 16 }}>
          {/* Sidebar */}
          <aside className="reveal-item" style={{ position: 'sticky', top: 100, alignSelf: 'start', height: 'fit-content' }}>
            {/* Categories */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Categories
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {categories.map(cat => (
                  <li key={cat.key} style={{ marginBottom: 4 }}>
                    <button
                      onClick={() => { trigger('select'); setCategory(cat.key); }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: category === cat.key ? 'var(--color-bg-elevated)' : 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 14,
                        color: category === cat.key ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                        padding: '8px 12px',
                        borderRadius: 8,
                        transition: 'all 0.15s',
                      }}
                    >
                      {cat.label}
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        {categoryCounts[cat.key] || 0}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Availability */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Availability
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', fontSize: 14, color: 'var(--color-success)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} />
                In Stock ({products.length})
              </div>
            </div>
          </aside>

          {/* Main */}
          <div>
            {/* Header */}
            <div className="reveal-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
              <h1 style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-secondary)' }}>
                {category === 'all' ? 'All Products' : categories.find(c => c.key === category)?.label} — <span aria-live="polite" aria-atomic="true">{filtered.length} {filtered.length === 1 ? 'result' : 'results'}</span>
              </h1>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {/* Sort */}
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
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-muted)' }}>
                No products found matching your filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
