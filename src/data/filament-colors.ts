import type { FilamentColor } from '@/types';

export const filamentColors: FilamentColor[] = [
  { id: 'white',  name: 'Arctic White',   hex: '#F8F8F8', inStock: true, type: 'standard' },
  { id: 'black',  name: 'Midnight Black', hex: '#1A1A1A', inStock: true, type: 'standard' },
  { id: 'red',    name: 'Crimson Red',    hex: '#EF4444', inStock: true, type: 'standard' },
  { id: 'orange', name: 'Sunset Orange',  hex: '#F97316', inStock: true, type: 'standard' },
  { id: 'yellow', name: 'Solar Yellow',   hex: '#EAB308', inStock: true, type: 'standard' },
  { id: 'green',  name: 'Forest Green',   hex: '#22C55E', inStock: true, type: 'standard' },
  { id: 'blue',   name: 'Ocean Blue',     hex: '#3B82F6', inStock: true, type: 'standard' },
  { id: 'purple', name: 'Royal Purple',   hex: '#A855F7', inStock: true, type: 'standard' },
  { id: 'pink',   name: 'Hot Pink',       hex: '#EC4899', inStock: true, type: 'standard' },
  { id: 'teal',   name: 'Electric Teal',  hex: '#14B8A6', inStock: true, type: 'standard' },
  { id: 'gray',   name: 'Slate Gray',     hex: '#94A3B8', inStock: true, type: 'standard' },
];

export function getFilamentColor(id: string): FilamentColor | undefined {
  return filamentColors.find(c => c.id === id);
}

export function getAvailableColors(ids: string[]): FilamentColor[] {
  return ids
    .map(id => filamentColors.find(c => c.id === id))
    .filter((c): c is FilamentColor => c !== undefined && c.inStock);
}
