import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CheckoutPageClient } from '@/components/cart/CheckoutPageClient';
import { CartProvider } from '@/context/CartContext';
import { PromoProvider } from '@/context/PromoContext';
import { mockCartItem } from '@/test/helpers';
import type { ReactNode } from 'react';

// Mock ToastContext since it's not used directly but may be needed by providers
vi.mock('@/context/ToastContext', () => ({
  useToast: () => ({ show: vi.fn() }),
  ToastProvider: ({ children }: { children: ReactNode }) => children,
}));

// Mock CheckoutProgress
vi.mock('@/components/checkout/CheckoutProgress', () => ({
  CheckoutProgress: ({ currentStep }: { currentStep: number }) => (
    <div data-testid="checkout-progress" data-step={currentStep} />
  ),
}));

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <PromoProvider>
        {children}
      </PromoProvider>
    </CartProvider>
  );
}

// Helper to pre-populate cart via localStorage
function seedCart(items: ReturnType<typeof mockCartItem>[]) {
  localStorage.setItem('fidgetopia_cart', JSON.stringify(items));
}

describe('CheckoutPageClient', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders empty cart message when no items', () => {
    render(<CheckoutPageClient />, { wrapper: Wrapper });
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('renders checkout form when cart has items', () => {
    seedCart([mockCartItem()]);
    render(<CheckoutPageClient />, { wrapper: Wrapper });
    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('Shipping Address')).toBeInTheDocument();
  });

  it('has honeypot field', () => {
    seedCart([mockCartItem()]);
    render(<CheckoutPageClient />, { wrapper: Wrapper });
    const honeypot = document.querySelector('input[name="website"]') as HTMLInputElement;
    expect(honeypot).toBeInTheDocument();
    expect(honeypot.style.display).toBe('none');
  });

  it('shows error when submitting without affirmations', () => {
    seedCart([mockCartItem()]);
    render(<CheckoutPageClient />, { wrapper: Wrapper });

    // Fill required fields
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/Address Line 1/), { target: { value: '123 Main' } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'NYC' } });
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'NY' } });
    fireEvent.change(screen.getByLabelText('ZIP Code'), { target: { value: '10001' } });

    // Submit without checking affirmations
    const submitBtn = screen.getByRole('button', { name: /Place Order/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Please confirm both affirmations/)).toBeInTheDocument();
  });

  it('shows confirmation after successful order', async () => {
    seedCart([mockCartItem()]);
    render(<CheckoutPageClient />, { wrapper: Wrapper });

    // Check both affirmations
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(cb => fireEvent.click(cb));

    // Submit form directly (bypasses HTML5 required validation in jsdom)
    const form = document.querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Order Confirmed!')).toBeInTheDocument();
    });
  });

  it('submit button contains order total', () => {
    seedCart([mockCartItem({ price: 42.99 })]);
    render(<CheckoutPageClient />, { wrapper: Wrapper });
    const submitBtn = screen.getByRole('button', { name: /Place Order/i });
    expect(submitBtn.textContent).toContain('$');
  });

  it('displays order summary with item details', () => {
    seedCart([mockCartItem({ name: 'BPC-157', quantity: 2 })]);
    render(<CheckoutPageClient />, { wrapper: Wrapper });
    expect(screen.getByText('BPC-157')).toBeInTheDocument();
    expect(screen.getByText('Qty: 2')).toBeInTheDocument();
  });
});
