import type { Metadata } from 'next';
import { CheckoutPageClient } from '@/components/cart/CheckoutPageClient';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
