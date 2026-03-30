/**
 * Check and debug Supabase products
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkProducts() {
  console.log('Checking CJ products in Supabase...\n');

  const { data: products, error } = await supabase
    .from('products')
    .select('slug, name, variants')
    .like('slug', 'cj-%');

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log(`Found ${products.length} CJ products:\n`);

  for (const product of products) {
    console.log(`\n${product.name}`);
    console.log(`  Slug: ${product.slug}`);
    console.log(`  Variants: ${product.variants?.length || 0}`);

    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v, i) => {
        console.log(`    [${i}] ${v.variant}: $${v.price}`);
        console.log(`        Image: ${v.image?.substring(0, 60)}...`);
      });
    }
  }
}

checkProducts().catch(console.error);
