'use client';

import { useCallback } from 'react';
import styles from './FilterSidebar.module.css';

export interface ColorSwatchFilterProps {
  colors: { hex: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function ColorSwatchFilter({ colors, selected, onChange }: ColorSwatchFilterProps) {
  const toggle = useCallback(
    (hex: string) => {
      if (selected.includes(hex)) {
        onChange(selected.filter(c => c !== hex));
      } else {
        onChange([...selected, hex]);
      }
    },
    [selected, onChange]
  );

  const handleKeyDown = useCallback(
    (hex: string, e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle(hex);
      }
    },
    [toggle]
  );

  return (
    <div className={styles.colorGrid}>
      {colors.map(color => {
        const isSelected = selected.includes(color.hex);
        return (
          <button
            key={color.hex}
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            aria-label={color.label}
            className={`${styles.colorSwatch} ${isSelected ? styles.colorSwatchSelected : ''}`}
            style={{ backgroundColor: color.hex }}
            onClick={() => toggle(color.hex)}
            onKeyDown={e => handleKeyDown(color.hex, e)}
          />
        );
      })}
    </div>
  );
}
