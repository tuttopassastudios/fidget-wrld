'use client';

import { useMemo } from 'react';
import { useHaptics } from '@/hooks/useHaptics';
import type { ProductVariant } from '@/types';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function VariantSelector({ variants, selectedIndex, onSelect }: VariantSelectorProps) {
  const { trigger } = useHaptics();
  const hasColorSwatches = useMemo(() => variants.some(v => v.colorHex), [variants]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const len = variants.length;
    let next: number | null = null;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (selectedIndex + 1) % len;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (selectedIndex - 1 + len) % len;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = len - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    onSelect(next);
    const buttons = e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]');
    buttons[next]?.focus();
  };

  return (
    <div className="product-variants">
      <label id="variant-label">{hasColorSwatches ? 'Color:' : 'Size:'}</label>
      <div className="variant-options" role="radiogroup" aria-labelledby="variant-label" onKeyDown={handleKeyDown}>
        {variants.map((v, i) => {
          const isOutOfStock = v.inventory === 0;
          if (hasColorSwatches && v.colorHex) {
            return (
              <button
                key={v.sku}
                role="radio"
                aria-checked={i === selectedIndex}
                aria-label={`${v.variant}${isOutOfStock ? ' (Out of Stock)' : ''}`}
                tabIndex={i === selectedIndex ? 0 : -1}
                className={`variant-option${i === selectedIndex ? ' active' : ''}${isOutOfStock ? ' out-of-stock' : ''}`}
                onClick={() => { trigger('select'); onSelect(i); }}
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 8px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: isOutOfStock ? 0.5 : 1,
                  minWidth: 44,
                  minHeight: 44,
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: v.colorHex,
                    outline: i === selectedIndex ? '2px solid var(--color-accent-primary)' : '1px solid var(--color-border)',
                    outlineOffset: 2,
                    transition: 'outline 0.15s',
                    position: 'relative',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                />
                <span style={{
                  fontSize: 'var(--text-xs)',
                  color: i === selectedIndex ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  fontWeight: i === selectedIndex ? 600 : 400,
                  whiteSpace: 'nowrap',
                  textDecoration: isOutOfStock ? 'line-through' : 'none',
                }}>
                  {v.variant}
                </span>
              </button>
            );
          }

          return (
            <button
              key={v.sku}
              role="radio"
              aria-checked={i === selectedIndex}
              aria-label={`Size ${v.variant}${isOutOfStock ? ' (Out of Stock)' : ''}`}
              tabIndex={i === selectedIndex ? 0 : -1}
              className={`variant-option${i === selectedIndex ? ' active' : ''}${isOutOfStock ? ' out-of-stock' : ''}`}
              onClick={() => { trigger('select'); onSelect(i); }}
              style={{ opacity: isOutOfStock ? 0.5 : 1, textDecoration: isOutOfStock ? 'line-through' : 'none' }}
            >
              {v.variant}
            </button>
          );
        })}
      </div>
    </div>
  );
}
