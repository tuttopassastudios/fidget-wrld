#!/usr/bin/env node
/**
 * CJ Loop Agent
 *
 * Continuously fetches CJ Dropshipping data every 5m30s:
 * - Even cycles: Discover new products using search terms
 * - Odd cycles: Update existing product data
 *
 * Usage:
 *   node scripts/cj-loop-agent/index.js           # Run continuously
 *   node scripts/cj-loop-agent/index.js --once    # Run one cycle only
 *   node scripts/cj-loop-agent/index.js --discover # Discovery only
 *   node scripts/cj-loop-agent/index.js --update   # Updates only
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const CJDropshipping = require(path.join(process.env.USERPROFILE, 'cj-dropshipping-sdk'));
const config = require('./config');

// Parse arguments
const args = process.argv.slice(2);
const flags = {
  once: args.includes('--once'),
  discoverOnly: args.includes('--discover'),
  updateOnly: args.includes('--update'),
};

class CJLoopAgent {
  constructor() {
    this.cj = new CJDropshipping({ apiKey: config.CJ_API_KEY });
    this.cycleCount = 0;
    this.searchTermIndex = 0;
    this.productUpdateIndex = 0;
    this.candidates = this.loadCandidates();
    this.updatesLog = this.loadUpdatesLog();
    this.startTime = new Date();
  }

  // ─────────────────────────────────────────────────────────────
  // Data Persistence
  // ─────────────────────────────────────────────────────────────

  loadCandidates() {
    const filePath = path.join(__dirname, config.PATHS.CANDIDATES_FILE);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return { products: [], lastUpdated: null };
  }

  saveCandidates() {
    const filePath = path.join(__dirname, config.PATHS.CANDIDATES_FILE);
    this.candidates.lastUpdated = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(this.candidates, null, 2));
  }

  loadUpdatesLog() {
    const filePath = path.join(__dirname, config.PATHS.UPDATES_LOG);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return { updates: [], alerts: [] };
  }

  saveUpdatesLog() {
    const filePath = path.join(__dirname, config.PATHS.UPDATES_LOG);
    fs.writeFileSync(filePath, JSON.stringify(this.updatesLog, null, 2));
  }

  // ─────────────────────────────────────────────────────────────
  // Product Cache (for QA Agent to consume)
  // ─────────────────────────────────────────────────────────────

  loadProductCache() {
    const filePath = path.join(__dirname, config.PATHS.PRODUCT_CACHE);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return { products: {}, lastUpdated: null };
  }

  saveProductCache(cache) {
    const filePath = path.join(__dirname, config.PATHS.PRODUCT_CACHE);
    cache.lastUpdated = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(cache, null, 2));
  }

  cacheProductData(pid, slug, productData, variantData) {
    const cache = this.loadProductCache();
    cache.products[pid] = {
      pid,
      slug,
      product: productData,
      variants: variantData,
      cachedAt: new Date().toISOString(),
    };
    this.saveProductCache(cache);
    this.log(`   📦 Cached product data for QA agent`);
  }

  loadExistingProducts() {
    const filePath = path.join(__dirname, config.PATHS.CJ_PRODUCT_IDS);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return { productsAlreadyInStore: [] };
  }

  // ─────────────────────────────────────────────────────────────
  // Discovery: Find new products
  // ─────────────────────────────────────────────────────────────

  async discoverProducts() {
    const searchTerm = config.SEARCH_TERMS[this.searchTermIndex];
    this.searchTermIndex = (this.searchTermIndex + 1) % config.SEARCH_TERMS.length;

    this.log(`🔍 Searching: "${searchTerm}"`);

    try {
      const results = await this.cj.product.searchProducts({
        keyword: searchTerm,
        pageNum: 1,
        pageSize: 20,
      });

      // CJ API V2 structure: content[0].productList contains the actual products
      const contentList = results.data?.content || results.content || [];
      const products = contentList[0]?.productList || results.data?.list || results.list || [];
      this.log(`   Found ${products.length} products`);
      if (products.length === 0) {
        this.log(`   API response keys: ${Object.keys(results.data || results).join(', ')}`);
      }

      // Filter and score products
      const validProducts = products.filter(p => this.isValidCandidate(p));
      this.log(`   ${validProducts.length} meet criteria`);

      // Add new candidates
      let newCount = 0;
      for (const product of validProducts) {
        const pid = product.id || product.pid;
        if (!this.candidateExists(pid)) {
          this.addCandidate(product, searchTerm);
          newCount++;
        }
      }

      if (newCount > 0) {
        this.log(`   ✅ Added ${newCount} new candidate(s)`);
        this.saveCandidates();
      }

      return { searchTerm, found: products.length, valid: validProducts.length, new: newCount };

    } catch (error) {
      this.log(`   ❌ Error: ${error.message}`);
      return { searchTerm, error: error.message };
    }
  }

  isValidCandidate(product) {
    const price = parseFloat(product.sellPrice) || 0;
    const stock = product.warehouseInventoryNum || 0;
    const pid = product.id || product.pid;

    // Basic filters
    if (price > config.DISCOVERY.MAX_PRICE) return false;
    if (stock < config.DISCOVERY.MIN_STOCK) return false;

    // Check if already in store
    const existing = this.loadExistingProducts();
    if (existing.alreadyFetched?.includes(pid)) return false;

    return true;
  }

  candidateExists(pid) {
    return this.candidates.products.some(p => p.pid === pid);
  }

  addCandidate(product, searchTerm) {
    // API V2 uses 'id' field, we store as 'pid' for consistency
    const pid = product.id || product.pid;
    this.candidates.products.push({
      pid,
      name: product.nameEn || product.productNameEn,
      price: product.sellPrice,
      stock: product.warehouseInventoryNum,
      hasUSWarehouse: product.warehouseInventoryNum > 0,
      image: product.bigImage || product.productImage,
      searchTerm,
      foundAt: new Date().toISOString(),
      score: this.scoreProduct(product),
    });
  }

  scoreProduct(product) {
    let score = 50; // Base score

    // Price scoring (cheaper = better for margins)
    const price = parseFloat(product.sellPrice) || 0;
    if (price < 5) score += 20;
    else if (price < 10) score += 15;
    else if (price < 20) score += 10;

    // Stock scoring
    const stock = product.warehouseInventoryNum || 0;
    if (stock > 10000) score += 20;
    else if (stock > 1000) score += 15;
    else if (stock > 100) score += 10;

    // US warehouse bonus
    if (stock > 0) score += 15;

    return score;
  }

  // ─────────────────────────────────────────────────────────────
  // Updates: Refresh existing product data
  // ─────────────────────────────────────────────────────────────

  async updateExistingProduct() {
    const existing = this.loadExistingProducts();
    const products = existing.productsAlreadyInStore || [];

    if (products.length === 0) {
      this.log('📦 No existing products to update');
      return null;
    }

    // Round-robin through products
    const product = products[this.productUpdateIndex];
    this.productUpdateIndex = (this.productUpdateIndex + 1) % products.length;

    this.log(`📦 Updating: ${product.name} (${product.slug})`);

    try {
      const cjData = await this.cj.product.getProduct({ pid: product.pid });
      const variants = await this.cj.product.getVariants({ pid: product.pid });

      // Cache full product data for QA agent
      const productData = cjData.data || cjData;
      const variantList = variants.data || variants || [];
      this.cacheProductData(product.pid, product.slug, productData, variantList);

      const update = {
        pid: product.pid,
        slug: product.slug,
        timestamp: new Date().toISOString(),
        changes: [],
      };

      // Check for changes
      const currentPrice = productData.sellPrice;

      // Calculate total stock
      const totalStock = variantList.reduce((sum, v) => sum + (v.variantVolume || 0), 0);

      // Check stock levels
      if (totalStock < config.UPDATE.STOCK_LOW_THRESHOLD) {
        update.changes.push({
          type: 'LOW_STOCK',
          message: `Stock is low: ${totalStock} units`,
          severity: totalStock === 0 ? 'critical' : 'warning',
        });
      }

      // Log the update
      this.updatesLog.updates.push(update);

      // Keep only last 100 updates
      if (this.updatesLog.updates.length > 100) {
        this.updatesLog.updates = this.updatesLog.updates.slice(-100);
      }

      // Add alerts for significant changes
      if (update.changes.length > 0) {
        this.updatesLog.alerts.push(...update.changes.map(c => ({
          ...c,
          product: product.slug,
          timestamp: update.timestamp,
        })));
        this.log(`   ⚠️  ${update.changes.length} change(s) detected`);
      } else {
        this.log(`   ✅ No changes`);
      }

      this.saveUpdatesLog();
      return update;

    } catch (error) {
      this.log(`   ❌ Error: ${error.message}`);
      return { pid: product.pid, error: error.message };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Report Generation
  // ─────────────────────────────────────────────────────────────

  generateReport() {
    const now = new Date();
    const runtime = Math.round((now - this.startTime) / 60000);

    const topCandidates = [...this.candidates.products]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const recentAlerts = this.updatesLog.alerts.slice(-10).reverse();

    const md = `# CJ Loop Agent Report

**Status:** Running
**Started:** ${this.startTime.toISOString()}
**Runtime:** ${runtime} minutes
**Cycles Completed:** ${this.cycleCount}
**Next Cycle:** ${new Date(now.getTime() + config.LOOP_INTERVAL_MS).toLocaleTimeString()}

---

## Discovery Stats

- **Total Candidates Found:** ${this.candidates.products.length}
- **Search Terms Cycled:** ${this.searchTermIndex}/${config.SEARCH_TERMS.length}

### Top 10 Candidates (by score)

| Score | Name | Price | Stock | US Warehouse |
|-------|------|-------|-------|--------------|
${topCandidates.map(p => `| ${p.score} | ${p.name?.substring(0, 40)}... | $${p.price} | ${p.stock} | ${p.hasUSWarehouse ? 'Yes' : 'No'} |`).join('\n')}

---

## Update Stats

- **Products in Rotation:** ${this.loadExistingProducts().productsAlreadyInStore?.length || 0}
- **Current Index:** ${this.productUpdateIndex}
- **Total Updates Logged:** ${this.updatesLog.updates.length}

### Recent Alerts

${recentAlerts.length > 0 ? recentAlerts.map(a => `- **[${a.severity?.toUpperCase()}]** ${a.product}: ${a.message} (${new Date(a.timestamp).toLocaleTimeString()})`).join('\n') : '_No recent alerts_'}

---

## Recent Activity

| Cycle | Time | Action | Result |
|-------|------|--------|--------|
${this.recentActivity.slice(-10).map(a => `| ${a.cycle} | ${a.time} | ${a.action} | ${a.result} |`).join('\n')}

---

_Last updated: ${now.toISOString()}_
`;

    const reportPath = path.join(__dirname, config.PATHS.LIVE_REPORT);
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(reportPath, md);
  }

  recentActivity = [];

  logActivity(action, result) {
    this.recentActivity.push({
      cycle: this.cycleCount,
      time: new Date().toLocaleTimeString(),
      action,
      result,
    });
    if (this.recentActivity.length > 20) {
      this.recentActivity = this.recentActivity.slice(-20);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Main Loop
  // ─────────────────────────────────────────────────────────────

  log(message) {
    const time = new Date().toLocaleTimeString();
    console.log(`[${time}] ${message}`);
  }

  async runCycle() {
    this.cycleCount++;
    this.log(`\n${'═'.repeat(50)}`);
    this.log(`Cycle #${this.cycleCount}`);
    this.log(`${'═'.repeat(50)}`);

    let result;

    if (flags.discoverOnly) {
      result = await this.discoverProducts();
      this.logActivity('Discovery', result.new ? `+${result.new} new` : 'No new');
    } else if (flags.updateOnly) {
      result = await this.updateExistingProduct();
      this.logActivity('Update', result?.changes?.length ? `${result.changes.length} changes` : 'OK');
    } else {
      // Alternate between discovery and updates
      if (this.cycleCount % 2 === 1) {
        result = await this.discoverProducts();
        this.logActivity('Discovery', result.new ? `+${result.new} new` : 'No new');
      } else {
        result = await this.updateExistingProduct();
        this.logActivity('Update', result?.changes?.length ? `${result.changes.length} changes` : 'OK');
      }
    }

    // Update report
    this.generateReport();

    return result;
  }

  async run() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║           CJ Loop Agent - Starting                 ║');
    console.log('╠════════════════════════════════════════════════════╣');
    console.log(`║ Interval: ${config.LOOP_INTERVAL_MS / 1000}s (${config.LOOP_INTERVAL_MS / 60000}m 30s)            ║`);
    console.log(`║ Mode: ${flags.discoverOnly ? 'Discovery Only' : flags.updateOnly ? 'Updates Only' : 'Discovery + Updates'}                  ║`);
    console.log(`║ Search Terms: ${config.SEARCH_TERMS.length}                            ║`);
    console.log('╚════════════════════════════════════════════════════╝');

    // Run first cycle immediately
    await this.runCycle();

    if (flags.once) {
      this.log('\n✅ Single cycle complete (--once flag)');
      return;
    }

    // Continue looping
    this.log(`\n⏰ Next cycle in ${config.LOOP_INTERVAL_MS / 1000} seconds...`);

    setInterval(async () => {
      await this.runCycle();
      this.log(`\n⏰ Next cycle in ${config.LOOP_INTERVAL_MS / 1000} seconds...`);
    }, config.LOOP_INTERVAL_MS);
  }
}

// Start the agent
const agent = new CJLoopAgent();
agent.run().catch(console.error);
