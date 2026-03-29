/**
 * Update Magnet Balls product in Supabase
 * Run with: npx tsx scripts/update-magnet-balls.ts
 */
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const variants = [
  { sku: 'FW-MAG-216-RED', name: 'Magnet Balls', variant: 'Red', color: 'Red', colorHex: '#8B0000', price: 24.99, image: 'https://jzfesgxooirrjsnluphz.supabase.co/storage/v1/object/public/products/mag-balls-red.png' },
  { sku: 'FW-MAG-216-BLU', name: 'Magnet Balls', variant: 'Blue', color: 'Blue', colorHex: '#1E90FF', price: 24.99, image: 'https://jzfesgxooirrjsnluphz.supabase.co/storage/v1/object/public/products/mag-balls-blue.png' },
  { sku: 'FW-MAG-216-GLD', name: 'Magnet Balls', variant: 'Gold', color: 'Gold', colorHex: '#FFD700', price: 24.99, image: 'https://jzfesgxooirrjsnluphz.supabase.co/storage/v1/object/public/products/mag-balls-gold.png' },
  { sku: 'FW-MAG-216-SIL', name: 'Magnet Balls', variant: 'Silver', color: 'Silver', colorHex: '#C0C0C0', price: 24.99, image: 'https://jzfesgxooirrjsnluphz.supabase.co/storage/v1/object/public/products/mag-balls-silver.png' },
];

async function main() {
  console.log('Updating Magnet Balls product in Supabase...\n');

  // First check if product exists with old slug
  const { data: oldProduct } = await supabase
    .from('products')
    .select('id, slug, name')
    .eq('slug', 'n52-magnetic-balls')
    .single();

  if (oldProduct) {
    console.log(`Found product with old slug: ${oldProduct.name} (${oldProduct.slug})`);
    console.log('Updating to new name and slug...\n');

    const { error } = await supabase
      .from('products')
      .update({
        slug: 'magnet-balls',
        name: 'Magnet Balls',
        variants: variants,
        meta_title: 'Magnet Balls | Premium Desk Toy',
        meta_description: 'Ultra-strong N52 neodymium magnet balls for creative desk sculptures. Available in silver, gold, black, red, and rainbow.',
        updated_at: new Date().toISOString(),
      })
      .eq('id', oldProduct.id);

    if (error) {
      console.error('Error updating product:', error.message);
      process.exit(1);
    }

    console.log('✓ Product updated successfully!');
  } else {
    // Check if it already exists with new slug
    const { data: newProduct } = await supabase
      .from('products')
      .select('id, slug, name')
      .eq('slug', 'magnet-balls')
      .single();

    if (newProduct) {
      console.log(`Product already exists with new slug: ${newProduct.name}`);
      console.log('Updating variants...\n');

      const { error } = await supabase
        .from('products')
        .update({
          variants: variants,
          meta_description: 'Ultra-strong N52 neodymium magnet balls for creative desk sculptures. Available in silver, gold, black, red, and rainbow.',
          updated_at: new Date().toISOString(),
        })
        .eq('id', newProduct.id);

      if (error) {
        console.error('Error updating variants:', error.message);
        process.exit(1);
      }

      console.log('✓ Variants updated successfully!');
    } else {
      console.log('Product not found in database. It may need to be created first.');
      console.log('The local products.ts file is the source of truth for this project.');
    }
  }

  // Verify the update
  const { data: product } = await supabase
    .from('products')
    .select('slug, name, variants')
    .eq('slug', 'magnet-balls')
    .single();

  if (product) {
    console.log('\n--- Current product state ---');
    console.log(`Name: ${product.name}`);
    console.log(`Slug: ${product.slug}`);
    console.log(`Variants: ${(product.variants as any[]).length}`);
    (product.variants as any[]).forEach((v: any) => {
      console.log(`  - ${v.variant} (${v.color})`);
    });
  }
}

main().catch(console.error);
