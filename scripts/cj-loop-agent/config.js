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

  // Fidget toy keyword filters - product name must contain at least one
  // These are specific enough to identify actual fidget toys
  FIDGET_KEYWORDS: [
    'fidget', 'fidgeting',
    'spinner', 'spinning toy',
    'fidget cube', 'infinity cube', 'magic cube',
    'stress ball', 'stress relief toy', 'stress toy',
    'sensory toy', 'sensory fidget',
    'squishy toy', 'squeeze toy', 'squish',
    'pop it', 'pop bubble', 'bubble pop', 'simple dimple', 'push pop',
    'anxiety toy', 'anxiety relief',
    'magnetic ball', 'magnetic putty', 'magnetic fidget', 'buckyballs', 'neocube',
    'putty', 'slime',
    'tangle toy', 'tangle fidget',
    'flippy chain', 'bike chain fidget',
    'mesh marble', 'marble mesh',
    'stretchy string', 'noodle stretchy',
    'wacky tracks', 'snap track',
    'finger toy', 'hand spinner',
    'desk toy', 'desk fidget',
    'decompression toy', 'decompression fidget',
    'autism toy', 'adhd toy', 'adhd fidget',
    'calm toy', 'calming fidget',
    'ferrofluid',
  ],

  // Words that disqualify a product (not fidget toys)
  EXCLUDE_KEYWORDS: [
    // Jewelry
    'earring', 'necklace', 'bracelet', 'jewelry', 'jewellery', 'pendant', 'ring set',
    'anklet', 'brooch', 'tiara', 'hairpin', 'hair clip', 'barrette',
    // Clothing
    'shaver', 'razor', 'jacket', 'coat', 'clothing', 'shirt', 'dress', 'hoodie',
    'pants', 'shorts', 'skirt', 'sweater', 'vest', 'underwear', 'socks',
    // Electronics
    'dispenser', 'massager', 'phone case', 'charger', 'cable', 'adapter',
    'speaker', 'headphone', 'earbuds', 'bluetooth', 'wireless', 'usb',
    // Beauty
    'lipstick', 'makeup', 'cosmetic', 'skincare', 'perfume', 'nail',
    // Kitchen/Home
    'kitchen', 'cooking', 'food', 'water bottle', 'cup', 'mug', 'plate', 'bowl',
    'furniture', 'lamp', 'curtain', 'bedding', 'towel',
    // Pets
    'pet', 'dog', 'cat', 'animal feed', 'collar', 'leash', 'aquarium',
    // Craft/Decor
    'crystal tree', 'pearl', 'gemstone', 'resin craft', 'decoration', 'vase',
    'painting', 'canvas', 'frame', 'poster',
    // Bags
    'bag', 'purse', 'wallet', 'backpack', 'luggage', 'handbag', 'tote',
    // Misc
    'airtag', 'key ring', 'keychain holder', 'car', 'bike', 'motorcycle',
    'tool', 'wrench', 'screwdriver', 'garden', 'outdoor', 'camping',
  ],

  // Update settings
  UPDATE: {
    PRICE_CHANGE_THRESHOLD: 0.10,  // 10% price change = alert
    STOCK_LOW_THRESHOLD: 50,        // Alert if stock drops below
  },
};
