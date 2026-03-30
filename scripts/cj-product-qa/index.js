#!/usr/bin/env node
/**
 * CJ Product QA Agent
 *
 * Audits CJ Dropshipping products in the Fidget WRLD store:
 * - Validates variants, prices, and images against Loop Agent's cache
 * - Checks US warehouse availability
 * - Suggests description improvements
 * - Generates a detailed markdown audit report
 *
 * NOTE: This agent reads from the Loop Agent's cache (no API calls).
 * Run the Loop Agent first to populate fresh data.
 *
 * Usage:
 *   node scripts/cj-product-qa/index.js              # Full audit
 *   node scripts/cj-product-qa/index.js --product X  # Single product
 *   node scripts/cj-product-qa/index.js --skip-descriptions
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');

const CJClient = require('./lib/cj-client');
const StoreClient = require('./lib/store-client');
const ImageValidator = require('./lib/image-validator');
const DescriptionRewriter = require('./lib/description-rewriter');
const ReportGenerator = require('./lib/report-generator');
const config = require('./config');

// Parse command line arguments
const args = process.argv.slice(2);
const flags = {
  product: args.find((a, i) => args[i - 1] === '--product'),
  skipDescriptions: args.includes('--skip-descriptions'),
};

class ProductQAAgent {
  constructor() {
    this.cjClient = new CJClient();
    this.storeClient = new StoreClient();
    this.imageValidator = new ImageValidator();
    this.descriptionRewriter = new DescriptionRewriter();
    this.report = new ReportGenerator();
  }

  /**
   * Main entry point
   */
  async run() {
    console.log('═'.repeat(60));
    console.log('CJ Product QA Agent (Cache Mode)');
    console.log('═'.repeat(60));
    console.log('\n   Using Loop Agent cache - no API calls will be made.');

    try {
      // Check cache status
      const cacheStatus = this.cjClient.getCacheStatus();
      if (cacheStatus.productCount === 0) {
        console.log('\n   ⚠️  Cache is empty! Run the Loop Agent first to sync products.');
        console.log('   Command: node scripts/cj-loop-agent/index.js --update');
        return;
      }

      // Load products
      const products = await this.storeClient.getCJProducts();

      if (products.length === 0) {
        console.log('\n   No CJ products found in store.');
        return;
      }

      // Filter if specific product requested
      let productsToAudit = products;
      if (flags.product) {
        productsToAudit = products.filter(p => p.slug === flags.product);
        if (productsToAudit.length === 0) {
          console.log(`\n   Product not found: ${flags.product}`);
          return;
        }
      }

      // Check for missing cache entries
      const pids = productsToAudit.map(p => p.cjPid).filter(Boolean);
      const missingPids = this.cjClient.getMissingProducts(pids);
      if (missingPids.length > 0) {
        console.log(`\n   ⚠️  ${missingPids.length} product(s) not in cache - will be flagged`);
      }

      console.log(`\n   Found ${productsToAudit.length} products to audit`);
      console.log(`   Cache has ${cacheStatus.productCount} products available`);

      // Audit each product
      for (let i = 0; i < productsToAudit.length; i++) {
        const product = productsToAudit[i];
        console.log(`\n${'─'.repeat(60)}`);
        console.log(`[${i + 1}/${productsToAudit.length}] Auditing: ${product.name}`);
        console.log(`${'─'.repeat(60)}`);

        const result = await this.auditProduct(product);
        this.report.addProductAudit(result);

        // Show progress
        const remaining = productsToAudit.length - (i + 1);
        if (remaining > 0) {
          console.log(`\n   ${remaining} products remaining`);
        }
      }

      // Finalize report
      this.report.setApiLog(this.cjClient.getRequestLog());
      this.report.complete();

      console.log('\n' + '═'.repeat(60));
      console.log('Audit Complete!');
      console.log('═'.repeat(60));
      console.log(`\n   Report saved to: reports/cj-product-audit.md`);
      console.log(`   Products audited: ${productsToAudit.length}`);
      console.log(`   Issues found: ${this.report.issues.length}`);
      console.log(`   Suggestions: ${this.report.suggestions.length}`);

    } catch (error) {
      console.error('\n   Error:', error.message);
      this.report.complete();
      throw error;
    }
  }

  /**
   * Audit a single product
   */
  async auditProduct(product) {
    const result = {
      slug: product.slug,
      name: product.name,
      cjPid: product.cjPid,
      issues: [],
      suggestions: [],
      status: 'PASS',
    };

    // 1. Get CJ data from Loop Agent cache (no API calls)
    let cjProduct = null;
    let cjVariants = null;

    if (product.cjPid) {
      cjProduct = await this.cjClient.getProduct(product.cjPid);
      cjVariants = await this.cjClient.getVariants(product.cjPid);

      if (!cjProduct) {
        result.issues.push({
          severity: 'warning',
          message: 'Not in cache - run Loop Agent to sync this product',
        });
      }
    } else {
      result.issues.push({
        severity: 'warning',
        message: 'No CJ PID configured for this product',
      });
    }

    // 2. Audit variants
    result.variantAudit = this.auditVariants(product, cjProduct, cjVariants);
    if (result.variantAudit.issues.length > 0) {
      result.issues.push(...result.variantAudit.issues);
    }

    // 3. Validate images
    console.log('   Validating images...');
    result.imageAudit = await this.imageValidator.checkAllVariantImages(product);
    if (!result.imageAudit.summary.allValid) {
      result.issues.push({
        severity: 'warning',
        message: `${result.imageAudit.summary.invalid} image(s) failed validation`,
      });
    }

    // 4. Check US warehouse availability
    if (cjProduct) {
      result.warehouseAudit = this.cjClient.checkUSWarehouse(cjProduct);
      if (!result.warehouseAudit.available) {
        result.issues.push({
          severity: 'warning',
          message: 'No US warehouse availability detected',
        });
      }
    }

    // 5. Analyze description
    console.log('   Analyzing description...');
    result.descriptionAudit = this.descriptionRewriter.analyzeDescription(product);

    if (result.descriptionAudit.needsRewrite && !flags.skipDescriptions) {
      console.log('   Generating description suggestion...');
      const rewrite = await this.descriptionRewriter.improveDescription(product, cjProduct);
      if (rewrite.success) {
        result.descriptionSuggestion = rewrite.suggestion;
        result.suggestions.push({
          field: 'description',
          summary: 'Description improvement available',
          details: `**Suggested:**\n\`\`\`html\n${rewrite.suggestion}\n\`\`\``,
        });
      }
    }

    // 6. Determine overall status
    const criticalIssues = result.issues.filter(i => i.severity === 'critical');
    const warnings = result.issues.filter(i => i.severity === 'warning');

    if (criticalIssues.length > 0) {
      result.status = 'FAIL';
    } else if (warnings.length > 0) {
      result.status = 'WARNING';
    } else {
      result.status = 'PASS';
    }

    console.log(`   Status: ${result.status}`);
    return result;
  }

  /**
   * Audit variants against CJ data
   */
  auditVariants(product, cjProduct, cjVariants) {
    const result = {
      status: 'OK',
      comparisons: [],
      issues: [],
    };

    const storeVariants = product.variants || [];

    if (!cjVariants || cjVariants.length === 0) {
      result.status = 'NO_CJ_DATA';
      return result;
    }

    // Compare each store variant
    for (const storeVar of storeVariants) {
      const comparison = {
        storeVariant: storeVar.variant || storeVar.sku,
        storePrice: storeVar.price,
        cjMatch: false,
        priceMatch: false,
        stock: null,
      };

      // Try to find matching CJ variant
      const cjMatch = cjVariants.find(cv => {
        const cvName = (cv.variantNameEn || cv.name || '').toLowerCase();
        const svName = (storeVar.variant || '').toLowerCase();
        return cvName.includes(svName) || svName.includes(cvName);
      });

      if (cjMatch) {
        comparison.cjMatch = true;
        comparison.cjPrice = cjMatch.variantSellPrice || cjMatch.price;
        comparison.stock = cjMatch.variantVolume || cjMatch.stock;

        // Check price margin
        if (comparison.cjPrice && comparison.storePrice) {
          const margin = ((comparison.storePrice - comparison.cjPrice) / comparison.storePrice) * 100;
          comparison.margin = Math.round(margin);
          comparison.priceMatch = margin >= config.AUDIT.MIN_MARGIN_PERCENT;

          if (!comparison.priceMatch) {
            result.issues.push({
              severity: 'warning',
              message: `Low margin on ${storeVar.variant}: ${comparison.margin}% (min: ${config.AUDIT.MIN_MARGIN_PERCENT}%)`,
            });
          }
        }

        // Check stock
        if (comparison.stock !== null && comparison.stock < config.AUDIT.LOW_STOCK_WARNING) {
          result.issues.push({
            severity: comparison.stock === 0 ? 'critical' : 'warning',
            message: `Low stock on ${storeVar.variant}: ${comparison.stock} units`,
          });
        }
      } else {
        result.issues.push({
          severity: 'warning',
          message: `No CJ match found for variant: ${storeVar.variant}`,
        });
      }

      result.comparisons.push(comparison);
    }

    // Check for CJ variants we don't have
    const unmatchedCJ = cjVariants.filter(cv => {
      const cvName = (cv.variantNameEn || cv.name || '').toLowerCase();
      return !storeVariants.some(sv => {
        const svName = (sv.variant || '').toLowerCase();
        return cvName.includes(svName) || svName.includes(cvName);
      });
    });

    if (unmatchedCJ.length > 0 && unmatchedCJ.length <= 5) {
      result.issues.push({
        severity: 'info',
        message: `CJ has ${unmatchedCJ.length} additional variant(s) not in store`,
      });
    }

    if (result.issues.some(i => i.severity === 'critical')) {
      result.status = 'CRITICAL';
    } else if (result.issues.some(i => i.severity === 'warning')) {
      result.status = 'WARNING';
    }

    return result;
  }
}

// Run the agent
const agent = new ProductQAAgent();
agent.run().catch(console.error);
