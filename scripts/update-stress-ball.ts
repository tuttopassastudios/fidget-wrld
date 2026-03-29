/**
 * Update Ice Cube Stress Ball product in Supabase
 * Run with: npx tsx scripts/update-stress-ball.ts
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
  'ice-cube-stress-ball.png',
  'ice-cube-stress-ball-2.png',
];

async function uploadImages(): Promise<Record<string, string>> {
  console.log('Uploading Ice Cube Stress Ball images to Supabase Storage...\n');

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
  console.log('\nUpdating Ice Cube Stress Ball product in Supabase...\n');

  const variants = [
    { sku: 'FW-STRESS-4PK', name: 'Ice Cube Stress Ball', variant: '4-Pack', price: 14.99, image: imageUrls['ice-cube-stress-ball.png'] || `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/ice-cube-stress-ball.png` },
  ];

  const { data: product } = await supabase
    .from('products')
    .select('id, slug, name')
    .eq('slug', 'stress-ball-set')
    .single();

  if (product) {
    console.log(`Found product: ${product.name} (${product.slug})`);
    console.log('Updating to Ice Cube Stress Ball...\n');

    const { error } = await supabase
      .from('products')
      .update({
        name: 'Ice Cube Stress Ball',
        variants: variants,
        default_variant_index: 0,
        description: `<p>Cool down your stress with our unique Ice Cube Stress Balls. These satisfying squeeze toys feature a realistic ice cube design with a soft, squishy texture that's perfect for relieving tension.</p>
<p>Perfect for the office, classroom, or home, these stress balls help improve focus, reduce anxiety, and strengthen hand muscles.</p>`,
        features: [
          'Unique ice cube design',
          'Soft squishy texture',
          'Durable TPR material',
          'Washable surface',
          'Great for hand exercises',
        ],
        specifications: {
          'Pack Size': '4 stress balls',
          'Material': 'TPR',
          'Durability': 'Over 10,000 squeezes',
        },
        textures: ['soft', 'smooth'],
        materials: ['TPR'],
        meta_title: 'Ice Cube Stress Ball | Squeeze Toys',
        meta_description: 'Unique ice cube shaped stress balls. Perfect for stress relief, focus, and hand exercises.',
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
    .eq('slug', 'stress-ball-set')
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
  await updateProduct(imageUrls);
}

main().catch(console.error);
