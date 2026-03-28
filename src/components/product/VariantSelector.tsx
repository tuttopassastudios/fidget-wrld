'use client';

import { useHaptics } from '@/hooks/useHaptics';
import type { ProductVariant } from '@/types';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function VariantSelector({ variants, selectedIndex, onSelect }: VariantSelectorProps) {
  const { trigger } = useHaptics();

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
      <label id="variant-label">Size:</label>
      <div className="variant-options" role="radiogroup" aria-labelledby="variant-label" onKeyDown={handleKeyDown}>
        {variants.map((v, i) => (
          <button
            key={v.sku}
            role="radio"
            aria-checked={i === selectedIndex}
            aria-label={`Size ${v.variant}`}
            tabIndex={i === selectedIndex ? 0 : -1}
            className={`variant-option${i === selectedIndex ? ' active' : ''}`}
            onClick={() => { trigger('select'); onSelect(i); }}
          >
            {v.variant}
          </button>
        ))}
      </div>
    </div>
  );
}
