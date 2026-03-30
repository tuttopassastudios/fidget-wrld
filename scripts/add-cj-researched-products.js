/**
 * Add CJ Researched Products to Supabase
 *
 * This script takes products from cj-researched-products.json (fetched via CJ SDK)
 * and adds them to Supabase with real CJ images and descriptions.
 *
 * Usage: node scripts/add-cj-researched-products.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Load researched products
const researchedFile = path.join(__dirname, 'cj-researched-products.json');
const researchedData = JSON.parse(fs.readFileSync(researchedFile, 'utf-8'));

// Helper to create a URL-friendly slug
function createSlug(name) {
  return 'cj-' + name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

// Helper to extract plain text from HTML description
function extractPlainText(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper to extract features from description
function extractFeatures(description) {
  const plainText = extractPlainText(description);
  const features = [];

  // Look for numbered lists or bullet points in the text
  const sentences = plainText.split(/[.!]\s+/);

  for (const sentence of sentences) {
    if (sentence.length > 15 && sentence.length < 100) {
      // Filter out sentences that are just product info
      if (!sentence.match(/^(Note|Color|Material|Type|Packing|Size)/i)) {
        const cleaned = sentence.replace(/^\d+\.\s*/, '').trim();
        if (cleaned && features.length < 5) {
          features.push(cleaned);
        }
      }
    }
  }

  // Default features if we couldn't extract any
  if (features.length === 0) {
    features.push(
      'Premium quality construction',
      'Great for stress relief',
      'Perfect for all ages',
      'Compact and portable'
    );
  }

  return features.slice(0, 5);
}

// Helper to determine category from product name/description
function determineCategory(name, description) {
  const text = (name + ' ' + description).toLowerCase();

  if (text.includes('spinner')) return 'Desk Toy';
  if (text.includes('pop it') || text.includes('bubble')) return 'Clicky';
  if (text.includes('squishy') || text.includes('squeeze')) return 'Squishy';
  if (text.includes('magnetic') || text.includes('magnet')) return 'Magnetic';
  if (text.includes('stretch')) return 'Stretchy';
  if (text.includes('cube')) return 'Desk Toy';

  return 'Desk Toy'; // Default
}

// Helper to determine moods
function determineMoods(name, description) {
  const text = (name + ' ' + description).toLowerCase();
  const moods = [];

  if (text.includes('stress') || text.includes('relax') || text.includes('calm') || text.includes('anxiety')) {
    moods.push('calm');
  }
  if (text.includes('focus') || text.includes('adhd') || text.includes('attention')) {
    moods.push('focus');
  }
  if (text.includes('fun') || text.includes('play') || text.includes('game') || text.includes('kids')) {
    moods.push('play');
  }

  // Default if none found
  if (moods.length === 0) {
    moods.push('focus', 'calm');
  }

  return moods;
}

// Helper to determine audiences
function determineAudiences(name, description) {
  const text = (name + ' ' + description).toLowerCase();
  const audiences = [];

  if (text.includes('kids') || text.includes('child')) {
    audiences.push('kids');
  }
  if (text.includes('adult')) {
    audiences.push('adults');
  }
  if (text.includes('office') || text.includes('desk')) {
    audiences.push('office');
  }

  audiences.push('all'); // Always include all

  return [...new Set(audiences)];
}

// Helper to parse product images
function parseImages(imageField) {
  if (!imageField) return [];

  // If it's already an array
  if (Array.isArray(imageField)) return imageField;

  // If it's a JSON string
  try {
    const parsed = JSON.parse(imageField);
    if (Array.isArray(parsed)) return parsed;
    return [parsed];
  } catch {
    // Single URL string
    return [imageField];
  }
}

