import type { FilamentColor } from '@/types';

export const filamentColors: FilamentColor[] = [
  { id: 'blue',               name: 'Bambu Blue',         hex: '#2563EB', inStock: true, type: 'standard'      },
  { id: 'dark-purple',        name: 'Dark Purple',        hex: '#3B0764', inStock: true, type: 'standard'      },
  { id: 'white',              name: 'Arctic White',       hex: '#F8F8F8', inStock: true, type: 'standard'      },
  { id: 'silver',             name: 'Silk Silver',        hex: '#C8C8CC', inStock: true, type: 'silk',         priceAdjustment: 1.00 },
  { id: 'transparent-blue',   name: 'Ice Translucent',    hex: '#D4ECFA', inStock: true, type: 'translucent',  priceAdjustment: 1.00 },
  { id: 'pink-blue-gradient', name: 'South Beach',        hex: '#00C4B4', inStock: true, type: 'silk-gradient', priceAdjustment: 1.00 },
];

export function getFilamentColor(id: string): FilamentColor | undefined {
  return filamentColors.find(c => c.id === id);
}

export function getAvailableColors(ids: string[]): FilamentColor[] {
  return ids
    .map(id => filamentColors.find(c => c.id === id))
    .filter((c): c is FilamentColor => c !== undefined && c.inStock);
}
