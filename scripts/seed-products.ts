/**
 * Seed script for Supabase products table
 * Run with: npx tsx scripts/seed-products.ts
 */

import { createClient } from '@supabase/supabase-js';
import { productPages } from '../src/data/products';
import type { Database, Json } from '../src/lib/supabase/types';

// Load environment variables
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seedProducts() {
  console.log(`Seeding ${productPages.length} products to Supabase...`);

  for (const product of productPages) {
    const dbRow = {
      slug: product.slug,
      name: product.name,
      tagline: product.tagline ?? null,
      category: product.category,
      subcategory: product.subcategory ?? null,
      variants: product.variants as unknown as Json,
      default_variant_index: product.defaultVariantIndex,
      description: product.description,
      features: product.features,
      specifications: product.specifications as unknown as Json,
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

    const { error } = await supabase
      .from('products')
      .upsert(dbRow as Database['public']['Tables']['products']['Insert'], { onConflict: 'slug' });

    if (error) {
      console.error(`Failed to insert ${product.slug}:`, error.message);
    } else {
      console.log(`✓ ${product.name}`);
    }
  }

  console.log('\nSeeding complete!');
}

seedProducts().catch(console.error);