// Convert CJ product to Supabase format
function convertToSupabaseProduct(cjProduct) {
  const images = parseImages(cjProduct.image);
  const mainImage = images[0] || 'https://placehold.co/600x600?text=No+Image';

  // Create variants from CJ variant data
  const variants = [];

  if (cjProduct.variants && cjProduct.variants.length > 0) {
    // Group variants by price tier
    const priceGroups = {};
    cjProduct.variants.forEach(v => {
      const price = v.price || cjProduct.avgCost || 5;
      const tier = Math.floor(price);
      if (!priceGroups[tier]) {
        priceGroups[tier] = [];
      }
      priceGroups[tier].push(v);
    });

    // Create a variant for each price tier (limit to 4 tiers)
    const tiers = Object.keys(priceGroups).sort((a, b) => a - b).slice(0, 4);
    const tierNames = ['Standard', 'Deluxe', 'Premium', 'Ultimate'];

    tiers.forEach((tier, index) => {
      const tierVariants = priceGroups[tier];
      const firstVariant = tierVariants[0];
      const costPrice = firstVariant.price || parseFloat(tier);
      const retailPrice = Math.ceil(costPrice * 2.5 * 100) / 100; // 2.5x markup
      const tierName = tierNames[index] || `Tier ${index + 1}`;

      variants.push({
        sku: `CJ-${cjProduct.sku}-${tierName.toUpperCase().substring(0, 3)}`,
        name: cjProduct.name.substring(0, 60),
        variant: tierName,
        price: retailPrice,
        image: firstVariant.image || mainImage,
      });
    });
  }

  // Fallback if no variants
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

  // Clean up description HTML - keep structure but make it store-appropriate
  let cleanDescription = cjProduct.description || '';
  // Remove embedded images from description (we use them separately)
  cleanDescription = cleanDescription.replace(/<img[^>]*>/gi, '');
  // Remove empty paragraphs
  cleanDescription = cleanDescription.replace(/<p>\s*<\/p>/gi, '');
  // Remove excessive line breaks
  cleanDescription = cleanDescription.replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '<br/>');

  // Extract specifications from description
  const specs = {};
  const descText = extractPlainText(cjProduct.description || '');

  const materialMatch = descText.match(/Material:\s*([^\n<]+)/i);
  if (materialMatch) specs['Material'] = materialMatch[1].trim();

  const sizeMatch = descText.match(/Size[^:]*:\s*([^\n<]+)/i);
  if (sizeMatch) specs['Size'] = sizeMatch[1].trim();

  if (cjProduct.weight) specs['Weight'] = cjProduct.weight + 'g';

  // Determine category and metadata
  const category = determineCategory(cjProduct.name, descText);
  const moods = determineMoods(cjProduct.name, descText);
  const audiences = determineAudiences(cjProduct.name, descText);

  return {
    slug: createSlug(cjProduct.name),
    name: cjProduct.name.substring(0, 80),
    tagline: 'Stress relief at your fingertips',
    category,
    variants,
    default_variant_index: 0,
    description: cleanDescription || '<p>Premium fidget toy for stress relief and focus. Perfect for all ages.</p>',
    features: extractFeatures(cjProduct.description),
    specifications: Object.keys(specs).length > 0 ? specs : { 'Quality': 'Premium' },
    moods,
    audiences,
    textures: ['smooth'],
    age_recommendation: '6+',
    materials: specs['Material'] ? [specs['Material']] : ['Plastic'],
    is_new: true,
    is_bestseller: false,
    is_limited: false,
    related_slugs: [],
    meta_title: `${cjProduct.name.substring(0, 50)} | Fidget WRLD`,
    meta_description: `${cjProduct.name.substring(0, 100)}. Premium fidget toy for stress relief and focus. Shop now at Fidget WRLD.`,
    cj_pid: cjProduct.pid, // Store CJ product ID for reference
    cj_sku: cjProduct.sku,
    cj_images: images, // Store all CJ images
  };
}

async function addProducts() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Adding CJ Researched Products to Supabase       ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  if (!researchedData.products || researchedData.products.length === 0) {
    console.log('No researched products found in cj-researched-products.json');
    console.log('Run: node scripts/cj-product-lookup.js <productId>');
    return;
  }

  console.log(`Found ${researchedData.products.length} researched product(s)\n`);

  let added = 0;
  let skipped = 0;
  let errors = 0;

  for (const cjProduct of researchedData.products) {
    console.log(`\nProcessing: ${cjProduct.name.substring(0, 50)}...`);

    const product = convertToSupabaseProduct(cjProduct);

    // Check if already exists
    const { data: existing } = await supabase
      .from('products')
      .select('slug')
      .eq('slug', product.slug)
      .single();

    if (existing) {
      console.log(`⏭️  Skipped (already exists): ${product.slug}`);
      skipped++;
      continue;
    }

    // Try to insert
    const { error } = await supabase.from('products').insert(product);

    if (error) {
      console.error(`❌ Error: ${error.message}`);

      // If error is about unknown columns, try without them
      if (error.message.includes('cj_')) {
        console.log('   Retrying without CJ metadata fields...');
        delete product.cj_pid;
        delete product.cj_sku;
        delete product.cj_images;

        const { error: retryError } = await supabase.from('products').insert(product);
        if (retryError) {
          console.error(`   ❌ Still failed: ${retryError.message}`);
          errors++;
        } else {
          console.log(`   ✅ Added: ${product.name}`);
          added++;
        }
      } else {
        errors++;
      }
    } else {
      console.log(`✅ Added: ${product.name}`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   Variants: ${product.variants.length}`);
      console.log(`   Price Range: $${product.variants[0]?.price} - $${product.variants[product.variants.length - 1]?.price}`);
      added++;
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`Complete: ${added} added, ${skipped} skipped, ${errors} errors`);
  console.log('═'.repeat(50));

  if (added > 0) {
    console.log('\n🎉 New products are now available on the site!');
    console.log('Run: npm run dev -- to see them');
  }
}

addProducts().catch(console.error);
