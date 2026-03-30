/**
 * Set products to Out of Stock in Supabase
 * These products are not fulfilled via CJDropshipping and are currently unavailable
 * Run with: npx tsx scripts/set-out-of-stock.ts
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

// Products to mark as out of stock (not fulfilled via CJDropshipping)
const outOfStockSlugs = [
  'magnet-balls',      // Magnet Balls
  'stress-ball-set',   // Ice Cube Stress Ball
  'fidget-cube',       // Fidget Cube
];

async function main() {
  console.log('Setting products to Out of Stock in Supabase...\n');
  console.log('Products to update:');
  outOfStockSlugs.forEach(slug => console.log(`  - ${slug}`));
  console.log();

  for (const slug of outOfStockSlugs) {
    // Check if product exists
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, slug, name, is_out_of_stock')
      .eq('slug', slug)
      .single();

    if (fetchError || !product) {
      console.log(`⚠ Product "${slug}" not found in database - skipping`);
      continue;
    }

    if (product.is_out_of_stock) {
      console.log(`✓ ${product.name} (${slug}) - already marked as Out of Stock`);
      continue;
    }

    // Update to out of stock
    const { error: updateError } = await supabase
      .from('products')
      .update({
        is_out_of_stock: true,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug);

    if (updateError) {
      console.error(`✗ Error updating ${slug}: ${updateError.message}`);
      continue;
    }

    console.log(`✓ ${product.name} (${slug}) - marked as Out of Stock`);
  }

  console.log('\n--- Verification ---');

  // Verify all products
  const { data: products } = await supabase
    .from('products')
    .select('slug, name, is_out_of_stock')
    .in('slug', outOfStockSlugs);

  if (products) {
    products.forEach(p => {
      const status = p.is_out_of_stock ? 'OUT OF STOCK' : 'AVAILABLE';
      console.log(`${p.name}: ${status}`);
    });
  }
}

main().catch(console.error);
