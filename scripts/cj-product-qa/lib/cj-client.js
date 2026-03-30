/**
 * CJ Dropshipping API Client with Rate Limiting
 */

const path = require('path');
const CJDropshipping = require(path.join(process.env.USERPROFILE, 'cj-dropshipping-sdk'));
const config = require('../config');

class CJClient {
  constructor() {
    this.cj = new CJDropshipping({ apiKey: config.CJ_API_KEY });
    this.lastRequestTime = 0;
    this.requestLog = [];
  }

  /**
   * Wait for rate limit cooldown
   */
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (this.lastRequestTime > 0 && timeSinceLastRequest < config.CJ_RATE_LIMIT_MS) {
      const waitTime = config.CJ_RATE_LIMIT_MS - timeSinceLastRequest;
      console.log(`\n   Rate limit: waiting ${Math.round(waitTime / 1000)}s...`);

      // Show countdown
      const startWait = Date.now();
      while (Date.now() - startWait < waitTime) {
        const remaining = Math.ceil((waitTime - (Date.now() - startWait)) / 1000);
        process.stdout.write(`\r   Waiting: ${remaining}s remaining...    `);
        await this.sleep(1000);
      }
      process.stdout.write('\r   Ready!                              \n');
    }

    this.lastRequestTime = Date.now();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get product details from CJ API
   */
  async getProduct(pid) {
    await this.waitForRateLimit();

    try {
      console.log(`   Fetching product ${pid}...`);
      const result = await this.cj.product.getProduct({ pid });

      this.requestLog.push({
        time: new Date().toISOString(),
        endpoint: 'getProduct',
        pid,
        success: true,
      });

      return result.data || result;
    } catch (error) {
      this.requestLog.push({
        time: new Date().toISOString(),
        endpoint: 'getProduct',
        pid,
        success: false,
        error: error.message,
      });

      if (error.message?.includes('Too Many Requests')) {
        console.log('   Rate limited by CJ API. Waiting 5 minutes...');
        await this.sleep(config.CJ_RATE_LIMIT_MS);
        return this.getProduct(pid); // Retry
      }
      throw error;
    }
  }

  /**
   * Get product variants from CJ API
   */
  async getVariants(pid) {
    await this.waitForRateLimit();

    try {
      console.log(`   Fetching variants for ${pid}...`);
      const result = await this.cj.product.getVariants({ pid });

      this.requestLog.push({
        time: new Date().toISOString(),
        endpoint: 'getVariants',
        pid,
        success: true,
      });

      return result.data || result;
    } catch (error) {
      this.requestLog.push({
        time: new Date().toISOString(),
        endpoint: 'getVariants',
        pid,
        success: false,
        error: error.message,
      });

      if (error.message?.includes('Too Many Requests')) {
        console.log('   Rate limited by CJ API. Waiting 5 minutes...');
        await this.sleep(config.CJ_RATE_LIMIT_MS);
        return this.getVariants(pid);
      }
      throw error;
    }
  }

  /**
   * Get all warehouses (to find US warehouses)
   */
  async getWarehouses() {
    await this.waitForRateLimit();

    try {
      console.log('   Fetching warehouse list...');
      const result = await this.cj.warehouse.getWarehouses();

      this.requestLog.push({
        time: new Date().toISOString(),
        endpoint: 'getWarehouses',
        success: true,
      });

      return result.data || result;
    } catch (error) {
      this.requestLog.push({
        time: new Date().toISOString(),
        endpoint: 'getWarehouses',
        success: false,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Check if product has US warehouse availability
   */
  checkUSWarehouse(productData) {
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
   * Estimate time to complete remaining audits
   */
  getEstimatedCompletion(remainingProducts) {
    const msNeeded = remainingProducts * config.CJ_RATE_LIMIT_MS;
    return new Date(Date.now() + msNeeded);
  }
}

module.exports = CJClient;
