/**
 * Firestore product data layer.
 * CRUD operations for the `products` collection, with Next.js cache tags
 * for on-demand revalidation and a static-data fallback when Firestore is unreachable.
 */

import type { ProductPage } from '@/types';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { stripProtoPollution } from '@/lib/sanitize';
import { cacheTag } from 'next/cache';
import { revalidateTag } from 'next/cache';

const COLLECTION = 'products';

// ---------------------------------------------------------------------------
// Read (uncached — used by admin API routes)
// ---------------------------------------------------------------------------

export async function getAllProducts(): Promise<ProductPage[]> {
  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection(COLLECTION).orderBy('name').get();
    return snapshot.docs.map((doc) => doc.data() as unknown as ProductPage);
  } catch (error) {
    console.error('[products-db] Firestore read failed, using static fallback:', error);
    const { productPages } = await import('@/data/products');
    return productPages;
  }
}

export async function getProductBySlug(slug: string): Promise<ProductPage | null> {
  try {
    const db = getAdminFirestore();
    const doc = await db.collection(COLLECTION).doc(slug).get();
    if (!doc.exists) return null;
    return doc.data() as unknown as ProductPage;
  } catch (error) {
    console.error('[products-db] Firestore read failed, using static fallback:', error);
    const { getProductBySlug: staticGet } = await import('@/data/products');
    return staticGet(slug) ?? null;
  }
}

// ---------------------------------------------------------------------------
// Write (admin only — called from API routes)
// ---------------------------------------------------------------------------

function revalidateProducts() {
  revalidateTag('products', 'max');
}

export async function createProduct(product: ProductPage): Promise<void> {
  const db = getAdminFirestore();
  const clean = stripProtoPollution(product as unknown as Record<string, unknown>) as unknown as ProductPage;
  const ref = db.collection(COLLECTION).doc(clean.slug);

  const existing = await ref.get();
  if (existing.exists) {
    throw new Error(`Product with slug "${clean.slug}" already exists`);
  }

  await ref.set(clean);
  revalidateProducts();
}

export async function updateProduct(
  slug: string,
  data: Partial<ProductPage>
): Promise<void> {
  const db = getAdminFirestore();
  const clean = stripProtoPollution(data as unknown as Record<string, unknown>) as unknown as Partial<ProductPage>;
  const ref = db.collection(COLLECTION).doc(slug);

  const existing = await ref.get();
  if (!existing.exists) {
    throw new Error(`Product "${slug}" not found`);
  }

  // If slug is changing, delete old doc and create new one
  if (clean.slug && clean.slug !== slug) {
    const newRef = db.collection(COLLECTION).doc(clean.slug);
    const conflict = await newRef.get();
    if (conflict.exists) {
      throw new Error(`Product with slug "${clean.slug}" already exists`);
    }
    await newRef.set({ ...existing.data(), ...clean });
    await ref.delete();
    revalidateProducts();
  } else {
    await ref.update(clean);
    revalidateProducts();
  }
}

export async function deleteProduct(slug: string): Promise<void> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(slug);

  const existing = await ref.get();
  if (!existing.exists) {
    throw new Error(`Product "${slug}" not found`);
  }

  await ref.delete();
  revalidateProducts();
}

// ---------------------------------------------------------------------------
// Cached wrappers (for storefront server components)
// Tagged with 'products' for on-demand revalidation via revalidateTag.
// ---------------------------------------------------------------------------

export async function getProductPagesAsync(): Promise<ProductPage[]> {
  'use cache';
  cacheTag('products');
  return getAllProducts();
}

export async function getProductBySlugAsync(slug: string): Promise<ProductPage | undefined> {
  'use cache';
  cacheTag('products');
  const product = await getProductBySlug(slug);
  return product ?? undefined;
}

export async function getAllSlugsAsync(): Promise<string[]> {
  'use cache';
  cacheTag('products');
  const products = await getAllProducts();
  return products.map(p => p.slug);
}

export async function getBestSellers(): Promise<ProductPage[]> {
  'use cache';
  cacheTag('products');
  const products = await getAllProducts();
  // Return products marked as bestsellers, or fall back to featured slugs
  const bestsellers = products.filter(p => p.isBestseller);
  if (bestsellers.length > 0) return bestsellers.slice(0, 4);

  const featuredSlugs = ['n52-magnetic-balls', 'fidget-cube', 'pop-it-rainbow', 'stress-ball-set'];
  return featuredSlugs
    .map(slug => products.find(p => p.slug === slug))
    .filter((p): p is ProductPage => p !== undefined);
}
