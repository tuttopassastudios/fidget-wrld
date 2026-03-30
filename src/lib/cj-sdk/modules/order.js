/**
 * Order management module for CJ Dropshipping API
 * @module modules/order
 */

import { validateRequired } from '../utils/helpers.js';

/**
 * @typedef {Object} CreateOrderData
 * @property {string} orderNumber - Your unique order number
 * @property {string} shippingCountryCode - 2-letter country code (e.g., 'US')
 * @property {string} shippingCountry - Full country name
 * @property {string} shippingProvince - State/Province
 * @property {string} shippingCity - City
 * @property {string} shippingAddress - Street address
 * @property {string} shippingCustomerName - Customer full name
 * @property {string} shippingPhone - Customer phone
 * @property {string} [shippingZip] - Postal code
 * @property {string} [shippingAddress2] - Address line 2
 * @property {string} [houseNumber] - House number
 * @property {string} [email] - Customer email
 * @property {string} [remark] - Order notes
 * @property {string} [logisticName] - Shipping method name
 * @property {boolean} [fromCountryCode] - Source country
 * @property {Array<OrderProduct>} products - Products to order
 */

/**
 * @typedef {Object} OrderProduct
 * @property {string} vid - Variant ID
 * @property {number} quantity - Quantity to order
 * @property {string} [shippingName] - Shipping method for this item
 */

/**
 * Order/shopping management endpoints
 */
class OrderModule {
  /**
   * @param {import('../client').default} client - CJ API client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Create a new order (v3 API)
   * @param {CreateOrderData} data - Order data
   * @returns {Promise<Object>} Created order details
   * @example
   * const order = await cj.order.createOrder({
   *   orderNumber: 'MY-ORDER-001',
   *   shippingCountryCode: 'US',
   *   shippingCountry: 'United States',
   *   shippingProvince: 'California',
   *   shippingCity: 'Los Angeles',
   *   shippingAddress: '123 Main St',
   *   shippingCustomerName: 'John Doe',
   *   shippingPhone: '1234567890',
   *   shippingZip: '90001',
   *   products: [
   *     { vid: 'VARIANT_ID', quantity: 2 }
   *   ]
   * });
   */
  async createOrder(data) {
    validateRequired(data, [
      'orderNumber',
      'shippingCountryCode',
      'shippingCountry',
      'shippingProvince',
      'shippingCity',
      'shippingAddress',
      'shippingCustomerName',
      'shippingPhone',
      'products',
    ]);

    if (!Array.isArray(data.products) || data.products.length === 0) {
      throw new Error('products must be a non-empty array');
    }

    return this.client.post('/shopping/order/createOrderV3', data);
  }

  /**
   * List orders with filters
   * @param {Object} [params] - Query parameters
   * @param {string} [params.orderIds] - Comma-separated order IDs
   * @param {string} [params.orderStatus] - Filter by status
   * @param {number} [params.pageNum=1] - Page number
   * @param {number} [params.pageSize=20] - Results per page
   * @param {string} [params.startDate] - Start date filter
   * @param {string} [params.endDate] - End date filter
   * @returns {Promise<Object>} Order list
   * @example
   * const orders = await cj.order.listOrders({
   *   orderStatus: 'UNPAID',
   *   pageSize: 50
   * });
   */
  async listOrders(params = {}) {
    return this.client.get('/shopping/order/list', {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 20,
      ...params,
    });
  }

  /**
   * Get order details by order ID
   * @param {string} orderId - CJ order ID
   * @returns {Promise<Object>} Order details
   * @example
   * const order = await cj.order.getOrder('CJ_ORDER_ID');
   */
  async getOrder(orderId) {
    validateRequired({ orderId }, ['orderId']);
    return this.client.get('/shopping/order/getOrderDetail', { orderId });
  }

  /**
   * Confirm an order
   * @param {string} orderId - CJ order ID
   * @returns {Promise<Object>} Confirmation result
   * @example
   * await cj.order.confirmOrder('CJ_ORDER_ID');
   */
  async confirmOrder(orderId) {
    validateRequired({ orderId }, ['orderId']);
    return this.client.patch('/shopping/order/confirmOrder', { orderId });
  }

  /**
   * Delete/cancel an order
   * @param {string} orderId - CJ order ID
   * @returns {Promise<Object>} Deletion result
   * @example
   * await cj.order.deleteOrder('CJ_ORDER_ID');
   */
  async deleteOrder(orderId) {
    validateRequired({ orderId }, ['orderId']);
    return this.client.delete('/shopping/order/deleteOrder', { orderId });
  }

  /**
   * Change order warehouse
   * @param {string} orderCode - CJ order code
   * @param {string} storageId - New warehouse/storage ID
   * @returns {Promise<Object>} Change result
   * @example
   * await cj.order.changeWarehouse('ORDER_CODE', 'WAREHOUSE_ID');
   */
  async changeWarehouse(orderCode, storageId) {
    validateRequired({ orderCode, storageId }, ['orderCode', 'storageId']);
    return this.client.patch('/shopping/order/changeWarehouse', {
      orderCode,
      storageId,
    });
  }
}

export default OrderModule;
