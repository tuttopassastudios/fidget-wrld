#!/usr/bin/env node
/**
 * Add CJ Dropshipping Product to Store
 *
 * Usage:
 *   node scripts/add-cj-product.js <sku|pid>
 *
 * Examples:
 *   node scripts/add-cj-product.js CJYZ273871801AZ     (by SKU)
 *   node scripts/add-cj-product.js 1541333689475944448 (by PID)
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const CJDropshipping = require('cj-dropshipping-sdk');

const CJ_API_KEY = 'CJ3556407@api@12136edd24d14f27b10469e0f56fa300';
const cj = new CJDropshipping({ apiKey: CJ_API_KEY });

const PRODUCT_IDS_FILE = path.join(__dirname, 'cj-fidget-product-ids.json');
const RESEARCHED_FILE = path.join(__dirname, 'cj-researched-products.json');

function loadProductIds() {
  if (fs.existsSync(PRODUCT_IDS_FILE)) {
    return JSON.parse(fs.readFileSync(PRODUCT_IDS_FILE, 'utf8'));
  }
  return { alreadyFetched: [], productsAlreadyInStore: [] };
}

function saveProductIds(data) {
  fs.writeFileSync(PRODUCT_IDS_FILE, JSON.stringify(data, null, 2));
}

function loadResearched() {
  if (fs.existsSync(RESEARCHED_FILE)) {
    return JSON.parse(fs.readFileSync(RESEARCHED_FILE, 'utf8'));
  }
  return { products: [], lastUpdated: null };
}

function saveResearched(data) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(RESEARCHED_FILE, JSON.stringify(data, null, 2));
}

function generateSlug(name) {
  return 'cj-' + name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

async function addProduct(identifier) {
  console.log(`\n🔍 Looking up: ${identifier}\n`);

  try {
    // Determine if it's a SKU or PID
    const isSku = identifier.includes('CJ') || identifier.length < 15;
    const params = isSku ? { productSku: identifier } : { pid: identifier };

    console.log(`Fetching product by ${isSku ? 'SKU' : 'PID'}...`);
    const productResult = await cj.product.getProduct(params);

    if (!productResult.result || !productResult.data) {
      console.log('❌ Product not found');
      console.log('Response:', JSON.stringify(productResult, null, 2));
      return null;
    }

    const product = productResult.data;
    const pid = product.pid || product.id;
    const name = product.productNameEn || product.nameEn || product.productName;

    console.log(`✅ Found: ${name}`);
    console.log(`   PID: ${pid}`);
    console.log(`   SKU: ${product.productSku || product.sku}`);

    // Get variants
    let variants = [];
    try {
      console.log('\nFetching variants...');
      const variantsResult = await cj.product.getVariants({ pid });
      if (variantsResult.result && variantsResult.data) {
        variants = variantsResult.data;
        console.log(`✅ Found ${variants.length} variants`);
      }
    } catch (e) {
      console.log('⚠️  Could not fetch variants:', e.message);
    }

    // Calculate pricing
    let minPrice = Infinity, maxPrice = 0;
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
      const priceStr = String(product.sellPrice || '0');
      const prices = priceStr.split('--').map(p => parseFloat(p.trim()));
      minPrice = prices[0] || 0;
      maxPrice = prices[prices.length - 1] || minPrice;
    }

    const avgCost = (minPrice + maxPrice) / 2;
    const suggestedRetail = Math.ceil(avgCost * 2.5 * 100) / 100;
    const profit = suggestedRetail - avgCost;

    // Display info
    console.log('\n' + '═'.repeat(60));
    console.log('📊 PRODUCT DETAILS');
    console.log('═'.repeat(60));
    console.log(`Name: ${name}`);
    console.log(`Category: ${product.categoryName || 'Unknown'}`);
    console.log(`Cost: $${minPrice.toFixed(2)}${maxPrice !== minPrice ? ` - $${maxPrice.toFixed(2)}` : ''}`);
    console.log(`Suggested Retail: $${suggestedRetail.toFixed(2)}`);
    console.log(`Profit: $${profit.toFixed(2)} (${Math.round((profit / suggestedRetail) * 100)}% margin)`);
    console.log(`Material: ${product.materialEn || product.material || 'Not specified'}`);
    console.log(`Weight: ${product.productWeight ? product.productWeight + 'g' : 'Not specified'}`);
    console.log(`Variants: ${variants.length}`);
    console.log(`Image: ${product.productImage || product.bigImage}`);

    if (variants.length > 0) {
      console.log('\nVariant Preview (first 5):');
      variants.slice(0, 5).forEach(v => {
        const stock = v.variantVolume || 0;
        console.log(`  - ${v.variantNameEn || v.variantName}: $${parseFloat(v.variantSellPrice || 0).toFixed(2)} (Stock: ${stock})`);
      });
      if (variants.length > 5) {
        console.log(`  ... and ${variants.length - 5} more`);
      }
    }

    // Save to research file
    const researched = loadResearched();
    const researchEntry = {
      pid,
      sku: product.productSku || product.sku,
      name,
      description: product.description || '',
      image: product.productImage || product.bigImage,
      costRange: `$${minPrice.toFixed(2)}${maxPrice !== minPrice ? ` - $${maxPrice.toFixed(2)}` : ''}`,
      avgCost,
      suggestedRetail,
      profit: Math.round(profit * 100) / 100,
      profitMargin: Math.round((profit / suggestedRetail) * 100),
      material: product.materialEn || product.material,
      weight: product.productWeight,
      category: product.categoryName,
      variants: variants.map(v => ({
        vid: v.vid,
        sku: v.variantSku,
        name: v.variantNameEn || v.variantName,
        price: parseFloat(v.variantSellPrice || 0),
        image: v.variantImage,
        stock: v.variantVolume || 0,
      })),
      variantCount: variants.length,
      fetchedAt: new Date().toISOString(),
    };

    const existingIdx = researched.products.findIndex(p => p.pid === pid);
    if (existingIdx >= 0) {
      researched.products[existingIdx] = researchEntry;
      console.log('\n✅ Updated in research file');
    } else {
      researched.products.push(researchEntry);
      console.log('\n✅ Added to research file');
    }
    saveResearched(researched);

    // Add to product IDs file
    const productIds = loadProductIds();
    const slug = generateSlug(name);

    if (!productIds.alreadyFetched.includes(pid)) {
      productIds.alreadyFetched.push(pid);
    }

    const storeEntry = {
      pid,
      name,
      slug,
      type: product.categoryName || 'Fidget Toy',
      description: product.description || name,
      sourceUrl: `https://cjdropshipping.com/product/p-${pid}.html`,
      notes: `Added via script. ${variants.length} variants available.`,
    };

    const storeIdx = productIds.productsAlreadyInStore.findIndex(p => p.pid === pid);
    if (storeIdx >= 0) {
      productIds.productsAlreadyInStore[storeIdx] = storeEntry;
      console.log('✅ Updated in store products list');
    } else {
      productIds.productsAlreadyInStore.push(storeEntry);
      console.log('✅ Added to store products list');
    }
    saveProductIds(productIds);

    console.log(`\n📁 Suggested slug: ${slug}`);
    console.log('\nNext steps:');
    console.log('1. Create product page in src/data/products.ts');
    console.log('2. Add product images to public/images/products/');
    console.log('3. Test on dev server');

    return researchEntry;

  } catch (error) {
    if (error.message.includes('Too Many Requests')) {
      console.log('\n⚠️  Rate limited. Wait 5 minutes and try again.');
      console.log('   CJ API limit: 1 request per 300 seconds');
    } else {
      console.log(`\n❌ Error: ${error.message}`);
    }
    return null;
  }
}

// Main
const identifier = process.argv[2];

if (!identifier) {
  console.log(`
Add CJ Dropshipping Product to Store

Usage:
  node scripts/add-cj-product.js <sku|pid>

Examples:
  node scripts/add-cj-product.js CJYZ273871801AZ     (by SKU)
  node scripts/add-cj-product.js 1541333689475944448 (by PID)
`);
  process.exit(1);
}

addProduct(identifier);
