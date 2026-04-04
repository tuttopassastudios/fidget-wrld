import type { FilamentColor } from '@/types';

export const filamentColors: FilamentColor[] = [
  { id: 'blue',               name: 'Ocean Blue',       hex: '#3B82F6', inStock: true, type: 'standard'   },
  { id: 'dark-purple',        name: 'Dark Purple',      hex: '#5B21B6', inStock: true, type: 'standard'   },
  { id: 'white',              name: 'Arctic White',     hex: '#F8F8F8', inStock: true, type: 'standard'   },
  { id: 'silver',             name: 'Silver',           hex: '#BCC8D6', inStock: true, type: 'standard'   },
  { id: 'transparent-blue',   name: 'Transparent Blue', hex: '#93C5FD', inStock: true, type: 'translucent', priceAdjustment: 1.00 },
  { id: 'pink-blue-gradient', name: 'Pink/Blue Gradient', hex: '#C084FC', inStock: true, type: 'gradient', priceAdjustment: 1.00 },
];

export function getFilamentColor(id: string): FilamentColor | undefined {
  return filamentColors.find(c => c.id === id);
}

export function getAvailableColors(ids: string[]): FilamentColor[] {
  return ids
    .map(id => filamentColors.find(c => c.id === id))
    .filter((c): c is FilamentColor => c !== undefined && c.inStock);
}
