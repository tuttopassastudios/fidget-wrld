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
      { sku: 'FW-MAG-216-RED', name: 'Magnet Balls', variant: 'Red', color: 'Red', colorHex: '#8B0000', price: 24.99, image: 'https://jzfesgxooirrjsnluphz.supabase.co/storage/v1/object/public/products/mag-balls-red.png', inventory: 0 },
      { sku: 'FW-MAG-216-BLU', name: 'Magnet Balls', variant: 'Blue', color: 'Blue', colorHex: '#1E90FF', price: 24.99, image: 'https://jzfesgxooirrjsnluphz.supabase.co/storage/v1/object/public/products/mag-balls-blue.png', inventory: 0 },
      { sku: 'FW-MAG-216-GLD', name: 'Magnet Balls', variant: 'Gold', color: 'Gold', colorHex: '#FFD700', price: 24.99, image: 'https://jzfesgxooirrjsnluphz.supabase.co/storage/v1/object/public/products/mag-balls-gold.png', inventory: 0 },
      { sku: 'FW-MAG-216-SIL', name: 'Magnet Balls', variant: 'Silver', color: 'Silver', colorHex: '#C0C0C0', price: 24.99, image: 'https://jzfesgxooirrjsnluphz.supabase.co/storage/v1/object/public/products/mag-balls-silver.png', inventory: 0 },
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
    isOutOfStock: true,
    relatedSlugs: ['fidget-cube', 'cj-ferrofluid-speaker'],
    metaTitle: 'Magnet Balls | Premium Desk Toy',
    metaDescription: 'Ultra-strong N52 neodymium magnet balls for creative desk sculptures. Available in silver, gold, black, red, and rainbow.',
  },

  // ========== SQUISHY ==========
  {
    slug: 'stress-ball-set',
    name: 'Ice Cube Stress Ball',
    tagline: 'Squeeze away the stress',
    category: 'Squishy',
    variants: [
      { sku: 'FW-STRESS-4PK', name: 'Ice Cube Stress Ball', variant: '4-Pack', price: 14.99, image: 'https://jzfesgxooirrjsnluphz.supabase.co/storage/v1/object/public/products/ice-cube-stress-ball.png', inventory: 0 },
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
    isOutOfStock: true,
    relatedSlugs: ['cj-popcorn-squishy', 'cj-sticky-wall-ball'],
    metaTitle: 'Ice Cube Stress Ball | Squeeze Toys',
    metaDescription: 'Unique ice cube shaped stress balls. Perfect for stress relief, focus, and hand exercises.',
  },

  // ========== CLICKY ==========
  {
    slug: 'fidget-cube',
    name: 'Fidget Cube',
    tagline: '6 sides of satisfaction',
    category: 'Clicky',
    variants: [
      { sku: 'FW-CUBE-BG', name: 'Fidget Cube', variant: 'Black/Green', color: 'Black/Green', colorHex: '#2d5a27', price: 14.99, image: 'https://jzfesgxooirrjsnluphz.supabase.co/storage/v1/object/public/products/fidget-cube-black-green.png', inventory: 0 },
      { sku: 'FW-CUBE-GB', name: 'Fidget Cube', variant: 'Grey/Black', color: 'Grey/Black', colorHex: '#4a4a4a', price: 14.99, image: 'https://jzfesgxooirrjsnluphz.supabase.co/storage/v1/object/public/products/fidget-cube-grey-black.png', inventory: 0 },
      { sku: 'FW-CUBE-BB', name: 'Fidget Cube', variant: 'Black/Blue', color: 'Black/Blue', colorHex: '#1e3a5f', price: 14.99, image: 'https://jzfesgxooirrjsnluphz.supabase.co/storage/v1/object/public/products/fidget-cube-black-blue.png', inventory: 0 },
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
    isOutOfStock: true,
    relatedSlugs: ['cj-spinner-keychain', 'magnet-balls', 'cj-alloy-spinner'],
    metaTitle: 'Fidget Cube | 6-Sided Desk Toy',
    metaDescription: 'Premium fidget cube with 6 unique tactile sides. Click, glide, flip, and spin your stress away.',
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
  return productPages.filter(p => p.isBestseller && !p.isOutOfStock);
}

export function getNewArrivals(): ProductPage[] {
  return productPages.filter(p => p.isNew);
}

export function getRecommendations(cartItems: { sku: string; name: string }[]): (ProductVariant & { sku: string; slug: string; variantCount: number; category: ProductCategory })[] {
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
// Products sourced from CJ Dropshipping API with real images
// Last updated: 2026-03-30
// To add more products: node scripts/cj-product-lookup.js <productId>

export const cjDropshippingProducts: ProductPage[] = [
  // Product 1: Spinner Keychain (CJ PID: 1541333689475944448)
  {
    slug: 'cj-spinner-keychain',
    name: 'Fidget Spinner Keychain',
    tagline: 'Spin anywhere you go',
    category: 'Desk Toy',
    variants: [
      { sku: 'CJ-SPIN-KEY-BLK', name: 'Fidget Spinner Keychain', variant: 'Black', color: 'Black', colorHex: '#2a2a2a', price: 5.99, image: 'https://cf.cjdropshipping.com/5ba37cad-57a1-4705-b527-b868eee90280.jpg', cjPid: '1541333689475944448', cjVid: '1541333689765351424' },
      { sku: 'CJ-SPIN-KEY-RED', name: 'Fidget Spinner Keychain', variant: 'Red', color: 'Red', colorHex: '#DC143C', price: 5.99, image: 'https://cf.cjdropshipping.com/f2d24da0-b5ea-43e7-a729-c9c87911a666.jpg', cjPid: '1541333689475944448', cjVid: '1541333689765351425' },
      { sku: 'CJ-SPIN-KEY-WHT', name: 'Fidget Spinner Keychain', variant: 'White', color: 'White', colorHex: '#FFFFFF', price: 5.99, image: 'https://cf.cjdropshipping.com/44c7f08a-3f87-4686-8db8-1bb8a8627e11.jpg', cjPid: '1541333689475944448', cjVid: '1640924001965330433' },
      { sku: 'CJ-SPIN-KEY-GRN', name: 'Fidget Spinner Keychain', variant: 'Glow Green', color: 'Green', colorHex: '#32CD32', price: 6.99, image: 'https://cf.cjdropshipping.com/d174c68a-f724-43d6-a451-965d13ea4e4e.jpg', cjPid: '1541333689475944448', cjVid: '1562686756393734144' },
      { sku: 'CJ-SPIN-KEY-BLU', name: 'Fidget Spinner Keychain', variant: 'Glow Blue', color: 'Blue', colorHex: '#1E90FF', price: 6.99, image: 'https://cf.cjdropshipping.com/291de2f2-5387-4df8-b862-c1e593aeba4b.jpg', cjPid: '1541333689475944448', cjVid: '1567359122214375424' },
    ],
    defaultVariantIndex: 0,
    description: `<p>A creative multi-functional fidget toy that combines a finger spinner with a keychain and bottle opener. Perfect for on-the-go fidgeting!</p>
<p>Great for stress relief, anxiety, focus, and ADHD. The glow-in-the-dark variants light up after absorbing light. Compact 5cm x 3.7cm size fits anywhere.</p>`,
    features: [
      'Multi-functional: spinner + keychain + bottle opener',
      'Glow-in-the-dark options available',
      'Compact pocket-friendly size',
      'Perfect for anxiety and focus',
      'Zinc alloy & plastic construction',
    ],
    specifications: {
      'Material': 'Plastic / Zinc Alloy',
      'Size': '5cm x 3.7cm x 0.5cm',
      'Weight': '16-48g',
      'Type': 'Keychain Spinner',
    },
    moods: ['focus', 'calm', 'play'],
    audiences: ['adults', 'kids', 'all'],
    textures: ['smooth'],
    ageRecommendation: '6+',
    materials: ['Zinc Alloy', 'Plastic'],
    isNew: true,
    isBestseller: true,
    relatedSlugs: ['fidget-cube', 'cj-alloy-spinner', 'cj-popcorn-squishy'],
    metaTitle: 'Fidget Spinner Keychain | Fidget WRLD',
    metaDescription: 'Multi-functional fidget spinner keychain with bottle opener. Glow-in-the-dark options available for on-the-go stress relief.',
  },
  // Product 2: Alloy Fidget Spinner (CJ PID: 1527233425990758400)
  {
    slug: 'cj-alloy-spinner',
    name: 'Rainbow Alloy Fidget Spinner',
    tagline: 'Premium metal spinning',
    category: 'Desk Toy',
    variants: [
      { sku: 'CJ-ALLOY-SPIN-RBW', name: 'Rainbow Alloy Fidget Spinner', variant: 'Rainbow 6-Axis', color: 'Rainbow', colorHex: '#ff6b6b', price: 4.99, image: 'https://cf.cjdropshipping.com/quick/product/8dcda08d-587f-4ce2-8c2a-6c32ef805736.jpg', cjPid: '1527233425990758400', cjVid: '1527233426057867264' },
    ],
    defaultVariantIndex: 0,
    description: `<p>Premium colorful alloy fidget spinner with stunning electroplated rainbow finish. The six-axis design provides excellent balance for long, smooth spins.</p>
<p>Approximately 6cm in diameter, perfect for teens and adults. Made from high-quality alloy material for durability and satisfying weight.</p>`,
    features: [
      'Premium alloy construction',
      'Electroplated rainbow finish',
      'Six-axis balanced design',
      'Long smooth spin time',
      'Perfect desk toy size',
    ],
    specifications: {
      'Material': 'Alloy',
      'Diameter': '~6cm',
      'Weight': '80g',
      'Age Range': '7-14+ years',
    },
    moods: ['focus', 'calm'],
    audiences: ['adults', 'office', 'all'],
    textures: ['smooth'],
    ageRecommendation: '7+',
    materials: ['Alloy'],
    isNew: true,
    relatedSlugs: ['cj-spinner-keychain', 'fidget-cube', 'infinity-cube'],
    metaTitle: 'Rainbow Alloy Fidget Spinner | Fidget WRLD',
    metaDescription: 'Premium electroplated rainbow alloy fidget spinner. Six-axis design for balanced, long-lasting spins.',
  },
  // Product 3: Popcorn Cup Squishy (CJ PID: C4880398-A6C6-48C2-AF37-7852296CD892)
  {
    slug: 'cj-popcorn-squishy',
    name: 'Popcorn Cup Squishy',
    tagline: 'Squeeze the stress away',
    category: 'Squishy',
    variants: [
      { sku: 'CJ-POPCORN-SQU', name: 'Popcorn Cup Squishy', variant: 'Classic', price: 9.99, image: 'https://cf.cjdropshipping.com/15204672/1093995935640.png', cjPid: 'C4880398-A6C6-48C2-AF37-7852296CD892', cjVid: '7F972F58-59AE-4921-AB7F-F19D923D9F47' },
    ],
    defaultVariantIndex: 0,
    description: `<p>Adorable simulation popcorn cup squeeze toy that provides satisfying stress relief. This unique fidget toy looks just like a real popcorn cup!</p>
<p>Perfect for kids and adults who need a fun, tactile way to relieve anxiety and stress. The soft, squeezable material is durable and always returns to shape.</p>`,
    features: [
      'Realistic popcorn cup design',
      'Soft squeezable material',
      'Great for stress relief',
      'Durable construction',
      'Fun for all ages',
    ],
    specifications: {
      'Material': 'TPR/Foam',
      'Weight': '120g',
      'Type': 'Squeeze Toy',
    },
    moods: ['calm', 'play'],
    audiences: ['kids', 'all'],
    textures: ['soft'],
    ageRecommendation: '3+',
    materials: ['TPR', 'Foam'],
    isNew: true,
    isBestseller: true,
    relatedSlugs: ['stress-ball-set', 'squishy-animals', 'cj-spinner-keychain'],
    metaTitle: 'Popcorn Cup Squishy | Fidget WRLD',
    metaDescription: 'Cute simulation popcorn cup squeeze toy. Satisfying stress relief for kids and adults.',
  },
  // Product 4: Dancing Ferrofluid (CJ PID: 1719271582901743616)
  {
    slug: 'cj-ferrofluid-speaker',
    name: 'Dancing Ferrofluid Speaker',
    tagline: 'Music meets magnetism',
    category: 'Desk Toy',
    variants: [
      { sku: 'CJ-FERRO-YLW', name: 'Dancing Ferrofluid Speaker', variant: 'Yellow', color: 'Yellow', colorHex: '#FFD700', price: 149.99, image: 'https://cf.cjdropshipping.com/quick/product/816355c6-0da3-43e7-89e0-09f28b925818.jpg', cjPid: '1719271582901743616', cjVid: '1719271582981435392' },
      { sku: 'CJ-FERRO-GRY', name: 'Dancing Ferrofluid Speaker', variant: 'Gray', color: 'Gray', colorHex: '#808080', price: 149.99, image: 'https://cf.cjdropshipping.com/quick/product/f466ca43-21d0-4430-8f66-81703ca29e5e.jpg', cjPid: '1719271582901743616', cjVid: '1719271583048544256' },
    ],
    defaultVariantIndex: 0,
    description: `<p>Transform your music into a visual masterpiece with this mesmerizing dancing ferrofluid speaker. The magnetic fluid dances to the beat, creating captivating shapes that respond to different rhythms.</p>
<p>Features a built-in lithium-ion battery with up to 8 hours of continuous playtime. The warm white light illuminates the dynamic magnetic fluid display for a truly unique desk toy experience.</p>`,
    features: [
      'Ferrofluid dances to music rhythm',
      'Built-in speaker with 8hr battery',
      'Warm white LED illumination',
      'USB-C charging',
      'Premium desk decoration',
    ],
    specifications: {
      'Material': 'Plastic + Ferrofluid',
      'Size': '172mm x 106mm x 54mm',
      'Weight': '902-909g',
      'Battery': '8 hours playtime',
      'Charging': 'USB Type-C',
    },
    moods: ['calm', 'focus'],
    audiences: ['adults', 'office'],
    textures: ['smooth'],
    ageRecommendation: '14+',
    materials: ['Plastic', 'Ferrofluid', 'Magnets'],
    isNew: true,
    isLimited: true,
    relatedSlugs: ['magnetic-putty', 'magnet-balls', 'cj-alloy-spinner'],
    metaTitle: 'Dancing Ferrofluid Speaker | Fidget WRLD',
    metaDescription: 'Mesmerizing ferrofluid desk toy that dances to music. Premium magnetic fluid speaker with 8-hour battery life.',
  },
  // Product 5: Sticky Wall Ball (CJ PID: 3D7BC0C9-CC09-4FAB-94A2-5775F0D11661)
  {
    slug: 'cj-sticky-wall-ball',
    name: 'Sticky Wall Ball',
    tagline: 'Throw, stick, squeeze, repeat',
    category: 'Squishy',
    variants: [
      { sku: 'CJ-WALL-BALL-4PK', name: 'Sticky Wall Ball', variant: '4-Pack Rainbow', price: 5.99, image: 'https://cf.cjdropshipping.com/2044/18607719711932.png', cjPid: '3D7BC0C9-CC09-4FAB-94A2-5775F0D11661', cjVid: '0C468BCE-95D2-49FB-B125-111E227F7CB5' },
      { sku: 'CJ-WALL-BALL-GLOW4', name: 'Sticky Wall Ball', variant: '4-Pack Glow', price: 6.99, image: 'https://cf.cjdropshipping.com/2054/4786525385188.png', cjPid: '3D7BC0C9-CC09-4FAB-94A2-5775F0D11661', cjVid: '82B5C037-92D6-439C-AE87-418B1E283371' },
      { sku: 'CJ-WALL-BALL-BLU', name: 'Sticky Wall Ball', variant: 'Blue LED', color: 'Blue', colorHex: '#1E90FF', price: 2.99, image: 'https://cf.cjdropshipping.com/203104/1350329882.jpg', cjPid: '3D7BC0C9-CC09-4FAB-94A2-5775F0D11661', cjVid: '9434DFAA-1F07-4E9B-BF23-44A34348A6C2' },
      { sku: 'CJ-WALL-BALL-GRN', name: 'Sticky Wall Ball', variant: 'Green LED', color: 'Green', colorHex: '#32CD32', price: 2.99, image: 'https://cf.cjdropshipping.com/203104/2589223855002.jpg', cjPid: '3D7BC0C9-CC09-4FAB-94A2-5775F0D11661', cjVid: 'D36E8507-9141-425C-A5E6-A1FA2868C3E9' },
      { sku: 'CJ-WALL-BALL-RED', name: 'Sticky Wall Ball', variant: 'Red LED', color: 'Red', colorHex: '#DC143C', price: 2.99, image: 'https://cf.cjdropshipping.com/203104/488402365204.jpg', cjPid: '3D7BC0C9-CC09-4FAB-94A2-5775F0D11661', cjVid: 'FD042B76-A243-436E-9B97-7014407AB987' },
      { sku: 'CJ-WALL-BALL-8PK', name: 'Sticky Wall Ball', variant: '8-Pack LED', price: 9.99, image: 'https://cf.cjdropshipping.com/2054/5811979488440.jpg', cjPid: '3D7BC0C9-CC09-4FAB-94A2-5775F0D11661', cjVid: 'F021E2C4-FBD1-4022-9236-B59DAB3CBA58' },
    ],
    defaultVariantIndex: 0,
    description: `<p>Fun and satisfying sticky wall balls that stick to walls, ceilings, and smooth surfaces! Throw them against the wall and watch them stick, then slowly peel off. Perfect stress relief for all ages.</p>
<p>Made from safe TPR material with soft rubber filling. LED variants light up on impact for extra fun. Washable - just rinse with water to restore stickiness.</p>`,
    features: [
      'Sticks to walls and smooth surfaces',
      'LED variants light up on impact',
      'Soft, squeezable material',
      'Washable to restore stickiness',
      'Safe for kids 3+',
    ],
    specifications: {
      'Material': 'TPR (Thermoplastic Rubber)',
      'Size': '4.5-6.5cm diameter',
      'Weight': '12-50g per ball',
      'Type': 'Stress Relief / Throwing Toy',
    },
    moods: ['play', 'calm'],
    audiences: ['kids', 'all'],
    textures: ['soft'],
    ageRecommendation: '3+',
    materials: ['TPR', 'Soft Rubber'],
    isNew: true,
    isBestseller: true,
    relatedSlugs: ['stress-ball-set', 'cj-popcorn-squishy', 'squishy-animals'],
    metaTitle: 'Sticky Wall Ball | Fidget WRLD',
    metaDescription: 'Fun sticky stress balls that stick to walls. LED light-up options available. Perfect for stress relief and play.',
  },
  // Product 6: Fidget Anxiety Ring (CJ PID: 1463420820905922560)
  {
    slug: 'cj-fidget-ring',
    name: 'Fidget Anxiety Ring',
    tagline: 'Stylish stress relief jewelry',
    category: 'Desk Toy',
    variants: [
      { sku: 'CJ-RING-BUTTERFLY', name: 'Fidget Anxiety Ring', variant: 'Butterfly', color: 'Gold', colorHex: '#D4AF37', price: 6.99, image: 'https://cf.cjdropshipping.com/d84460a0-748b-46b1-ae82-3d9a5588ac24.jpg', cjPid: '1463420820905922560', cjVid: '1463420820985614336' },
      { sku: 'CJ-RING-BAND', name: 'Fidget Anxiety Ring', variant: 'Simple Band', color: 'Silver', colorHex: '#C0C0C0', price: 4.99, image: 'https://cf.cjdropshipping.com/ff1d0b0f-be2a-44b6-9a3f-9f7c74958451.jpg', cjPid: '1463420820905922560', cjVid: '1463420820989808640' },
      { sku: 'CJ-RING-FLOWER', name: 'Fidget Anxiety Ring', variant: 'Flower', color: 'Rose Gold', colorHex: '#B76E79', price: 4.99, image: 'https://cf.cjdropshipping.com/1783d3bb-70f4-4438-9fc4-d821593cc3b5.jpg', cjPid: '1463420820905922560', cjVid: '1463420820989808641' },
      { sku: 'CJ-RING-STAR', name: 'Fidget Anxiety Ring', variant: 'Star', color: 'Gold', colorHex: '#FFD700', price: 6.99, image: 'https://cf.cjdropshipping.com/4c6225df-830c-4259-b8cc-cdb2ec298c78.jpg', cjPid: '1463420820905922560', cjVid: '1463420820994002944' },
      { sku: 'CJ-RING-HEART', name: 'Fidget Anxiety Ring', variant: 'Heart', color: 'Silver', colorHex: '#C0C0C0', price: 4.99, image: 'https://cf.cjdropshipping.com/58ec2f49-0ad1-4c26-8ce2-d64e2c96e71d.jpg', cjPid: '1463420820905922560', cjVid: '1463420820994002945' },
      { sku: 'CJ-RING-MOON', name: 'Fidget Anxiety Ring', variant: 'Moon & Stars', color: 'Gold', colorHex: '#D4AF37', price: 4.99, image: 'https://cf.cjdropshipping.com/31d2b043-00ce-4785-8b80-c10d8c06d408.jpg', cjPid: '1463420820905922560', cjVid: '1463420820998197248' },
      { sku: 'CJ-RING-WAVE', name: 'Fidget Anxiety Ring', variant: 'Wave', color: 'Silver', colorHex: '#C0C0C0', price: 4.99, image: 'https://cf.cjdropshipping.com/ae0a37d6-214b-4d97-b4ed-245b6027bb83.jpg', cjPid: '1463420820905922560', cjVid: '1463420820998197249' },
    ],
    defaultVariantIndex: 0,
    description: `<p>Elegant spinner rings designed for discrete stress relief. The rotating band spins smoothly around your finger, providing a calming fidget experience that looks like stylish jewelry.</p>
<p>Made from copper with natural zircon accents and dripping oil treatment for a premium finish. Perfect for anxiety relief during meetings, classes, or any time you need to stay calm and focused.</p>`,
    features: [
      'Discrete fidget jewelry',
      'Smooth spinning band',
      'Multiple elegant designs',
      'Natural zircon accents',
      'Copper construction',
    ],
    specifications: {
      'Material': 'Copper with Zircon',
      'Style': 'Fashion Ring',
      'Weight': '1-14g',
      'Type': 'Spinner Ring',
    },
    moods: ['calm', 'focus'],
    audiences: ['adults', 'office'],
    textures: ['smooth'],
    ageRecommendation: '12+',
    materials: ['Copper', 'Zircon'],
    isNew: true,
    relatedSlugs: ['cj-spinner-keychain', 'fidget-cube', 'cj-alloy-spinner'],
    metaTitle: 'Fidget Anxiety Ring | Fidget WRLD',
    metaDescription: 'Elegant spinner rings for discrete stress relief. Stylish fidget jewelry with smooth rotating bands.',
  },
  // Product 7: Vintage Heart Rotating Ring (CJ PID: 1547121202051952640)
  {
    slug: 'cj-heart-spinner-ring',
    name: 'Heart Spinner Ring',
    tagline: 'Self-love meets stress relief',
    category: 'Desk Toy',
    variants: [
      { sku: 'CJ-HEART-RING-5', name: 'Heart Spinner Ring', variant: 'Size 5', price: 4.99, image: 'https://cf.cjdropshipping.com/quick/product/b14f01c3-5fa9-4a92-a076-108edd15c9da.jpg', cjPid: '1547121202051952640', cjVid: '1547121202454605824' },
      { sku: 'CJ-HEART-RING-6', name: 'Heart Spinner Ring', variant: 'Size 6', price: 4.99, image: 'https://cf.cjdropshipping.com/quick/product/b14f01c3-5fa9-4a92-a076-108edd15c9da.jpg', cjPid: '1547121202051952640', cjVid: '1547121202437828608' },
      { sku: 'CJ-HEART-RING-7', name: 'Heart Spinner Ring', variant: 'Size 7', price: 4.99, image: 'https://cf.cjdropshipping.com/quick/product/b14f01c3-5fa9-4a92-a076-108edd15c9da.jpg', cjPid: '1547121202051952640', cjVid: '1547121202442022912' },
      { sku: 'CJ-HEART-RING-8', name: 'Heart Spinner Ring', variant: 'Size 8', price: 4.99, image: 'https://cf.cjdropshipping.com/quick/product/b14f01c3-5fa9-4a92-a076-108edd15c9da.jpg', cjPid: '1547121202051952640', cjVid: '1547121202446217216' },
      { sku: 'CJ-HEART-RING-9', name: 'Heart Spinner Ring', variant: 'Size 9', price: 4.99, image: 'https://cf.cjdropshipping.com/quick/product/b14f01c3-5fa9-4a92-a076-108edd15c9da.jpg', cjPid: '1547121202051952640', cjVid: '1547121202446217217' },
      { sku: 'CJ-HEART-RING-10', name: 'Heart Spinner Ring', variant: 'Size 10', price: 4.99, image: 'https://cf.cjdropshipping.com/quick/product/b14f01c3-5fa9-4a92-a076-108edd15c9da.jpg', cjPid: '1547121202051952640', cjVid: '1547121202450411520' },
      { sku: 'CJ-HEART-RING-11', name: 'Heart Spinner Ring', variant: 'Size 11', price: 4.99, image: 'https://cf.cjdropshipping.com/quick/product/b14f01c3-5fa9-4a92-a076-108edd15c9da.jpg', cjPid: '1547121202051952640', cjVid: '1547121202450411521' },
    ],
    defaultVariantIndex: 2,
    description: `<p>A beautiful two-tone heart spinner ring with three rotatable circles. Turn them to relieve anxiety while wearing gorgeous jewelry that catches everyone's eye.</p>
<p>The detachable spinning hearts can be manually repositioned for a custom look. Perfect as a self-love reminder or meditation aid. Makes a wonderful gift for girls and women of all ages.</p>`,
    features: [
      'Three rotatable heart circles',
      'Two-tone vintage design',
      'Detachable & repositionable hearts',
      'Comfortable fit, no sharp edges',
      'Available in sizes 5-11',
    ],
    specifications: {
      'Material': 'Electroplated Metal',
      'Style': 'Vintage Heart',
      'Weight': '10-19g',
      'Sizes': '5, 6, 7, 8, 9, 10, 11',
    },
    moods: ['calm', 'focus'],
    audiences: ['adults', 'office'],
    textures: ['smooth'],
    ageRecommendation: '12+',
    materials: ['Metal'],
    isNew: true,
    relatedSlugs: ['cj-fidget-ring', 'cj-spinner-keychain', 'fidget-cube'],
    metaTitle: 'Heart Spinner Ring | Fidget WRLD',
    metaDescription: 'Vintage two-tone heart spinner ring with rotatable hearts. Beautiful anxiety relief jewelry in sizes 5-11.',
  },
  // Product 8: Magic Sand (CJ PID: FC3E917A-0094-45D1-B80E-053F7EFFDBE5)
  {
    slug: 'cj-magic-sand',
    name: 'Magic Sand',
    tagline: 'Sculpt, mold, and play',
    category: 'Squishy',
    variants: [
      { sku: 'CJ-SAND-PINK', name: 'Magic Sand', variant: 'Pink', color: 'Pink', colorHex: '#FF69B4', price: 2.99, image: 'https://cf.cjdropshipping.com/20190803/2446172977195.jpg', cjPid: 'FC3E917A-0094-45D1-B80E-053F7EFFDBE5', cjVid: 'A5ABB0BD-7FCC-4ECF-9D0D-6CD7DD0D42FC', cjWarehouse: 'US' },
      { sku: 'CJ-SAND-PURPLE', name: 'Magic Sand', variant: 'Purple', color: 'Purple', colorHex: '#8A2BE2', price: 2.99, image: 'https://cf.cjdropshipping.com/20190803/38729033035632.jpg', cjPid: 'FC3E917A-0094-45D1-B80E-053F7EFFDBE5', cjVid: 'FD9C9C1E-E612-4034-93C7-78939D29B074', cjWarehouse: 'US' },
      { sku: 'CJ-SAND-BLUE', name: 'Magic Sand', variant: 'Blue', color: 'Blue', colorHex: '#1E90FF', price: 2.99, image: 'https://cf.cjdropshipping.com/20190803/196979096855.jpg', inventory: 0, cjPid: 'FC3E917A-0094-45D1-B80E-053F7EFFDBE5', cjVid: 'D7940AE6-F68E-49C7-8D22-7A2BA68E5FE8', cjWarehouse: 'US' },
      { sku: 'CJ-SAND-RED', name: 'Magic Sand', variant: 'Red', color: 'Red', colorHex: '#DC143C', price: 2.99, image: 'https://cf.cjdropshipping.com/20190803/1572400752072.jpg', cjPid: 'FC3E917A-0094-45D1-B80E-053F7EFFDBE5', cjVid: '5BF25D63-320E-4C9B-8027-4073BD296D6A', cjWarehouse: 'US' },
      { sku: 'CJ-SAND-ORANGE', name: 'Magic Sand', variant: 'Orange', color: 'Orange', colorHex: '#FF8C00', price: 2.99, image: 'https://cf.cjdropshipping.com/15647616/1567367686041.jpg', cjPid: 'FC3E917A-0094-45D1-B80E-053F7EFFDBE5', cjVid: 'A411EC20-8A02-403A-8A6B-FDC97A8219DD', cjWarehouse: 'US' },
      { sku: 'CJ-SAND-YELLOW', name: 'Magic Sand', variant: 'Yellow', color: 'Yellow', colorHex: '#FFD700', price: 2.99, image: 'https://cf.cjdropshipping.com/20190803/810830999777.jpg', cjPid: 'FC3E917A-0094-45D1-B80E-053F7EFFDBE5', cjVid: '1E13C8E1-76A1-42C4-8B6B-393603B48FFD', cjWarehouse: 'US' },
      { sku: 'CJ-SAND-4PACK', name: 'Magic Sand', variant: '4-Pack', price: 9.99, image: 'https://cf.cjdropshipping.com/4386ae6c-5fd4-4052-b37a-0c228b9dea3a.jpg', inventory: 0, cjPid: 'FC3E917A-0094-45D1-B80E-053F7EFFDBE5', cjVid: '1549323625495539712', cjWarehouse: 'US' },
    ],
    defaultVariantIndex: 0,
    description: `<p>Experience the magic of hydrophobic sand that never gets wet! This amazing Mars Space Sand can be molded, sculpted, and shaped into endless creations, then breaks apart with a satisfying texture.</p>
<p>Non-toxic and safe for kids, this educational toy promotes creativity, fine motor skills, and sensory play. Unlike regular sand, it stays dry even underwater and cleans up easily without mess.</p>`,
    features: [
      'Hydrophobic - stays dry underwater',
      'Non-toxic and safe for kids',
      'Moldable and sculptable',
      'Easy cleanup - no mess',
      'Promotes creativity and fine motor skills',
    ],
    specifications: {
      'Material': 'Hydrophobic Sand',
      'Weight': '200g per pack',
      'Type': 'Sensory / Educational Toy',
      'Safety': 'Non-toxic',
    },
    moods: ['play', 'calm', 'focus'],
    audiences: ['kids', 'all'],
    textures: ['soft', 'mixed'],
    ageRecommendation: '3+',
    materials: ['Hydrophobic Sand'],
    isNew: true,
    relatedSlugs: ['cj-popcorn-squishy', 'stress-ball-set', 'cj-sticky-wall-ball'],
    metaTitle: 'Magic Sand | Fidget WRLD',
    metaDescription: 'Hydrophobic magic sand that never gets wet. Non-toxic, moldable sensory toy for creative play. Available in 6 colors.',
  },
  // Product 9: Magnetic Putty (CJ PID: 97C637BB-DB86-49D1-9B55-E94F6A46D2A6)
  {
    slug: 'cj-magnetic-putty',
    name: 'Magnetic Putty',
    tagline: 'Mesmerizing magnetic magic',
    category: 'Magnetic',
    variants: [
      { sku: 'CJ-MAGPUTTY-BLK', name: 'Magnetic Putty', variant: 'Black', color: 'Black', colorHex: '#2a2a2a', price: 3.99, image: 'https://cf.cjdropshipping.com/15144192/1945421527452.png', inventory: 0, cjPid: '97C637BB-DB86-49D1-9B55-E94F6A46D2A6', cjVid: '7F085E6B-3BB8-4F73-9779-6E08AE34E93F' },
      { sku: 'CJ-MAGPUTTY-BLU', name: 'Magnetic Putty', variant: 'Blue', color: 'Blue', colorHex: '#1E90FF', price: 3.99, image: 'https://cf.cjdropshipping.com/15144192/550769235177.png', inventory: 0, cjPid: '97C637BB-DB86-49D1-9B55-E94F6A46D2A6', cjVid: 'F9EAF989-836D-49F0-BBA6-8465BCD07079' },
      { sku: 'CJ-MAGPUTTY-ORG', name: 'Magnetic Putty', variant: 'Orange', color: 'Orange', colorHex: '#FF8C00', price: 3.99, image: 'https://cf.cjdropshipping.com/15144192/11754451409688.png', cjPid: '97C637BB-DB86-49D1-9B55-E94F6A46D2A6', cjVid: 'EE24B741-6B0E-49BD-9250-DF96275CFA65' },
      { sku: 'CJ-MAGPUTTY-GRN', name: 'Magnetic Putty', variant: 'Green', color: 'Green', colorHex: '#32CD32', price: 3.99, image: 'https://cf.cjdropshipping.com/15144192/577122354972.png', cjPid: '97C637BB-DB86-49D1-9B55-E94F6A46D2A6', cjVid: '2B9FE862-9735-4273-8DA2-8D8519127ECE' },
      { sku: 'CJ-MAGPUTTY-PNK', name: 'Magnetic Putty', variant: 'Pink', color: 'Pink', colorHex: '#FF69B4', price: 3.99, image: 'https://cf.cjdropshipping.com/15144192/1488641220192.png', cjPid: '97C637BB-DB86-49D1-9B55-E94F6A46D2A6', cjVid: '032B016D-2656-4C3F-A7A6-6ABADB1B5694' },
      { sku: 'CJ-MAGPUTTY-SLV', name: 'Magnetic Putty', variant: 'Silver', color: 'Silver', colorHex: '#C0C0C0', price: 3.99, image: 'https://cf.cjdropshipping.com/15144192/765565698135.png', cjPid: '97C637BB-DB86-49D1-9B55-E94F6A46D2A6', cjVid: 'DA889DF1-BADD-4851-B2C2-C500DE219C5D' },
      { sku: 'CJ-MAGPUTTY-6PK', name: 'Magnetic Putty', variant: '6-Pack', price: 14.99, image: 'https://cf.cjdropshipping.com/15144192/2977873394650.png', inventory: 0, cjPid: '97C637BB-DB86-49D1-9B55-E94F6A46D2A6', cjVid: '27A9BB5A-4B5B-43C1-B756-B1BB158CC67C' },
    ],
    defaultVariantIndex: 2,
    description: `<p>Watch in amazement as this incredible magnetic putty comes alive! Place a magnet nearby and watch the putty slowly engulf it, creating mesmerizing tendrils and shapes as it responds to the magnetic field.</p>
<p>Perfect for stress relief and ASMR-style relaxation. The putty is soft, pliable, and endlessly entertaining. Great for desk fidgeting, science demonstrations, or just mesmerizing fun.</p>`,
    features: [
      'Responds to magnetic fields',
      'Soft and pliable texture',
      'Mesmerizing ASMR-style movement',
      'Great for stress relief',
      'Includes strong magnet',
    ],
    specifications: {
      'Material': 'Magnetic Putty Compound',
      'Weight': '50g per tin',
      'Includes': 'Putty + Magnet',
      'Type': 'Magnetic Fidget Toy',
    },
    moods: ['calm', 'focus', 'play'],
    audiences: ['adults', 'kids', 'office'],
    textures: ['soft', 'smooth'],
    ageRecommendation: '8+',
    materials: ['Magnetic Putty', 'Iron Particles'],
    isNew: true,
    relatedSlugs: ['magnet-balls', 'cj-ferrofluid-speaker', 'cj-magic-sand'],
    metaTitle: 'Magnetic Putty | Fidget WRLD',
    metaDescription: 'Mesmerizing magnetic putty that swallows magnets. Watch it come alive with incredible magnetic effects. Perfect stress relief fidget toy.',
  },
];

// Add CJ products to the main product list
productPages.push(...cjDropshippingProducts);
