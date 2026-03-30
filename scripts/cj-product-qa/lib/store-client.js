/**
 * Store Client - Fetch products from Supabase and static files
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

class StoreClient {
  constructor() {
    const { url, serviceKey } = config.getSupabaseConfig();
    if (url && serviceKey) {
      this.supabase = createClient(url, serviceKey);
    }
  }

  /**
   * Get all CJ products from Supabase
   */
  async getCJProductsFromSupabase() {
    if (!this.supabase) {
      console.log('   Supabase not configured, skipping...');
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .like('slug', 'cj-%');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.log(`   Supabase error: ${error.message}`);
      return [];
    }
  }

  /**
   * Get CJ product ID mappings
   */
  getCJProductIds() {
    const filePath = path.join(__dirname, '..', config.PATHS.CJ_PRODUCT_IDS);
    if (!fs.existsSync(filePath)) {
      console.log('   CJ product IDs file not found');
      return { productsAlreadyInStore: [] };
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  /**
   * Get cached CJ research data
   */
  getCachedCJData() {
    const filePath = path.join(__dirname, '..', config.PATHS.CJ_RESEARCHED_PRODUCTS);
    if (!fs.existsSync(filePath)) {
      return { products: [] };
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  /**
   * Find CJ PID for a store product
   */
  findPidForProduct(slug, productIds) {
    const mapping = productIds.productsAlreadyInStore?.find(p => p.slug === slug);
    return mapping?.pid || null;
  }

  /**
   * Get all CJ products with their PIDs
   */
  async getCJProducts() {
    console.log('\n   Loading store products...');

    // Get products from Supabase
    const supabaseProducts = await this.getCJProductsFromSupabase();
    console.log(`   Found ${supabaseProducts.length} CJ products in Supabase`);

    // Get PID mappings
    const productIds = this.getCJProductIds();

    // Merge with PID info
    const products = supabaseProducts.map(product => {
      const pid = this.findPidForProduct(product.slug, productIds);
      const mapping = productIds.productsAlreadyInStore?.find(p => p.slug === product.slug);

      return {
        ...product,
        cjPid: pid,
        cjSourceUrl: mapping?.sourceUrl,
        cjNotes: mapping?.notes,
      };
    });

    return products;
  }

  /**
   * Update a product in Supabase
   */
  async updateProduct(slug, updates) {
    if (!this.supabase) {
      console.log('   Supabase not configured, cannot update');
      return false;
    }

    try {
      const { error } = await this.supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('slug', slug);

      if (error) throw error;
      return true;
    } catch (error) {
      console.log(`   Update error for ${slug}: ${error.message}`);
      return false;
    }
  }
}

module.exports = StoreClient;
