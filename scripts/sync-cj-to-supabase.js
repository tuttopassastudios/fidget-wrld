/**
 * Sync CJ Dropshipping products to Supabase
 *
 * This script replaces old placeholder CJ products with real products
 * that have working images from the CJ API.
 *
 * Usage: node scripts/sync-cj-to-supabase.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Old CJ product slugs to delete (placeholder products with broken images)
const oldCjSlugs = [
  'cj-rainbow-fidget-spinner',
  'cj-pop-it-sensory',
  'cj-squishy-animals',
  'cj-mesh-marble',
  'cj-aluminum-infinity-cube',
  'cj-flippy-chain',
  'cj-magnetic-rings',
  'cj-stretchy-noodles',
  'cj-simple-dimple-keychain',
  'cj-wacky-tracks',
  'cj-tangle-fidget',
  // Also check for any others that might have been added
  'cj-creative-fidget-spinner-toy-keychain-hand-spinner-',
  'cj-colorful-alloy-fidget-spinner-electroplating',
  'cj-stress-relief-simulation-popcorn-cup',
  'cj-dancing-ferrofluid-magnetic-desk-toy',
];

// New CJ products with REAL images from CJ API
const newCjProducts = [
  // Product 1: Spinner Keychain (CJ PID: 1541333689475944448)
  {
    slug: 'cj-spinner-keychain',
    name: 'Fidget Spinner Keychain',
    tagline: 'Spin anywhere you go',
    category: 'Desk Toy',
    variants: [
      { sku: 'CJ-SPIN-KEY-BLK', name: 'Fidget Spinner Keychain', variant: 'Black', color: 'Black', colorHex: '#2a2a2a', price: 5.99, image: 'https://cf.cjdropshipping.com/5ba37cad-57a1-4705-b527-b868eee90280.jpg' },
      { sku: 'CJ-SPIN-KEY-RED', name: 'Fidget Spinner Keychain', variant: 'Red', color: 'Red', colorHex: '#DC143C', price: 5.99, image: 'https://cf.cjdropshipping.com/f2d24da0-b5ea-43e7-a729-c9c87911a666.jpg' },
      { sku: 'CJ-SPIN-KEY-WHT', name: 'Fidget Spinner Keychain', variant: 'White', color: 'White', colorHex: '#FFFFFF', price: 5.99, image: 'https://cf.cjdropshipping.com/44c7f08a-3f87-4686-8db8-1bb8a8627e11.jpg' },
      { sku: 'CJ-SPIN-KEY-GRN', name: 'Fidget Spinner Keychain', variant: 'Glow Green', color: 'Green', colorHex: '#32CD32', price: 6.99, image: 'https://cf.cjdropshipping.com/d174c68a-f724-43d6-a451-965d13ea4e4e.jpg' },
      { sku: 'CJ-SPIN-KEY-BLU', name: 'Fidget Spinner Keychain', variant: 'Glow Blue', color: 'Blue', colorHex: '#1E90FF', price: 6.99, image: 'https://cf.cjdropshipping.com/291de2f2-5387-4df8-b862-c1e593aeba4b.jpg' },
    ],
    default_variant_index: 0,
    description: '<p>A creative multi-functional fidget toy that combines a finger spinner with a keychain and bottle opener. Perfect for on-the-go fidgeting!</p><p>Great for stress relief, anxiety, focus, and ADHD. The glow-in-the-dark variants light up after absorbing light. Compact 5cm x 3.7cm size fits anywhere.</p>',
    features: ['Multi-functional: spinner + keychain + bottle opener', 'Glow-in-the-dark options available', 'Compact pocket-friendly size', 'Perfect for anxiety and focus', 'Zinc alloy & plastic construction'],
    specifications: { 'Material': 'Plastic / Zinc Alloy', 'Size': '5cm x 3.7cm x 0.5cm', 'Weight': '16-48g', 'Type': 'Keychain Spinner' },
    moods: ['focus', 'calm', 'play'],
    audiences: ['adults', 'kids', 'all'],
    textures: ['smooth'],
    age_recommendation: '6+',
    materials: ['Zinc Alloy', 'Plastic'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['fidget-cube', 'cj-alloy-spinner', 'cj-popcorn-squishy'],
    meta_title: 'Fidget Spinner Keychain | Fidget WRLD',
    meta_description: 'Multi-functional fidget spinner keychain with bottle opener. Glow-in-the-dark options available for on-the-go stress relief.',
  },
  // Product 2: Alloy Fidget Spinner (CJ PID: 1527233425990758400)
  {
    slug: 'cj-alloy-spinner',
    name: 'Rainbow Alloy Fidget Spinner',
    tagline: 'Premium metal spinning',
    category: 'Desk Toy',
    variants: [
      { sku: 'CJ-ALLOY-SPIN-RBW', name: 'Rainbow Alloy Fidget Spinner', variant: 'Rainbow 6-Axis', color: 'Rainbow', colorHex: '#ff6b6b', price: 4.99, image: 'https://cf.cjdropshipping.com/quick/product/8dcda08d-587f-4ce2-8c2a-6c32ef805736.jpg' },
    ],
    default_variant_index: 0,
    description: '<p>Premium colorful alloy fidget spinner with stunning electroplated rainbow finish. The six-axis design provides excellent balance for long, smooth spins.</p><p>Approximately 6cm in diameter, perfect for teens and adults. Made from high-quality alloy material for durability and satisfying weight.</p>',
    features: ['Premium alloy construction', 'Electroplated rainbow finish', 'Six-axis balanced design', 'Long smooth spin time', 'Perfect desk toy size'],
    specifications: { 'Material': 'Alloy', 'Diameter': '~6cm', 'Weight': '80g', 'Age Range': '7-14+ years' },
    moods: ['focus', 'calm'],
    audiences: ['adults', 'office', 'all'],
    textures: ['smooth'],
    age_recommendation: '7+',
    materials: ['Alloy'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['cj-spinner-keychain', 'fidget-cube', 'infinity-cube'],
    meta_title: 'Rainbow Alloy Fidget Spinner | Fidget WRLD',
    meta_description: 'Premium electroplated rainbow alloy fidget spinner. Six-axis design for balanced, long-lasting spins.',
  },
  // Product 3: Popcorn Cup Squishy (CJ PID: C4880398-A6C6-48C2-AF37-7852296CD892)
  {
    slug: 'cj-popcorn-squishy',
    name: 'Popcorn Cup Squishy',
    tagline: 'Squeeze the stress away',
    category: 'Squishy',
    variants: [
      { sku: 'CJ-POPCORN-SQU', name: 'Popcorn Cup Squishy', variant: 'Classic', price: 9.99, image: 'https://cf.cjdropshipping.com/15204672/1093995935640.png' },
    ],
    default_variant_index: 0,
    description: '<p>Adorable simulation popcorn cup squeeze toy that provides satisfying stress relief. This unique fidget toy looks just like a real popcorn cup!</p><p>Perfect for kids and adults who need a fun, tactile way to relieve anxiety and stress. The soft, squeezable material is durable and always returns to shape.</p>',
    features: ['Realistic popcorn cup design', 'Soft squeezable material', 'Great for stress relief', 'Durable construction', 'Fun for all ages'],
    specifications: { 'Material': 'TPR/Foam', 'Weight': '120g', 'Type': 'Squeeze Toy' },
    moods: ['calm', 'play'],
    audiences: ['kids', 'all'],
    textures: ['soft'],
    age_recommendation: '3+',
    materials: ['TPR', 'Foam'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['stress-ball-set', 'squishy-animals', 'cj-spinner-keychain'],
    meta_title: 'Popcorn Cup Squishy | Fidget WRLD',
    meta_description: 'Cute simulation popcorn cup squeeze toy. Satisfying stress relief for kids and adults.',
  },
  // Product 4: Dancing Ferrofluid (CJ PID: 1719271582901743616)
  {
    slug: 'cj-ferrofluid-speaker',
    name: 'Dancing Ferrofluid Speaker',
    tagline: 'Music meets magnetism',
    category: 'Desk Toy',
    variants: [
      { sku: 'CJ-FERRO-YLW', name: 'Dancing Ferrofluid Speaker', variant: 'Yellow', color: 'Yellow', colorHex: '#FFD700', price: 149.99, image: 'https://cf.cjdropshipping.com/quick/product/816355c6-0da3-43e7-89e0-09f28b925818.jpg' },
      { sku: 'CJ-FERRO-GRY', name: 'Dancing Ferrofluid Speaker', variant: 'Gray', color: 'Gray', colorHex: '#808080', price: 149.99, image: 'https://cf.cjdropshipping.com/quick/product/f466ca43-21d0-4430-8f66-81703ca29e5e.jpg' },
    ],
    default_variant_index: 0,
    description: '<p>Transform your music into a visual masterpiece with this mesmerizing dancing ferrofluid speaker. The magnetic fluid dances to the beat, creating captivating shapes that respond to different rhythms.</p><p>Features a built-in lithium-ion battery with up to 8 hours of continuous playtime. The warm white light illuminates the dynamic magnetic fluid display for a truly unique desk toy experience.</p>',
    features: ['Ferrofluid dances to music rhythm', 'Built-in speaker with 8hr battery', 'Warm white LED illumination', 'USB-C charging', 'Premium desk decoration'],
    specifications: { 'Material': 'Plastic + Ferrofluid', 'Size': '172mm x 106mm x 54mm', 'Weight': '902-909g', 'Battery': '8 hours playtime', 'Charging': 'USB Type-C' },
    moods: ['calm', 'focus'],
    audiences: ['adults', 'office'],
    textures: ['smooth'],
    age_recommendation: '14+',
    materials: ['Plastic', 'Ferrofluid', 'Magnets'],
    is_new: true,
    is_bestseller: false,
    is_limited: true,
    related_slugs: ['magnetic-putty', 'magnet-balls', 'cj-alloy-spinner'],
    meta_title: 'Dancing Ferrofluid Speaker | Fidget WRLD',
    meta_description: 'Mesmerizing ferrofluid desk toy that dances to music. Premium magnetic fluid speaker with 8-hour battery life.',
  },
];

async function syncProducts() {
  console.log('='.repeat(60));
  console.log('CJ Dropshipping Product Sync');
  console.log('='.repeat(60));

  // Step 1: Delete old CJ products with placeholder images
  console.log('\n📦 Step 1: Removing old CJ products with broken images...\n');

  let deleted = 0;
  for (const slug of oldCjSlugs) {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('slug', slug)
      .select();

    if (error) {
      console.log(`   ⚠️  Error deleting ${slug}: ${error.message}`);
    } else if (data && data.length > 0) {
      console.log(`   🗑️  Deleted: ${slug}`);
      deleted++;
    }
  }
  console.log(`   Total deleted: ${deleted}`);

  // Step 2: Add new CJ products with real images
  console.log('\n📦 Step 2: Adding new CJ products with real images...\n');

  let added = 0;
  let skipped = 0;
  let errors = 0;

  for (const product of newCjProducts) {
    // Check if product already exists
    const { data: existing } = await supabase
      .from('products')
      .select('slug')
      .eq('slug', product.slug)
      .single();

    if (existing) {
      // Update existing product
      const { error: updateError } = await supabase
        .from('products')
        .update(product)
        .eq('slug', product.slug);

      if (updateError) {
        console.log(`   ❌ Error updating ${product.name}: ${updateError.message}`);
        errors++;
      } else {
        console.log(`   🔄 Updated: ${product.name}`);
        skipped++;
      }
      continue;
    }

    // Insert new product
    const { error } = await supabase.from('products').insert(product);

    if (error) {
      console.error(`   ❌ Error adding ${product.name}:`, error.message);
      errors++;
    } else {
      console.log(`   ✅ Added: ${product.name}`);
      added++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Sync complete!');
  console.log(`   Deleted: ${deleted} old products`);
  console.log(`   Added: ${added} new products`);
  console.log(`   Updated: ${skipped} existing products`);
  console.log(`   Errors: ${errors}`);
  console.log('='.repeat(60));
}

syncProducts().catch(console.error);
