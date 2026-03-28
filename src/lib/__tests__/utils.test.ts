import { describe, it, expect } from 'vitest';
import { formatCurrency, slugify } from '@/lib/utils';

describe('formatCurrency', () => {
  it('formats a normal price', () => {
    expect(formatCurrency(42.99)).toBe('$42.99');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats round number with two decimals', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('formats single decimal correctly', () => {
    expect(formatCurrency(1000.5)).toBe('$1000.50');
  });

  it('formats small amounts', () => {
    expect(formatCurrency(0.01)).toBe('$0.01');
  });
});

describe('slugify', () => {
  it('lowercases and replaces spaces with dashes', () => {
    expect(slugify('BPC 157')).toBe('bpc-157');
  });

  it('handles already lowercase slug', () => {
    expect(slugify('bpc-157')).toBe('bpc-157');
  });

  it('strips leading/trailing dashes', () => {
    expect(slugify(' Hello World ')).toBe('hello-world');
  });

  it('replaces special characters', () => {
    expect(slugify('GHK-Cu (50mg)')).toBe('ghk-cu-50mg');
  });
});
