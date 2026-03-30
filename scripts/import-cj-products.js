/**
 * CJ Dropshipping Product Importer for Fidgetopia
 *
 * Fetches fidget products from CJ Dropshipping and converts them
 * to the Fidgetopia product format.
 *
 * Usage:
 *   node scripts/import-cj-products.js search    # Search and save raw CJ products
 *   node scripts/import-cj-products.js convert   # Convert saved products to Fidgetopia format
 *   node scripts/import-cj-products.js both      # Do both (with rate limit warning)
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const CJDropshipping = require('cj-dropshipping-sdk');

// Output paths
const RAW_PRODUCTS_PATH = path.join(__dirname, 'cj-products-raw.json');
const CONVERTED_PRODUCTS_PATH = path.join(__dirname, 'cj-products-converted.js');

// CJ API key from fidgetopia's env or fallback to CJ SDK env
const API_KEY = process.env.CJ_API_KEY || 'CJ3556407@api@12136edd24d14f27b10469e0f56fa300';

// Fidget-related search terms
const SEARCH_TERMS = [
  'fidget',
  'fidget toy',
  'fidget spinner',
  'stress ball',
  'pop it',
  'fidget cube',
  'squishy toy',
  'sensory toy',
];

// Category mapping from CJ categories to Fidgetopia categories
const CATEGORY_MAP = {
  'fidget spinner': 'Desk Toy',
  'fidget cube': 'Clicky',
  'fidget toy': 'Desk Toy',
  'stress ball': 'Squishy',
  'squishy': 'Squishy',
  'pop it': 'Clicky',
  'sensory': 'Stretchy',
  'magnetic': 'Magnetic',
  'putty': 'Stretchy',
  'slime': 'Stretchy',
  'squeeze': 'Squishy',
  'default': 'Desk Toy',
};

/**
 * Determine Fidgetopia category from product name/description
 */
function mapCategory(product) {
  const text = `${product.productNameEn || ''} ${product.description || ''}`.toLowerCase();

  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (keyword !== 'default' && text.includes(keyword)) {
      return category;
    }
  }
  return CATEGORY_MAP.default;
}

/**
 * Generate a URL-friendly slug from product name
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

/**
 * Generate SKU from CJ product ID
 */
function generateSku(pid, variantIndex = 0) {
  return `CJ-${pid.substring(0, 8).toUpperCase()}-${variantIndex}`;
}

/**
 * Determine moods based on product characteristics
 */
function determineMoods(product) {
  const text = `${product.productNameEn || ''} ${product.description || ''}`.toLowerCase();
  const moods = [];

  if (text.includes('stress') || text.includes('relax') || text.includes('calm')) {
    moods.push('calm');
  }
  if (text.includes('focus') || text.includes('adhd') || text.includes('anxiety')) {
    moods.push('focus');
  }
  if (text.includes('fun') || text.includes('play') || text.includes('game') || text.includes('kid')) {
    moods.push('play');
  }

  // Default if none detected
  if (moods.length === 0) {
    moods.push('focus', 'calm');
  }

  return moods;
}

/**
 * Determine target audiences
 */
function determineAudiences(product) {
  const text = `${product.productNameEn || ''} ${product.description || ''}`.toLowerCase();

  if (text.includes('kid') || text.includes('child')) {
    return ['kids', 'all'];
  }
  if (text.includes('office') || text.includes('desk') || text.includes('adult')) {
    return ['adults', 'office'];
  }
  return ['all'];
}

/**
 * Determine textures based on product type
 */
function determineTextures(category) {
  const textureMap = {
    'Squishy': ['soft'],
    'Stretchy': ['soft', 'smooth'],
    'Clicky': ['smooth'],
    'Magnetic': ['smooth'],
    'Desk Toy': ['smooth', 'mixed'],
    'Gift Set': ['mixed'],
    'Collectible': ['mixed'],
  };
  return textureMap[category] || ['smooth'];
}

/**
 * Convert CJ product to Fidgetopia format
 */
