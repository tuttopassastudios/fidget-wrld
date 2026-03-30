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
  // Product 5: Sticky Wall Ball (CJ PID: 3D7BC0C9-CC09-4FAB-94A2-5775F0D11661)
  {
    slug: 'cj-sticky-wall-ball',
    name: 'Sticky Wall Ball',
    tagline: 'Throw, stick, squeeze, repeat',
    category: 'Squishy',
    variants: [
      { sku: 'CJ-WALL-BALL-4PK', name: 'Sticky Wall Ball', variant: '4-Pack Rainbow', price: 5.99, image: 'https://cf.cjdropshipping.com/2044/18607719711932.png' },
      { sku: 'CJ-WALL-BALL-GLOW4', name: 'Sticky Wall Ball', variant: '4-Pack Glow', price: 6.99, image: 'https://cf.cjdropshipping.com/2054/4786525385188.png' },
      { sku: 'CJ-WALL-BALL-BLU', name: 'Sticky Wall Ball', variant: 'Blue LED', color: 'Blue', colorHex: '#1E90FF', price: 2.99, image: 'https://cf.cjdropshipping.com/203104/1350329882.jpg' },
      { sku: 'CJ-WALL-BALL-GRN', name: 'Sticky Wall Ball', variant: 'Green LED', color: 'Green', colorHex: '#32CD32', price: 2.99, image: 'https://cf.cjdropshipping.com/203104/2589223855002.jpg' },
      { sku: 'CJ-WALL-BALL-RED', name: 'Sticky Wall Ball', variant: 'Red LED', color: 'Red', colorHex: '#DC143C', price: 2.99, image: 'https://cf.cjdropshipping.com/203104/488402365204.jpg' },
      { sku: 'CJ-WALL-BALL-8PK', name: 'Sticky Wall Ball', variant: '8-Pack LED', price: 9.99, image: 'https://cf.cjdropshipping.com/2054/5811979488440.jpg' },
    ],
    default_variant_index: 0,
    description: '<p>Fun and satisfying sticky wall balls that stick to walls, ceilings, and smooth surfaces! Throw them against the wall and watch them stick, then slowly peel off. Perfect stress relief for all ages.</p><p>Made from safe TPR material with soft rubber filling. LED variants light up on impact for extra fun. Washable - just rinse with water to restore stickiness.</p>',
    features: ['Sticks to walls and smooth surfaces', 'LED variants light up on impact', 'Soft, squeezable material', 'Washable to restore stickiness', 'Safe for kids 3+'],
    specifications: { 'Material': 'TPR (Thermoplastic Rubber)', 'Size': '4.5-6.5cm diameter', 'Weight': '12-50g per ball', 'Type': 'Stress Relief / Throwing Toy' },
    moods: ['play', 'calm'],
    audiences: ['kids', 'all'],
    textures: ['soft'],
    age_recommendation: '3+',
    materials: ['TPR', 'Soft Rubber'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['stress-ball-set', 'cj-popcorn-squishy', 'squishy-animals'],
    meta_title: 'Sticky Wall Ball | Fidget WRLD',
    meta_description: 'Fun sticky stress balls that stick to walls. LED light-up options available. Perfect for stress relief and play.',
  },
  // Product 6: Fidget Anxiety Ring (CJ PID: 1463420820905922560)
  {
    slug: 'cj-fidget-ring',
    name: 'Fidget Anxiety Ring',
    tagline: 'Stylish stress relief jewelry',
    category: 'Desk Toy',
    variants: [
      { sku: 'CJ-RING-BUTTERFLY', name: 'Fidget Anxiety Ring', variant: 'Butterfly', color: 'Gold', colorHex: '#D4AF37', price: 6.99, image: 'https://cf.cjdropshipping.com/d84460a0-748b-46b1-ae82-3d9a5588ac24.jpg' },
      { sku: 'CJ-RING-BAND', name: 'Fidget Anxiety Ring', variant: 'Simple Band', color: 'Silver', colorHex: '#C0C0C0', price: 4.99, image: 'https://cf.cjdropshipping.com/ff1d0b0f-be2a-44b6-9a3f-9f7c74958451.jpg' },
      { sku: 'CJ-RING-FLOWER', name: 'Fidget Anxiety Ring', variant: 'Flower', color: 'Rose Gold', colorHex: '#B76E79', price: 4.99, image: 'https://cf.cjdropshipping.com/1783d3bb-70f4-4438-9fc4-d821593cc3b5.jpg' },
      { sku: 'CJ-RING-STAR', name: 'Fidget Anxiety Ring', variant: 'Star', color: 'Gold', colorHex: '#FFD700', price: 6.99, image: 'https://cf.cjdropshipping.com/4c6225df-830c-4259-b8cc-cdb2ec298c78.jpg' },
      { sku: 'CJ-RING-HEART', name: 'Fidget Anxiety Ring', variant: 'Heart', color: 'Silver', colorHex: '#C0C0C0', price: 4.99, image: 'https://cf.cjdropshipping.com/58ec2f49-0ad1-4c26-8ce2-d64e2c96e71d.jpg' },
      { sku: 'CJ-RING-MOON', name: 'Fidget Anxiety Ring', variant: 'Moon & Stars', color: 'Gold', colorHex: '#D4AF37', price: 4.99, image: 'https://cf.cjdropshipping.com/31d2b043-00ce-4785-8b80-c10d8c06d408.jpg' },
      { sku: 'CJ-RING-WAVE', name: 'Fidget Anxiety Ring', variant: 'Wave', color: 'Silver', colorHex: '#C0C0C0', price: 4.99, image: 'https://cf.cjdropshipping.com/ae0a37d6-214b-4d97-b4ed-245b6027bb83.jpg' },
    ],
    default_variant_index: 0,
    description: '<p>Elegant spinner rings designed for discrete stress relief. The rotating band spins smoothly around your finger, providing a calming fidget experience that looks like stylish jewelry.</p><p>Made from copper with natural zircon accents and dripping oil treatment for a premium finish. Perfect for anxiety relief during meetings, classes, or any time you need to stay calm and focused.</p>',
    features: ['Discrete fidget jewelry', 'Smooth spinning band', 'Multiple elegant designs', 'Natural zircon accents', 'Copper construction'],
    specifications: { 'Material': 'Copper with Zircon', 'Style': 'Fashion Ring', 'Weight': '1-14g', 'Type': 'Spinner Ring' },
    moods: ['calm', 'focus'],
    audiences: ['adults', 'office'],
    textures: ['smooth'],
    age_recommendation: '12+',
    materials: ['Copper', 'Zircon'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['cj-spinner-keychain', 'fidget-cube', 'cj-alloy-spinner'],
    meta_title: 'Fidget Anxiety Ring | Fidget WRLD',
    meta_description: 'Elegant spinner rings for discrete stress relief. Stylish fidget jewelry with smooth rotating bands.',
  },
  // Product 7: Vintage Heart Rotating Ring (CJ PID: 1547121202051952640)
  {
    slug: 'cj-heart-spinner-ring',
    name: 'Heart Spinner Ring',
    tagline: 'Self-love meets stress relief',
    category: 'Desk Toy',
    variants: [
      { sku: 'CJ-HEART-RING-5', name: 'Heart Spinner Ring', variant: 'Size 5', price: 4.99, image: 'https://cf.cjdropshipping.com/quick/product/b14f01c3-5fa9-4a92-a076-108edd15c9da.jpg' },
      { sku: 'CJ-HEART-RING-6', name: 'Heart Spinner Ring', variant: 'Size 6', price: 4.99, image: 'https://cf.cjdropshipping.com/quick/product/b14f01c3-5fa9-4a92-a076-108edd15c9da.jpg' },
      { sku: 'CJ-HEART-RING-7', name: 'Heart Spinner Ring', variant: 'Size 7', price: 4.99, image: 'https://cf.cjdropshipping.com/quick/product/b14f01c3-5fa9-4a92-a076-108edd15c9da.jpg' },
      { sku: 'CJ-HEART-RING-8', name: 'Heart Spinner Ring', variant: 'Size 8', price: 4.99, image: 'https://cf.cjdropshipping.com/quick/product/b14f01c3-5fa9-4a92-a076-108edd15c9da.jpg' },
      { sku: 'CJ-HEART-RING-9', name: 'Heart Spinner Ring', variant: 'Size 9', price: 4.99, image: 'https://cf.cjdropshipping.com/quick/product/b14f01c3-5fa9-4a92-a076-108edd15c9da.jpg' },
      { sku: 'CJ-HEART-RING-10', name: 'Heart Spinner Ring', variant: 'Size 10', price: 4.99, image: 'https://cf.cjdropshipping.com/quick/product/b14f01c3-5fa9-4a92-a076-108edd15c9da.jpg' },
      { sku: 'CJ-HEART-RING-11', name: 'Heart Spinner Ring', variant: 'Size 11', price: 4.99, image: 'https://cf.cjdropshipping.com/quick/product/b14f01c3-5fa9-4a92-a076-108edd15c9da.jpg' },
    ],
    default_variant_index: 2,
    description: '<p>A beautiful two-tone heart spinner ring with three rotatable circles. Turn them to relieve anxiety while wearing gorgeous jewelry that catches everyone\'s eye.</p><p>The detachable spinning hearts can be manually repositioned for a custom look. Perfect as a self-love reminder or meditation aid. Makes a wonderful gift for girls and women of all ages.</p>',
    features: ['Three rotatable heart circles', 'Two-tone vintage design', 'Detachable & repositionable hearts', 'Comfortable fit, no sharp edges', 'Available in sizes 5-11'],
    specifications: { 'Material': 'Electroplated Metal', 'Style': 'Vintage Heart', 'Weight': '10-19g', 'Sizes': '5, 6, 7, 8, 9, 10, 11' },
    moods: ['calm', 'focus'],
    audiences: ['adults', 'office'],
    textures: ['smooth'],
    age_recommendation: '12+',
    materials: ['Metal'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['cj-fidget-ring', 'cj-spinner-keychain', 'fidget-cube'],
    meta_title: 'Heart Spinner Ring | Fidget WRLD',
    meta_description: 'Vintage two-tone heart spinner ring with rotatable hearts. Beautiful anxiety relief jewelry in sizes 5-11.',
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
