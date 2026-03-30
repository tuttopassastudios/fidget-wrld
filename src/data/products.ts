import type { ProductPage, ProductVariant, BulkTier, ProductCategory } from '@/types';

export const bulkTiers: BulkTier[] = [
  { qty: 3, discount: 10, label: '10% off' },
  { qty: 5, discount: 15, label: '15% off' },
  { qty: 10, discount: 20, label: '20% off' },
];

export const productPages: ProductPage[] = [
  // ========== MAGNETIC ==========
  {
    slug: 'magnet-balls',
    name: 'Magnet Balls',
    tagline: 'The ultimate desk toy experience',
    category: 'Magnetic',
    variants: [
      { sku: 'FW-MAG-216-RED', name: 'Magnet Balls', variant: 'Red', color: 'Red', colorHex: '#8B0000', price: 24.99, image: 'https://jzfesgxooirrjsnluphz.supabase.co/storage/v1/object/public/products/mag-balls-red.png' },
      { sku: 'FW-MAG-216-BLU', name: 'Magnet Balls', variant: 'Blue', color: 'Blue', colorHex: '#1E90FF', price: 24.99, image: 'https://jzfesgxooirrjsnluphz.supabase.co/storage/v1/object/public/products/mag-balls-blue.png' },
      { sku: 'FW-MAG-216-GLD', name: 'Magnet Balls', variant: 'Gold', color: 'Gold', colorHex: '#FFD700', price: 24.99, image: 'https://jzfesgxooirrjsnluphz.supabase.co/storage/v1/object/public/products/mag-balls-gold.png' },
      { sku: 'FW-MAG-216-SIL', name: 'Magnet Balls', variant: 'Silver', color: 'Silver', colorHex: '#C0C0C0', price: 24.99, image: 'https://jzfesgxooirrjsnluphz.supabase.co/storage/v1/object/public/products/mag-balls-silver.png' },
    ],
    defaultVariantIndex: 0,
    description: `<p>Experience the mesmerizing world of magnetic sculpture with our premium N52 neodymium magnetic balls. These ultra-strong rare earth magnets snap together with satisfying precision, allowing you to create endless 3D shapes, patterns, and sculptures.</p>
<p>Each 5mm sphere features a precision-machined surface with a triple-layer nickel-copper-nickel coating for durability and a smooth, premium feel. The N52 grade delivers maximum magnetic strength for secure connections and complex builds.</p>`,
    features: [
      'N52 grade neodymium - strongest available',
      'Triple-layer Ni-Cu-Ni coating',
      '5mm precision spheres',
      'Includes metal storage tin',
      'Endless creative possibilities',
    ],
    specifications: {
      'Magnet Grade': 'N52 (Strongest)',
      'Sphere Diameter': '5mm',
      'Coating': 'Nickel-Copper-Nickel',
      'Pull Force': '~0.9 lbs per sphere',
      'Material': 'NdFeB (Neodymium Iron Boron)',
    },
    moods: ['focus', 'calm', 'play'],
    audiences: ['adults', 'office'],
    textures: ['smooth'],
    ageRecommendation: '14+',
    materials: ['Neodymium', 'Nickel', 'Copper'],
    dimensions: 'Tin: 60mm x 60mm x 30mm',
    weight: '216pc: 185g',
    isBestseller: true,
    relatedSlugs: ['magnetic-putty', 'infinity-cube', 'fidget-cube'],
    metaTitle: 'Magnet Balls | Premium Desk Toy',
    metaDescription: 'Ultra-strong N52 neodymium magnet balls for creative desk sculptures. Available in silver, gold, black, red, and rainbow.',
  },
  {
    slug: 'magnetic-putty',
    name: 'Magnetic Putty',
    tagline: 'Watch it come alive',
    category: 'Magnetic',
    variants: [
      { sku: 'FW-MPUT-SIL', name: 'Magnetic Putty', variant: 'Silver', color: 'Silver', colorHex: '#8a8a8a', price: 14.99, image: '/images/products/mag-putty-silver.webp' },
      { sku: 'FW-MPUT-GLD', name: 'Magnetic Putty', variant: 'Gold', color: 'Gold', colorHex: '#b8860b', price: 14.99, image: '/images/products/mag-putty-gold.webp' },
      { sku: 'FW-MPUT-BLU', name: 'Magnetic Putty', variant: 'Blue Galaxy', color: 'Blue', colorHex: '#1e3a5f', price: 16.99, image: '/images/products/mag-putty-blue.webp' },
    ],
    defaultVariantIndex: 0,
    description: `<p>Magnetic Putty takes the classic stretchy putty experience to a whole new level. Infused with millions of micron-sized iron particles, this mesmerizing putty comes alive in the presence of a magnet.</p>
<p>Watch in amazement as the putty reaches out, engulfs, and swallows the included neodymium magnet. Stretch it, bounce it, snap it, or let it slowly devour metal objects for hours of hypnotic entertainment.</p>`,
    features: [
      'Responds to magnets',
      'Includes strong neodymium magnet',
      'Stretches, bounces, and snaps',
      'Hypnotic slow-flow movement',
      'Comes in resealable tin',
    ],
    specifications: {
      'Weight': '80g',
      'Includes': 'Putty + N52 Cube Magnet',
      'Container': 'Metal Tin',
    },
    moods: ['calm', 'focus'],
    audiences: ['adults', 'office', 'kids'],
    textures: ['soft', 'smooth'],
    ageRecommendation: '8+',
    materials: ['Silicone', 'Iron Particles'],
    isNew: true,
    relatedSlugs: ['magnet-balls', 'stress-ball-set'],
    metaTitle: 'Magnetic Putty | Mesmerizing Desk Toy',
    metaDescription: 'Watch magnetic putty come alive and engulf magnets. Hypnotic stress relief for your desk.',
  },

  // ========== SQUISHY ==========
  {
    slug: 'stress-ball-set',
    name: 'Ice Cube Stress Ball',
    tagline: 'Squeeze away the stress',
    category: 'Squishy',
    variants: [
      { sku: 'FW-STRESS-4PK', name: 'Ice Cube Stress Ball', variant: '4-Pack', price: 14.99, image: 'https://jzfesgxooirrjsnluphz.supabase.co/storage/v1/object/public/products/ice-cube-stress-ball.png' },
    ],
    defaultVariantIndex: 0,
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
    moods: ['calm', 'focus'],
    audiences: ['all'],
    textures: ['soft', 'smooth'],
    ageRecommendation: '3+',
    materials: ['TPR'],
    isBestseller: true,
    relatedSlugs: ['squishy-animals', 'pop-it-rainbow'],
    metaTitle: 'Ice Cube Stress Ball | Squeeze Toys',
    metaDescription: 'Unique ice cube shaped stress balls. Perfect for stress relief, focus, and hand exercises.',
  },
  {
    slug: 'squishy-animals',
    name: 'Squishy Animals',
    tagline: 'Adorable & squeezable',
    category: 'Squishy',
    variants: [
      { sku: 'FW-SQSH-CAT', name: 'Squishy Animal', variant: 'Cat', price: 8.99, image: '/images/products/squishy-cat.webp' },
      { sku: 'FW-SQSH-PANDA', name: 'Squishy Animal', variant: 'Panda', price: 8.99, image: '/images/products/squishy-panda.webp' },
      { sku: 'FW-SQSH-BUNNY', name: 'Squishy Animal', variant: 'Bunny', price: 8.99, image: '/images/products/squishy-bunny.webp' },
      { sku: 'FW-SQSH-5PK', name: 'Squishy Animals', variant: '5-Pack Random', price: 29.99, image: '/images/products/squishy-5pack.webp' },
    ],
    defaultVariantIndex: 0,
    description: `<p>These adorable slow-rising squishy animals are impossibly soft and satisfying to squeeze. Made from premium memory foam material, they slowly return to their original shape after each squeeze.</p>
<p>Each squishy features cute painted details and a light scent. Perfect for stress relief, sensory play, or just as an adorable desk companion.</p>`,
    features: [
      'Ultra-slow rise foam',
      'Soft scented material',
      'Hand-painted details',
      'Perfect desk size',
      'Incredibly soft texture',
    ],
    specifications: {
      'Size': '8-12cm',
      'Material': 'PU Foam',
      'Rise Time': '5-8 seconds',
    },
    moods: ['calm', 'play'],
    audiences: ['kids', 'all'],
    textures: ['soft'],
    ageRecommendation: '5+',
    materials: ['PU Foam'],
    relatedSlugs: ['stress-ball-set', 'pop-it-rainbow'],
    metaTitle: 'Squishy Animals | Slow Rising Foam Toys',
    metaDescription: 'Adorable slow-rising squishy animals. Super soft, scented, and satisfying to squeeze.',
  },

  // ========== CLICKY ==========
  {
    slug: 'pop-it-rainbow',
    name: 'Pop It Rainbow',
    tagline: 'Pop, flip, repeat',
    category: 'Clicky',
    variants: [
      { sku: 'FW-POP-SQ-RBW', name: 'Pop It Rainbow', variant: 'Square', price: 9.99, image: '/images/products/pop-it-square.webp' },
      { sku: 'FW-POP-CIR-RBW', name: 'Pop It Rainbow', variant: 'Circle', price: 9.99, image: '/images/products/pop-it-circle.webp' },
      { sku: 'FW-POP-OCT-RBW', name: 'Pop It Rainbow', variant: 'Octagon', price: 11.99, image: '/images/products/pop-it-octagon.webp' },
      { sku: 'FW-POP-JUMBO', name: 'Pop It Rainbow', variant: 'Jumbo Square', price: 19.99, image: '/images/products/pop-it-jumbo.webp' },
    ],
    defaultVariantIndex: 0,
    description: `<p>The satisfying bubble-popping sensation that took the world by storm. Our Pop It fidget toys feature premium food-grade silicone with perfectly tuned bubbles that deliver a crisp, satisfying pop every time.</p>
<p>Flip it over and pop again - endless entertainment for all ages. Great for focus, stress relief, or just pure fidgeting fun.</p>`,
    features: [
      'Food-grade silicone',
      'Perfectly tuned pop feel',
      'Flip and repeat forever',
      'Easy to clean',
      'Multiple game modes',
    ],
    specifications: {
      'Material': 'Food-Grade Silicone',
      'Standard Size': '12.5cm x 12.5cm',
      'Bubble Count': '28-64 depending on shape',
    },
    moods: ['focus', 'calm', 'play'],
    audiences: ['kids', 'all'],
    textures: ['smooth', 'soft'],
    ageRecommendation: '3+',
    materials: ['Silicone'],
    relatedSlugs: ['fidget-cube', 'simple-dimple'],
    metaTitle: 'Pop It Rainbow | Bubble Pop Fidget Toy',
    metaDescription: 'Premium silicone Pop It fidget toy in rainbow colors. Satisfying pops for endless entertainment.',
  },
  {
    slug: 'simple-dimple',
    name: 'Simple Dimple',
    tagline: 'Quick pops on the go',
    category: 'Clicky',
    variants: [
      { sku: 'FW-DIMPLE-3', name: 'Simple Dimple', variant: '3-Bubble', price: 5.99, image: '/images/products/simple-dimple-3.webp' },
      { sku: 'FW-DIMPLE-5', name: 'Simple Dimple', variant: '5-Bubble', price: 7.99, image: '/images/products/simple-dimple-5.webp' },
      { sku: 'FW-DIMPLE-KEY', name: 'Simple Dimple', variant: 'Keychain', price: 4.99, image: '/images/products/simple-dimple-keychain.webp' },
    ],
    defaultVariantIndex: 0,
    description: `<p>The pocket-sized popping companion. Simple Dimple brings the satisfying bubble-pop experience to a compact, portable design that clips onto your keys, bag, or fits perfectly in your pocket.</p>
<p>Each bubble delivers a crisp pop with just the right amount of resistance. Perfect for quick fidget breaks anywhere.</p>`,
    features: [
      'Ultra-portable design',
      'Keychain attachment option',
      'Premium silicone bubbles',
      'Perfect pop resistance',
      'Durable ABS frame',
    ],
    specifications: {
      'Size': '7-12cm',
      'Material': 'Silicone + ABS Plastic',
      'Weight': '15-25g',
    },
    moods: ['focus', 'calm'],
    audiences: ['all'],
    textures: ['smooth'],
    ageRecommendation: '3+',
    materials: ['Silicone', 'ABS'],
    relatedSlugs: ['pop-it-rainbow', 'fidget-cube'],
    metaTitle: 'Simple Dimple | Portable Pop Fidget',
    metaDescription: 'Compact bubble-pop fidget toy. Perfect for pockets, keychains, and on-the-go fidgeting.',
  },
  {
    slug: 'fidget-cube',
    name: 'Fidget Cube',
    tagline: '6 sides of satisfaction',
    category: 'Clicky',
    variants: [
      { sku: 'FW-CUBE-BG', name: 'Fidget Cube', variant: 'Black/Green', color: 'Black/Green', colorHex: '#2d5a27', price: 14.99, image: 'https://jzfesgxooirrjsnluphz.supabase.co/storage/v1/object/public/products/fidget-cube-black-green.png' },
      { sku: 'FW-CUBE-GB', name: 'Fidget Cube', variant: 'Grey/Black', color: 'Grey/Black', colorHex: '#4a4a4a', price: 14.99, image: 'https://jzfesgxooirrjsnluphz.supabase.co/storage/v1/object/public/products/fidget-cube-grey-black.png' },
      { sku: 'FW-CUBE-BB', name: 'Fidget Cube', variant: 'Black/Blue', color: 'Black/Blue', colorHex: '#1e3a5f', price: 14.99, image: 'https://jzfesgxooirrjsnluphz.supabase.co/storage/v1/object/public/products/fidget-cube-black-blue.png' },
    ],
    defaultVariantIndex: 0,
    description: `<p>The original 6-sided fidget companion. Each face of this pocket-sized cube features a different tactile experience: click, glide, flip, breathe, roll, and spin.</p>
<p>Engineered for quality with premium materials and satisfying feedback on every interaction. Perfect for meetings, studying, or any time you need to keep your hands busy.</p>`,
    features: [
      '6 unique fidget sides',
      'Click buttons (silent & clicky)',
      'Joystick glide pad',
      'Flip switch',
      'Rolling ball & gears',
      'Spin dial',
    ],
    specifications: {
      'Size': '3.3cm cube',
      'Material': 'ABS Plastic + Silicone',
      'Weight': '45g',
    },
    moods: ['focus', 'calm'],
    audiences: ['adults', 'office', 'all'],
    textures: ['smooth', 'mixed'],
    ageRecommendation: '6+',
    materials: ['ABS', 'Silicone', 'Metal'],
    isBestseller: true,
    relatedSlugs: ['infinity-cube', 'pop-it-rainbow', 'magnet-balls'],
    metaTitle: 'Fidget Cube | 6-Sided Desk Toy',
    metaDescription: 'Premium fidget cube with 6 unique tactile sides. Click, glide, flip, and spin your stress away.',
  },

  // ========== DESK TOYS ==========
  {
    slug: 'infinity-cube',
    name: 'Infinity Cube',
    tagline: 'Fold forever',
    category: 'Desk Toy',
    variants: [
      { sku: 'FW-INF-ALU-SIL', name: 'Infinity Cube', variant: 'Aluminum Silver', color: 'Silver', colorHex: '#C0C0C0', price: 19.99, image: '/images/products/infinity-cube-silver.webp' },
      { sku: 'FW-INF-ALU-BLK', name: 'Infinity Cube', variant: 'Aluminum Black', color: 'Black', colorHex: '#2a2a2a', price: 19.99, image: '/images/products/infinity-cube-black.webp' },
      { sku: 'FW-INF-ALU-RBW', name: 'Infinity Cube', variant: 'Aluminum Rainbow', color: 'Rainbow', colorHex: '#ff6b6b', price: 24.99, image: '/images/products/infinity-cube-rainbow.webp' },
      { sku: 'FW-INF-PLAS', name: 'Infinity Cube', variant: 'Classic Plastic', color: 'Multi', colorHex: '#4169e1', price: 9.99, image: '/images/products/infinity-cube-plastic.webp' },
    ],
    defaultVariantIndex: 0,
    description: `<p>The Infinity Cube is a mesmerizing mechanical puzzle that folds endlessly in any direction. Eight interconnected cubes linked by precision hinges create infinite folding possibilities.</p>
<p>Our premium aluminum version features CNC-machined blocks with a satisfying weight and buttery-smooth hinges. The perfect desk companion for focus and meditation.</p>`,
    features: [
      'Infinite folding motion',
      '8 interconnected cubes',
      'Smooth precision hinges',
      'Premium aluminum build',
      'Compact pocket size',
    ],
    specifications: {
      'Folded Size': '4cm x 4cm x 4cm',
      'Material': 'Anodized Aluminum / ABS Plastic',
      'Weight': 'Aluminum: 120g, Plastic: 45g',
    },
    moods: ['focus', 'calm'],
    audiences: ['adults', 'office'],
    textures: ['smooth'],
    ageRecommendation: '8+',
    materials: ['Aluminum', 'Stainless Steel Hinges'],
    relatedSlugs: ['fidget-cube', 'magnet-balls'],
    metaTitle: 'Infinity Cube | Premium Folding Fidget',
    metaDescription: 'Premium aluminum infinity cube with endless folding motion. The ultimate desk fidget toy.',
  },
  {
    slug: 'newton-cradle',
    name: "Newton's Cradle",
    tagline: 'Physics in motion',
    category: 'Desk Toy',
    variants: [
      { sku: 'FW-NEWT-SM', name: "Newton's Cradle", variant: 'Small (5.5")', price: 14.99, image: '/images/products/newton-small.webp' },
      { sku: 'FW-NEWT-LG', name: "Newton's Cradle", variant: 'Large (7")', price: 24.99, image: '/images/products/newton-large.webp' },
      { sku: 'FW-NEWT-XL', name: "Newton's Cradle", variant: 'Executive (9")', price: 39.99, image: '/images/products/newton-executive.webp' },
    ],
    defaultVariantIndex: 1,
    description: `<p>The classic demonstration of momentum and energy transfer, reimagined as an elegant desk accessory. Watch in satisfaction as the steel balls click and clack in perfect rhythm.</p>
<p>Features a sturdy metal frame and precision-balanced chrome steel balls for smooth, consistent motion that can last for minutes.</p>`,
    features: [
      'Precision-balanced balls',
      'Sturdy metal frame',
      'Long-lasting swing motion',
      'Classic physics demonstration',
      'Elegant desk decoration',
    ],
    specifications: {
      'Frame': 'Polished Metal',
      'Balls': 'Chrome Steel',
      'Ball Diameter': '22mm / 25mm / 30mm',
    },
    moods: ['calm', 'focus'],
    audiences: ['adults', 'office'],
    textures: ['smooth'],
    ageRecommendation: '8+',
    materials: ['Steel', 'Metal', 'Nylon String'],
    relatedSlugs: ['kinetic-sand', 'infinity-cube'],
    metaTitle: "Newton's Cradle | Classic Desk Toy",
    metaDescription: "Premium Newton's Cradle desk toy. Mesmerizing physics demonstration for your office.",
  },
  {
    slug: 'kinetic-sand',
    name: 'Kinetic Sand',
    tagline: 'Flows like magic',
    category: 'Desk Toy',
    variants: [
      { sku: 'FW-KSAND-NAT', name: 'Kinetic Sand', variant: 'Natural (1lb)', color: 'Natural', colorHex: '#c2b280', price: 12.99, image: '/images/products/kinetic-sand-natural.webp' },
      { sku: 'FW-KSAND-BLU', name: 'Kinetic Sand', variant: 'Ocean Blue (1lb)', color: 'Blue', colorHex: '#4169e1', price: 12.99, image: '/images/products/kinetic-sand-blue.webp' },
      { sku: 'FW-KSAND-PNK', name: 'Kinetic Sand', variant: 'Pink (1lb)', color: 'Pink', colorHex: '#ff69b4', price: 12.99, image: '/images/products/kinetic-sand-pink.webp' },
      { sku: 'FW-KSAND-SET', name: 'Kinetic Sand', variant: 'Rainbow Set (3lb)', color: 'Multi', colorHex: '#ff6b6b', price: 29.99, image: '/images/products/kinetic-sand-set.webp' },
    ],
    defaultVariantIndex: 0,
    description: `<p>Kinetic Sand is 98% sand and 2% magic. This amazing moldable sand sticks to itself and not to you, creating a mesmerizing sensory experience that flows through your fingers like a slow-motion liquid.</p>
<p>Perfect for desk play, stress relief, or creative sculpting. Never dries out and can be used over and over again.</p>`,
    features: [
      'Sticks to itself, not you',
      'Never dries out',
      'Easy to clean',
      'Satisfying texture',
      'Endless moldability',
    ],
    specifications: {
      'Composition': '98% Sand, 2% Polymer',
      'Weight Options': '1lb / 3lb',
      'Storage': 'Resealable container included',
    },
    moods: ['calm', 'play'],
    audiences: ['kids', 'all'],
    textures: ['soft', 'smooth'],
    ageRecommendation: '3+',
    materials: ['Sand', 'Silicone Polymer'],
    relatedSlugs: ['magnetic-putty', 'stress-ball-set'],
    metaTitle: 'Kinetic Sand | Moldable Sand Toy',
    metaDescription: 'Magical kinetic sand that flows and molds. Satisfying desk toy for all ages.',
  },

  // ========== STRETCHY ==========
  {
    slug: 'stretchy-strings',
    name: 'Stretchy Strings',
    tagline: 'Pull, stretch, twist',
    category: 'Stretchy',
    variants: [
      { sku: 'FW-STRCH-6PK', name: 'Stretchy Strings', variant: '6-Pack Neon', price: 8.99, image: '/images/products/stretchy-strings-6.webp' },
      { sku: 'FW-STRCH-12PK', name: 'Stretchy Strings', variant: '12-Pack Rainbow', price: 14.99, image: '/images/products/stretchy-strings-12.webp' },
      { sku: 'FW-STRCH-24PK', name: 'Stretchy Strings', variant: '24-Pack Party', price: 24.99, image: '/images/products/stretchy-strings-24.webp' },
    ],
    defaultVariantIndex: 1,
    description: `<p>Super stretchy, super satisfying. These colorful elastic strings can stretch to over 10x their original length without breaking. Pull them, twist them, wrap them - endless ways to fidget.</p>
<p>Made from durable TPR material that returns to original shape every time. Great for sensory play, stress relief, and keeping hands busy.</p>`,
    features: [
      'Stretches 10x length',
      'Always returns to shape',
      'Durable TPR material',
      'Bright neon colors',
      'Quiet fidget option',
    ],
    specifications: {
      'Length': '18cm relaxed',
      'Material': 'TPR',
      'Stretch': '10x+',
    },
    moods: ['calm', 'play'],
    audiences: ['kids', 'all'],
    textures: ['smooth', 'soft'],
    ageRecommendation: '3+',
    materials: ['TPR'],
    relatedSlugs: ['stress-ball-set', 'squishy-animals'],
    metaTitle: 'Stretchy Strings | Elastic Fidget Toy',
    metaDescription: 'Super stretchy fidget strings in neon colors. Pull, stretch, and twist for satisfying stress relief.',
  },
  {
    slug: 'mesh-marble-fidget',
    name: 'Mesh & Marble Fidget',
    tagline: 'Squeeze and slide',
    category: 'Stretchy',
    variants: [
      { sku: 'FW-MESH-6PK', name: 'Mesh & Marble', variant: '6-Pack', price: 9.99, image: '/images/products/mesh-marble-6.webp' },
      { sku: 'FW-MESH-12PK', name: 'Mesh & Marble', variant: '12-Pack', price: 16.99, image: '/images/products/mesh-marble-12.webp' },
    ],
    defaultVariantIndex: 0,
    description: `<p>A classic fidget toy that never gets old. A smooth marble trapped inside a stretchy mesh tube creates an endlessly satisfying squeeze-and-slide sensation.</p>
<p>Squeeze it and the marble pops through the mesh. Perfect for keeping hands busy during calls, meetings, or study sessions.</p>`,
    features: [
      'Satisfying squeeze action',
      'Marble pops through mesh',
      'Quiet fidget toy',
      'Durable construction',
      'Multiple colors included',
    ],
    specifications: {
      'Size': '5cm x 2cm',
      'Material': 'Mesh + Glass Marble',
      'Colors': 'Assorted',
    },
    moods: ['calm', 'focus'],
    audiences: ['all'],
    textures: ['mixed'],
    ageRecommendation: '5+',
    materials: ['Nylon Mesh', 'Glass'],
    relatedSlugs: ['stretchy-strings', 'stress-ball-set'],
    metaTitle: 'Mesh & Marble Fidget | Squeeze Toy',
    metaDescription: 'Classic mesh and marble fidget toy. Satisfying squeeze-and-slide action for stress relief.',
  },

  // ========== GIFT SETS ==========
  {
    slug: 'ultimate-fidget-bundle',
    name: 'Ultimate Fidget Bundle',
    tagline: 'Everything you need',
    category: 'Gift Set',
    variants: [
      { sku: 'FW-BUNDLE-ULT', name: 'Ultimate Fidget Bundle', variant: 'Complete Set', price: 49.99, compareAtPrice: 74.99, image: '/images/products/ultimate-bundle.webp' },
    ],
    defaultVariantIndex: 0,
    description: `<p>The ultimate fidget collection in one premium gift box. This carefully curated bundle includes our most popular fidget toys, perfect for gifting or treating yourself to the complete fidget experience.</p>
<p>Save over 30% compared to buying individually.</p>`,
    features: [
      'Fidget Cube',
      'Pop It Square',
      'Infinity Cube (Plastic)',
      'Stress Ball 3-Pack',
      'Stretchy Strings 6-Pack',
      'Mesh & Marble 3-Pack',
      'Premium Gift Box',
    ],
    specifications: {
      'Items Included': '6 different fidget types',
      'Packaging': 'Premium Gift Box',
      'Savings': '33% off retail',
    },
    moods: ['focus', 'calm', 'play'],
    audiences: ['all'],
    textures: ['mixed'],
    ageRecommendation: '6+',
    materials: ['Various'],
    isNew: true,
    relatedSlugs: ['fidget-cube', 'pop-it-rainbow', 'stress-ball-set'],
    metaTitle: 'Ultimate Fidget Bundle | Gift Set',
    metaDescription: 'Complete fidget toy bundle with 6 popular fidgets. Save 33% in premium gift packaging.',
  },
  {
    slug: 'desk-fidget-collection',
    name: 'Desk Fidget Collection',
    tagline: 'Upgrade your workspace',
    category: 'Gift Set',
    variants: [
      { sku: 'FW-DESK-COLL', name: 'Desk Fidget Collection', variant: 'Executive Set', price: 79.99, compareAtPrice: 119.99, image: '/images/products/desk-collection.webp' },
    ],
    defaultVariantIndex: 0,
    description: `<p>Elevate your desk with our premium Executive Desk Collection. This sophisticated set features our finest fidget toys in premium finishes, perfect for the modern professional.</p>
<p>Includes everything you need to keep focused and stress-free throughout the workday.</p>`,
    features: [
      'N52 Magnetic Balls (216pc Silver)',
      'Aluminum Infinity Cube',
      'Premium Fidget Cube',
      "Newton's Cradle (Large)",
      'Magnetic Putty',
      'Executive Storage Case',
    ],
    specifications: {
      'Items Included': '5 premium desk toys',
      'Packaging': 'Executive Storage Case',
      'Finish': 'Silver/Chrome',
    },
    moods: ['focus', 'calm'],
    audiences: ['adults', 'office'],
    textures: ['smooth'],
    ageRecommendation: '14+',
    materials: ['Aluminum', 'Metal', 'Premium Plastics'],
    isLimited: true,
    relatedSlugs: ['magnet-balls', 'infinity-cube', 'newton-cradle'],
    metaTitle: 'Desk Fidget Collection | Executive Gift Set',
    metaDescription: 'Premium desk fidget collection for professionals. Includes magnetic balls, infinity cube, and more.',
  },
];

