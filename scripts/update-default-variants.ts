/**
 * Update default variant indices in Supabase for products with photos
 * Run with: npx tsx scripts/update-default-variants.ts
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

const updates = [
  { slug: 'magnet-balls', defaultVariantIndex: 3 },      // Red variant with photo
  { slug: 'fidget-cube', defaultVariantIndex: 2 },       // Cherry Red variant with photo
];

async function main() {
  console.log('Updating default variant indices in Supabase...\n');

  for (const update of updates) {
    const { error } = await supabase
      .from('products')
      .update({
        default_variant_index: update.defaultVariantIndex,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', update.slug);

    if (error) {
      console.error(`  ✗ ${update.slug}: ${error.message}`);
    } else {
      console.log(`  ✓ ${update.slug}: default variant index set to ${update.defaultVariantIndex}`);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
