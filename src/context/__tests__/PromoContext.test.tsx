import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PromoProvider, usePromo } from '@/context/PromoContext';
import type { ReactNode } from 'react';

function wrapper({ children }: { children: ReactNode }) {
  return <PromoProvider>{children}</PromoProvider>;
}

describe('PromoContext', () => {
  describe('apply', () => {
    it('applies valid RESEARCH10 code', () => {
      const { result } = renderHook(() => usePromo(), { wrapper });
      let applyResult: { success: boolean; message: string };
      act(() => { applyResult = result.current.apply('RESEARCH10', 60); });
      expect(applyResult!.success).toBe(true);
      expect(result.current.activePromo).not.toBeNull();
      expect(result.current.activePromo!.code).toBe('RESEARCH10');
    });

    it('rejects RESEARCH10 below minimum', () => {
      const { result } = renderHook(() => usePromo(), { wrapper });
      let applyResult: { success: boolean; message: string };
      act(() => { applyResult = result.current.apply('RESEARCH10', 30); });
      expect(applyResult!.success).toBe(false);
      expect(applyResult!.message).toContain('$50.00');
    });

    it('rejects invalid code', () => {
      const { result } = renderHook(() => usePromo(), { wrapper });
      let applyResult: { success: boolean; message: string };
      act(() => { applyResult = result.current.apply('BOGUS', 100); });
      expect(applyResult!.success).toBe(false);
      expect(applyResult!.message).toContain('Invalid');
    });

    it('handles case insensitivity', () => {
      const { result } = renderHook(() => usePromo(), { wrapper });
      let applyResult: { success: boolean; message: string };
      act(() => { applyResult = result.current.apply('research10', 60); });
      expect(applyResult!.success).toBe(true);
    });

    it('handles whitespace', () => {
      const { result } = renderHook(() => usePromo(), { wrapper });
      let applyResult: { success: boolean; message: string };
      act(() => { applyResult = result.current.apply('  WELCOME15  ', 10); });
      expect(applyResult!.success).toBe(true);
    });

    it('applies WELCOME15 with no minimum', () => {
      const { result } = renderHook(() => usePromo(), { wrapper });
      let applyResult: { success: boolean; message: string };
      act(() => { applyResult = result.current.apply('WELCOME15', 0.01); });
      expect(applyResult!.success).toBe(true);
    });
  });

  describe('calculateDiscount', () => {
    it('returns zero when no promo is active', () => {
      const { result } = renderHook(() => usePromo(), { wrapper });
      const discount = result.current.calculateDiscount(100);
      expect(discount.discount).toBe(0);
      expect(discount.freeShipping).toBe(false);
    });

    it('calculates percent discount', () => {
      const { result } = renderHook(() => usePromo(), { wrapper });
      act(() => { result.current.apply('RESEARCH10', 100); });
      const discount = result.current.calculateDiscount(100);
      expect(discount.discount).toBeCloseTo(10);
      expect(discount.freeShipping).toBe(false);
    });

    it('calculates fixed discount capped at subtotal', () => {
      const { result } = renderHook(() => usePromo(), { wrapper });
      act(() => { result.current.apply('FLAT20', 100); });
      // Discount should be $20
      const discount = result.current.calculateDiscount(100);
      expect(discount.discount).toBe(20);

      // If subtotal drops below $20, discount is capped
      const discountSmall = result.current.calculateDiscount(15);
      expect(discountSmall.discount).toBe(0); // min $100 not met
    });

    it('calculates freeship promo', () => {
      const { result } = renderHook(() => usePromo(), { wrapper });
      act(() => { result.current.apply('FREESHIP', 80); });
      const discount = result.current.calculateDiscount(80);
      expect(discount.discount).toBe(0);
      expect(discount.freeShipping).toBe(true);
    });

    it('returns zero discount when minimum no longer met', () => {
      const { result } = renderHook(() => usePromo(), { wrapper });
      act(() => { result.current.apply('RESEARCH10', 60); });
      // Now calculate with subtotal below minimum
      const discount = result.current.calculateDiscount(30);
      expect(discount.discount).toBe(0);
      expect(discount.label).toContain('not met');
    });
  });

  describe('remove', () => {
    it('clears active promo', () => {
      const { result } = renderHook(() => usePromo(), { wrapper });
      act(() => { result.current.apply('WELCOME15', 10); });
      expect(result.current.activePromo).not.toBeNull();
      act(() => { result.current.remove(); });
      expect(result.current.activePromo).toBeNull();
    });
  });

  it('throws when used outside provider', () => {
    expect(() => {
      renderHook(() => usePromo());
    }).toThrow('usePromo must be used within PromoProvider');
  });
});