function convertToFidgetopiaProduct(cjProduct) {
  const name = cjProduct.productNameEn || cjProduct.productName || 'Fidget Toy';
  const slug = generateSlug(name);
  const category = mapCategory(cjProduct);

  // Create variants from CJ product
  const variants = [];
  if (cjProduct.variants && cjProduct.variants.length > 0) {
    cjProduct.variants.forEach((v, idx) => {
      variants.push({
        sku: generateSku(cjProduct.pid, idx),
        name: name,
        variant: v.variantNameEn || v.variantName || `Option ${idx + 1}`,
        price: parseFloat(v.variantSellPrice || cjProduct.sellPrice || 9.99),
        image: v.variantImage || cjProduct.productImage || '',
      });
    });
  } else {
    // Single variant product
    variants.push({
      sku: generateSku(cjProduct.pid, 0),
      name: name,
      variant: 'Default',
      price: parseFloat(cjProduct.sellPrice || 9.99),
      image: cjProduct.productImage || '',
    });
  }

  return {
    slug,
    name,
    tagline: 'Premium quality fidget toy',
    category,
    variants,
    defaultVariantIndex: 0,
    description: `<p>${cjProduct.description || cjProduct.productNameEn || 'High-quality fidget toy for stress relief and focus.'}</p>`,
    features: [
      'Premium quality materials',
      'Satisfying tactile feedback',
      'Perfect for stress relief',
      'Compact and portable',
      'Great for all ages',
    ],
    specifications: {
      'Material': cjProduct.materialEn || 'Premium Materials',
      'Weight': cjProduct.productWeight ? `${cjProduct.productWeight}g` : 'Lightweight',
    },
    moods: determineMoods(cjProduct),
    audiences: determineAudiences(cjProduct),
    textures: determineTextures(category),
    ageRecommendation: '6+',
    materials: cjProduct.materialEn ? [cjProduct.materialEn] : ['ABS', 'Silicone'],
    isNew: true,
    relatedSlugs: [],
    metaTitle: `${name} | Fidget WRLD`,
    metaDescription: `Shop ${name} - premium fidget toy for stress relief and focus. Free shipping on orders over $35.`,
    // Store CJ data for reference
    _cjData: {
      pid: cjProduct.pid,
      productSku: cjProduct.productSku,
      supplierId: cjProduct.supplierId,
    },
  };
}

/**
 * Search CJ Dropshipping for fidget products
 */
async function searchCJProducts() {
  console.log('Initializing CJ Dropshipping SDK...');

  const cj = new CJDropshipping({ apiKey: API_KEY });

  console.log('Searching for fidget products...\n');

  try {
    // Search for fidget products
    const results = await cj.product.searchProducts({
      keyword: 'fidget',
      pageNum: 1,
      pageSize: 50,
    });

    // Handle CJ's actual response structure
    let products = [];

    if (results.result && results.data) {
      // Try different response structures
      if (results.data.list) {
        products = results.data.list;
      } else if (results.data.content && results.data.content[0]?.productList) {
        products = results.data.content[0].productList;
      } else if (Array.isArray(results.data)) {
        products = results.data;
      }

      // Map to standardized format
      products = products.map(p => ({
        pid: p.id || p.pid,
        productNameEn: p.nameEn || p.productNameEn || p.name,
        productSku: p.sku || p.productSku,
        sellPrice: typeof p.sellPrice === 'string' ? parseFloat(p.sellPrice.split(' ')[0]) : (p.sellPrice || 9.99),
        productImage: p.bigImage || p.productImage || p.image,
        description: p.description || '',
        materialEn: p.materialEn || '',
        productWeight: p.productWeight || null,
        categoryId: p.categoryId,
        supplierId: p.supplierId,
      }));
    }

    if (products.length > 0) {
      console.log(`Found ${products.length} products`);

      // Filter to only include likely fidget toys
      const fidgetKeywords = ['fidget', 'spinner', 'cube', 'stress', 'pop', 'squishy', 'sensory', 'squeeze', 'toy'];
      const fidgetProducts = products.filter(p => {
        const name = (p.productNameEn || '').toLowerCase();
        return fidgetKeywords.some(kw => name.includes(kw));
      });

      console.log(`Filtered to ${fidgetProducts.length} fidget-related products`);

      // Save raw results
      fs.writeFileSync(RAW_PRODUCTS_PATH, JSON.stringify(fidgetProducts.length > 0 ? fidgetProducts : products, null, 2));
      console.log(`\nSaved raw products to: ${RAW_PRODUCTS_PATH}`);

      return fidgetProducts.length > 0 ? fidgetProducts : products;
    } else {
      console.log('No products found in response');
      console.log('Response structure:', JSON.stringify(Object.keys(results.data || {}), null, 2));
      return [];
    }
  } catch (error) {
    console.error('Error searching products:', error.message);
    if (error.code === 1600200 || error.message.includes('Too Many Requests')) {
      console.log('\nRate limited! CJ allows 1 request per 300 seconds.');
      console.log('Please wait 5 minutes and try again.');
    }
    throw error;
  }
}

