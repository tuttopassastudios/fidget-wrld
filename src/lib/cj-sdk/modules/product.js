/**
 * Product management module for CJ Dropshipping API
 * @module modules/product
 */

import { validateRequired } from '../utils/helpers.js';

/**
 * @typedef {Object} SearchProductsParams
 * @property {string} [keyword] - Search keyword
 * @property {string} [categoryId] - Category ID
 * @property {number} [pageNum=1] - Page number
 * @property {number} [pageSize=20] - Results per page (max 200)
 * @property {string} [countryCode] - Warehouse country code
 * @property {number} [minPrice] - Minimum price
 * @property {number} [maxPrice] - Maximum price
 * @property {string} [sortBy] - Sort field (price, createTime)
 * @property {string} [sortType] - Sort direction (asc, desc)
 */

/**
 * Product management endpoints
 */
class ProductModule {
  /**
   * @param {import('../client').default} client - CJ API client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Get all product categories
   * @returns {Promise<Object>} Categories list
   * @example
   * const categories = await cj.product.getCategories();
   */
  async getCategories() {
    return this.client.get('/product/getCategory');
  }

  /**
   * Search products (recommended API)
   * @param {SearchProductsParams} [params] - Search parameters
   * @returns {Promise<Object>} Product search results
   * @example
   * const results = await cj.product.searchProducts({
   *   keyword: 'phone case',
   *   pageSize: 20,
   *   countryCode: 'US'
   * });
   */
  async searchProducts(params = {}) {
    return this.client.get('/product/listV2', {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 20,
      ...params,
    });
  }

  /**
   * List products (legacy API)
   * @param {Object} [params] - Search parameters
   * @returns {Promise<Object>} Product list
   */
  async listProducts(params = {}) {
    return this.client.get('/product/list', {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 20,
      ...params,
    });
  }

  /**
   * Get product details by product ID or SKU
   * @param {Object} params - Query parameters
   * @param {string} [params.pid] - Product ID
   * @param {string} [params.productSku] - Product SKU
   * @returns {Promise<Object>} Product details
   * @example
   * const product = await cj.product.getProduct({ pid: '123456' });
   * // or
   * const product = await cj.product.getProduct({ productSku: 'SKU123' });
   */
  async getProduct(params) {
    if (!params.pid && !params.productSku) {
      throw new Error('Either pid or productSku is required');
    }
    return this.client.get('/product/query', params);
  }

  /**
   * Get product variants by product ID or SKU
   * @param {Object} params - Query parameters
   * @param {string} [params.pid] - Product ID
   * @param {string} [params.productSku] - Product SKU
   * @returns {Promise<Object>} Variant list
   * @example
   * const variants = await cj.product.getVariants({ pid: '123456' });
   */
  async getVariants(params) {
    if (!params.pid && !params.productSku) {
      throw new Error('Either pid or productSku is required');
    }
    return this.client.get('/product/variant/query', params);
  }

  /**
   * Get variant by variant ID
   * @param {string} vid - Variant ID
   * @returns {Promise<Object>} Variant details
   * @example
   * const variant = await cj.product.getVariantById('VAR123');
   */
  async getVariantById(vid) {
    validateRequired({ vid }, ['vid']);
    return this.client.get('/product/variant/queryByVid', { vid });
  }

  /**
   * Check stock by variant ID
   * @param {string} vid - Variant ID
   * @returns {Promise<Object>} Stock information
   * @example
   * const stock = await cj.product.getStock('VAR123');
   */
  async getStock(vid) {
    validateRequired({ vid }, ['vid']);
    return this.client.get('/product/stock/queryByVid', { vid });
  }

  /**
   * Check stock by SKU
   * @param {string} sku - Product SKU
   * @returns {Promise<Object>} Stock information
   * @example
   * const stock = await cj.product.getStockBySku('SKU123');
   */
  async getStockBySku(sku) {
    validateRequired({ sku }, ['sku']);
    return this.client.get('/product/stock/queryBySku', { sku });
  }

  /**
   * Get product comments/reviews
   * @param {string} pid - Product ID
   * @param {Object} [params] - Pagination parameters
   * @param {number} [params.pageNum=1] - Page number
   * @param {number} [params.pageSize=20] - Results per page
   * @returns {Promise<Object>} Product reviews
   * @example
   * const reviews = await cj.product.getComments('123456', { pageSize: 50 });
   */
  async getComments(pid, params = {}) {
    validateRequired({ pid }, ['pid']);
    return this.client.get('/product/productComments', {
      pid,
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 20,
      ...params,
    });
  }

  /**
   * Add product to "My Products" list
   * @param {string} productId - Product ID to add
   * @returns {Promise<Object>} Operation result
   * @example
   * await cj.product.addToMyProducts('123456');
   */
  async addToMyProducts(productId) {
    validateRequired({ productId }, ['productId']);
    return this.client.post('/product/addToMyProduct', { productId });
  }

  /**
   * Get products from "My Products" list
   * @param {Object} [params] - Query parameters
   * @param {number} [params.pageNum=1] - Page number
   * @param {number} [params.pageSize=20] - Results per page
   * @returns {Promise<Object>} My products list
   * @example
   * const myProducts = await cj.product.getMyProducts({ pageSize: 50 });
   */
  async getMyProducts(params = {}) {
    return this.client.get('/product/myProduct/query', {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 20,
      ...params,
    });
  }

  /**
   * Create a product sourcing request
   * @param {Object} data - Sourcing request data
   * @param {string} data.productUrl - Product URL to source
   * @param {string} [data.description] - Additional description
   * @param {number} [data.quantity] - Estimated quantity
   * @returns {Promise<Object>} Sourcing request result
   * @example
   * const request = await cj.product.createSourcingRequest({
   *   productUrl: 'https://example.com/product',
   *   description: 'Need this product in blue',
   *   quantity: 100
   * });
   */
  async createSourcingRequest(data) {
    validateRequired(data, ['productUrl']);
    return this.client.post('/product/sourcing/create', data);
  }
}

export default ProductModule;
