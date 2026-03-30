/**
 * CJ Client - Cache-Only Mode
 *
 * Reads product data from the Loop Agent's cache instead of calling the CJ API.
 * This allows the QA agent to run without consuming API quota.
 */

const fs = require('fs');
const path = require('path');
const config = require('../config');

// Path to Loop Agent's product cache
const LOOP_AGENT_CACHE = path.join(__dirname, '../../cj-loop-agent/data/product-cache.json');

class CJClient {
  constructor() {
    this.cache = this.loadCache();
    this.requestLog = [];
  }

  /**
   * Load the Loop Agent's product cache
   */
  loadCache() {
    try {
      if (fs.existsSync(LOOP_AGENT_CACHE)) {
        const data = JSON.parse(fs.readFileSync(LOOP_AGENT_CACHE, 'utf8'));
        const productCount = Object.keys(data.products || {}).length;
        console.log(`   Loaded ${productCount} products from Loop Agent cache`);
        if (data.lastUpdated) {
          console.log(`   Cache last updated: ${new Date(data.lastUpdated).toLocaleString()}`);
        }
        return data;
      }
    } catch (error) {
      console.log(`   Warning: Could not load cache: ${error.message}`);
    }
    return { products: {}, lastUpdated: null };
  }

  /**
   * Get product details from cache
   */
  async getProduct(pid) {
    const cached = this.cache.products[pid];

    this.requestLog.push({
      time: new Date().toISOString(),
      endpoint: 'getProduct (cache)',
      pid,
      success: !!cached,
      source: 'loop-agent-cache',
    });

    if (cached && cached.product) {
      console.log(`   Using cached data for ${pid} (cached: ${new Date(cached.cachedAt).toLocaleString()})`);
      return cached.product;
    }

    console.log(`   ⚠️  No cached data for ${pid} - run Loop Agent to sync`);
    return null;
  }

  /**
   * Get product variants from cache
   */
  async getVariants(pid) {
    const cached = this.cache.products[pid];

    this.requestLog.push({
      time: new Date().toISOString(),
      endpoint: 'getVariants (cache)',
      pid,
      success: !!cached,
      source: 'loop-agent-cache',
    });

    if (cached && cached.variants) {
      return cached.variants;
    }

    return [];
  }

  /**
   * Check if product has US warehouse availability
   */
  checkUSWarehouse(productData) {
    if (!productData) {
      return { available: false, inventoryNum: 0, verifiedWarehouse: 0, totalVerified: 0 };
    }

    return {
      available: (productData.warehouseInventoryNum > 0 ||
                  productData.verifiedWarehouse > 0 ||
                  productData.totalVerifiedInventory > 0),
      inventoryNum: productData.warehouseInventoryNum || 0,
      verifiedWarehouse: productData.verifiedWarehouse || 0,
      totalVerified: productData.totalVerifiedInventory || 0,
    };
  }

  /**
   * Get request log for report
   */
  getRequestLog() {
    return this.requestLog;
  }

  /**
   * Get cache status for reporting
   */
  getCacheStatus() {
    const products = Object.keys(this.cache.products || {});
    const ages = products.map(pid => {
      const cached = this.cache.products[pid];
      return cached?.cachedAt ? Date.now() - new Date(cached.cachedAt).getTime() : Infinity;
    });

    return {
      productCount: products.length,
      lastUpdated: this.cache.lastUpdated,
      oldestCacheMs: Math.max(...ages),
      newestCacheMs: Math.min(...ages),
    };
  }

  /**
   * Check which PIDs are missing from cache
   */
  getMissingProducts(requiredPids) {
    return requiredPids.filter(pid => !this.cache.products[pid]);
  }

  /**
   * No-op for cache mode (was used for ETA calculations)
   */
  getEstimatedCompletion(remainingProducts) {
    // In cache mode, no waiting needed
    return new Date();
  }
}

module.exports = CJClient;
