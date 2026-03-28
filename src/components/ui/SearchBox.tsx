'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { productPages } from '@/data/products';
import { useHaptics } from '@/hooks/useHaptics';

interface Suggestion {
  slug: string;
  name: string;
  category: string;
}

function getMatches(query: string): Suggestion[] {
  const lower = query.toLowerCase();
  const results: Suggestion[] = [];

  for (const product of productPages) {
    if (results.length >= 6) break;

    const nameMatch = product.name.toLowerCase().includes(lower);
    const categoryMatch = product.category.toLowerCase().includes(lower);
    const variantMatch = product.variants.some(
      v => v.name.toLowerCase().includes(lower) || v.variant.toLowerCase().includes(lower)
    );

    if (nameMatch || categoryMatch || variantMatch) {
      results.push({
        slug: product.slug,
        name: product.name,
        category: product.category,
      });
    }
  }

  return results;
}

export function SearchBox({ className }: { className?: string }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const { trigger } = useHaptics();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    if (query.trim().length < 2) return [];
    return getMatches(query.trim());
  }, [query]);

  const showDropdown = isOpen && suggestions.length > 0;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateToProduct = useCallback((slug: string) => {
    trigger('select');
    setIsOpen(false);
    setQuery('');
    router.push(`/products/${slug}`);
  }, [router, trigger]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trigger('tap');
    if (activeIndex >= 0 && activeIndex < suggestions.length) {
      navigateToProduct(suggestions[activeIndex].slug);
      return;
    }
    const trimmed = query.trim();
    if (trimmed) {
      setIsOpen(false);
      setQuery('');
      router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!showDropdown) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <form onSubmit={handleSubmit} className={className}>
        <label htmlFor="search-input" className="sr-only">Search products</label>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          id="search-input"
          ref={inputRef}
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="Search fidgets..."
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
        />
      </form>

      {showDropdown && (
        <ul
          id="search-suggestions"
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            zIndex: 1000,
            listStyle: 'none',
            padding: 0,
            margin: '4px 0 0 0',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          }}
        >
          {suggestions.map((s, i) => (
            <li
              key={s.slug}
              id={`suggestion-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                navigateToProduct(s.slug);
              }}
              onMouseEnter={() => setActiveIndex(i)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
                background: i === activeIndex ? 'var(--color-bg-elevated)' : 'transparent',
                borderBottom: i < suggestions.length - 1 ? '1px solid var(--color-border)' : 'none',
                transition: 'background 0.15s ease',
              }}
            >
              <span style={{
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {s.name}
              </span>
              <span style={{
                color: 'var(--color-text-muted)',
                fontSize: '12px',
                fontFamily: 'var(--font-family)',
                flexShrink: 0,
              }}>
                {s.category}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
