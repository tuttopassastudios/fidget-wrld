'use client';

import { useHaptics } from '@/hooks/useHaptics';

interface QuantitySelectorProps {
  value: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({ value, onChange, min = 1, max = 99 }: QuantitySelectorProps) {
  const { trigger } = useHaptics();

  return (
    <div className="quantity-selector" role="group" aria-label="Quantity selector">
      <button
        className="quantity-btn"
        onClick={() => { if (value > min) { trigger('select'); onChange(value - 1); } }}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        -
      </button>
      <span className="quantity-value" aria-live="polite" aria-atomic="true" aria-label={`Quantity: ${value}`}>{value}</span>
      <button
        className="quantity-btn"
        onClick={() => { if (value < max) { trigger('select'); onChange(value + 1); } }}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
