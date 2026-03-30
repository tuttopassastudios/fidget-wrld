import { productPages, cjDropshippingProducts } from '@/data/products';

export interface CJMapping {
  cjPid: string;
  cjVid: string;
  productName: string;
  variantName: string;
}

// Build a lookup map from store SKU to CJ IDs
const skuToCJMap: Map<string, CJMapping> = new Map();

// Initialize the map from all product pages
function initializeMap() {
  if (skuToCJMap.size > 0) return; // Already initialized

  for (const product of [...productPages, ...cjDropshippingProducts]) {
    for (const variant of product.variants) {
      if (variant.cjPid && variant.cjVid) {
        skuToCJMap.set(variant.sku, {
          cjPid: variant.cjPid,
          cjVid: variant.cjVid,
          productName: product.name,
          variantName: variant.variant,
        });
      }
    }
  }
}

/**
 * Get CJ Dropshipping mapping for a store SKU
 * @param sku Store SKU (e.g., 'CJ-SPIN-KEY-BLK')
 * @returns CJ mapping with PID and VID, or null if not a CJ product
 */
export function getCJMapping(sku: string): CJMapping | null {
  initializeMap();
  return skuToCJMap.get(sku) || null;
}

/**
 * Check if a SKU is a CJ Dropshipping product
 * @param sku Store SKU to check
 * @returns true if this is a CJ product that can be auto-fulfilled
 */
export function isCJProduct(sku: string): boolean {
  initializeMap();
  return skuToCJMap.has(sku);
}

/**
 * Get all CJ product SKUs
 * @returns Array of all SKUs that are CJ products
 */
export function getAllCJSkus(): string[] {
  initializeMap();
  return Array.from(skuToCJMap.keys());
}

/**
 * Get CJ mappings for multiple SKUs
 * @param skus Array of store SKUs
 * @returns Object with cj items and non-CJ items separated
 */
export function getCJMappings(skus: string[]): {
  cjItems: Array<{ sku: string; mapping: CJMapping }>;
  nonCJItems: string[];
} {
  initializeMap();

  const cjItems: Array<{ sku: string; mapping: CJMapping }> = [];
  const nonCJItems: string[] = [];

  for (const sku of skus) {
    const mapping = skuToCJMap.get(sku);
    if (mapping) {
      cjItems.push({ sku, mapping });
    } else {
      nonCJItems.push(sku);
    }
  }

  return { cjItems, nonCJItems };
}
