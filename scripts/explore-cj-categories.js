/**
 * Explore CJ Dropshipping Categories
 * Find the fidget toy / toys category for better product discovery
 */

require('dotenv').config({ path: '.env.local' });
const CJDropshipping = require('cj-dropshipping-sdk');

const CJ_API_KEY = 'CJ3556407@api@12136edd24d14f27b10469e0f56fa300';
const cj = new CJDropshipping({ apiKey: CJ_API_KEY });

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Exploring CJ Dropshipping Categories            ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  try {
    console.log('Fetching categories...\n');
    const result = await cj.product.getCategories();

    if (result.result && result.data) {
      const categories = Array.isArray(result.data) ? result.data : [result.data];

      console.log(`Found ${categories.length} top-level categories:\n`);

      // Look for toy-related categories
      const toyCategories = [];

      function searchCategories(cats, level = 0) {
        for (const cat of cats) {
          const name = cat.categoryNameEn || cat.categoryName || cat.name || '';
          const indent = '  '.repeat(level);

          // Check if it's toy/fidget related
          const isToyRelated = /toy|game|fidget|puzzle|hobby|gift|novelty|stress|sensory/i.test(name);

          if (isToyRelated || level === 0) {
            console.log(`${indent}${isToyRelated ? '🎯' : '📁'} ${name} (ID: ${cat.categoryId || cat.id})`);

            if (isToyRelated) {
              toyCategories.push({
                id: cat.categoryId || cat.id,
                name,
                level,
              });
            }
          }

          // Recursively search children
          if (cat.children && cat.children.length > 0) {
            searchCategories(cat.children, level + 1);
          }
        }
      }

      searchCategories(categories);

      console.log('\n' + '═'.repeat(50));
      console.log('🎯 TOY-RELATED CATEGORIES FOUND:');
      console.log('═'.repeat(50));

      if (toyCategories.length > 0) {
        toyCategories.forEach(cat => {
          console.log(`  - ${cat.name} (ID: ${cat.id})`);
        });
        console.log('\nUse these category IDs to search for fidget products:');
        console.log('cj.product.searchProducts({ categoryId: "CATEGORY_ID" })');
      } else {
        console.log('No toy-related categories found in top level.');
        console.log('Categories may need deeper exploration.');
      }

    } else {
      console.log('No categories returned');
      console.log('Response:', JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.error('Error:', error.message);

    if (error.message.includes('Too Many Requests')) {
      console.log('\n⚠️  Rate limited. Wait 5 minutes and try again.');
    }
  }
}

main();
