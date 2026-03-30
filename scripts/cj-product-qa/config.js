/**
 * CJ Product QA Agent Configuration
 */

module.exports = {
  // CJ API Configuration
  CJ_API_KEY: 'CJ3556407@api@12136edd24d14f27b10469e0f56fa300',
  CJ_RATE_LIMIT_MS: 300000, // 5 minutes between API calls

  // File paths
  PATHS: {
    CJ_PRODUCT_IDS: '../cj-fidget-product-ids.json',
    CJ_RESEARCHED_PRODUCTS: '../cj-researched-products.json',
    PRODUCTS_TS: '../../src/data/products.ts',
    REPORT_OUTPUT: '../../reports/cj-product-audit.md',
    AUDIT_STATE: './reports/.audit-state.json',
  },

  // Supabase (loaded from env)
  getSupabaseConfig: () => ({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }),

  // Claude API (loaded from env)
  getAnthropicKey: () => process.env.ANTHROPIC_API_KEY,

  // Audit settings
  AUDIT: {
    // Price margin thresholds
    MIN_MARGIN_PERCENT: 40, // Flag if margin below this
    TARGET_MARGIN_PERCENT: 60, // Suggested margin

    // Stock thresholds
    LOW_STOCK_WARNING: 50, // Warn if US stock below this
    OUT_OF_STOCK: 0,

    // Image validation timeout
    IMAGE_TIMEOUT_MS: 10000,
  },

  // Which fields can be auto-applied vs flagged
  CHANGE_POLICY: {
    autoApply: ['image_url_fix', 'updated_at'],
    flagForReview: ['price', 'description', 'variants_add', 'variants_remove', 'stock_warning'],
    neverChange: ['slug', 'sku', 'delete'],
  },
};
