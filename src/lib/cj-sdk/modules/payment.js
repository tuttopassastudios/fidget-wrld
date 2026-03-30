/**
 * Payment module for CJ Dropshipping API
 * @module modules/payment
 */

const { validateRequired } = require('../utils/helpers');

/**
 * Payment and balance management endpoints
 */
class PaymentModule {
  /**
   * @param {import('../client')} client - CJ API client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Get account balance
   * @returns {Promise<Object>} Balance information
   * @example
   * const balance = await cj.payment.getBalance();
   * console.log(`Available: $${balance.data.amount}`);
   */
  async getBalance() {
    return this.client.get('/shopping/pay/getBalance');
  }

  /**
   * Pay for an order using account balance
   * @param {string} orderId - CJ order ID to pay
   * @returns {Promise<Object>} Payment result
   * @example
   * const result = await cj.payment.payOrder('CJ_ORDER_ID');
   */
  async payOrder(orderId) {
    validateRequired({ orderId }, ['orderId']);
    return this.client.post('/shopping/pay/payBalance', { orderId });
  }

  /**
   * Pay for a shipment order (v2 API)
   * @param {string} shipmentOrderId - Shipment order ID
   * @param {string} payId - Payment ID
   * @returns {Promise<Object>} Payment result
   * @example
   * const result = await cj.payment.payShipment('SHIPMENT_ID', 'PAY_ID');
   */
  async payShipment(shipmentOrderId, payId) {
    validateRequired({ shipmentOrderId, payId }, ['shipmentOrderId', 'payId']);
    return this.client.post('/shopping/pay/payBalanceV2', {
      shipmentOrderId,
      payId,
    });
  }
}

module.exports = PaymentModule;
