import type { FilamentColor } from '@/types';

export const filamentColors: FilamentColor[] = [
  {
    id: 'white',
    name: 'Arctic White',
    hex: '#F8F8F8',
    inStock: true,
    type: 'standard',
  },
  {
    id: 'black',
    name: 'Midnight Black',
    hex: '#1A1A1A',
    inStock: true,
    type: 'standard',
  },
];

export function getFilamentColor(id: string): FilamentColor | undefined {
  return filamentColors.find(c => c.id === id);
}

export function getAvailableColors(ids: string[]): FilamentColor[] {
  return ids
    .map(id => filamentColors.find(c => c.id === id))
    .filter((c): c is FilamentColor => c !== undefined && c.inStock);
}
