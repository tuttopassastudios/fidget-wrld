/**
 * Update CJ Dropshipping products with real data from CJ API
 *
 * Fetches actual product photos, descriptions, and stock from CJ Dropshipping
 * and updates the products in Supabase.
 *
 * Usage: node scripts/update-cj-product-data.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const CJDropshipping = require('cj-dropshipping-sdk');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CJ_API_KEY = 'CJ3556407@api@12136edd24d14f27b10469e0f56fa300';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const cj = new CJDropshipping({ apiKey: CJ_API_KEY });

// Mapping of our product slugs to CJ search terms
const PRODUCT_SEARCH_MAP = {
  'cj-rainbow-fidget-spinner': 'metal fidget spinner rainbow',
  'cj-pop-it-sensory': 'pop it fidget silicone rainbow',
  'cj-squishy-animals': 'squishy slow rising animal kawaii',
  'cj-mesh-marble': 'mesh marble fidget sensory',
  'cj-aluminum-infinity-cube': 'infinity cube aluminum metal',
  'cj-flippy-chain': 'flippy chain fidget bike',
  'cj-magnetic-rings': 'magnetic rings fidget spinner',
  'cj-stretchy-noodles': 'stretchy string fidget sensory',
  'cj-simple-dimple-keychain': 'simple dimple keychain pop',
  'cj-wacky-tracks': 'wacky tracks snap click fidget',
  'cj-tangle-fidget': 'tangle fidget twist sensory',
};

// Cache for CJ products to minimize API calls
let cjProductCache = [];

async function searchCJProducts(keyword) {
  console.log(`\nSearching CJ for: "${keyword}"...`);

  try {
    const results = await cj.product.searchProducts({
      keyword,
      pageNum: 1,
      pageSize: 20,
    });

    if (results.result && results.data) {
      // Handle different response structures
      let products = [];
      if (results.data.list) {
        products = results.data.list;
      } else if (results.data.content && results.data.content[0]?.productList) {
        products = results.data.content[0].productList;
      }

      console.log(`  Found ${products.length} products`);
      return products;
    }
    return [];
  } catch (error) {
    if (error.message.includes('Too Many Requests')) {
      console.log('  ⚠️  Rate limited - using cached/sample data');
      return [];
    }
    throw error;
  }
}

async function getProductDetails(pid) {
  console.log(`  Fetching details for product ${pid}...`);

  try {
    const result = await cj.product.getProduct({ pid });
    if (result.result && result.data) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.log(`  ⚠️  Could not fetch details: ${error.message}`);
    return null;
  }
}

async function getProductVariants(pid) {
  try {
    const result = await cj.product.getVariants({ pid });
    if (result.result && result.data) {
      return result.data;
    }
    return [];
  } catch (error) {
    return [];
  }
}

function buildDescription(cjProduct) {
  let desc = '';

  if (cjProduct.description) {
    // Clean up HTML and format
    desc = cjProduct.description
      .replace(/<br\s*\/?>/gi, '</p><p>')
      .replace(/\n/g, '</p><p>');

    if (!desc.startsWith('<p>')) {
      desc = `<p>${desc}</p>`;
    }
  } else if (cjProduct.productNameEn || cjProduct.nameEn) {
    desc = `<p>Premium quality ${cjProduct.productNameEn || cjProduct.nameEn}. Perfect for stress relief, focus, and fidgeting.</p>`;
  }

  return desc;
}

function extractFeatures(cjProduct) {
  const features = [];

  if (cjProduct.materialEn) {
    features.push(`Made from ${cjProduct.materialEn}`);
  }
  if (cjProduct.productWeight) {
    features.push(`Lightweight design (${cjProduct.productWeight}g)`);
  }
  if (cjProduct.packWeight) {
    features.push(`Ships in protective packaging`);
  }

  // Add generic features if we don't have enough
  if (features.length < 3) {
    features.push('Premium quality materials');
    features.push('Satisfying tactile feedback');
    features.push('Perfect for stress relief');
    features.push('Compact and portable');
  }

  return features.slice(0, 5);
}

function buildVariants(cjProduct, cjVariants, existingVariants) {
  if (!cjVariants || cjVariants.length === 0) {
    // Update existing variant with new image
    return existingVariants.map((v, idx) => ({
      ...v,
      image: cjProduct.bigImage || cjProduct.productImage || v.image,
      inventory: cjProduct.warehouseInventoryNum || undefined,
    }));
  }

  // Build variants from CJ data
  return cjVariants.slice(0, 5).map((v, idx) => ({
    sku: existingVariants[idx]?.sku || `CJ-${cjProduct.id?.substring(0, 6) || 'PROD'}-${idx}`,
    name: existingVariants[0]?.name || cjProduct.productNameEn || cjProduct.nameEn,
    variant: v.variantNameEn || v.variantName || `Option ${idx + 1}`,
    color: v.variantNameEn || undefined,
    price: parseFloat(v.variantSellPrice) || existingVariants[idx]?.price || 9.99,
    image: v.variantImage || cjProduct.bigImage || existingVariants[idx]?.image,
    inventory: v.variantVolume || undefined,
  }));
}

async function updateProductInSupabase(slug, updates) {
  console.log(`  Updating ${slug} in Supabase...`);

  const { error } = await supabase
    .from('products')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', slug);

  if (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }

  console.log(`  ✅ Updated successfully`);
  return true;
}

async function processProduct(slug, searchTerm) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Processing: ${slug}`);
  console.log('='.repeat(50));

  // Get current product from Supabase
  const { data: currentProduct } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!currentProduct) {
    console.log(`  ⚠️  Product not found in Supabase`);
    return false;
  }

  // Search for matching CJ product
  const searchResults = await searchCJProducts(searchTerm);

  if (searchResults.length === 0) {
    console.log(`  ⚠️  No CJ products found, keeping existing data`);
    return false;
  }

  // Use first matching product
  const cjProduct = searchResults[0];
  console.log(`  Found: ${cjProduct.nameEn || cjProduct.productNameEn || 'Unknown'}`);

  // Get product details if we have a product ID
  let productDetails = cjProduct;
  let variants = [];

  if (cjProduct.id) {
    // Wait a bit to avoid rate limiting
    await new Promise(r => setTimeout(r, 1000));

    const details = await getProductDetails(cjProduct.id);
    if (details) {
      productDetails = { ...cjProduct, ...details };
    }

    // Try to get variants
    variants = await getProductVariants(cjProduct.id);
  }

  // Build update object
  const updates = {
    description: buildDescription(productDetails),
    features: extractFeatures(productDetails),
    variants: buildVariants(productDetails, variants, currentProduct.variants),
    specifications: {
      ...currentProduct.specifications,
      'Material': productDetails.materialEn || currentProduct.specifications?.Material || 'Premium Materials',
      'Weight': productDetails.productWeight ? `${productDetails.productWeight}g` : currentProduct.specifications?.Weight,
    },
  };

  // Update main image in first variant
  if (productDetails.bigImage || productDetails.productImage) {
    updates.variants = updates.variants.map((v, idx) => ({
      ...v,
      image: idx === 0 ? (productDetails.bigImage || productDetails.productImage) : v.image,
    }));
  }

  return await updateProductInSupabase(slug, updates);
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  CJ Dropshipping Product Data Updater            ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  const slugs = Object.keys(PRODUCT_SEARCH_MAP);
  let updated = 0;
  let failed = 0;

  // Process first product to test API
  console.log('Testing CJ API connection...');

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    const searchTerm = PRODUCT_SEARCH_MAP[slug];

    try {
      const success = await processProduct(slug, searchTerm);
      if (success) updated++;
      else failed++;

      // Wait between products to avoid rate limiting
      if (i < slugs.length - 1) {
        console.log('\n⏳ Waiting 2 seconds before next product...');
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (error) {
      console.error(`\n❌ Error processing ${slug}:`, error.message);

      if (error.message.includes('Too Many Requests')) {
        console.log('\n⚠️  Rate limited by CJ API (1 request per 300 seconds)');
        console.log('   Products processed so far will be saved.');
        console.log('   Run this script again in 5 minutes to continue.\n');
        break;
      }

      failed++;
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`Update complete: ${updated} updated, ${failed} failed/skipped`);
  console.log('═'.repeat(50));
}

main().catch(console.error);
