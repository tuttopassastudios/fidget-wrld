import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { PageReveal } from '@/components/ui/PageReveal';
import { getProductPagesAsync } from '@/lib/products-db';

const ProductsPageClient = dynamic(
  () => import('@/components/product/ProductsPageClient').then((m) => m.ProductsPageClient),
);

export const metadata: Metadata = {
  title: 'Shop All Fidget Toys',
  description:
    'Browse our full catalog of premium fidget toys. Magnetic balls, squishy toys, clicky cubes, and more for focus, calm, and play.',
};

export default async function ProductsPage() {
  const products = await getProductPagesAsync();
  return (
    <PageReveal>
      <ProductsPageClient products={products} />
    </PageReveal>
  );
}
