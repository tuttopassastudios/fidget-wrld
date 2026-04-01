/**
 * CJ Dropshipping Product Lookup Tool
 *
 * Since CJ's search API doesn't filter by keyword, use this tool to:
 * 1. Look up specific products by ID (from CJ website)
 * 2. Check stock and pricing
 * 3. Calculate profitability
 *
 * HOW TO FIND PRODUCT IDs:
 * 1. Go to https://cjdropshipping.com
 * 2. Search for fidget toys manually
 * 3. Click on a product
 * 4. Copy the product ID from the URL (e.g., /product/p-1234567890)
 *
 * Usage:
 *   node scripts/cj-product-lookup.js <productId>
 *   node scripts/cj-product-lookup.js list  (shows saved products)
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
// Use local SDK copy
const CJDropshippingModule = require('../src/lib/cj-sdk/index.js');
const CJDropshipping = CJDropshippingModule.default || CJDropshippingModule;

const CJ_API_KEY = 'CJ3556407@api@12136edd24d14f27b10469e0f56fa300';
const cj = new CJDropshipping({ apiKey: CJ_API_KEY });

const SAVED_PRODUCTS_FILE = path.join(__dirname, 'cj-researched-products.json');
const TARGET_MARKUP = 2.5;

function loadSavedProducts() {
  if (fs.existsSync(SAVED_PRODUCTS_FILE)) {
    return JSON.parse(fs.readFileSync(SAVED_PRODUCTS_FILE, 'utf-8'));
  }
  return { products: [], lastUpdated: null };
}

function saveProducts(data) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(SAVED_PRODUCTS_FILE, JSON.stringify(data, null, 2));
}

function analyzeProduct(product, variants = []) {
  const name = product.productNameEn || product.nameEn || product.productName || 'Unknown';

  // Get price range from variants or product
  let minPrice = Infinity;
  let maxPrice = 0;

  if (variants.length > 0) {
    variants.forEach(v => {
      const price = parseFloat(v.variantSellPrice || v.sellPrice || 0);
      if (price > 0) {
        minPrice = Math.min(minPrice, price);
        maxPrice = Math.max(maxPrice, price);
      }
    });
  }

  if (minPrice === Infinity) {
    const priceStr = product.sellPrice || '0';
    const prices = priceStr.toString().split('--').map(p => parseFloat(p.trim()));
    minPrice = prices[0] || 0;
    maxPrice = prices[prices.length - 1] || minPrice;
  }

  const avgCost = (minPrice + maxPrice) / 2;
  const suggestedRetail = Math.ceil(avgCost * TARGET_MARKUP * 100) / 100;
  const profit = suggestedRetail - avgCost;

  return {
    pid: product.pid || product.id,
    sku: product.productSku || product.sku,
    name,
    description: product.description || '',
    image: product.productImage || product.bigImage,
    costRange: minPrice === maxPrice ? `$${minPrice.toFixed(2)}` : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`,
    avgCost,
    suggestedRetail,
    profit: Math.round(profit * 100) / 100,
    profitMargin: avgCost > 0 ? Math.round((profit / suggestedRetail) * 100) : 0,
    material: product.materialEn || product.material,
    weight: product.productWeight,
    variants: variants.map(v => ({
      vid: v.vid,
      name: v.variantNameEn || v.variantName,
      price: parseFloat(v.variantSellPrice || 0),
      image: v.variantImage,
      stock: v.variantVolume || 0,
    })),
    variantCount: variants.length,
    fetchedAt: new Date().toISOString(),
  };
}

async function lookupProduct(pid) {
  console.log(`\n🔍 Looking up product: ${pid}\n`);

  try {
    // Get product details
    console.log('Fetching product details...');
    const productResult = await cj.product.getProduct({ pid });

    if (!productResult.result || !productResult.data) {
      console.log('❌ Product not found or API error');
      return null;
    }

    const product = productResult.data;
    console.log(`✅ Found: ${product.productNameEn || product.productName}`);

    // Try to get variants (may hit rate limit)
    let variants = [];
    try {
      console.log('Fetching variants...');
      const variantsResult = await cj.product.getVariants({ pid });
      if (variantsResult.result && variantsResult.data) {
        variants = variantsResult.data;
        console.log(`✅ Found ${variants.length} variants`);
      }
    } catch (e) {
      console.log('⚠️  Could not fetch variants (rate limited)');
    }

    // Analyze the product
    const analysis = analyzeProduct(product, variants);

    // Display results
    console.log('\n' + '═'.repeat(60));
    console.log('📊 PRODUCT ANALYSIS');
    console.log('═'.repeat(60));
    console.log(`Name: ${analysis.name}`);
    console.log(`SKU: ${analysis.sku}`);
    console.log(`Cost: ${analysis.costRange}`);
    console.log(`Suggested Retail: $${analysis.suggestedRetail.toFixed(2)}`);
    console.log(`Profit: $${analysis.profit.toFixed(2)} (${analysis.profitMargin}% margin)`);
    console.log(`Material: ${analysis.material || 'Not specified'}`);
    console.log(`Weight: ${analysis.weight ? analysis.weight + 'g' : 'Not specified'}`);
    console.log(`Variants: ${analysis.variantCount}`);

    if (analysis.variants.length > 0) {
      console.log('\nVariants:');
      analysis.variants.slice(0, 5).forEach(v => {
        console.log(`  - ${v.name}: $${v.price.toFixed(2)} (Stock: ${v.stock})`);
      });
      if (analysis.variants.length > 5) {
        console.log(`  ... and ${analysis.variants.length - 5} more`);
      }
    }

    // Save to research file
    const saved = loadSavedProducts();
    const existingIndex = saved.products.findIndex(p => p.pid === analysis.pid);
    if (existingIndex >= 0) {
      saved.products[existingIndex] = analysis;
      console.log('\n✅ Updated in research file');
    } else {
      saved.products.push(analysis);
      console.log('\n✅ Added to research file');
    }
    saveProducts(saved);

    return analysis;

  } catch (error) {
    if (error.message.includes('Too Many Requests')) {
      console.log('\n⚠️  Rate limited. Wait 5 minutes and try again.');
    } else {
      console.log(`\n❌ Error: ${error.message}`);
    }
    return null;
  }
}

function listSavedProducts() {
  const saved = loadSavedProducts();

  console.log('\n' + '═'.repeat(60));
  console.log('📋 RESEARCHED PRODUCTS');
  console.log('═'.repeat(60));

  if (saved.products.length === 0) {
    console.log('\nNo products saved yet.');
    console.log('\nTo add products:');
    console.log('1. Go to https://cjdropshipping.com');
    console.log('2. Find fidget toys you want to sell');
    console.log('3. Copy the product ID from the URL');
    console.log('4. Run: node scripts/cj-product-lookup.js <productId>');
    return;
  }

  console.log(`\nFound ${saved.products.length} researched products:\n`);

  // Sort by profit
  const sorted = [...saved.products].sort((a, b) => b.profit - a.profit);

  sorted.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name.substring(0, 45)}${p.name.length > 45 ? '...' : ''}`);
    console.log(`   Cost: ${p.costRange} → Retail: $${p.suggestedRetail.toFixed(2)} | Profit: $${p.profit.toFixed(2)} (${p.profitMargin}%)`);
    console.log(`   PID: ${p.pid} | Variants: ${p.variantCount}`);
    console.log('');
  });

  console.log(`Last updated: ${saved.lastUpdated || 'Never'}`);
}

// Main
const arg = process.argv[2];

if (!arg || arg === 'help') {
  console.log(`
CJ Dropshipping Product Lookup Tool

Usage:
  node scripts/cj-product-lookup.js <productId>   Look up a specific product
  node scripts/cj-product-lookup.js list          List saved research
  node scripts/cj-product-lookup.js help          Show this help

Finding Product IDs:
  1. Go to https://cjdropshipping.com
  2. Search for "fidget toys" or "stress toys"
  3. Click on a product
  4. Copy the product ID from URL: /product/p-XXXXX or pid=XXXXX

Example:
  node scripts/cj-product-lookup.js 1663470454922809344
`);
} else if (arg === 'list') {
  listSavedProducts();
} else {
  lookupProduct(arg);
}
