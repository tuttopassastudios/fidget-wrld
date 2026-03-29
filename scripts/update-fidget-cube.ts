/**
 * Update Fidget Cube product in Supabase
 * Run with: npx tsx scripts/update-fidget-cube.ts
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

const BUCKET_NAME = 'products';
const IMAGES_DIR = path.join(__dirname, '../public/images/products');

const imagesToUpload = [
  'fidget-cube-black-green.png',
  'fidget-cube-grey-black.png',
  'fidget-cube-black-blue.png',
];

async function uploadImages(): Promise<Record<string, string>> {
  console.log('Uploading Fidget Cube images to Supabase Storage...\n');

  const uploadedUrls: Record<string, string> = {};

  for (const file of imagesToUpload) {
    const filePath = path.join(IMAGES_DIR, file);

    if (!fs.existsSync(filePath)) {
      console.error(`  ✗ ${file}: File not found`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(file, fileBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      console.error(`  ✗ ${file}: ${error.message}`);
    } else {
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${file}`;
      uploadedUrls[file] = publicUrl;
      console.log(`  ✓ ${file}`);
    }
  }

  return uploadedUrls;
}

async function updateProduct(imageUrls: Record<string, string>) {
  console.log('\nUpdating Fidget Cube product in Supabase...\n');

  const variants = [
    { sku: 'FW-CUBE-BG', name: 'Fidget Cube', variant: 'Black/Green', color: 'Black/Green', colorHex: '#2d5a27', price: 14.99, image: imageUrls['fidget-cube-black-green.png'] || `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/fidget-cube-black-green.png` },
    { sku: 'FW-CUBE-GB', name: 'Fidget Cube', variant: 'Grey/Black', color: 'Grey/Black', colorHex: '#4a4a4a', price: 14.99, image: imageUrls['fidget-cube-grey-black.png'] || `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/fidget-cube-grey-black.png` },
    { sku: 'FW-CUBE-BB', name: 'Fidget Cube', variant: 'Black/Blue', color: 'Black/Blue', colorHex: '#1e3a5f', price: 14.99, image: imageUrls['fidget-cube-black-blue.png'] || `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/fidget-cube-black-blue.png` },
  ];

  const { data: product } = await supabase
    .from('products')
    .select('id, slug, name')
    .eq('slug', 'fidget-cube')
    .single();

  if (product) {
    console.log(`Found product: ${product.name} (${product.slug})`);
    console.log('Updating variants...\n');

    const { error } = await supabase
      .from('products')
      .update({
        variants: variants,
        default_variant_index: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', product.id);

    if (error) {
      console.error('Error updating product:', error.message);
      process.exit(1);
    }

    console.log('✓ Product updated successfully!');
  } else {
    console.log('Product not found in database. Run seed-products.ts first.');
    process.exit(1);
  }

  // Verify the update
  const { data: updated } = await supabase
    .from('products')
    .select('slug, name, variants')
    .eq('slug', 'fidget-cube')
    .single();

  if (updated) {
    console.log('\n--- Current product state ---');
    console.log(`Name: ${updated.name}`);
    console.log(`Slug: ${updated.slug}`);
    console.log(`Variants: ${(updated.variants as any[]).length}`);
    (updated.variants as any[]).forEach((v: any) => {
      console.log(`  - ${v.variant} (${v.sku})`);
    });
  }

  return variants;
}

async function main() {
  // Step 1: Upload images
  const imageUrls = await uploadImages();

  // Step 2: Update product in Supabase
  const variants = await updateProduct(imageUrls);

  // Step 3: Output URLs for products.ts update
  console.log('\n--- Supabase image URLs ---');
  console.log('Update products.ts with these URLs:\n');
  variants.forEach(v => {
    console.log(`  ${v.variant}: ${v.image}`);
  });
}

main().catch(console.error);
