/**
 * Webhook module for CJ Dropshipping API
 * @module modules/webhook
 */

const { validateRequired } = require('../utils/helpers');

/**
 * Webhook types supported by CJ Dropshipping
 * @enum {string}
 */
const WebhookType = {
  /** Order status changes */
  ORDER_STATUS: 'ORDER_STATUS',
  /** Package tracking updates */
  TRACKING: 'TRACKING',
  /** Stock level changes */
  STOCK: 'STOCK',
};

/**
 * Webhook configuration endpoints
 */
class WebhookModule {
  /**
   * @param {import('../client')} client - CJ API client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Set webhook URL for notifications
   * @param {string} type - Webhook type (ORDER_STATUS, TRACKING, STOCK)
   * @param {string|string[]} urls - Webhook URL(s) to receive notifications
   * @returns {Promise<Object>} Configuration result
   * @example
   * // Set single webhook URL
   * await cj.webhook.setWebhook('ORDER_STATUS', 'https://mysite.com/webhook/orders');
   *
   * // Set multiple webhook URLs
   * await cj.webhook.setWebhook('TRACKING', [
   *   'https://mysite.com/webhook/tracking',
   *   'https://backup.com/webhook/tracking'
   * ]);
   */
  async setWebhook(type, urls) {
    validateRequired({ type, urls }, ['type', 'urls']);

    const urlList = Array.isArray(urls) ? urls : [urls];

    return this.client.post('/webhook/set', {
      type,
      urls: urlList,
    });
  }

  /**
   * Set webhook for order status changes
   * @param {string|string[]} urls - Webhook URL(s)
   * @returns {Promise<Object>} Configuration result
   */
  async setOrderStatusWebhook(urls) {
    return this.setWebhook(WebhookType.ORDER_STATUS, urls);
  }

  /**
   * Set webhook for tracking updates
   * @param {string|string[]} urls - Webhook URL(s)
   * @returns {Promise<Object>} Configuration result
   */
  async setTrackingWebhook(urls) {
    return this.setWebhook(WebhookType.TRACKING, urls);
  }

  /**
   * Set webhook for stock updates
   * @param {string|string[]} urls - Webhook URL(s)
   * @returns {Promise<Object>} Configuration result
   */
  async setStockWebhook(urls) {
    return this.setWebhook(WebhookType.STOCK, urls);
  }
}

module.exports = WebhookModule;
module.exports.WebhookType = WebhookType;