// Flat map of all SKUs
const allVariants: Record<string, ProductVariant & { slug: string; variantCount: number; category: ProductCategory }> = {};
for (const page of productPages) {
  for (const v of page.variants) {
    allVariants[v.sku] = { ...v, slug: page.slug, variantCount: page.variants.length, category: page.category };
  }
}

export function getProductBySlug(slug: string): ProductPage | undefined {
  return productPages.find(p => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return productPages.map(p => p.slug);
}

export function getVariantBySku(sku: string) {
  return allVariants[sku] || null;
}

export function getBulkTier(qty: number): BulkTier | null {
  let tier: BulkTier | null = null;
  for (const t of bulkTiers) {
    if (qty >= t.qty) tier = t;
  }
  return tier;
}

export function getProductsByCategory(category: ProductCategory): ProductPage[] {
  return productPages.filter(p => p.category === category);
}

export function getBestsellers(): ProductPage[] {
  return productPages.filter(p => p.isBestseller);
}

export function getNewArrivals(): ProductPage[] {
  return productPages.filter(p => p.isNew);
}

export function getRecommendations(cartItems: { sku: string; name: string }[]): (ProductVariant & { sku: string; slug: string; variantCount: number; category: ProductCategory })[] {
  const cartSkus = new Set(cartItems.map(i => i.sku));
  const cartSlugs = new Set<string>();

  // Get slugs of items in cart
  for (const item of cartItems) {
    const variant = allVariants[item.sku];
    if (variant) cartSlugs.add(variant.slug);
  }

  // Get related products
  const seen = new Set<string>();
  const results: (ProductVariant & { sku: string; slug: string; variantCount: number; category: ProductCategory })[] = [];

  for (const item of cartItems) {
    const variant = allVariants[item.sku];
    if (!variant) continue;

    const product = getProductBySlug(variant.slug);
    if (!product?.relatedSlugs) continue;

    for (const relatedSlug of product.relatedSlugs) {
      if (cartSlugs.has(relatedSlug) || seen.has(relatedSlug)) continue;
      seen.add(relatedSlug);

      const relatedProduct = getProductBySlug(relatedSlug);
      if (!relatedProduct) continue;

      const defaultVariant = relatedProduct.variants[relatedProduct.defaultVariantIndex];
      results.push({
        ...defaultVariant,
        slug: relatedSlug,
        variantCount: relatedProduct.variants.length,
        category: relatedProduct.category,
      });
    }
  }

  return results.slice(0, 4);
}

// ========== CJ DROPSHIPPING PRODUCTS ==========
// Products sourced from CJ Dropshipping API
// To refresh: node scripts/import-cj-products.js search && node scripts/import-cj-products.js convert

export const cjDropshippingProducts: ProductPage[] = [
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
    defaultVariantIndex: 0,
    description: `<p>High quality metal fidget spinner with stunning rainbow titanium finish. Premium bearing system delivers ultra-smooth, long-lasting spins of 3+ minutes.</p>
<p>The perfect desk companion for focus, stress relief, and satisfying fidget breaks. Compact enough to carry anywhere.</p>`,
    features: [
      'Premium zinc alloy construction',
      'Smooth ceramic bearing',
      '3+ minute spin time',
      'Stunning rainbow finish',
      'Pocket-sized design',
    ],
    specifications: {
      'Material': 'Zinc Alloy',
      'Bearing': 'Ceramic R188',
      'Spin Time': '3+ minutes',
      'Weight': '65g',
    },
    moods: ['focus', 'calm'],
    audiences: ['adults', 'office', 'all'],
    textures: ['smooth'],
    ageRecommendation: '6+',
    materials: ['Zinc Alloy', 'Ceramic'],
    isNew: true,
    relatedSlugs: ['fidget-cube', 'infinity-cube', 'cj-magnetic-rings'],
    metaTitle: 'Rainbow Metal Fidget Spinner | Fidget WRLD',
    metaDescription: 'Premium metal fidget spinner with rainbow finish. Ultra-smooth 3+ minute spins for stress relief and focus.',
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
    defaultVariantIndex: 0,
    description: `<p>The viral sensation that delivers endless popping satisfaction. Made from premium food-grade silicone with perfectly tuned bubbles that pop with a crisp, satisfying sound.</p>
<p>Flip it over and pop again - it never gets old! Great for anxiety relief, focus, and sensory play.</p>`,
    features: [
      'Food-grade silicone',
      'Perfect pop resistance',
      'Flip and repeat forever',
      'Easy to clean',
      'Multiple shapes available',
    ],
    specifications: {
      'Material': 'Food-Grade Silicone',
      'Size': '12.5cm x 12.5cm',
      'Weight': '45g',
    },
    moods: ['calm', 'play', 'focus'],
    audiences: ['kids', 'all'],
    textures: ['smooth', 'soft'],
    ageRecommendation: '3+',
    materials: ['Silicone'],
    isNew: true,
    relatedSlugs: ['pop-it-rainbow', 'simple-dimple', 'cj-simple-dimple-keychain'],
    metaTitle: 'Pop It Sensory Toy | Fidget WRLD',
    metaDescription: 'Premium silicone Pop It fidget toy. Endless popping fun for stress relief and sensory play.',
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
    defaultVariantIndex: 0,
    description: `<p>Adorable slow-rising squishy animals that are impossibly soft and satisfying to squeeze. Made from premium PU memory foam with hand-painted details.</p>
<p>Each squishy features a light, pleasant scent and slowly returns to its original shape after squeezing. Perfect for stress relief or as cute desk companions.</p>`,
    features: [
      'Ultra-slow rise foam',
      'Hand-painted details',
      'Light scented',
      'Super soft texture',
      'Kawaii designs',
    ],
    specifications: {
      'Material': 'PU Memory Foam',
      'Size': '8-10cm',
      'Rise Time': '5-8 seconds',
      'Weight': '35g each',
    },
    moods: ['calm', 'play'],
    audiences: ['kids', 'all'],
    textures: ['soft'],
    ageRecommendation: '5+',
    materials: ['PU Foam'],
    isNew: true,
    relatedSlugs: ['squishy-animals', 'stress-ball-set', 'cj-mesh-marble'],
    metaTitle: 'Kawaii Squishy Animals | Fidget WRLD',
    metaDescription: 'Adorable slow-rising squishy animals. Super soft and satisfying to squeeze for stress relief.',
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
    defaultVariantIndex: 0,
    description: `<p>The classic fidget toy that never gets old. A smooth glass marble trapped inside a stretchy mesh tube creates an endlessly satisfying squeeze-and-slide sensation.</p>
<p>Squeeze it and watch the marble pop through the mesh. Quiet, durable, and perfect for keeping hands busy during calls or meetings.</p>`,
    features: [
      'Classic squeeze action',
      'Marble pops through mesh',
      'Silent fidget option',
      'Durable construction',
      'Multiple colors included',
    ],
    specifications: {
      'Size': '5cm x 2cm',
      'Material': 'Nylon Mesh + Glass Marble',
      'Colors': 'Assorted',
    },
    moods: ['calm', 'focus'],
    audiences: ['all'],
    textures: ['mixed'],
    ageRecommendation: '5+',
    materials: ['Nylon', 'Glass'],
    isNew: true,
    relatedSlugs: ['mesh-marble-fidget', 'stretchy-strings', 'cj-stretchy-noodles'],
    metaTitle: 'Mesh Marble Fidget | Fidget WRLD',
    metaDescription: 'Classic mesh and marble fidget toy. Satisfying squeeze-and-slide action for quiet stress relief.',
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
    defaultVariantIndex: 0,
    description: `<p>Premium CNC-machined aluminum infinity cube with buttery-smooth hinges. Eight interconnected cubes linked by precision hinges create infinite folding possibilities.</p>
<p>The satisfying weight and cool metal feel make this the ultimate desk fidget. Fold endlessly in any direction for meditative stress relief.</p>`,
    features: [
      'CNC-machined aluminum',
      'Precision steel hinges',
      'Satisfying weight (95g)',
      'Infinite folding motion',
      'Premium anodized finish',
    ],
    specifications: {
      'Material': 'Anodized Aluminum',
      'Folded Size': '4cm x 4cm x 4cm',
      'Weight': '95g',
      'Hinges': 'Stainless Steel',
    },
    moods: ['focus', 'calm'],
    audiences: ['adults', 'office'],
    textures: ['smooth'],
    ageRecommendation: '8+',
    materials: ['Aluminum', 'Stainless Steel'],
    isNew: true,
    relatedSlugs: ['infinity-cube', 'fidget-cube', 'cj-rainbow-fidget-spinner'],
    metaTitle: 'Aluminum Infinity Cube | Fidget WRLD',
    metaDescription: 'Premium CNC-machined aluminum infinity cube. Endless folding satisfaction for focus and stress relief.',
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
    defaultVariantIndex: 0,
    description: `<p>Bike chain-style fidget toy with smooth, satisfying movement. Flip, fold, twist and roll the interconnected links for quiet desktop fidgeting.</p>
<p>Made from durable zinc alloy with a premium finish. Perfect for meetings, phone calls, or any time you need to keep your hands busy.</p>`,
    features: [
      'Smooth flipping action',
      'Zinc alloy construction',
      'Silent operation',
      'Compact pocket size',
      'Durable design',
    ],
    specifications: {
      'Material': 'Zinc Alloy',
      'Size': '9cm x 3cm',
      'Weight': '28g',
    },
    moods: ['focus', 'calm'],
    audiences: ['adults', 'office'],
    textures: ['smooth'],
    ageRecommendation: '6+',
    materials: ['Zinc Alloy'],
    isNew: true,
    relatedSlugs: ['fidget-cube', 'cj-wacky-tracks', 'cj-aluminum-infinity-cube'],
    metaTitle: 'Flippy Chain Fidget | Fidget WRLD',
    metaDescription: 'Bike chain-style fidget toy. Smooth flipping action for quiet, satisfying desk fidgeting.',
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
    defaultVariantIndex: 0,
    description: `<p>Mesmerizing magnetic fidget rings that stack, spin, and perform amazing tricks. Strong neodymium magnets create satisfying connections and smooth movements.</p>
<p>Roll them along your fingers, stack them together, or learn impressive tricks. The possibilities are endless with these addictive magnetic rings.</p>`,
    features: [
      'Strong neodymium magnets',
      'Smooth rolling action',
      'Endless trick possibilities',
      'Premium plated finish',
      'Satisfying magnetic snap',
    ],
    specifications: {
      'Material': 'Neodymium Magnets',
      'Ring Size': '20mm diameter',
      'Weight': '40g (3-pack)',
    },
    moods: ['focus', 'play'],
    audiences: ['adults', 'all'],
    textures: ['smooth'],
    ageRecommendation: '14+',
    materials: ['Neodymium', 'Nickel Plating'],
    isNew: true,
    relatedSlugs: ['magnet-balls', 'magnetic-putty', 'cj-rainbow-fidget-spinner'],
    metaTitle: 'Magnetic Fidget Rings | Fidget WRLD',
    metaDescription: 'Mesmerizing magnetic fidget rings. Stack, spin, and perform tricks with strong neodymium magnets.',
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
    defaultVariantIndex: 1,
    description: `<p>Super stretchy sensory strings that pull to over 10x their original length without breaking. Made from durable TPR material that always returns to shape.</p>
<p>Pull them, twist them, wrap them around your fingers - endless ways to fidget. Great for sensory play, stress relief, and tactile stimulation.</p>`,
    features: [
      'Stretches 10x+ length',
      'Always returns to shape',
      'Durable TPR material',
      'Bright neon colors',
      'Great for sensory play',
    ],
    specifications: {
      'Length': '18cm relaxed',
      'Material': 'TPR',
      'Stretch': '10x+',
    },
    moods: ['calm', 'play'],
    audiences: ['kids', 'all'],
    textures: ['smooth', 'soft'],
    ageRecommendation: '3+',
    materials: ['TPR'],
    isNew: true,
    relatedSlugs: ['stretchy-strings', 'cj-mesh-marble', 'cj-squishy-animals'],
    metaTitle: 'Stretchy Sensory Noodles | Fidget WRLD',
    metaDescription: 'Super stretchy fidget strings in neon colors. Pull, stretch, and twist for satisfying sensory play.',
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
    defaultVariantIndex: 1,
    description: `<p>The pocket-sized popping companion that goes everywhere. Simple Dimple brings satisfying bubble-pop action to a compact, portable design with keychain attachment.</p>
<p>Each silicone bubble delivers a crisp pop with perfect resistance. Clip it to your keys, bag, or backpack for fidget breaks anywhere.</p>`,
    features: [
      'Ultra-portable design',
      'Keychain attachment',
      'Premium silicone bubbles',
      'Perfect pop resistance',
      'Durable ABS frame',
    ],
    specifications: {
      'Size': '6-10cm',
      'Material': 'Silicone + ABS',
      'Weight': '12-18g',
    },
    moods: ['focus', 'calm'],
    audiences: ['all'],
    textures: ['smooth'],
    ageRecommendation: '3+',
    materials: ['Silicone', 'ABS'],
    isNew: true,
    relatedSlugs: ['simple-dimple', 'cj-pop-it-sensory', 'pop-it-rainbow'],
    metaTitle: 'Simple Dimple Keychain | Fidget WRLD',
    metaDescription: 'Portable bubble-pop fidget keychain. Perfect for pockets, bags, and on-the-go fidgeting.',
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
    defaultVariantIndex: 1,
    description: `<p>Snap and click fidget links that bend into any shape you can imagine. Each segment clicks satisfyingly as you twist and turn the chain.</p>
<p>Connect multiple tracks together for longer creations. Great for fidgeting, building, and keeping hands busy with satisfying snap sounds.</p>`,
    features: [
      'Satisfying snap sound',
      'Bends any direction',
      'Connect multiple tracks',
      'Durable ABS plastic',
      'Bright colors',
    ],
    specifications: {
      'Material': 'ABS Plastic',
      'Links per Track': '24',
      'Weight': '22g each',
    },
    moods: ['play', 'focus'],
    audiences: ['kids', 'all'],
    textures: ['smooth'],
    ageRecommendation: '3+',
    materials: ['ABS'],
    isNew: true,
    relatedSlugs: ['cj-flippy-chain', 'fidget-cube', 'cj-tangle-fidget'],
    metaTitle: 'Wacky Tracks Snap Links | Fidget WRLD',
    metaDescription: 'Snap and click fidget links. Bend into any shape with satisfying snap sounds.',
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
    defaultVariantIndex: 0,
    description: `<p>Interconnected curved sections that twist, turn, and coil in endless combinations. The unique shape provides tactile stimulation while keeping your hands busy.</p>
<p>Available in textured, metallic, and glow-in-the-dark versions. Perfect for desk fidgeting, therapy, or sensory exploration.</p>`,
    features: [
      'Endless twisting motion',
      'Textured surface options',
      'Interconnected sections',
      'Quiet operation',
      'Therapeutic fidgeting',
    ],
    specifications: {
      'Material': 'ABS Plastic',
      'Sections': '18 connected pieces',
      'Weight': '30g',
    },
    moods: ['focus', 'calm'],
    audiences: ['all'],
    textures: ['mixed', 'bumpy'],
    ageRecommendation: '3+',
    materials: ['ABS'],
    isNew: true,
    relatedSlugs: ['cj-wacky-tracks', 'cj-flippy-chain', 'fidget-cube'],
    metaTitle: 'Tangle Fidget Toy | Fidget WRLD',
    metaDescription: 'Twist and turn tangle fidget toy. Interconnected sections for endless tactile fidgeting.',
  },
];

// Add CJ products to the main product list
productPages.push(...cjDropshippingProducts);
