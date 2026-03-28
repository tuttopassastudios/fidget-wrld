import { notFound } from 'next/navigation';
import { cacheTag } from 'next/cache';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageReveal } from '@/components/ui/PageReveal';
import { ProductPageClient } from '@/components/product/ProductPageClient';
import { getProductBySlugAsync, getAllSlugsAsync } from '@/lib/products-db';

// Pre-render known product pages at build time
// New products will be rendered on-demand and cached
export async function generateStaticParams() {
  const slugs = await getAllSlugsAsync();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlugAsync(slug);
  if (!product) return { title: 'Product Not Found' };
  const defaultVariant = product.variants[product.defaultVariantIndex];
  return {
    title: product.metaTitle,
    description: product.metaDescription,
    openGraph: {
      title: product.metaTitle,
      description: product.metaDescription,
      images: [{ url: defaultVariant.image, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.metaTitle,
      description: product.metaDescription,
      images: [{ url: defaultVariant.image, alt: product.name }],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  'use cache';
  cacheTag('products');

  const { slug } = await params;
  const product = await getProductBySlugAsync(slug);
  if (!product) notFound();

  const defaultVariant = product.variants[product.defaultVariantIndex];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.metaDescription,
    image: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pepmax.bio'}${defaultVariant.image}`,
    sku: defaultVariant.sku,
    brand: { '@type': 'Brand', name: 'PepMax' },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: Math.min(...product.variants.map(v => v.price)),
      highPrice: Math.max(...product.variants.map(v => v.price)),
      offerCount: product.variants.length,
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <PageReveal className="product-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container">
        <div className="reveal-item">
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: product.category, href: '/products' },
            { label: product.name },
          ]} />
        </div>
        <ProductPageClient product={product} />
      </div>
    </PageReveal>
  );
}
