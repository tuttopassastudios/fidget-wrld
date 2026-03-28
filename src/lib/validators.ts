import type { CartItem, WishlistItem } from '@/types';

export function isCartItemArray(value: unknown): value is CartItem[] {
  return Array.isArray(value) && value.every(item =>
    typeof item === 'object' && item !== null &&
    typeof (item as CartItem).sku === 'string' &&
    typeof (item as CartItem).name === 'string' &&
    typeof (item as CartItem).price === 'number' && (item as CartItem).price >= 0 &&
    typeof (item as CartItem).quantity === 'number' && (item as CartItem).quantity >= 1
  );
}

export function isWishlistItemArray(value: unknown): value is WishlistItem[] {
  return Array.isArray(value) && value.every(item =>
    typeof item === 'object' && item !== null &&
    typeof (item as WishlistItem).sku === 'string' &&
    typeof (item as WishlistItem).name === 'string' &&
    typeof (item as WishlistItem).addedAt === 'number'
  );
}

