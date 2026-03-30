/**
 * CJ Loop Agent Configuration
 */

module.exports = {
  // CJ API Configuration
  CJ_API_KEY: 'CJ3556407@api@12136edd24d14f27b10469e0f56fa300',

  // Loop interval: 5 minutes 30 seconds (to safely avoid rate limits)
  LOOP_INTERVAL_MS: 330000,

  // File paths
  PATHS: {
    CJ_PRODUCT_IDS: '../cj-fidget-product-ids.json',
    CANDIDATES_FILE: './data/product-candidates.json',
    UPDATES_LOG: './data/updates-log.json',
    PRODUCT_CACHE: './data/product-cache.json', // Full CJ data for QA agent
    LIVE_REPORT: '../../reports/cj-loop-agent.md',
  },

  // Search terms for product discovery (rotate through these)
  SEARCH_TERMS: [
    'fidget spinner metal',
    'pop it silicone bubble',
    'stress ball squishy',
    'fidget cube',
    'infinity cube',
    'magnetic putty',
    'sensory toy autism',
    'fidget ring anxiety',
    'mesh marble fidget',
    'wacky tracks snap',
    'tangle fidget',
    'simple dimple',
    'stretchy string',
    'flippy chain',
    'squeeze toy kawaii',
  ],

  // Discovery settings
  DISCOVERY: {
    MIN_PROFIT_MARGIN: 0.4,  // 40% minimum margin
    MIN_STOCK: 10,            // Minimum stock level (lowered to find more products)
    MAX_PRICE: 50,            // Max cost price to consider
    PREFER_US_WAREHOUSE: true,
  },

  // Update settings
  UPDATE: {
    PRICE_CHANGE_THRESHOLD: 0.10,  // 10% price change = alert
    STOCK_LOW_THRESHOLD: 50,        // Alert if stock drops below
  },
};
