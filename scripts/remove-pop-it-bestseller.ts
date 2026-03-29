/**
 * Remove Pop It Rainbow from bestsellers in Supabase
 * Run with: npx tsx scripts/remove-pop-it-bestseller.ts
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

async function main() {
  console.log('Updating Pop It Rainbow to remove bestseller status...\n');

  const { data: product } = await supabase
    .from('products')
    .select('id, slug, name, is_bestseller')
    .eq('slug', 'pop-it-rainbow')
    .single();

  if (!product) {
    console.log('Product pop-it-rainbow not found in database.');
    process.exit(1);
  }

  console.log(`Found: ${product.name} (is_bestseller: ${product.is_bestseller})`);

  const { error } = await supabase
    .from('products')
    .update({
      is_bestseller: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', product.id);

  if (error) {
    console.error('Error updating product:', error.message);
    process.exit(1);
  }

  console.log('✓ Pop It Rainbow is_bestseller set to false');

  // Verify
  const { data: updated } = await supabase
    .from('products')
    .select('slug, name, is_bestseller')
    .eq('slug', 'pop-it-rainbow')
    .single();

  if (updated) {
    console.log(`\nVerified: ${updated.name} (is_bestseller: ${updated.is_bestseller})`);
  }
}

main().catch(console.error);
