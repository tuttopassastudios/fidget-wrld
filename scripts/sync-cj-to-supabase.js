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
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const REVALIDATE_SECRET = process.env.AGE_GATE_SECRET;

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
      { sku: 'CJ-SPIN-KEY-BLK', name: 'Fidget Spinner Keychain', variant: 'Black', color: 'Black', colorHex: '#2a2a2a', price: 5.99, inventory: 0, image: 'https://cf.cjdropshipping.com/5ba37cad-57a1-4705-b527-b868eee90280.jpg' },
      { sku: 'CJ-SPIN-KEY-RED', name: 'Fidget Spinner Keychain', variant: 'Red', color: 'Red', colorHex: '#DC143C', price: 5.99, inventory: 0, image: 'https://cf.cjdropshipping.com/f2d24da0-b5ea-43e7-a729-c9c87911a666.jpg' },
      { sku: 'CJ-SPIN-KEY-WHT', name: 'Fidget Spinner Keychain', variant: 'White', color: 'White', colorHex: '#FFFFFF', price: 5.99, inventory: 0, image: 'https://cf.cjdropshipping.com/44c7f08a-3f87-4686-8db8-1bb8a8627e11.jpg' },
      { sku: 'CJ-SPIN-KEY-GRN', name: 'Fidget Spinner Keychain', variant: 'Glow Green', color: 'Green', colorHex: '#32CD32', price: 6.99, inventory: 0, image: 'https://cf.cjdropshipping.com/d174c68a-f724-43d6-a451-965d13ea4e4e.jpg' },
      { sku: 'CJ-SPIN-KEY-BLU', name: 'Fidget Spinner Keychain', variant: 'Glow Blue', color: 'Blue', colorHex: '#1E90FF', price: 6.99, inventory: 0, image: 'https://cf.cjdropshipping.com/291de2f2-5387-4df8-b862-c1e593aeba4b.jpg' },
    ],
    is_out_of_stock: true,
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
      { sku: 'CJ-ALLOY-SPIN-RBW', name: 'Rainbow Alloy Fidget Spinner', variant: 'Rainbow 6-Axis', color: 'Rainbow', colorHex: '#ff6b6b', price: 4.99, inventory: 0, image: 'https://cf.cjdropshipping.com/quick/product/8dcda08d-587f-4ce2-8c2a-6c32ef805736.jpg' },
    ],
    is_out_of_stock: true,
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
      { sku: 'CJ-POPCORN-SQU', name: 'Popcorn Cup Squishy', variant: 'Classic', price: 9.99, inventory: 0, image: 'https://cf.cjdropshipping.com/15204672/1093995935640.png' },
    ],
    is_out_of_stock: true,
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
      { sku: 'CJ-FERRO-YLW', name: 'Dancing Ferrofluid Speaker', variant: 'Yellow', color: 'Yellow', colorHex: '#FFD700', price: 149.99, inventory: 0, image: 'https://cf.cjdropshipping.com/quick/product/816355c6-0da3-43e7-89e0-09f28b925818.jpg' },
      { sku: 'CJ-FERRO-GRY', name: 'Dancing Ferrofluid Speaker', variant: 'Gray', color: 'Gray', colorHex: '#808080', price: 149.99, inventory: 0, image: 'https://cf.cjdropshipping.com/quick/product/f466ca43-21d0-4430-8f66-81703ca29e5e.jpg' },
    ],
    is_out_of_stock: true,
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
      { sku: 'CJ-WALL-BALL-4PK', name: 'Sticky Wall Ball', variant: '4-Pack Rainbow', price: 5.99, inventory: 0, image: 'https://cf.cjdropshipping.com/2044/18607719711932.png' },
      { sku: 'CJ-WALL-BALL-GLOW4', name: 'Sticky Wall Ball', variant: '4-Pack Glow', price: 6.99, inventory: 0, image: 'https://cf.cjdropshipping.com/2054/4786525385188.png' },
      { sku: 'CJ-WALL-BALL-BLU', name: 'Sticky Wall Ball', variant: 'Blue LED', color: 'Blue', colorHex: '#1E90FF', price: 2.99, inventory: 0, image: 'https://cf.cjdropshipping.com/203104/1350329882.jpg' },
      { sku: 'CJ-WALL-BALL-GRN', name: 'Sticky Wall Ball', variant: 'Green LED', color: 'Green', colorHex: '#32CD32', price: 2.99, inventory: 0, image: 'https://cf.cjdropshipping.com/203104/2589223855002.jpg' },
      { sku: 'CJ-WALL-BALL-RED', name: 'Sticky Wall Ball', variant: 'Red LED', color: 'Red', colorHex: '#DC143C', price: 2.99, inventory: 0, image: 'https://cf.cjdropshipping.com/203104/488402365204.jpg' },
      { sku: 'CJ-WALL-BALL-8PK', name: 'Sticky Wall Ball', variant: '8-Pack LED', price: 9.99, inventory: 0, image: 'https://cf.cjdropshipping.com/2054/5811979488440.jpg' },
    ],
    is_out_of_stock: true,
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
      { sku: 'CJ-RING-BUTTERFLY', name: 'Fidget Anxiety Ring', variant: 'Butterfly', color: 'Gold', colorHex: '#D4AF37', price: 6.99, inventory: 0, image: 'https://cf.cjdropshipping.com/d84460a0-748b-46b1-ae82-3d9a5588ac24.jpg' },
      { sku: 'CJ-RING-BAND', name: 'Fidget Anxiety Ring', variant: 'Simple Band', color: 'Silver', colorHex: '#C0C0C0', price: 4.99, inventory: 0, image: 'https://cf.cjdropshipping.com/ff1d0b0f-be2a-44b6-9a3f-9f7c74958451.jpg' },
      { sku: 'CJ-RING-FLOWER', name: 'Fidget Anxiety Ring', variant: 'Flower', color: 'Rose Gold', colorHex: '#B76E79', price: 4.99, inventory: 0, image: 'https://cf.cjdropshipping.com/1783d3bb-70f4-4438-9fc4-d821593cc3b5.jpg' },
      { sku: 'CJ-RING-STAR', name: 'Fidget Anxiety Ring', variant: 'Star', color: 'Gold', colorHex: '#FFD700', price: 6.99, inventory: 0, image: 'https://cf.cjdropshipping.com/4c6225df-830c-4259-b8cc-cdb2ec298c78.jpg' },
      { sku: 'CJ-RING-HEART', name: 'Fidget Anxiety Ring', variant: 'Heart', color: 'Silver', colorHex: '#C0C0C0', price: 4.99, inventory: 0, image: 'https://cf.cjdropshipping.com/58ec2f49-0ad1-4c26-8ce2-d64e2c96e71d.jpg' },
      { sku: 'CJ-RING-MOON', name: 'Fidget Anxiety Ring', variant: 'Moon & Stars', color: 'Gold', colorHex: '#D4AF37', price: 4.99, inventory: 0, image: 'https://cf.cjdropshipping.com/31d2b043-00ce-4785-8b80-c10d8c06d408.jpg' },
      { sku: 'CJ-RING-WAVE', name: 'Fidget Anxiety Ring', variant: 'Wave', color: 'Silver', colorHex: '#C0C0C0', price: 4.99, inventory: 0, image: 'https://cf.cjdropshipping.com/ae0a37d6-214b-4d97-b4ed-245b6027bb83.jpg' },
    ],
    is_out_of_stock: true,
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
      { sku: 'CJ-HEART-RING-5', name: 'Heart Spinner Ring', variant: 'Size 5', price: 4.99, inventory: 0, image: 'https://cf.cjdropshipping.com/quick/product/b14f01c3-5fa9-4a92-a076-108edd15c9da.jpg' },
      { sku: 'CJ-HEART-RING-6', name: 'Heart Spinner Ring', variant: 'Size 6', price: 4.99, inventory: 0, image: 'https://cf.cjdropshipping.com/quick/product/b14f01c3-5fa9-4a92-a076-108edd15c9da.jpg' },
      { sku: 'CJ-HEART-RING-7', name: 'Heart Spinner Ring', variant: 'Size 7', price: 4.99, inventory: 0, image: 'https://cf.cjdropshipping.com/quick/product/b14f01c3-5fa9-4a92-a076-108edd15c9da.jpg' },
      { sku: 'CJ-HEART-RING-8', name: 'Heart Spinner Ring', variant: 'Size 8', price: 4.99, inventory: 0, image: 'https://cf.cjdropshipping.com/quick/product/b14f01c3-5fa9-4a92-a076-108edd15c9da.jpg' },
      { sku: 'CJ-HEART-RING-9', name: 'Heart Spinner Ring', variant: 'Size 9', price: 4.99, inventory: 0, image: 'https://cf.cjdropshipping.com/quick/product/b14f01c3-5fa9-4a92-a076-108edd15c9da.jpg' },
      { sku: 'CJ-HEART-RING-10', name: 'Heart Spinner Ring', variant: 'Size 10', price: 4.99, inventory: 0, image: 'https://cf.cjdropshipping.com/quick/product/b14f01c3-5fa9-4a92-a076-108edd15c9da.jpg' },
      { sku: 'CJ-HEART-RING-11', name: 'Heart Spinner Ring', variant: 'Size 11', price: 4.99, inventory: 0, image: 'https://cf.cjdropshipping.com/quick/product/b14f01c3-5fa9-4a92-a076-108edd15c9da.jpg' },
    ],
    is_out_of_stock: true,
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
  // Product 8: Magic Sand (CJ PID: FC3E917A-0094-45D1-B80E-053F7EFFDBE5)
  {
    slug: 'cj-magic-sand',
    name: 'Magic Sand',
    tagline: 'Sculpt, mold, and play',
    category: 'Squishy',
    variants: [
      { sku: 'CJ-SAND-PINK', name: 'Magic Sand', variant: 'Pink', color: 'Pink', colorHex: '#FF69B4', price: 2.99, image: 'https://cf.cjdropshipping.com/20190803/2446172977195.jpg' },
      { sku: 'CJ-SAND-PURPLE', name: 'Magic Sand', variant: 'Purple', color: 'Purple', colorHex: '#8A2BE2', price: 2.99, image: 'https://cf.cjdropshipping.com/20190803/38729033035632.jpg' },
      { sku: 'CJ-SAND-BLUE', name: 'Magic Sand', variant: 'Blue', color: 'Blue', colorHex: '#1E90FF', price: 2.99, inventory: 0, image: 'https://cf.cjdropshipping.com/20190803/196979096855.jpg' },
      { sku: 'CJ-SAND-RED', name: 'Magic Sand', variant: 'Red', color: 'Red', colorHex: '#DC143C', price: 2.99, image: 'https://cf.cjdropshipping.com/20190803/1572400752072.jpg' },
      { sku: 'CJ-SAND-ORANGE', name: 'Magic Sand', variant: 'Orange', color: 'Orange', colorHex: '#FF8C00', price: 2.99, image: 'https://cf.cjdropshipping.com/15647616/1567367686041.jpg' },
      { sku: 'CJ-SAND-YELLOW', name: 'Magic Sand', variant: 'Yellow', color: 'Yellow', colorHex: '#FFD700', price: 2.99, image: 'https://cf.cjdropshipping.com/20190803/810830999777.jpg' },
      { sku: 'CJ-SAND-4PACK', name: 'Magic Sand', variant: '4-Pack', price: 9.99, inventory: 0, image: 'https://cf.cjdropshipping.com/4386ae6c-5fd4-4052-b37a-0c228b9dea3a.jpg' },
    ],
    default_variant_index: 0,
    description: '<p>Experience the magic of hydrophobic sand that never gets wet! This amazing Mars Space Sand can be molded, sculpted, and shaped into endless creations, then breaks apart with a satisfying texture.</p><p>Non-toxic and safe for kids, this educational toy promotes creativity, fine motor skills, and sensory play. Unlike regular sand, it stays dry even underwater and cleans up easily without mess.</p>',
    features: ['Hydrophobic - stays dry underwater', 'Non-toxic and safe for kids', 'Moldable and sculptable', 'Easy cleanup - no mess', 'Promotes creativity and fine motor skills'],
    specifications: { 'Material': 'Hydrophobic Sand', 'Weight': '200g per pack', 'Type': 'Sensory / Educational Toy', 'Safety': 'Non-toxic' },
    moods: ['play', 'calm', 'focus'],
    audiences: ['kids', 'all'],
    textures: ['soft', 'mixed'],
    age_recommendation: '3+',
    materials: ['Hydrophobic Sand'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['cj-popcorn-squishy', 'stress-ball-set', 'cj-sticky-wall-ball'],
    meta_title: 'Magic Sand | Fidget WRLD',
    meta_description: 'Hydrophobic magic sand that never gets wet. Non-toxic, moldable sensory toy for creative play. Available in 6 colors.',
  },
  // Product 9: Magnetic Putty (CJ PID: 97C637BB-DB86-49D1-9B55-E94F6A46D2A6)
  {
    slug: 'cj-magnetic-putty',
    name: 'Magnetic Putty',
    tagline: 'Mesmerizing magnetic magic',
    category: 'Magnetic',
    variants: [
      { sku: 'CJ-MAGPUTTY-BLK', name: 'Magnetic Putty', variant: 'Black', color: 'Black', colorHex: '#2a2a2a', price: 3.99, inventory: 0, image: 'https://cf.cjdropshipping.com/15144192/1945421527452.png' },
      { sku: 'CJ-MAGPUTTY-BLU', name: 'Magnetic Putty', variant: 'Blue', color: 'Blue', colorHex: '#1E90FF', price: 3.99, inventory: 0, image: 'https://cf.cjdropshipping.com/15144192/550769235177.png' },
      { sku: 'CJ-MAGPUTTY-ORG', name: 'Magnetic Putty', variant: 'Orange', color: 'Orange', colorHex: '#FF8C00', price: 3.99, image: 'https://cf.cjdropshipping.com/15144192/11754451409688.png' },
      { sku: 'CJ-MAGPUTTY-GRN', name: 'Magnetic Putty', variant: 'Green', color: 'Green', colorHex: '#32CD32', price: 3.99, image: 'https://cf.cjdropshipping.com/15144192/577122354972.png' },
      { sku: 'CJ-MAGPUTTY-PNK', name: 'Magnetic Putty', variant: 'Pink', color: 'Pink', colorHex: '#FF69B4', price: 3.99, image: 'https://cf.cjdropshipping.com/15144192/1488641220192.png' },
      { sku: 'CJ-MAGPUTTY-SLV', name: 'Magnetic Putty', variant: 'Silver', color: 'Silver', colorHex: '#C0C0C0', price: 3.99, image: 'https://cf.cjdropshipping.com/15144192/765565698135.png' },
      { sku: 'CJ-MAGPUTTY-6PK', name: 'Magnetic Putty', variant: '6-Pack', price: 14.99, inventory: 0, image: 'https://cf.cjdropshipping.com/15144192/2977873394650.png' },
    ],
    default_variant_index: 2,
    description: '<p>Watch in amazement as this incredible magnetic putty comes alive! Place a magnet nearby and watch the putty slowly engulf it, creating mesmerizing tendrils and shapes as it responds to the magnetic field.</p><p>Perfect for stress relief and ASMR-style relaxation. The putty is soft, pliable, and endlessly entertaining. Great for desk fidgeting, science demonstrations, or just mesmerizing fun.</p>',
    features: ['Responds to magnetic fields', 'Soft and pliable texture', 'Mesmerizing ASMR-style movement', 'Great for stress relief', 'Includes strong magnet'],
    specifications: { 'Material': 'Magnetic Putty Compound', 'Weight': '50g per tin', 'Includes': 'Putty + Magnet', 'Type': 'Magnetic Fidget Toy' },
    moods: ['calm', 'focus', 'play'],
    audiences: ['adults', 'kids', 'office'],
    textures: ['soft', 'smooth'],
    age_recommendation: '8+',
    materials: ['Magnetic Putty', 'Iron Particles'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['magnet-balls', 'cj-ferrofluid-speaker', 'cj-magic-sand'],
    meta_title: 'Magnetic Putty | Fidget WRLD',
    meta_description: 'Mesmerizing magnetic putty that swallows magnets. Watch it come alive with incredible magnetic effects. Perfect stress relief fidget toy.',
  },
  // Product 10: Sensory Twist Stick (CJ PID: 1968510332013142017)
  {
    slug: 'cj-sensory-twist-stick',
    name: 'Sensory Twist Stick',
    tagline: 'Bend it, twist it, feel it',
    category: 'Clicky',
    variants: [
      { sku: 'CJ-TWIST-STICK', name: 'Sensory Twist Stick', variant: 'Default', price: 28.99, inventory: 667, image: 'https://cf.cjdropshipping.com/6644ab24-b26c-4c1c-9e15-05269ffadeb1.png' },
    ],
    default_variant_index: 0,
    description: '<p>The Sensory Twist Stick is the satisfying decompression toy you didn\'t know you needed. Twist it, bend it, and flex it in endless configurations — each movement delivers tactile feedback that melts stress away.</p><p>Compact enough for a desk, backpack, or pocket, this stick is perfect for keeping hands busy during meetings, studying, or any time anxiety creeps in. The smooth resistance of each twist is endlessly repeatable and never gets old.</p>',
    features: ['Satisfying twist and flex resistance', 'Compact — fits in pocket or bag', 'Quiet and desk-friendly', 'Endless configurations to explore', 'Ships from US warehouse — fast delivery'],
    specifications: { 'Weight': '104g', 'Type': 'Decompression Twist Stick', 'SKU': 'CJYZ2533527' },
    moods: ['calm', 'focus'],
    audiences: ['adults', 'kids', 'office'],
    textures: ['smooth'],
    age_recommendation: '6+',
    materials: ['Plastic'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['cj-magic-sand', 'cj-magnetic-putty', 'fidget-cube'],
    meta_title: 'Sensory Twist Stick | Fidget WRLD',
    meta_description: 'Bend, twist, and flex your stress away with the Sensory Twist Stick. 667 units in US warehouse — fast shipping.',
  },
  // Product 11: Crystal Mud Slime (CJ PID: 76FABA4F-4632-40A3-834E-B3986701A663)
  {
    slug: 'cj-crystal-slime',
    name: 'Crystal Mud Slime',
    tagline: 'Stretch it, squish it, zone out',
    category: 'Squishy',
    variants: [
      { sku: 'CJ-SLIME-BLGRN', name: 'Crystal Mud Slime', variant: 'Blue/Green', color: 'Blue/Green', colorHex: '#00CED1', price: 4.99, inventory: 95, image: 'https://cf.cjdropshipping.com/15465312/743928183936.jpg' },
      { sku: 'CJ-SLIME-BLPNK', name: 'Crystal Mud Slime', variant: 'Blue/Pink', color: 'Blue/Pink', colorHex: '#FF69B4', price: 4.99, inventory: 91, image: 'https://cf.cjdropshipping.com/15465312/1055366378112.jpg' },
      { sku: 'CJ-SLIME-BLPUR', name: 'Crystal Mud Slime', variant: 'Blue/Purple', color: 'Blue/Purple', colorHex: '#8A2BE2', price: 4.99, inventory: 76, image: 'https://cf.cjdropshipping.com/15465312/2090230617046.jpg' },
    ],
    default_variant_index: 0,
    description: '<p>Lose yourself in the mesmerizing gradient swirls of our Crystal Mud Slime. This ultra-clear crystal slime stretches, squishes, and flows in ways that are deeply satisfying to watch and feel.</p><p>The two-tone gradient creates a hypnotic color blend as you play. Each 60ml jar is the perfect desk companion — pop it open, stretch a strand, and feel the stress disappear. Non-sticky, non-toxic, and endlessly re-playable.</p>',
    features: ['Stunning gradient two-tone color swirls', 'Ultra-clear crystal texture', 'Non-sticky and non-toxic formula', '60ml jar — perfect desk size', 'Ships from US warehouse — fast delivery'],
    specifications: { 'Volume': '60ml per jar', 'Weight': '37–110g', 'Type': 'Crystal Mud Slime', 'Safety': 'Non-toxic' },
    moods: ['calm', 'play'],
    audiences: ['kids', 'adults'],
    textures: ['soft', 'smooth'],
    age_recommendation: '6+',
    materials: ['Crystal Mud'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['cj-magic-sand', 'cj-magnetic-putty', 'stress-ball-set'],
    meta_title: 'Crystal Mud Slime | Fidget WRLD',
    meta_description: 'Two-tone gradient crystal mud slime — stretch it, squish it, zone out. Non-toxic 60ml jar ships from US warehouse.',
  },
  // Product 12: Cotton Cloud Slime (CJ PID: 1399935069627486208)
  {
    slug: 'cj-cotton-slime',
    name: 'Cotton Cloud Slime',
    tagline: 'Soft as a cloud, satisfying as ever',
    category: 'Squishy',
    variants: [
      { sku: 'CJ-COTTON-SLIME-BLU', name: 'Cotton Cloud Slime', variant: 'Blue', color: 'Blue', colorHex: '#1E90FF', price: 4.99, inventory: 102, image: 'https://cf.cjdropshipping.com/ff0e4e07-3c4d-42b9-94a3-7ae196f2cd32.jpg' },
      { sku: 'CJ-COTTON-SLIME-PKB', name: 'Cotton Cloud Slime', variant: 'Pink and Blue', color: 'Pink/Blue', colorHex: '#FF69B4', price: 4.99, inventory: 41, image: 'https://cf.cjdropshipping.com/d7d1afbf-b257-469f-bb24-d792d3ca5ba2.jpg' },
    ],
    default_variant_index: 0,
    description: '<p>Fluffy, stretchy, and impossibly soft — our Cotton Cloud Slime has the lightest, most satisfying texture of any slime you\'ve tried. Poke it, pull it, and watch it slowly spring back like a real cloud.</p><p>The three-color swirl design creates a mesmerizing visual as you play. Non-sticky and non-toxic, it\'s the perfect sensory toy for kids and adults who need a calm, satisfying outlet for restless hands.</p>',
    features: ['Ultra-fluffy cotton cloud texture', 'Three-color swirl design', 'Slow-rise, satisfying spring-back', 'Non-sticky and non-toxic', 'Ships from US warehouse — fast delivery'],
    specifications: { 'Weight': '100g', 'Type': 'Cotton Cloud Slime', 'Safety': 'Non-toxic' },
    moods: ['calm', 'play'],
    audiences: ['kids', 'adults'],
    textures: ['soft'],
    age_recommendation: '6+',
    materials: ['Cotton Slime'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['cj-crystal-slime', 'cj-magic-sand', 'stress-ball-set'],
    meta_title: 'Cotton Cloud Slime | Fidget WRLD',
    meta_description: 'Ultra-fluffy three-color cotton cloud slime — poke it, stretch it, feel the stress melt away. Ships from US warehouse.',
  },
  // Product 13: Giant Goose Pillow (CJ PID: 2406100313121600000)
  {
    slug: 'cj-goose-pillow',
    name: 'Giant Goose Pillow',
    tagline: 'Squeeze it, hug it, squish it',
    category: 'Squishy',
    variants: [
      { sku: 'CJ-GOOSE-190', name: 'Giant Goose Pillow', variant: '190cm', price: 22.99, inventory: 83, image: 'https://cf.cjdropshipping.com/quick/product/c78d27e9-d9c6-4f5b-bdfc-95f8afc2e00c.jpg' },
    ],
    default_variant_index: 0,
    description: '<p>Meet the ultimate comfort companion — a giant 190cm goose plushie that doubles as a squishy stress toy. Soft enough to squish, big enough to hug, and satisfying enough to keep your hands busy all day.</p><p>The oversized plush body is filled with ultra-soft PP cotton for a pillowy, squeeze-able feel. Works as a body pillow, seat cushion, or just a giant friend to flop onto when stress hits.</p>',
    features: ['Massive 190cm size — bigger than you', 'Ultra-soft PP cotton fill', 'Satisfying squish and hug texture', 'Works as a body pillow or seat cushion', 'Ships from US warehouse — fast delivery'],
    specifications: { 'Size': '190cm (75 inches)', 'Fill': 'PP Cotton', 'Color': 'White', 'Weight': '~1900g' },
    moods: ['calm', 'play'],
    audiences: ['kids', 'adults'],
    textures: ['soft'],
    age_recommendation: '3+',
    materials: ['Plush', 'PP Cotton'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: ['cj-magic-sand', 'cj-magnetic-putty', 'stress-ball-set'],
    meta_title: 'Giant Goose Pillow | Fidget WRLD',
    meta_description: 'Giant 190cm goose plush pillow — squeeze it, hug it, squish it. Oversized stress-relief plushie ships from US warehouse.',
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

  // Step 3: Bust the Next.js products cache
  if (SITE_URL && REVALIDATE_SECRET) {
    console.log('\n📦 Step 3: Busting Next.js products cache...\n');
    try {
      const res = await fetch(`${SITE_URL}/api/revalidate/products?token=${encodeURIComponent(REVALIDATE_SECRET)}`, {
        method: 'POST',
      });
      const json = await res.json();
      if (res.ok) {
        console.log('   ✅ Cache revalidated successfully');
      } else {
        console.log(`   ⚠️  Cache revalidation failed: ${JSON.stringify(json)}`);
      }
    } catch (err) {
      console.log(`   ⚠️  Cache revalidation request failed: ${err.message}`);
    }
  } else {
    console.log('\n⚠️  Cache NOT revalidated — set NEXT_PUBLIC_SITE_URL and AGE_GATE_SECRET in .env.local to auto-bust cache after sync.');
  }
}

syncProducts().catch(console.error);
