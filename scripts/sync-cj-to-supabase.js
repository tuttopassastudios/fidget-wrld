/**
 * Sync CJ Dropshipping products to Supabase
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

// CJ Dropshipping products to sync
const cjProducts = [
  {
    slug: 'cj-rainbow-fidget-spinner',
    name: 'Rainbow Metal Fidget Spinner',
    tagline: 'Spin away the stress',
    category: 'Desk Toy',
    variants: [
      { sku: 'CJ-SPIN-RBW', name: 'Rainbow Metal Fidget Spinner', variant: 'Rainbow', color: 'Rainbow', colorHex: '#ff6b6b', price: 7.99, image: 'https://cf.cjdropshipping.com/fidget-spinner-rainbow.jpg' },
      { sku: 'CJ-SPIN-BLK', name: 'Rainbow Metal Fidget Spinner', variant: 'Black', color: 'Black', colorHex: '#2a2a2a', price: 6.99, image: 'https://cf.cjdropshipping.com/fidget-spinner-black.jpg' },
      { sku: 'CJ-SPIN-GLD', name: 'Rainbow Metal Fidget Spinner', variant: 'Gold', color: 'Gold', colorHex: '#FFD700', price: 7.99, image: 'https://cf.cjdropshipping.com/fidget-spinner-gold.jpg' },
    ],
    default_variant_index: 0,
    description: `<p>High quality metal fidget spinner with stunning rainbow titanium finish. Premium bearing system delivers ultra-smooth, long-lasting spins of 3+ minutes.</p><p>The perfect desk companion for focus, stress relief, and satisfying fidget breaks. Compact enough to carry anywhere.</p>`,
    features: ['Premium zinc alloy construction', 'Smooth ceramic bearing', '3+ minute spin time', 'Stunning rainbow finish', 'Pocket-sized design'],
    specifications: { 'Material': 'Zinc Alloy', 'Bearing': 'Ceramic R188', 'Spin Time': '3+ minutes', 'Weight': '65g' },
    moods: ['focus', 'calm'],
    audiences: ['adults', 'office', 'all'],
    textures: ['smooth'],
    age_recommendation: '6+',
    materials: ['Zinc Alloy', 'Ceramic'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['fidget-cube', 'infinity-cube', 'cj-magnetic-rings'],
    meta_title: 'Rainbow Metal Fidget Spinner | Fidget WRLD',
    meta_description: 'Premium metal fidget spinner with rainbow finish. Ultra-smooth 3+ minute spins for stress relief and focus.',
  },
  {
    slug: 'cj-pop-it-sensory',
    name: 'Pop It Sensory Toy',
    tagline: 'Endless popping satisfaction',
    category: 'Clicky',
    variants: [
      { sku: 'CJ-POP-SQ-RBW', name: 'Pop It Sensory Toy', variant: 'Square Rainbow', color: 'Rainbow', colorHex: '#ff6b6b', price: 4.99, image: 'https://cf.cjdropshipping.com/pop-it-rainbow.jpg' },
      { sku: 'CJ-POP-CIR-BLU', name: 'Pop It Sensory Toy', variant: 'Circle Blue', color: 'Blue', colorHex: '#1E90FF', price: 4.99, image: 'https://cf.cjdropshipping.com/pop-it-blue.jpg' },
      { sku: 'CJ-POP-HEX-GRN', name: 'Pop It Sensory Toy', variant: 'Hexagon Green', color: 'Green', colorHex: '#32CD32', price: 5.99, image: 'https://cf.cjdropshipping.com/pop-it-green.jpg' },
    ],
    default_variant_index: 0,
    description: `<p>The viral sensation that delivers endless popping satisfaction. Made from premium food-grade silicone with perfectly tuned bubbles that pop with a crisp, satisfying sound.</p><p>Flip it over and pop again - it never gets old! Great for anxiety relief, focus, and sensory play.</p>`,
    features: ['Food-grade silicone', 'Perfect pop resistance', 'Flip and repeat forever', 'Easy to clean', 'Multiple shapes available'],
    specifications: { 'Material': 'Food-Grade Silicone', 'Size': '12.5cm x 12.5cm', 'Weight': '45g' },
    moods: ['calm', 'play', 'focus'],
    audiences: ['kids', 'all'],
    textures: ['smooth', 'soft'],
    age_recommendation: '3+',
    materials: ['Silicone'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['pop-it-rainbow', 'simple-dimple', 'cj-simple-dimple-keychain'],
    meta_title: 'Pop It Sensory Toy | Fidget WRLD',
    meta_description: 'Premium silicone Pop It fidget toy. Endless popping fun for stress relief and sensory play.',
  },
  {
    slug: 'cj-squishy-animals',
    name: 'Kawaii Squishy Animals',
    tagline: 'Squeeze the cuteness',
    category: 'Squishy',
    variants: [
      { sku: 'CJ-SQU-CAT', name: 'Kawaii Squishy Animals', variant: 'Cat', price: 3.99, image: 'https://cf.cjdropshipping.com/squishy-cat.jpg' },
      { sku: 'CJ-SQU-PANDA', name: 'Kawaii Squishy Animals', variant: 'Panda', price: 3.99, image: 'https://cf.cjdropshipping.com/squishy-panda.jpg' },
      { sku: 'CJ-SQU-BUNNY', name: 'Kawaii Squishy Animals', variant: 'Bunny', price: 3.99, image: 'https://cf.cjdropshipping.com/squishy-bunny.jpg' },
      { sku: 'CJ-SQU-5PK', name: 'Kawaii Squishy Animals', variant: '5-Pack Assorted', price: 14.99, image: 'https://cf.cjdropshipping.com/squishy-5pack.jpg' },
    ],
    default_variant_index: 0,
    description: `<p>Adorable slow-rising squishy animals that are impossibly soft and satisfying to squeeze. Made from premium PU memory foam with hand-painted details.</p><p>Each squishy features a light, pleasant scent and slowly returns to its original shape after squeezing. Perfect for stress relief or as cute desk companions.</p>`,
    features: ['Ultra-slow rise foam', 'Hand-painted details', 'Light scented', 'Super soft texture', 'Kawaii designs'],
    specifications: { 'Material': 'PU Memory Foam', 'Size': '8-10cm', 'Rise Time': '5-8 seconds', 'Weight': '35g each' },
    moods: ['calm', 'play'],
    audiences: ['kids', 'all'],
    textures: ['soft'],
    age_recommendation: '5+',
    materials: ['PU Foam'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['squishy-animals', 'stress-ball-set', 'cj-mesh-marble'],
    meta_title: 'Kawaii Squishy Animals | Fidget WRLD',
    meta_description: 'Adorable slow-rising squishy animals. Super soft and satisfying to squeeze for stress relief.',
  },
  {
    slug: 'cj-mesh-marble',
    name: 'Mesh Marble Fidget',
    tagline: 'Squeeze and slide',
    category: 'Stretchy',
    variants: [
      { sku: 'CJ-MESH-6PK', name: 'Mesh Marble Fidget', variant: '6-Pack Assorted', price: 5.99, image: 'https://cf.cjdropshipping.com/mesh-marble-6.jpg' },
      { sku: 'CJ-MESH-12PK', name: 'Mesh Marble Fidget', variant: '12-Pack Party', price: 9.99, image: 'https://cf.cjdropshipping.com/mesh-marble-12.jpg' },
    ],
    default_variant_index: 0,
    description: `<p>The classic fidget toy that never gets old. A smooth glass marble trapped inside a stretchy mesh tube creates an endlessly satisfying squeeze-and-slide sensation.</p><p>Squeeze it and watch the marble pop through the mesh. Quiet, durable, and perfect for keeping hands busy during calls or meetings.</p>`,
    features: ['Classic squeeze action', 'Marble pops through mesh', 'Silent fidget option', 'Durable construction', 'Multiple colors included'],
    specifications: { 'Size': '5cm x 2cm', 'Material': 'Nylon Mesh + Glass Marble', 'Colors': 'Assorted' },
    moods: ['calm', 'focus'],
    audiences: ['all'],
    textures: ['mixed'],
    age_recommendation: '5+',
    materials: ['Nylon', 'Glass'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['mesh-marble-fidget', 'stretchy-strings', 'cj-stretchy-noodles'],
    meta_title: 'Mesh Marble Fidget | Fidget WRLD',
    meta_description: 'Classic mesh and marble fidget toy. Satisfying squeeze-and-slide action for quiet stress relief.',
  },
  {
    slug: 'cj-aluminum-infinity-cube',
    name: 'Aluminum Infinity Cube',
    tagline: 'Fold forever',
    category: 'Desk Toy',
    variants: [
      { sku: 'CJ-INF-SIL', name: 'Aluminum Infinity Cube', variant: 'Silver', color: 'Silver', colorHex: '#C0C0C0', price: 11.99, image: 'https://cf.cjdropshipping.com/infinity-cube-silver.jpg' },
      { sku: 'CJ-INF-BLK', name: 'Aluminum Infinity Cube', variant: 'Black', color: 'Black', colorHex: '#2a2a2a', price: 11.99, image: 'https://cf.cjdropshipping.com/infinity-cube-black.jpg' },
      { sku: 'CJ-INF-RBW', name: 'Aluminum Infinity Cube', variant: 'Rainbow', color: 'Rainbow', colorHex: '#ff6b6b', price: 14.99, image: 'https://cf.cjdropshipping.com/infinity-cube-rainbow.jpg' },
    ],
    default_variant_index: 0,
    description: `<p>Premium CNC-machined aluminum infinity cube with buttery-smooth hinges. Eight interconnected cubes linked by precision hinges create infinite folding possibilities.</p><p>The satisfying weight and cool metal feel make this the ultimate desk fidget. Fold endlessly in any direction for meditative stress relief.</p>`,
    features: ['CNC-machined aluminum', 'Precision steel hinges', 'Satisfying weight (95g)', 'Infinite folding motion', 'Premium anodized finish'],
    specifications: { 'Material': 'Anodized Aluminum', 'Folded Size': '4cm x 4cm x 4cm', 'Weight': '95g', 'Hinges': 'Stainless Steel' },
    moods: ['focus', 'calm'],
    audiences: ['adults', 'office'],
    textures: ['smooth'],
    age_recommendation: '8+',
    materials: ['Aluminum', 'Stainless Steel'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['infinity-cube', 'fidget-cube', 'cj-rainbow-fidget-spinner'],
    meta_title: 'Aluminum Infinity Cube | Fidget WRLD',
    meta_description: 'Premium CNC-machined aluminum infinity cube. Endless folding satisfaction for focus and stress relief.',
  },
  {
    slug: 'cj-flippy-chain',
    name: 'Flippy Chain Fidget',
    tagline: 'Flip, fold, repeat',
    category: 'Desk Toy',
    variants: [
      { sku: 'CJ-CHAIN-SIL', name: 'Flippy Chain Fidget', variant: 'Silver', color: 'Silver', colorHex: '#C0C0C0', price: 3.49, image: 'https://cf.cjdropshipping.com/flippy-chain-silver.jpg' },
      { sku: 'CJ-CHAIN-BLK', name: 'Flippy Chain Fidget', variant: 'Black', color: 'Black', colorHex: '#2a2a2a', price: 3.49, image: 'https://cf.cjdropshipping.com/flippy-chain-black.jpg' },
      { sku: 'CJ-CHAIN-RBW', name: 'Flippy Chain Fidget', variant: 'Rainbow', color: 'Rainbow', colorHex: '#ff6b6b', price: 4.49, image: 'https://cf.cjdropshipping.com/flippy-chain-rainbow.jpg' },
    ],
    default_variant_index: 0,
    description: `<p>Bike chain-style fidget toy with smooth, satisfying movement. Flip, fold, twist and roll the interconnected links for quiet desktop fidgeting.</p><p>Made from durable zinc alloy with a premium finish. Perfect for meetings, phone calls, or any time you need to keep your hands busy.</p>`,
    features: ['Smooth flipping action', 'Zinc alloy construction', 'Silent operation', 'Compact pocket size', 'Durable design'],
    specifications: { 'Material': 'Zinc Alloy', 'Size': '9cm x 3cm', 'Weight': '28g' },
    moods: ['focus', 'calm'],
    audiences: ['adults', 'office'],
    textures: ['smooth'],
    age_recommendation: '6+',
    materials: ['Zinc Alloy'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['fidget-cube', 'cj-wacky-tracks', 'cj-aluminum-infinity-cube'],
    meta_title: 'Flippy Chain Fidget | Fidget WRLD',
    meta_description: 'Bike chain-style fidget toy. Smooth flipping action for quiet, satisfying desk fidgeting.',
  },
  {
    slug: 'cj-magnetic-rings',
    name: 'Magnetic Fidget Rings',
    tagline: 'Stack, spin, amaze',
    category: 'Magnetic',
    variants: [
      { sku: 'CJ-RING-3PK', name: 'Magnetic Fidget Rings', variant: '3-Pack Silver', color: 'Silver', colorHex: '#C0C0C0', price: 6.99, image: 'https://cf.cjdropshipping.com/magnetic-rings-silver.jpg' },
      { sku: 'CJ-RING-3PK-RBW', name: 'Magnetic Fidget Rings', variant: '3-Pack Rainbow', color: 'Rainbow', colorHex: '#ff6b6b', price: 7.99, image: 'https://cf.cjdropshipping.com/magnetic-rings-rainbow.jpg' },
      { sku: 'CJ-RING-6PK', name: 'Magnetic Fidget Rings', variant: '6-Pack Mixed', color: 'Mixed', colorHex: '#4169e1', price: 12.99, image: 'https://cf.cjdropshipping.com/magnetic-rings-6pack.jpg' },
    ],
    default_variant_index: 0,
    description: `<p>Mesmerizing magnetic fidget rings that stack, spin, and perform amazing tricks. Strong neodymium magnets create satisfying connections and smooth movements.</p><p>Roll them along your fingers, stack them together, or learn impressive tricks. The possibilities are endless with these addictive magnetic rings.</p>`,
    features: ['Strong neodymium magnets', 'Smooth rolling action', 'Endless trick possibilities', 'Premium plated finish', 'Satisfying magnetic snap'],
    specifications: { 'Material': 'Neodymium Magnets', 'Ring Size': '20mm diameter', 'Weight': '40g (3-pack)' },
    moods: ['focus', 'play'],
    audiences: ['adults', 'all'],
    textures: ['smooth'],
    age_recommendation: '14+',
    materials: ['Neodymium', 'Nickel Plating'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['magnet-balls', 'magnetic-putty', 'cj-rainbow-fidget-spinner'],
    meta_title: 'Magnetic Fidget Rings | Fidget WRLD',
    meta_description: 'Mesmerizing magnetic fidget rings. Stack, spin, and perform tricks with strong neodymium magnets.',
  },
  {
    slug: 'cj-stretchy-noodles',
    name: 'Stretchy Sensory Noodles',
    tagline: 'Pull, stretch, twist',
    category: 'Stretchy',
    variants: [
      { sku: 'CJ-NOODLE-6PK', name: 'Stretchy Sensory Noodles', variant: '6-Pack Neon', price: 4.99, image: 'https://cf.cjdropshipping.com/stretchy-noodles-6.jpg' },
      { sku: 'CJ-NOODLE-12PK', name: 'Stretchy Sensory Noodles', variant: '12-Pack Rainbow', price: 7.99, image: 'https://cf.cjdropshipping.com/stretchy-noodles-12.jpg' },
      { sku: 'CJ-NOODLE-24PK', name: 'Stretchy Sensory Noodles', variant: '24-Pack Party', price: 12.99, image: 'https://cf.cjdropshipping.com/stretchy-noodles-24.jpg' },
    ],
    default_variant_index: 1,
    description: `<p>Super stretchy sensory strings that pull to over 10x their original length without breaking. Made from durable TPR material that always returns to shape.</p><p>Pull them, twist them, wrap them around your fingers - endless ways to fidget. Great for sensory play, stress relief, and tactile stimulation.</p>`,
    features: ['Stretches 10x+ length', 'Always returns to shape', 'Durable TPR material', 'Bright neon colors', 'Great for sensory play'],
    specifications: { 'Length': '18cm relaxed', 'Material': 'TPR', 'Stretch': '10x+' },
    moods: ['calm', 'play'],
    audiences: ['kids', 'all'],
    textures: ['smooth', 'soft'],
    age_recommendation: '3+',
    materials: ['TPR'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['stretchy-strings', 'cj-mesh-marble', 'cj-squishy-animals'],
    meta_title: 'Stretchy Sensory Noodles | Fidget WRLD',
    meta_description: 'Super stretchy fidget strings in neon colors. Pull, stretch, and twist for satisfying sensory play.',
  },
  {
    slug: 'cj-simple-dimple-keychain',
    name: 'Simple Dimple Keychain',
    tagline: 'Pop on the go',
    category: 'Clicky',
    variants: [
      { sku: 'CJ-DIMPLE-2B', name: 'Simple Dimple Keychain', variant: '2-Bubble', price: 2.49, image: 'https://cf.cjdropshipping.com/simple-dimple-2.jpg' },
      { sku: 'CJ-DIMPLE-3B', name: 'Simple Dimple Keychain', variant: '3-Bubble', price: 2.99, image: 'https://cf.cjdropshipping.com/simple-dimple-3.jpg' },
      { sku: 'CJ-DIMPLE-5B', name: 'Simple Dimple Keychain', variant: '5-Bubble', price: 3.99, image: 'https://cf.cjdropshipping.com/simple-dimple-5.jpg' },
    ],
    default_variant_index: 1,
    description: `<p>The pocket-sized popping companion that goes everywhere. Simple Dimple brings satisfying bubble-pop action to a compact, portable design with keychain attachment.</p><p>Each silicone bubble delivers a crisp pop with perfect resistance. Clip it to your keys, bag, or backpack for fidget breaks anywhere.</p>`,
    features: ['Ultra-portable design', 'Keychain attachment', 'Premium silicone bubbles', 'Perfect pop resistance', 'Durable ABS frame'],
    specifications: { 'Size': '6-10cm', 'Material': 'Silicone + ABS', 'Weight': '12-18g' },
    moods: ['focus', 'calm'],
    audiences: ['all'],
    textures: ['smooth'],
    age_recommendation: '3+',
    materials: ['Silicone', 'ABS'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['simple-dimple', 'cj-pop-it-sensory', 'pop-it-rainbow'],
    meta_title: 'Simple Dimple Keychain | Fidget WRLD',
    meta_description: 'Portable bubble-pop fidget keychain. Perfect for pockets, bags, and on-the-go fidgeting.',
  },
  {
    slug: 'cj-wacky-tracks',
    name: 'Wacky Tracks Snap Links',
    tagline: 'Snap, click, create',
    category: 'Clicky',
    variants: [
      { sku: 'CJ-WACKY-1PK', name: 'Wacky Tracks Snap Links', variant: 'Single', price: 2.99, image: 'https://cf.cjdropshipping.com/wacky-tracks-single.jpg' },
      { sku: 'CJ-WACKY-3PK', name: 'Wacky Tracks Snap Links', variant: '3-Pack', price: 6.99, image: 'https://cf.cjdropshipping.com/wacky-tracks-3pack.jpg' },
      { sku: 'CJ-WACKY-6PK', name: 'Wacky Tracks Snap Links', variant: '6-Pack Party', price: 11.99, image: 'https://cf.cjdropshipping.com/wacky-tracks-6pack.jpg' },
    ],
    default_variant_index: 1,
    description: `<p>Snap and click fidget links that bend into any shape you can imagine. Each segment clicks satisfyingly as you twist and turn the chain.</p><p>Connect multiple tracks together for longer creations. Great for fidgeting, building, and keeping hands busy with satisfying snap sounds.</p>`,
    features: ['Satisfying snap sound', 'Bends any direction', 'Connect multiple tracks', 'Durable ABS plastic', 'Bright colors'],
    specifications: { 'Material': 'ABS Plastic', 'Links per Track': '24', 'Weight': '22g each' },
    moods: ['play', 'focus'],
    audiences: ['kids', 'all'],
    textures: ['smooth'],
    age_recommendation: '3+',
    materials: ['ABS'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['cj-flippy-chain', 'fidget-cube', 'cj-tangle-fidget'],
    meta_title: 'Wacky Tracks Snap Links | Fidget WRLD',
    meta_description: 'Snap and click fidget links. Bend into any shape with satisfying snap sounds.',
  },
  {
    slug: 'cj-tangle-fidget',
    name: 'Tangle Fidget Toy',
    tagline: 'Twist and turn',
    category: 'Desk Toy',
    variants: [
      { sku: 'CJ-TANGLE-TEX', name: 'Tangle Fidget Toy', variant: 'Textured', price: 4.99, image: 'https://cf.cjdropshipping.com/tangle-textured.jpg' },
      { sku: 'CJ-TANGLE-MET', name: 'Tangle Fidget Toy', variant: 'Metallic', price: 5.99, image: 'https://cf.cjdropshipping.com/tangle-metallic.jpg' },
      { sku: 'CJ-TANGLE-GLO', name: 'Tangle Fidget Toy', variant: 'Glow in Dark', price: 5.99, image: 'https://cf.cjdropshipping.com/tangle-glow.jpg' },
    ],
    default_variant_index: 0,
    description: `<p>Interconnected curved sections that twist, turn, and coil in endless combinations. The unique shape provides tactile stimulation while keeping your hands busy.</p><p>Available in textured, metallic, and glow-in-the-dark versions. Perfect for desk fidgeting, therapy, or sensory exploration.</p>`,
    features: ['Endless twisting motion', 'Textured surface options', 'Interconnected sections', 'Quiet operation', 'Therapeutic fidgeting'],
    specifications: { 'Material': 'ABS Plastic', 'Sections': '18 connected pieces', 'Weight': '30g' },
    moods: ['focus', 'calm'],
    audiences: ['all'],
    textures: ['mixed', 'bumpy'],
    age_recommendation: '3+',
    materials: ['ABS'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['cj-wacky-tracks', 'cj-flippy-chain', 'fidget-cube'],
    meta_title: 'Tangle Fidget Toy | Fidget WRLD',
    meta_description: 'Twist and turn tangle fidget toy. Interconnected sections for endless tactile fidgeting.',
  },
];

async function syncProducts() {
  console.log('Syncing CJ Dropshipping products to Supabase...\n');

  let added = 0;
  let skipped = 0;
  let errors = 0;

  for (const product of cjProducts) {
    // Check if product already exists
    const { data: existing } = await supabase
      .from('products')
      .select('slug')
      .eq('slug', product.slug)
      .single();

    if (existing) {
      console.log(`⏭️  Skipped (exists): ${product.name}`);
      skipped++;
      continue;
    }

    // Insert the product
    const { error } = await supabase.from('products').insert(product);

    if (error) {
      console.error(`❌ Error adding ${product.name}:`, error.message);
      errors++;
    } else {
      console.log(`✅ Added: ${product.name}`);
      added++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Sync complete: ${added} added, ${skipped} skipped, ${errors} errors`);
  console.log('='.repeat(50));
}

syncProducts().catch(console.error);
