'use client';

import { useCallback, useRef } from 'react';
import styles from './FilterSidebar.module.css';

export interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (range: [number, number]) => void;
}

export function PriceRangeSlider({ min, max, value, onChange }: PriceRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMin = Math.min(Number(e.target.value), value[1] - 1);
      onChange([newMin, value[1]]);
    },
    [value, onChange]
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMax = Math.max(Number(e.target.value), value[0] + 1);
      onChange([value[0], newMax]);
    },
    [value, onChange]
  );

  const range = max - min;
  const leftPercent = range > 0 ? ((value[0] - min) / range) * 100 : 0;
  const rightPercent = range > 0 ? ((value[1] - min) / range) * 100 : 100;

  return (
    <div className={styles.priceSlider}>
      <div className={styles.priceDisplay}>
        ${value[0]} &mdash; ${value[1]}
      </div>
      <div className={styles.sliderTrack} ref={trackRef}>
        <div
          className={styles.sliderFill}
          style={{ left: `${leftPercent}%`, width: `${rightPercent - leftPercent}%` }}
        />
        <input
          type="range"
          className={styles.sliderInput}
          min={min}
          max={max}
          value={value[0]}
          onChange={handleMinChange}
          aria-label="Minimum price"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value[0]}
        />
        <input
          type="range"
          className={styles.sliderInput}
          min={min}
          max={max}
          value={value[1]}
          onChange={handleMaxChange}
          aria-label="Maximum price"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value[1]}
        />
      </div>
    </div>
  );
}
