/**
 * Find Profitable CJ Dropshipping Products
 *
 * Searches for fidget toys that:
 * - Ship from US warehouses (faster delivery)
 * - Have good profit margins
 * - Fit the fidget toy niche
 *
 * Usage: node scripts/find-profitable-cj-products.js
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const CJDropshipping = require('cj-dropshipping-sdk');

const CJ_API_KEY = 'CJ3556407@api@12136edd24d14f27b10469e0f56fa300';
const cj = new CJDropshipping({ apiKey: CJ_API_KEY });

const OUTPUT_FILE = path.join(__dirname, 'profitable-products-research.json');

// Fidget toy search terms to try
const FIDGET_SEARCHES = [
  'fidget toy',
  'fidget spinner',
  'pop it',
  'stress ball',
  'fidget cube',
  'sensory toy',
  'squishy toy',
  'magnetic toy',
  'infinity cube',
  'fidget ring',
];

// Target retail markup (e.g., 2.5x = 150% markup)
const TARGET_MARKUP = 2.5;
const MIN_PROFIT_MARGIN = 5; // Minimum $5 profit per item

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getUSWarehouses() {
  console.log('📦 Fetching US warehouse info...\n');

  try {
    const result = await cj.warehouse.getWarehouses();

    if (result.result && result.data) {
      const usWarehouses = result.data.filter(w =>
        w.countryCode === 'US' ||
        w.warehouseName?.toLowerCase().includes('us') ||
        w.warehouseName?.toLowerCase().includes('united states')
      );

      console.log(`Found ${usWarehouses.length} US warehouses:`);
      usWarehouses.forEach(w => {
        console.log(`  - ${w.warehouseName} (${w.countryCode})`);
      });

      return usWarehouses;
    }
    return [];
  } catch (error) {
    console.log(`⚠️  Could not fetch warehouses: ${error.message}`);
    return [];
  }
}

async function searchProducts(keyword) {
  console.log(`\n🔍 Searching for: "${keyword}"...`);

  try {
    const result = await cj.product.searchProducts({
      keyword,
      pageNum: 1,
      pageSize: 50,
    });

    if (result.result && result.data) {
      let products = [];

      // Handle different response structures
      if (result.data.list) {
        products = result.data.list;
      } else if (result.data.content && result.data.content[0]?.productList) {
        products = result.data.content[0].productList;
      }

      console.log(`   Found ${products.length} products`);
      return products;
    }
    return [];
  } catch (error) {
    if (error.message.includes('Too Many Requests')) {
      console.log('   ⚠️  Rate limited - waiting 5 minutes...');
      throw error;
    }
    console.log(`   ❌ Error: ${error.message}`);
    return [];
  }
}

async function getProductDetails(pid) {
  try {
    const result = await cj.product.getProduct({ pid });
    if (result.result && result.data) {
      return result.data;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function checkStock(vid) {
  try {
    const result = await cj.product.getStock(vid);
    if (result.result && result.data) {
      return result.data;
    }
    return null;
  } catch (error) {
    return null;
  }
}

function analyzeProduct(product) {
  const name = product.nameEn || product.productNameEn || product.name || 'Unknown';
  const costPrice = parseFloat(
    typeof product.sellPrice === 'string'
      ? product.sellPrice.split(' ')[0].replace('--', '')
      : product.sellPrice
  ) || 0;

  // Calculate suggested retail price and profit
  const suggestedRetail = Math.ceil(costPrice * TARGET_MARKUP * 100) / 100;
  const profit = suggestedRetail - costPrice;
  const profitMargin = costPrice > 0 ? ((profit / suggestedRetail) * 100).toFixed(1) : 0;

  // Check if it's likely a fidget toy based on name
  const fidgetKeywords = ['fidget', 'spinner', 'cube', 'stress', 'sensory', 'squishy', 'pop', 'magnetic', 'toy', 'ball', 'ring'];
  const isFidgetToy = fidgetKeywords.some(kw => name.toLowerCase().includes(kw));

  // Check warehouse availability
  const hasUSWarehouse = product.warehouseInventoryNum > 0 ||
                         product.verifiedWarehouse > 0 ||
                         product.totalVerifiedInventory > 0;

  return {
    pid: product.id || product.pid,
    sku: product.sku || product.productSku,
    name,
    costPrice,
    suggestedRetail,
    profit: Math.round(profit * 100) / 100,
    profitMargin: parseFloat(profitMargin),
    inventory: product.warehouseInventoryNum || 0,
    hasUSWarehouse,
    isFidgetToy,
    image: product.bigImage || product.productImage,
    category: product.categoryId,
    isProfitable: profit >= MIN_PROFIT_MARGIN,
    listedNum: product.listedNum || 0, // How many sellers list this
  };
}

function rankProducts(products) {
  return products
    .filter(p => p.isFidgetToy && p.isProfitable && p.costPrice > 0)
    .sort((a, b) => {
      // Score based on: profit margin, inventory, popularity
      const scoreA = a.profit * 2 + (a.hasUSWarehouse ? 10 : 0) + Math.min(a.inventory / 1000, 10);
      const scoreB = b.profit * 2 + (b.hasUSWarehouse ? 10 : 0) + Math.min(b.inventory / 1000, 10);
      return scoreB - scoreA;
    });
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  CJ Dropshipping - Profitable Fidget Product Finder          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log(`Target markup: ${TARGET_MARKUP}x (${((TARGET_MARKUP - 1) * 100).toFixed(0)}% margin)`);
  console.log(`Minimum profit: $${MIN_PROFIT_MARGIN} per item\n`);

  const allProducts = [];

  // First, get warehouse info
  const usWarehouses = await getUSWarehouses();

  // Wait before next API call
  console.log('\n⏳ Waiting before product search...');
  await sleep(2000);

  // Search for fidget products
  for (let i = 0; i < FIDGET_SEARCHES.length; i++) {
    const keyword = FIDGET_SEARCHES[i];

    try {
      const products = await searchProducts(keyword);

      // Analyze each product
      for (const product of products) {
        const analysis = analyzeProduct(product);
        analysis.searchTerm = keyword;

        // Avoid duplicates
        if (!allProducts.find(p => p.pid === analysis.pid)) {
          allProducts.push(analysis);
        }
      }

      // Wait between searches (but we'll likely get rate limited)
      if (i < FIDGET_SEARCHES.length - 1) {
        await sleep(1000);
      }
    } catch (error) {
      if (error.message.includes('Too Many Requests')) {
        console.log('\n⚠️  Rate limited by CJ API.');
        console.log('   Saving progress and exiting...');
        console.log('   Run again in 5 minutes to continue.\n');
        break;
      }
    }
  }

  // Rank and filter products
  const rankedProducts = rankProducts(allProducts);

  // Display top results
  console.log('\n' + '═'.repeat(65));
  console.log('📊 TOP PROFITABLE FIDGET PRODUCTS');
  console.log('═'.repeat(65));

  if (rankedProducts.length === 0) {
    console.log('\nNo profitable fidget products found in this search.');
    console.log('This may be due to CJ API not filtering by keyword properly.');
  } else {
    console.log(`\nFound ${rankedProducts.length} profitable fidget products:\n`);

    rankedProducts.slice(0, 15).forEach((p, i) => {
      console.log(`${i + 1}. ${p.name.substring(0, 50)}${p.name.length > 50 ? '...' : ''}`);
      console.log(`   Cost: $${p.costPrice.toFixed(2)} → Sell: $${p.suggestedRetail.toFixed(2)} (Profit: $${p.profit.toFixed(2)}, ${p.profitMargin}%)`);
      console.log(`   Inventory: ${p.inventory.toLocaleString()} | US Warehouse: ${p.hasUSWarehouse ? '✅' : '❌'} | Sellers: ${p.listedNum}`);
      console.log('');
    });
  }

  // Save all results to file
  const output = {
    timestamp: new Date().toISOString(),
    searchTerms: FIDGET_SEARCHES,
    targetMarkup: TARGET_MARKUP,
    minProfit: MIN_PROFIT_MARGIN,
    usWarehouses,
    totalProductsFound: allProducts.length,
    profitableProducts: rankedProducts.length,
    topProducts: rankedProducts.slice(0, 25),
    allProducts: allProducts,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\n💾 Full results saved to: ${OUTPUT_FILE}`);

  // Summary
  console.log('\n' + '═'.repeat(65));
  console.log('📈 SUMMARY');
  console.log('═'.repeat(65));
  console.log(`Total products analyzed: ${allProducts.length}`);
  console.log(`Fidget toys found: ${allProducts.filter(p => p.isFidgetToy).length}`);
  console.log(`Profitable items (>$${MIN_PROFIT_MARGIN} margin): ${rankedProducts.length}`);
  console.log(`With US warehouse: ${rankedProducts.filter(p => p.hasUSWarehouse).length}`);
}

main().catch(console.error);
