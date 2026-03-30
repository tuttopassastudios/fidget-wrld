/**
 * CJ Dropshipping SDK - Main Entry Point
 * @module cj-dropshipping-sdk
 */

import CJClient from './client.js';
import AuthModule from './modules/auth.js';
import ProductModule from './modules/product.js';
import OrderModule from './modules/order.js';
import PaymentModule from './modules/payment.js';
import LogisticsModule from './modules/logistics.js';
import WarehouseModule from './modules/warehouse.js';
import WebhookModule, { WebhookType } from './modules/webhook.js';

// Export error classes for external use
import {
  CJApiError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NetworkError,
} from './utils/errors.js';

/**
 * Main CJ Dropshipping SDK class
 * Provides access to all API modules through a unified interface
 *
 * @example
 * import CJDropshipping from 'cj-dropshipping-sdk';
 *
 * const cj = new CJDropshipping({
 *   apiKey: process.env.CJ_API_KEY
 * });
 *
 * // Search products
 * const products = await cj.product.searchProducts({ keyword: 'phone case' });
 *
 * // Create order
 * const order = await cj.order.createOrder({ ... });
 */
class CJDropshipping {
  /**
   * Create a new CJ Dropshipping SDK instance
   * @param {Object} options - Configuration options
   * @param {string} options.apiKey - CJ API key (required)
   * @param {string} [options.baseUrl] - Custom API base URL
   * @param {number} [options.timeout=30000] - Request timeout in ms
   * @param {number} [options.maxRetries=3] - Max retry attempts
   */
  constructor(options = {}) {
    /**
     * Core HTTP client
     * @type {CJClient}
     * @private
     */
    this._client = new CJClient(options);

    // Lazy-loaded module instances
    this._auth = null;
    this._product = null;
    this._order = null;
    this._payment = null;
    this._logistics = null;
    this._warehouse = null;
    this._webhook = null;
  }

  /**
   * Authentication module
   * @type {AuthModule}
   */
  get auth() {
    if (!this._auth) {
      this._auth = new AuthModule(this._client);
    }
    return this._auth;
  }

  /**
   * Product management module
   * @type {ProductModule}
   */
  get product() {
    if (!this._product) {
      this._product = new ProductModule(this._client);
    }
    return this._product;
  }

  /**
   * Order management module
   * @type {OrderModule}
   */
  get order() {
    if (!this._order) {
      this._order = new OrderModule(this._client);
    }
    return this._order;
  }

  /**
   * Payment module
   * @type {PaymentModule}
   */
  get payment() {
    if (!this._payment) {
      this._payment = new PaymentModule(this._client);
    }
    return this._payment;
  }

  /**
   * Logistics module
   * @type {LogisticsModule}
   */
  get logistics() {
    if (!this._logistics) {
      this._logistics = new LogisticsModule(this._client);
    }
    return this._logistics;
  }

  /**
   * Warehouse module
   * @type {WarehouseModule}
   */
  get warehouse() {
    if (!this._warehouse) {
      this._warehouse = new WarehouseModule(this._client);
    }
    return this._warehouse;
  }

  /**
   * Webhook module
   * @type {WebhookModule}
   */
  get webhook() {
    if (!this._webhook) {
      this._webhook = new WebhookModule(this._client);
    }
    return this._webhook;
  }

  /**
   * Get the underlying HTTP client
   * Useful for advanced use cases or debugging
   * @returns {CJClient}
   */
  getClient() {
    return this._client;
  }

  /**
   * Clear cached authentication token
   */
  clearToken() {
    this._client.clearToken();
  }
}

// Export main class as default
export default CJDropshipping;

// Named exports for direct imports
export {
  CJDropshipping,
  CJClient,
  CJApiError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NetworkError,
  AuthModule,
  ProductModule,
  OrderModule,
  PaymentModule,
  LogisticsModule,
  WarehouseModule,
  WebhookModule,
  WebhookType,
};
