/**
 * Update CJ Product Images in Supabase
 *
 * Updates existing products with real CJ images from cj-researched-products.json
 *
 * Usage: node scripts/update-cj-product-images.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Load researched products
const researchedFile = path.join(__dirname, 'cj-researched-products.json');
const researchedData = JSON.parse(fs.readFileSync(researchedFile, 'utf-8'));

// Parse image field from CJ data
function parseImages(imageField) {
  if (!imageField) return [];
  if (Array.isArray(imageField)) return imageField;
  try {
    const parsed = JSON.parse(imageField);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [imageField];
  }
}

// Mapping of CJ PIDs to Supabase slugs
const pidToSlug = {
  '1541333689475944448': 'cj-creative-fidget-spinner-toy-keychain-hand-spinner-',
  '1527233425990758400': 'cj-colorful-alloy-fidget-spinner-electroplating',
  'C4880398-A6C6-48C2-AF37-7852296CD892': 'cj-stress-relief-simulation-popcorn-cup',
  '1719271582901743616': 'cj-dancing-ferrofluid-magnetic-desk-toy',
};

async function updateProductImages() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Updating CJ Product Images in Supabase          ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const cjProduct of researchedData.products) {
    const slug = pidToSlug[cjProduct.pid];
    if (!slug) {
      console.log(`⏭️  No slug mapping for PID: ${cjProduct.pid}`);
      skipped++;
      continue;
    }

    console.log(`\nUpdating: ${cjProduct.name.substring(0, 50)}...`);

    // Get images
    const images = parseImages(cjProduct.image);
    const mainImage = images[0] || null;

    if (!mainImage) {
      console.log(`⏭️  No images found`);
      skipped++;
      continue;
    }

    // Create updated variants with real images
    const variants = [];
    const tierNames = ['Standard', 'Deluxe', 'Premium', 'Ultimate'];

    if (cjProduct.variants && cjProduct.variants.length > 0) {
      // Group by price
      const priceGroups = {};
      cjProduct.variants.forEach(v => {
        const tier = Math.floor(v.price);
        if (!priceGroups[tier]) priceGroups[tier] = [];
        priceGroups[tier].push(v);
      });

      const tiers = Object.keys(priceGroups).sort((a, b) => a - b).slice(0, 4);

      tiers.forEach((tier, index) => {
        const tierVariants = priceGroups[tier];
        const firstVariant = tierVariants[0];
        const costPrice = firstVariant.price;
        const retailPrice = Math.ceil(costPrice * 2.5 * 100) / 100;
        const tierName = tierNames[index] || `Tier ${index + 1}`;

        // Use variant image or fall back to product images
        let variantImage = firstVariant.image;
        if (!variantImage || variantImage.includes('placeholder')) {
          variantImage = images[index] || mainImage;
        }

        variants.push({
          sku: `CJ-${cjProduct.sku}-${tierName.toUpperCase().substring(0, 3)}`,
          name: cjProduct.name.substring(0, 60),
          variant: tierName,
          price: retailPrice,
          image: variantImage,
        });
      });
    }

    // Fallback single variant
    if (variants.length === 0) {
      const retailPrice = cjProduct.suggestedRetail || Math.ceil((cjProduct.avgCost || 5) * 2.5);
      variants.push({
        sku: `CJ-${cjProduct.sku}-STD`,
        name: cjProduct.name.substring(0, 60),
        variant: 'Standard',
        price: retailPrice,
        image: mainImage,
      });
    }

    // Update the product
    const { error } = await supabase
      .from('products')
      .update({ variants })
      .eq('slug', slug);

    if (error) {
      console.error(`❌ Error: ${error.message}`);
      errors++;
    } else {
      console.log(`✅ Updated with ${variants.length} variant(s)`);
      variants.forEach((v, i) => {
        console.log(`   [${i}] ${v.variant}: $${v.price} - ${v.image.substring(0, 50)}...`);
      });
      updated++;
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`Complete: ${updated} updated, ${skipped} skipped, ${errors} errors`);
  console.log('═'.repeat(50));
}

updateProductImages().catch(console.error);
