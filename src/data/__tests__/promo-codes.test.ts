import { describe, it, expect } from 'vitest';
import { PROMO_CODES } from '@/data/promo-codes';

describe('PROMO_CODES', () => {
  it('RESEARCH10 is 10% off with $50 minimum', () => {
    const code = PROMO_CODES['RESEARCH10'];
    expect(code).toBeDefined();
    expect(code.type).toBe('percent');
    expect(code.value).toBe(10);
    expect(code.min).toBe(50);
  });

  it('WELCOME15 is 15% off with no minimum', () => {
    const code = PROMO_CODES['WELCOME15'];
    expect(code).toBeDefined();
    expect(code.type).toBe('percent');
    expect(code.value).toBe(15);
    expect(code.min).toBe(0);
  });

  it('FLAT20 is $20 off with $100 minimum', () => {
    const code = PROMO_CODES['FLAT20'];
    expect(code).toBeDefined();
    expect(code.type).toBe('fixed');
    expect(code.value).toBe(20);
    expect(code.min).toBe(100);
  });

  it('FREESHIP is free shipping with $75 minimum', () => {
    const code = PROMO_CODES['FREESHIP'];
    expect(code).toBeDefined();
    expect(code.type).toBe('freeship');
    expect(code.value).toBe(0);
    expect(code.min).toBe(75);
  });

  it('has exactly 4 promo codes', () => {
    expect(Object.keys(PROMO_CODES)).toHaveLength(4);
  });
});