/**
 * Convert saved CJ products to Fidgetopia format
 */
function convertProducts() {
  console.log('Loading raw CJ products...');

  if (!fs.existsSync(RAW_PRODUCTS_PATH)) {
    console.error(`Error: ${RAW_PRODUCTS_PATH} not found.`);
    console.error('Run "node scripts/import-cj-products.js search" first.');
    process.exit(1);
  }

  const rawProducts = JSON.parse(fs.readFileSync(RAW_PRODUCTS_PATH, 'utf-8'));
  console.log(`Loaded ${rawProducts.length} products`);

  // Convert each product
  const convertedProducts = rawProducts.map(convertToFidgetopiaProduct);

  // Filter out duplicates by slug
  const seen = new Set();
  const uniqueProducts = convertedProducts.filter(p => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });

  console.log(`Converted ${uniqueProducts.length} unique products`);

  // Generate JS file content
  const jsContent = `/**
 * CJ Dropshipping Products for Fidgetopia
 * Generated on: ${new Date().toISOString()}
 *
 * Add these to src/data/products.ts by importing and spreading into productPages array:
 *
 * import { cjProducts } from '@/scripts/cj-products-converted';
 * export const productPages: ProductPage[] = [
 *   // ... existing products,
 *   ...cjProducts,
 * ];
 */

export const cjProducts = ${JSON.stringify(uniqueProducts, null, 2).replace(/"_cjData":/g, '// CJ Reference: _cjData:')};
`;

  fs.writeFileSync(CONVERTED_PRODUCTS_PATH, jsContent);
  console.log(`\nSaved converted products to: ${CONVERTED_PRODUCTS_PATH}`);

  // Also output a preview
  console.log('\n--- Preview of first 3 products ---\n');
  uniqueProducts.slice(0, 3).forEach((p, i) => {
    console.log(`${i + 1}. ${p.name}`);
    console.log(`   Slug: ${p.slug}`);
    console.log(`   Category: ${p.category}`);
    console.log(`   Variants: ${p.variants.length}`);
    console.log(`   Price: $${p.variants[0].price}`);
    console.log('');
  });

  return uniqueProducts;
}

/**
 * Main entry point
 */
async function main() {
  const command = process.argv[2] || 'search';

  console.log('='.repeat(50));
  console.log('CJ Dropshipping Product Importer for Fidgetopia');
  console.log('='.repeat(50));
  console.log('');

  switch (command) {
    case 'search':
      await searchCJProducts();
      console.log('\nNext step: Run "node scripts/import-cj-products.js convert"');
      break;

    case 'convert':
      convertProducts();
      console.log('\nNext step: Review the converted products and add to products.ts');
      break;

    case 'both':
      console.log('WARNING: Running both search and convert.');
      console.log('If you hit rate limits, the convert step will use cached data.\n');
      try {
        await searchCJProducts();
      } catch (e) {
        if (fs.existsSync(RAW_PRODUCTS_PATH)) {
          console.log('\nUsing previously cached products...');
        } else {
          throw e;
        }
      }
      console.log('\n');
      convertProducts();
      break;

    default:
      console.log('Usage:');
      console.log('  node scripts/import-cj-products.js search   - Search CJ for fidget products');
      console.log('  node scripts/import-cj-products.js convert  - Convert saved products to Fidgetopia format');
      console.log('  node scripts/import-cj-products.js both     - Do both steps');
  }
}

main().catch(error => {
  console.error('\nFatal error:', error.message);
  process.exit(1);
});
