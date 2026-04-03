'use client';

export interface FilamentColor {
  id: string;
  name: string;
  hex: string;
  inStock: boolean;
  type?: string;
}

interface FilamentColorPickerProps {
  colors: FilamentColor[];
  selectedId: string;
  onChange: (id: string) => void;
}

export function FilamentColorPicker({ colors, selectedId, onChange }: FilamentColorPickerProps) {
  const selectedColor = colors.find((c) => c.id === selectedId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <style>{`
        .filament-swatch {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          padding: 0;
          position: relative;
          transition: opacity 0.15s, box-shadow 0.15s;
          flex-shrink: 0;
        }
        @media (max-width: 640px) {
          .filament-swatch {
            width: 40px;
            height: 40px;
          }
        }
        .filament-swatch:focus-visible {
          outline: 2px solid #0ea5e9;
          outline-offset: 3px;
        }
        .filament-swatch--selected {
          box-shadow: 0 0 0 2px #fff, 0 0 0 4px #0ea5e9;
        }
        .filament-swatch--out-of-stock {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .filament-swatch--out-of-stock::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            transparent calc(50% - 1px),
            rgba(0, 0, 0, 0.5) calc(50% - 1px),
            rgba(0, 0, 0, 0.5) calc(50% + 1px),
            transparent calc(50% + 1px)
          );
        }
      `}</style>

      <div
        style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
        role="radiogroup"
        aria-label="Filament color"
      >
        {colors.map((color) => {
          const isSelected = color.id === selectedId;
          const classNames = [
            'filament-swatch',
            isSelected ? 'filament-swatch--selected' : '',
            !color.inStock ? 'filament-swatch--out-of-stock' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={color.id}
              className={classNames}
              style={{ backgroundColor: color.hex }}
              aria-label={`${color.name}${!color.inStock ? ' (out of stock)' : ''}`}
              aria-pressed={isSelected}
              disabled={!color.inStock}
              onClick={() => {
                if (color.inStock) onChange(color.id);
              }}
              title={color.name}
            />
          );
        })}
      </div>

      {selectedColor && (
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: '#555',
            fontWeight: 500,
          }}
          aria-live="polite"
        >
          {selectedColor.name}
          {selectedColor.type && (
            <span style={{ fontWeight: 400, color: '#888', marginLeft: '4px' }}>
              &mdash; {selectedColor.type}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
