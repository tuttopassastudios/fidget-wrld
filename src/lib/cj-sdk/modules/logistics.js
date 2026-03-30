/**
 * Logistics module for CJ Dropshipping API
 * @module modules/logistics
 */

const { validateRequired } = require('../utils/helpers');

/**
 * @typedef {Object} FreightCalculateParams
 * @property {string} startCountryCode - Origin country code
 * @property {string} endCountryCode - Destination country code
 * @property {Array<FreightProduct>} products - Products to calculate freight for
 */

/**
 * @typedef {Object} FreightProduct
 * @property {number} quantity - Product quantity
 * @property {string} vid - Variant ID
 */

/**
 * Logistics and shipping management endpoints
 */
class LogisticsModule {
  /**
   * @param {import('../client')} client - CJ API client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Calculate shipping freight
   * @param {FreightCalculateParams} params - Freight calculation parameters
   * @returns {Promise<Object>} Freight options and costs
   * @example
   * const freight = await cj.logistics.calculateFreight({
   *   startCountryCode: 'CN',
   *   endCountryCode: 'US',
   *   products: [
   *     { vid: 'VARIANT_ID', quantity: 2 }
   *   ]
   * });
   */
  async calculateFreight(params) {
    validateRequired(params, ['startCountryCode', 'endCountryCode', 'products']);

    if (!Array.isArray(params.products) || params.products.length === 0) {
      throw new Error('products must be a non-empty array');
    }

    return this.client.post('/logistic/freightCalculate', params);
  }

  /**
   * Calculate partner freight
   * @param {Object} params - Partner freight parameters
   * @returns {Promise<Object>} Partner freight options
   * @example
   * const freight = await cj.logistics.calculatePartnerFreight({
   *   startCountryCode: 'CN',
   *   endCountryCode: 'US',
   *   products: [{ vid: 'VARIANT_ID', quantity: 1 }]
   * });
   */
  async calculatePartnerFreight(params) {
    validateRequired(params, ['startCountryCode', 'endCountryCode', 'products']);
    return this.client.post('/logistic/partnerFreightCalculate', params);
  }

  /**
   * Get tracking information for a shipment
   * @param {string} trackNumber - Tracking number
   * @returns {Promise<Object>} Tracking details and history
   * @example
   * const tracking = await cj.logistics.getTrackingInfo('TRACK123456');
   * console.log(tracking.data.trackInfo);
   */
  async getTrackingInfo(trackNumber) {
    validateRequired({ trackNumber }, ['trackNumber']);
    return this.client.get('/logistic/trackInfo', { trackNumber });
  }

  /**
   * Get supplier logistics templates
   * @param {string[]} skuList - Array of product SKUs
   * @returns {Promise<Object>} Available logistics options
   * @example
   * const logistics = await cj.logistics.getSupplierLogistics(['SKU1', 'SKU2']);
   */
  async getSupplierLogistics(skuList) {
    if (!Array.isArray(skuList) || skuList.length === 0) {
      throw new Error('skuList must be a non-empty array');
    }
    return this.client.post('/logistic/getSupplierLogisticsTemplate', { skuList });
  }
}

module.exports = LogisticsModule;
