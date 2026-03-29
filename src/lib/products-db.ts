/**
 * Supabase product data layer.
 * CRUD operations for the `products` table, with Next.js cache tags
 * for on-demand revalidation and a static-data fallback when Supabase is unreachable.
 */

import type { ProductPage, ProductVariant } from '@/types';
import { getAdminClient } from '@/lib/supabase/admin';
import type { DbProduct, DbProductInsert } from '@/lib/supabase/types';
import { stripProtoPollution } from '@/lib/sanitize';
import { cacheTag } from 'next/cache';
import { revalidateTag } from 'next/cache';

// ---------------------------------------------------------------------------
// Type Conversion Helpers
// ---------------------------------------------------------------------------

function dbRowToProductPage(row: DbProduct): ProductPage {
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? undefined,
    category: row.category,
    subcategory: row.subcategory ?? undefined,
    variants: row.variants as unknown as ProductVariant[],
    defaultVariantIndex: row.default_variant_index,
    description: row.description,
    features: row.features,
    specifications: row.specifications as Record<string, string>,
    moods: row.moods,
    audiences: row.audiences,
    textures: row.textures,
    ageRecommendation: row.age_recommendation ?? undefined,
    materials: row.materials ?? undefined,
    dimensions: row.dimensions ?? undefined,
    weight: row.weight ?? undefined,
    isNew: row.is_new,
    isBestseller: row.is_bestseller,
    isLimited: row.is_limited,
    relatedSlugs: row.related_slugs ?? undefined,
    about: row.about ?? undefined,
    careInstructions: row.care_instructions ?? undefined,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
  };
}

function productPageToDbRow(product: ProductPage): DbProductInsert {
  return {
    slug: product.slug,
    name: product.name,
    tagline: product.tagline ?? null,
    category: product.category,
    subcategory: product.subcategory ?? null,
    variants: product.variants as unknown as DbProductInsert['variants'],
    default_variant_index: product.defaultVariantIndex,
    description: product.description,
    features: product.features,
    specifications: product.specifications as unknown as DbProductInsert['specifications'],
    moods: product.moods,
    audiences: product.audiences,
    textures: product.textures,
    age_recommendation: product.ageRecommendation ?? null,
    materials: product.materials ?? null,
    dimensions: product.dimensions ?? null,
    weight: product.weight ?? null,
    is_new: product.isNew ?? false,
    is_bestseller: product.isBestseller ?? false,
    is_limited: product.isLimited ?? false,
    related_slugs: product.relatedSlugs ?? null,
    about: product.about ?? null,
    care_instructions: product.careInstructions ?? null,
    meta_title: product.metaTitle,
    meta_description: product.metaDescription,
  };
}

// ---------------------------------------------------------------------------
// Read (uncached — used by admin API routes)
// ---------------------------------------------------------------------------

export async function getAllProducts(): Promise<ProductPage[]> {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) throw error;
    if (!data) return [];

    return data.map(dbRowToProductPage);
  } catch (error) {
    console.error('[products-db] Supabase read failed, using static fallback:', error);
    const { productPages } = await import('@/data/products');
    return productPages;
  }
}

export async function getProductBySlug(slug: string): Promise<ProductPage | null> {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    if (!data) return null;

    return dbRowToProductPage(data);
  } catch (error) {
    console.error('[products-db] Supabase read failed, using static fallback:', error);
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
  const supabase = getAdminClient();
  const clean = stripProtoPollution(product as unknown as Record<string, unknown>) as unknown as ProductPage;
  const dbRow = productPageToDbRow(clean);

  // Check if product already exists
  const { data: existing } = await supabase
    .from('products')
    .select('slug')
    .eq('slug', clean.slug)
    .single();

  if (existing) {
    throw new Error(`Product with slug "${clean.slug}" already exists`);
  }

  const { error } = await supabase.from('products').insert(dbRow);

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }

  revalidateProducts();
}

export async function updateProduct(
  slug: string,
  data: Partial<ProductPage>
): Promise<void> {
  const supabase = getAdminClient();
  const clean = stripProtoPollution(data as unknown as Record<string, unknown>) as unknown as Partial<ProductPage>;

  // Check if product exists
  const { data: existing, error: fetchError } = await supabase
    .from('products')
    .select('slug')
    .eq('slug', slug)
    .single();

  if (fetchError || !existing) {
    throw new Error(`Product "${slug}" not found`);
  }

  // If slug is changing, check for conflicts
  if (clean.slug && clean.slug !== slug) {
    const { data: conflict } = await supabase
      .from('products')
      .select('slug')
      .eq('slug', clean.slug)
      .single();

    if (conflict) {
      throw new Error(`Product with slug "${clean.slug}" already exists`);
    }
  }

  // Build update object with snake_case keys
  const updateData: Record<string, unknown> = {};
  if (clean.slug !== undefined) updateData.slug = clean.slug;
  if (clean.name !== undefined) updateData.name = clean.name;
  if (clean.tagline !== undefined) updateData.tagline = clean.tagline;
  if (clean.category !== undefined) updateData.category = clean.category;
  if (clean.subcategory !== undefined) updateData.subcategory = clean.subcategory;
  if (clean.variants !== undefined) updateData.variants = clean.variants;
  if (clean.defaultVariantIndex !== undefined) updateData.default_variant_index = clean.defaultVariantIndex;
  if (clean.description !== undefined) updateData.description = clean.description;
  if (clean.features !== undefined) updateData.features = clean.features;
  if (clean.specifications !== undefined) updateData.specifications = clean.specifications;
  if (clean.moods !== undefined) updateData.moods = clean.moods;
  if (clean.audiences !== undefined) updateData.audiences = clean.audiences;
  if (clean.textures !== undefined) updateData.textures = clean.textures;
  if (clean.ageRecommendation !== undefined) updateData.age_recommendation = clean.ageRecommendation;
  if (clean.materials !== undefined) updateData.materials = clean.materials;
  if (clean.dimensions !== undefined) updateData.dimensions = clean.dimensions;
  if (clean.weight !== undefined) updateData.weight = clean.weight;
  if (clean.isNew !== undefined) updateData.is_new = clean.isNew;
  if (clean.isBestseller !== undefined) updateData.is_bestseller = clean.isBestseller;
  if (clean.isLimited !== undefined) updateData.is_limited = clean.isLimited;
  if (clean.relatedSlugs !== undefined) updateData.related_slugs = clean.relatedSlugs;
  if (clean.about !== undefined) updateData.about = clean.about;
  if (clean.careInstructions !== undefined) updateData.care_instructions = clean.careInstructions;
  if (clean.metaTitle !== undefined) updateData.meta_title = clean.metaTitle;
  if (clean.metaDescription !== undefined) updateData.meta_description = clean.metaDescription;

  updateData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('products')
    .update(updateData)
    .eq('slug', slug);

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }

  revalidateProducts();
}

export async function deleteProduct(slug: string): Promise<void> {
  const supabase = getAdminClient();

  // Check if product exists
  const { data: existing, error: fetchError } = await supabase
    .from('products')
    .select('slug')
    .eq('slug', slug)
    .single();

  if (fetchError || !existing) {
    throw new Error(`Product "${slug}" not found`);
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('slug', slug);

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }

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

  const featuredSlugs = ['magnet-balls', 'fidget-cube', 'infinity-cube', 'stress-ball-set'];
  return featuredSlugs
    .map(slug => products.find(p => p.slug === slug))
    .filter((p): p is ProductPage => p !== undefined);
}
