/**
 * Add Pending CJ Products to Supabase
 *
 * Adds products from cj-fidget-product-ids.json that haven't been fully fetched yet.
 * Uses basic info from our research with placeholder images.
 * These can be updated later when we fetch full details from CJ API.
 *
 * Usage: node scripts/add-pending-cj-products.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Load product IDs file
const idsFile = path.join(__dirname, 'cj-fidget-product-ids.json');
const idsData = JSON.parse(fs.readFileSync(idsFile, 'utf-8'));

// Load already-fetched products to skip them
const researchedFile = path.join(__dirname, 'cj-researched-products.json');
let researchedPids = [];
if (fs.existsSync(researchedFile)) {
  const researchedData = JSON.parse(fs.readFileSync(researchedFile, 'utf-8'));
  researchedPids = researchedData.products.map(p => p.pid);
}

// Helper to create a URL-friendly slug
function createSlug(name) {
  return 'cj-' + name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

// Product configurations based on our research
const productConfigs = {
  '1527233425990758400': {
    tagline: 'Premium metal spin therapy',
    category: 'Desk Toy',
    description: '<p>Premium metal alloy fidget spinner with stunning electroplated finish. Six-axis design for ultra-smooth, balanced spinning.</p><p>The perfect desk companion for focus, stress relief, and satisfying fidget breaks. Built to last with premium zinc alloy construction.</p>',
    features: [
      'Premium zinc alloy construction',
      'Six-axis balanced design',
      'Stunning electroplated finish',
      'Ultra-smooth ceramic bearing',
      'Long-lasting spin time',
    ],
    specifications: { 'Material': 'Zinc Alloy', 'Finish': 'Electroplated', 'Axes': '6' },
    moods: ['focus', 'calm'],
    audiences: ['adults', 'office', 'all'],
    textures: ['smooth'],
    materials: ['Zinc Alloy', 'Ceramic'],
    estimatedPrice: 14.99,
  },
  'C4880398-A6C6-48C2-AF37-7852296CD892': {
    tagline: 'Squeeze away stress deliciously',
    category: 'Squishy',
    description: '<p>Adorable popcorn cup shaped squishy fidget toy that is impossibly satisfying to squeeze. Realistic design brings joy to your desk or play time.</p><p>Made from premium slow-rising foam material. Perfect for stress relief, anxiety management, and sensory play for both kids and adults.</p>',
    features: [
      'Realistic popcorn cup design',
      'Slow-rising foam material',
      'Ultra-satisfying squeeze',
      'Safe for kids and adults',
      'Cute desk decoration',
    ],
    specifications: { 'Material': 'PU Foam', 'Type': 'Slow Rising Squishy' },
    moods: ['calm', 'play'],
    audiences: ['kids', 'all'],
    textures: ['soft'],
    materials: ['PU Foam'],
    estimatedPrice: 9.99,
  },
  '1719271582901743616': {
    tagline: 'Mesmerizing magnetic magic',
    category: 'Magnetic',
    description: '<p>Captivating ferrofluid display that dances and moves with magnetic fields. Watch the magnetic liquid create mesmerizing spiky patterns as you move the included magnet.</p><p>Premium desk toy perfect for offices, home decor, or anyone who loves science and visual relaxation. Music-reactive for an even more amazing experience.</p>',
    features: [
      'Real ferrofluid magnetic liquid',
      'Reacts to music and sound',
      'Mesmerizing visual display',
      'Premium glass enclosure',
      'Includes magnetic wand',
    ],
    specifications: { 'Material': 'Glass + Ferrofluid', 'Feature': 'Music Reactive', 'Type': 'Magnetic Desk Toy' },
    moods: ['calm', 'focus'],
    audiences: ['adults', 'office', 'all'],
    textures: ['smooth'],
    materials: ['Glass', 'Ferrofluid'],
    estimatedPrice: 34.99,
  },
};

// Convert product from IDs file to Supabase format
function createSupabaseProduct(product) {
  const config = productConfigs[product.pid] || {};

  // Determine category from type
  let category = config.category || 'Desk Toy';
  if (product.type.includes('Squishy') || product.type.includes('Squeeze')) {
    category = 'Squishy';
  } else if (product.type.includes('Magnetic')) {
    category = 'Magnetic';
  } else if (product.type.includes('Spinner')) {
    category = 'Desk Toy';
  }

  const price = config.estimatedPrice || 12.99;

  return {
    slug: createSlug(product.name),
    name: product.name,
    tagline: config.tagline || 'Premium fidget therapy',
    category,
    variants: [
      {
        sku: `CJ-${product.pid.substring(0, 8)}-STD`,
        name: product.name,
        variant: 'Standard',
        price,
        image: 'https://placehold.co/600x600/2dd4bf/white?text=' + encodeURIComponent(product.type.split('/')[0]),
      },
    ],
    default_variant_index: 0,
    description: config.description || `<p>${product.description}</p><p>Premium quality fidget toy for stress relief and focus.</p>`,
    features: config.features || [
      'Premium quality construction',
      'Great for stress relief',
      'Perfect for all ages',
      'Compact and portable',
    ],
    specifications: config.specifications || { 'Quality': 'Premium' },
    moods: config.moods || ['focus', 'calm'],
    audiences: config.audiences || ['all'],
    textures: config.textures || ['smooth'],
    age_recommendation: '6+',
    materials: config.materials || ['Premium Materials'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: [],
    meta_title: `${product.name} | Fidget WRLD`,
    meta_description: `${product.description}. Shop now at Fidget WRLD for premium fidget toys.`,
  };
}

async function addPendingProducts() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Adding Pending CJ Products to Supabase          ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // Filter to only products not yet in researched file
  const pendingProducts = idsData.products.filter(p => !researchedPids.includes(p.pid));

  if (pendingProducts.length === 0) {
    console.log('All products have been fully fetched from CJ API.');
    console.log('Run: node scripts/add-cj-researched-products.js to add them.');
    return;
  }

  console.log(`Found ${pendingProducts.length} pending product(s) to add\n`);
  console.log('Note: These have placeholder images. Update with CJ API later.\n');

  let added = 0;
  let skipped = 0;
  let errors = 0;

  for (const product of pendingProducts) {
    console.log(`Processing: ${product.name}...`);

    const supabaseProduct = createSupabaseProduct(product);

    // Check if already exists
    const { data: existing } = await supabase
      .from('products')
      .select('slug')
      .eq('slug', supabaseProduct.slug)
      .single();

    if (existing) {
      console.log(`⏭️  Skipped (exists): ${supabaseProduct.slug}`);
      skipped++;
      continue;
    }

    const { error } = await supabase.from('products').insert(supabaseProduct);

    if (error) {
      console.error(`❌ Error: ${error.message}`);
      errors++;
    } else {
      console.log(`✅ Added: ${supabaseProduct.name}`);
      console.log(`   Slug: ${supabaseProduct.slug}`);
      console.log(`   Category: ${supabaseProduct.category}`);
      console.log(`   Price: $${supabaseProduct.variants[0].price}`);
      added++;
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`Complete: ${added} added, ${skipped} skipped, ${errors} errors`);
  console.log('═'.repeat(50));

  if (added > 0) {
    console.log('\n📝 Note: Products have placeholder images.');
    console.log('   To update with real CJ images:');
    console.log('   1. Wait 5 min between each: node scripts/cj-product-lookup.js <pid>');
    console.log('   2. Then run: node scripts/add-cj-researched-products.js');
  }
}

addPendingProducts().catch(console.error);
