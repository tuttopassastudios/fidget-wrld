import type { ProductPage, ProductVariant, BulkTier, ProductCategory } from '@/types';

export const bulkTiers: BulkTier[] = [
  { qty: 3, discount: 10, label: '10% off' },
  { qty: 5, discount: 15, label: '15% off' },
  { qty: 10, discount: 20, label: '20% off' },
];

export const productPages: ProductPage[] = [
  // ========== 3D PRINTED ==========
  {
    slug: 'dummy-13',
    name: 'Dummy 13 Action Figure',
    tagline: 'Fully articulated 3D-printed action figure — infinite poses, yours to customize',
    category: 'Collectible',
    fulfillmentType: '3d-printed',
    stlFile: '/models/dummy13-runners.stl',
    availableFilamentColorIds: ['white', 'black'],
    customizationOptions: {
      engravingText: false,
      keychainHole: false,
    },
    printLeadTime: '3–5 business days',
    variants: [
      {
        sku: '3DP-D13-WHT',
        name: 'Dummy 13 Action Figure',
        variant: 'Arctic White',
        color: 'Arctic White',
        colorHex: '#F8F8F8',
        filamentColorId: 'white',
        price: 39.99,
        image: '/images/products/dummy-13.jpg',
        inventory: 999,
      },
      {
        sku: '3DP-D13-BLK',
        name: 'Dummy 13 Action Figure',
        variant: 'Midnight Black',
        color: 'Midnight Black',
        colorHex: '#1A1A1A',
        filamentColorId: 'black',
        price: 39.99,
        image: '/images/products/dummy-13.jpg',
        inventory: 999,
      },
    ],
    defaultVariantIndex: 0,
    description: `<p>Dummy 13 is a 3D-printable action figure designed for super expressive articulation and infinite customization, accessible to anyone with a 3D printer. Your kit arrives as two parts-on-runners — the armor runner and the frame runner — printed in your chosen color and ready to pop apart and assemble. Every joint is engineered for maximum range of motion so you can strike virtually any pose imaginable.</p>`,
    features: [
      'Fully articulated — expressive poses in every direction',
      'Ships as two parts-on-runners (armor + frame)',
      'Requires light assembly — snap parts off runners and connect',
      'Made to order — printed in-house',
      'Choose your filament color',
      'Designed for infinite customization',
    ],
    specifications: {
      'Material': 'PLA Filament',
      'Kit Contents': 'Armor runner + Frame runner',
      'Assembly': 'Snap-fit, no tools or glue required',
      'Lead Time': '3–5 business days',
    },
    moods: ['play', 'collect'],
    audiences: ['kids', 'adults', 'all'],
    textures: ['smooth'],
    ageRecommendation: '10+',
    materials: ['PLA Plastic'],
    isNew: true,
    relatedSlugs: ['infinity-cube', 'click-clack-swoosh'],
    metaTitle: 'Dummy 13 Action Figure | Custom 3D-Printed | Fidget WRLD',
    metaDescription: 'Dummy 13 is a fully articulated 3D-printed action figure kit. Shipped as parts on runners, assembled in minutes. Made to order in your choice of color.',
  },
  {
    slug: 'click-clack-swoosh',
    name: 'Click Clack Swoosh',
    tagline: 'Satisfying clicks and swooshes — print-in-place, made to order',
    category: 'Clicky',
    fulfillmentType: '3d-printed',
    stlFile: '/models/click-clack-swoosh.stl',
    availableFilamentColorIds: ['white', 'black'],
    customizationOptions: {
      engravingText: true,
      keychainHole: true,
    },
    printLeadTime: '3–5 business days',
    variants: [
      {
        sku: '3DP-CCS-WHT',
        name: 'Click Clack Swoosh',
        variant: 'Arctic White',
        color: 'Arctic White',
        colorHex: '#F8F8F8',
        filamentColorId: 'white',
        price: 14.99,
        image: '/images/products/click-clack-swoosh.jpg',
        inventory: 999,
      },
      {
        sku: '3DP-CCS-BLK',
        name: 'Click Clack Swoosh',
        variant: 'Midnight Black',
        color: 'Midnight Black',
        colorHex: '#1A1A1A',
        filamentColorId: 'black',
        price: 14.99,
        image: '/images/products/click-clack-swoosh.jpg',
        inventory: 999,
      },
    ],
    defaultVariantIndex: 0,
    description: `<p>The Click Clack Swoosh is a fast, satisfying print-in-place fidget toy that delivers tactile clicks and smooth swooshing motion straight out of the printer — no assembly required. At just 32 minutes of print time, it is one of our quickest builds without sacrificing quality. The repetitive clicking and fluid movement make it ideal for staying focused or winding down.</p>`,
    features: [
      'Print-in-place — comes off the printer fully assembled',
      'Satisfying click and swoosh action',
      '32-minute print — quick turnaround',
      'Made to order — printed in-house',
      'Choose your filament color',
      'Optional text engraving',
      'Optional keychain hole add-on',
    ],
    specifications: {
      'Material': 'PLA Filament',
      'Print Style': 'Print-in-place (no assembly)',
      'Print Time': '~32 minutes',
      'Lead Time': '3–5 business days',
    },
    moods: ['focus', 'play', 'calm'],
    audiences: ['adults', 'kids', 'office'],
    textures: ['smooth', 'bumpy'],
    ageRecommendation: '6+',
    materials: ['PLA Plastic'],
    isNew: true,
    relatedSlugs: ['infinity-cube', 'magnet-balls'],
    metaTitle: 'Click Clack Swoosh | Custom 3D-Printed Fidget Toy | Fidget WRLD',
    metaDescription: 'The Click Clack Swoosh is a print-in-place fidget toy with satisfying click and swoosh action. Made to order in your choice of color. Ships in 3–5 business days.',
  },
  {
    slug: 'infinity-cube',
    name: 'Infinity Cube',
    tagline: 'The endless fold — print-in-place, made to order',
    category: 'Clicky',
    fulfillmentType: '3d-printed',
    stlFile: '/models/yafic_v2.stl',
    availableFilamentColorIds: ['white', 'black'],
    customizationOptions: {
      engravingText: true,
      keychainHole: true,
    },
    printLeadTime: '3–5 business days',
    variants: [
      {
        sku: '3DP-INFCUBE-WHT',
        name: 'Infinity Cube',
        variant: 'Arctic White',
        color: 'Arctic White',
        colorHex: '#F8F8F8',
        filamentColorId: 'white',
        price: 19.99,
        image: '/images/products/infinity-cube.jpg',
        inventory: 999,
      },
      {
        sku: '3DP-INFCUBE-BLK',
        name: 'Infinity Cube',
        variant: 'Midnight Black',
        color: 'Midnight Black',
        colorHex: '#1A1A1A',
        filamentColorId: 'black',
        price: 19.99,
        image: '/images/products/infinity-cube.jpg',
        inventory: 999,
      },
    ],
    defaultVariantIndex: 0,
    description: `<p>The Infinity Cube is a classic kinetic toy made of eight interconnected cubes that can be folded and unfolded endlessly in a continuous, mesmerizing motion. As a "print-in-place" model, it comes directly off the 3D printer fully assembled, though a well-calibrated machine is essential to ensure its joints print correctly. It prints easily in PLA plastic without needing support material, providing a smooth, repetitive, and quiet fidget experience that is excellent for improving focus in calm settings.</p>`,
    features: [
      'Print-in-place — comes off the printer fully assembled',
      'Eight interconnected cubes, endless fold cycle',
      'No support material needed',
      'Made to order — printed in-house',
      'Choose your filament color',
      'Optional text engraving',
      'Optional keychain hole add-on',
    ],
    specifications: {
      'Material': 'PLA Filament',
      'Print Style': 'Print-in-place (no assembly)',
      'Print Resolution': '0.2mm layer height',
      'Lead Time': '3–5 business days',
    },
    moods: ['focus', 'calm'],
    audiences: ['adults', 'kids', 'office'],
    textures: ['smooth'],
    ageRecommendation: '8+',
    materials: ['PLA Plastic'],
    isNew: true,
    relatedSlugs: ['magnet-balls', 'fidget-cube'],
    metaTitle: 'Infinity Cube | Custom 3D-Printed Fidget Toy | Fidget WRLD',
    metaDescription: 'The Infinity Cube is a print-in-place fidget toy — eight interconnected cubes that fold endlessly. Made to order in your choice of color.',
  },

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
    relatedSlugs: ['fidget-cube', 'stress-ball-set'],
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
    relatedSlugs: ['magnet-balls', 'fidget-cube'],
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
    relatedSlugs: ['magnet-balls', 'stress-ball-set'],
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
// In-stock products fulfilled from US warehouse
export const cjDropshippingProducts: ProductPage[] = [
  // Magic Sand — US warehouse (Pink, Purple, Red, Orange, Yellow in stock)
  {
    slug: 'cj-magic-sand',
    name: 'Magic Sand',
    tagline: 'Sculpt, mold, and play',
    category: 'Squishy',
    variants: [
      { sku: 'CJ-SAND-PINK', name: 'Magic Sand', variant: 'Pink', color: 'Pink', colorHex: '#FF69B4', price: 2.99, image: 'https://cf.cjdropshipping.com/20190803/2446172977195.jpg', cjPid: 'FC3E917A-0094-45D1-B80E-053F7EFFDBE5', cjVid: 'A5ABB0BD-7FCC-4ECF-9D0D-6CD7DD0D42FC', cjWarehouse: 'US' },
      { sku: 'CJ-SAND-PURPLE', name: 'Magic Sand', variant: 'Purple', color: 'Purple', colorHex: '#8A2BE2', price: 2.99, image: 'https://cf.cjdropshipping.com/20190803/38729033035632.jpg', cjPid: 'FC3E917A-0094-45D1-B80E-053F7EFFDBE5', cjVid: 'FD9C9C1E-E612-4034-93C7-78939D29B074', cjWarehouse: 'US' },
      { sku: 'CJ-SAND-BLUE', name: 'Magic Sand', variant: 'Blue', color: 'Blue', colorHex: '#1E90FF', price: 2.99, inventory: 0, image: 'https://cf.cjdropshipping.com/20190803/196979096855.jpg', cjPid: 'FC3E917A-0094-45D1-B80E-053F7EFFDBE5', cjVid: 'D7940AE6-F68E-49C7-8D22-7A2BA68E5FE8', cjWarehouse: 'CN' },
      { sku: 'CJ-SAND-RED', name: 'Magic Sand', variant: 'Red', color: 'Red', colorHex: '#DC143C', price: 2.99, image: 'https://cf.cjdropshipping.com/20190803/1572400752072.jpg', cjPid: 'FC3E917A-0094-45D1-B80E-053F7EFFDBE5', cjVid: '5BF25D63-320E-4C9B-8027-4073BD296D6A', cjWarehouse: 'US' },
      { sku: 'CJ-SAND-ORANGE', name: 'Magic Sand', variant: 'Orange', color: 'Orange', colorHex: '#FF8C00', price: 2.99, image: 'https://cf.cjdropshipping.com/15647616/1567367686041.jpg', cjPid: 'FC3E917A-0094-45D1-B80E-053F7EFFDBE5', cjVid: 'A411EC20-8A02-403A-8A6B-FDC97A8219DD', cjWarehouse: 'US' },
      { sku: 'CJ-SAND-YELLOW', name: 'Magic Sand', variant: 'Yellow', color: 'Yellow', colorHex: '#FFD700', price: 2.99, image: 'https://cf.cjdropshipping.com/20190803/810830999777.jpg', cjPid: 'FC3E917A-0094-45D1-B80E-053F7EFFDBE5', cjVid: '1E13C8E1-76A1-42C4-8B6B-393603B48FFD', cjWarehouse: 'US' },
      { sku: 'CJ-SAND-4PACK', name: 'Magic Sand', variant: '4-Pack', price: 9.99, inventory: 0, image: 'https://cf.cjdropshipping.com/4386ae6c-5fd4-4052-b37a-0c228b9dea3a.jpg', cjPid: 'FC3E917A-0094-45D1-B80E-053F7EFFDBE5', cjVid: '1549323625495539712', cjWarehouse: 'CN' },
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
    isBestseller: false,
    relatedSlugs: ['cj-magnetic-putty', 'stress-ball-set', 'cj-crystal-slime'],
    metaTitle: 'Magic Sand | Fidget WRLD',
    metaDescription: 'Hydrophobic magic sand that never gets wet. Non-toxic, moldable sensory toy for creative play. Available in 6 colors.',
  },
  // Magnetic Putty — US warehouse (Orange, Green, Pink, Silver in stock)
  {
    slug: 'cj-magnetic-putty',
    name: 'Magnetic Putty',
    tagline: 'Mesmerizing magnetic magic',
    category: 'Magnetic',
    variants: [
      { sku: 'CJ-MAGPUTTY-BLK', name: 'Magnetic Putty', variant: 'Black', color: 'Black', colorHex: '#2a2a2a', price: 3.99, image: 'https://cf.cjdropshipping.com/15144192/1945421527452.png', inventory: 0, cjPid: '97C637BB-DB86-49D1-9B55-E94F6A46D2A6', cjVid: '7F085E6B-3BB8-4F73-9779-6E08AE34E93F' },
      { sku: 'CJ-MAGPUTTY-BLU', name: 'Magnetic Putty', variant: 'Blue', color: 'Blue', colorHex: '#1E90FF', price: 3.99, image: 'https://cf.cjdropshipping.com/15144192/550769235177.png', inventory: 0, cjPid: '97C637BB-DB86-49D1-9B55-E94F6A46D2A6', cjVid: 'F9EAF989-836D-49F0-BBA6-8465BCD07079' },
      { sku: 'CJ-MAGPUTTY-ORG', name: 'Magnetic Putty', variant: 'Orange', color: 'Orange', colorHex: '#FF8C00', price: 3.99, image: 'https://cf.cjdropshipping.com/15144192/11754451409688.png', cjPid: '97C637BB-DB86-49D1-9B55-E94F6A46D2A6', cjVid: 'EE24B741-6B0E-49BD-9250-DF96275CFA65', cjWarehouse: 'US' },
      { sku: 'CJ-MAGPUTTY-GRN', name: 'Magnetic Putty', variant: 'Green', color: 'Green', colorHex: '#32CD32', price: 3.99, image: 'https://cf.cjdropshipping.com/15144192/577122354972.png', cjPid: '97C637BB-DB86-49D1-9B55-E94F6A46D2A6', cjVid: '2B9FE862-9735-4273-8DA2-8D8519127ECE', cjWarehouse: 'US' },
      { sku: 'CJ-MAGPUTTY-PNK', name: 'Magnetic Putty', variant: 'Pink', color: 'Pink', colorHex: '#FF69B4', price: 3.99, image: 'https://cf.cjdropshipping.com/15144192/1488641220192.png', cjPid: '97C637BB-DB86-49D1-9B55-E94F6A46D2A6', cjVid: '032B016D-2656-4C3F-A7A6-6ABADB1B5694', cjWarehouse: 'US' },
      { sku: 'CJ-MAGPUTTY-SLV', name: 'Magnetic Putty', variant: 'Silver', color: 'Silver', colorHex: '#C0C0C0', price: 3.99, image: 'https://cf.cjdropshipping.com/15144192/765565698135.png', cjPid: '97C637BB-DB86-49D1-9B55-E94F6A46D2A6', cjVid: 'DA889DF1-BADD-4851-B2C2-C500DE219C5D', cjWarehouse: 'US' },
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
    isBestseller: true,
    relatedSlugs: ['magnet-balls', 'cj-magic-sand', 'cj-crystal-slime'],
    metaTitle: 'Magnetic Putty | Fidget WRLD',
    metaDescription: 'Mesmerizing magnetic putty that swallows magnets. Watch it come alive with incredible magnetic effects. Perfect stress relief fidget toy.',
  },
  // Sensory Twist Stick — 667 units in US warehouse
  {
    slug: 'cj-sensory-twist-stick',
    name: 'Sensory Twist Stick',
    tagline: 'Bend it, twist it, feel it',
    category: 'Clicky',
    variants: [
      { sku: 'CJ-TWIST-STICK', name: 'Sensory Twist Stick', variant: 'Variety Pack (6 pcs)', price: 19.99, inventory: 667, image: 'https://cf.cjdropshipping.com/6644ab24-b26c-4c1c-9e15-05269ffadeb1.png', cjPid: '1968510332013142017', cjVid: '1968510332097028097', cjWarehouse: 'US' },
    ],
    defaultVariantIndex: 0,
    description: `<p>The Sensory Twist Stick is the satisfying decompression toy you didn't know you needed. Twist it, bend it, and flex it in endless configurations — each movement delivers tactile feedback that melts stress away.</p>
<p>Compact enough for a desk, backpack, or pocket, this stick is perfect for keeping hands busy during meetings, studying, or any time anxiety creeps in. The smooth resistance of each twist is endlessly repeatable and never gets old.</p>`,
    features: [
      'Satisfying twist and flex resistance',
      'Compact — fits in pocket or bag',
      'Quiet and desk-friendly',
      'Endless configurations to explore',
      'Ships from US warehouse — fast delivery',
    ],
    specifications: {
      'Weight': '104g',
      'Type': 'Decompression Twist Stick',
      'SKU': 'CJYZ2533527',
    },
    moods: ['calm', 'focus'],
    audiences: ['adults', 'kids', 'office'],
    textures: ['smooth'],
    ageRecommendation: '6+',
    materials: ['Plastic'],
    isNew: true,
    isBestseller: true,
    relatedSlugs: ['cj-magic-sand', 'cj-magnetic-putty', 'fidget-cube'],
    metaTitle: 'Sensory Twist Stick | Fidget WRLD',
    metaDescription: 'Bend, twist, and flex your stress away with the Sensory Twist Stick. 667 units in US warehouse — fast shipping.',
  },
  // Crystal Mud Slime — 76-95 units in US warehouse
  {
    slug: 'cj-crystal-slime',
    name: 'Crystal Mud Slime',
    tagline: 'Stretch it, squish it, zone out',
    category: 'Squishy',
    variants: [
      { sku: 'CJ-SLIME-BLGRN', name: 'Crystal Mud Slime', variant: 'Blue/Green', color: 'Blue/Green', colorHex: '#00CED1', price: 4.99, inventory: 95, image: 'https://cf.cjdropshipping.com/15465312/743928183936.jpg', cjPid: '76FABA4F-4632-40A3-834E-B3986701A663', cjVid: '0165F45D-C692-4F48-8FB9-FDD49A1FA7A1', cjWarehouse: 'US' },
      { sku: 'CJ-SLIME-BLPNK', name: 'Crystal Mud Slime', variant: 'Blue/Pink', color: 'Blue/Pink', colorHex: '#FF69B4', price: 4.99, inventory: 91, image: 'https://cf.cjdropshipping.com/15465312/1055366378112.jpg', cjPid: '76FABA4F-4632-40A3-834E-B3986701A663', cjVid: '3C5A4838-93A7-4260-A36F-6138BDE52885', cjWarehouse: 'US' },
      { sku: 'CJ-SLIME-BLPUR', name: 'Crystal Mud Slime', variant: 'Blue/Purple', color: 'Blue/Purple', colorHex: '#8A2BE2', price: 4.99, inventory: 76, image: 'https://cf.cjdropshipping.com/15465312/2090230617046.jpg', cjPid: '76FABA4F-4632-40A3-834E-B3986701A663', cjVid: '447BD75A-F7AD-4DF3-A6D4-99475829E337', cjWarehouse: 'US' },
    ],
    defaultVariantIndex: 0,
    description: `<p>Lose yourself in the mesmerizing gradient swirls of our Crystal Mud Slime. This ultra-clear crystal slime stretches, squishes, and flows in ways that are deeply satisfying to watch and feel.</p>
<p>The two-tone gradient creates a hypnotic color blend as you play. Each 60ml jar is the perfect desk companion — pop it open, stretch a strand, and feel the stress disappear. Non-sticky, non-toxic, and endlessly re-playable.</p>`,
    features: [
      'Stunning gradient two-tone color swirls',
      'Ultra-clear crystal texture',
      'Non-sticky and non-toxic formula',
      '60ml jar — perfect desk size',
      'Ships from US warehouse — fast delivery',
    ],
    specifications: {
      'Volume': '60ml per jar',
      'Weight': '37–110g',
      'Type': 'Crystal Mud Slime',
      'Safety': 'Non-toxic',
    },
    moods: ['calm', 'play'],
    audiences: ['kids', 'adults'],
    textures: ['soft', 'smooth'],
    ageRecommendation: '6+',
    materials: ['Crystal Mud'],
    isNew: true,
    isBestseller: true,
    relatedSlugs: ['cj-magic-sand', 'cj-magnetic-putty', 'stress-ball-set'],
    metaTitle: 'Crystal Mud Slime | Fidget WRLD',
    metaDescription: 'Two-tone gradient crystal mud slime — stretch it, squish it, zone out. Non-toxic 60ml jar ships from US warehouse.',
  },
  // Cotton Cloud Slime — 41-102 units in US warehouse
  {
    slug: 'cj-cotton-slime',
    name: 'Cotton Cloud Slime',
    tagline: 'Soft as a cloud, satisfying as ever',
    category: 'Squishy',
    variants: [
      { sku: 'CJ-COTTON-SLIME-BLU', name: 'Cotton Cloud Slime', variant: 'Blue', color: 'Blue', colorHex: '#1E90FF', price: 4.99, inventory: 102, image: 'https://cf.cjdropshipping.com/ff0e4e07-3c4d-42b9-94a3-7ae196f2cd32.jpg', cjPid: '1399935069627486208', cjVid: '1605049879640944640', cjWarehouse: 'US' },
      { sku: 'CJ-COTTON-SLIME-PKB', name: 'Cotton Cloud Slime', variant: 'Pink and Blue', color: 'Pink/Blue', colorHex: '#FF69B4', price: 4.99, inventory: 41, image: 'https://cf.cjdropshipping.com/d7d1afbf-b257-469f-bb24-d792d3ca5ba2.jpg', cjPid: '1399935069627486208', cjVid: '1604670736529108992', cjWarehouse: 'US' },
    ],
    defaultVariantIndex: 0,
    description: `<p>Fluffy, stretchy, and impossibly soft — our Cotton Cloud Slime has the lightest, most satisfying texture of any slime you've tried. Poke it, pull it, and watch it slowly spring back like a real cloud.</p>
<p>The three-color swirl design creates a mesmerizing visual as you play. Non-sticky and non-toxic, it's the perfect sensory toy for kids and adults who need a calm, satisfying outlet for restless hands.</p>`,
    features: [
      'Ultra-fluffy cotton cloud texture',
      'Three-color swirl design',
      'Slow-rise, satisfying spring-back',
      'Non-sticky and non-toxic',
      'Ships from US warehouse — fast delivery',
    ],
    specifications: {
      'Weight': '100g',
      'Type': 'Cotton Cloud Slime',
      'Safety': 'Non-toxic',
    },
    moods: ['calm', 'play'],
    audiences: ['kids', 'adults'],
    textures: ['soft'],
    ageRecommendation: '6+',
    materials: ['Cotton Slime'],
    isNew: true,
    relatedSlugs: ['cj-crystal-slime', 'cj-magic-sand', 'stress-ball-set'],
    metaTitle: 'Cotton Cloud Slime | Fidget WRLD',
    metaDescription: 'Ultra-fluffy three-color cotton cloud slime — poke it, stretch it, feel the stress melt away. Ships from US warehouse.',
  },
  // Giant Goose Pillow — 83 units in US warehouse
  {
    slug: 'cj-goose-pillow',
    name: 'Giant Goose Pillow',
    tagline: 'Squeeze it, hug it, squish it',
    category: 'Squishy',
    variants: [
      { sku: 'CJ-GOOSE-190', name: 'Giant Goose Pillow', variant: '190cm', price: 22.99, inventory: 83, image: 'https://cf.cjdropshipping.com/quick/product/c78d27e9-d9c6-4f5b-bdfc-95f8afc2e00c.jpg', cjPid: '2406100313121600000', cjVid: '2406100313121600900', cjWarehouse: 'US' },
    ],
    defaultVariantIndex: 0,
    description: `<p>Meet the ultimate comfort companion — a giant 190cm goose plushie that doubles as a squishy stress toy. Soft enough to squish, big enough to hug, and satisfying enough to keep your hands busy all day.</p>
<p>The oversized plush body is filled with ultra-soft PP cotton for a pillowy, squeeze-able feel. Works as a body pillow, seat cushion, or just a giant friend to flop onto when stress hits.</p>`,
    features: [
      'Massive 190cm size — bigger than you',
      'Ultra-soft PP cotton fill',
      'Satisfying squish and hug texture',
      'Works as a body pillow or seat cushion',
      'Ships from US warehouse — fast delivery',
    ],
    specifications: {
      'Size': '190cm (75 inches)',
      'Fill': 'PP Cotton',
      'Color': 'White',
      'Weight': '~1900g',
    },
    moods: ['calm', 'play'],
    audiences: ['kids', 'adults'],
    textures: ['soft'],
    ageRecommendation: '3+',
    materials: ['Plush', 'PP Cotton'],
    isNew: true,
    relatedSlugs: ['cj-magic-sand', 'cj-magnetic-putty', 'stress-ball-set'],
    metaTitle: 'Giant Goose Pillow | Fidget WRLD',
    metaDescription: 'Giant 190cm goose plush pillow — squeeze it, hug it, squish it. Oversized stress-relief plushie ships from US warehouse.',
  },
];

// Add CJ products to the main product list
productPages.push(...cjDropshippingProducts);
