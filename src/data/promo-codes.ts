import type { PromoCode } from '@/types';

export const PROMO_CODES: Record<string, PromoCode> = {
  'RESEARCH10': { type: 'percent', value: 10, min: 50, label: '10% Off' },
  'WELCOME15':  { type: 'percent', value: 15, min: 0, label: '15% Off' },
  'FLAT20':     { type: 'fixed', value: 20, min: 100, label: '$20 Off' },
  'FREESHIP':   { type: 'freeship', value: 0, min: 75, label: 'Free Shipping' },
  'FIDGET10':   { type: 'percent_freeship', value: 10, min: 0, label: '10% Off + Free Shipping' },
};
