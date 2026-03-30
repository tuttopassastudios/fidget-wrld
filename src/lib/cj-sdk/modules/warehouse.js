/**
 * Warehouse module for CJ Dropshipping API
 * @module modules/warehouse
 */

/**
 * Warehouse and storage management endpoints
 */
class WarehouseModule {
  /**
   * @param {import('../client')} client - CJ API client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Get list of all global warehouses
   * @returns {Promise<Object>} List of available warehouses
   * @example
   * const warehouses = await cj.warehouse.getWarehouses();
   * warehouses.data.forEach(wh => {
   *   console.log(`${wh.countryCode}: ${wh.warehouseName}`);
   * });
   */
  async getWarehouses() {
    return this.client.get('/product/globalWarehouseList');
  }

  /**
   * Get warehouse details
   * @returns {Promise<Object>} Warehouse details
   * @example
   * const details = await cj.warehouse.getWarehouseDetail();
   */
  async getWarehouseDetail() {
    return this.client.get('/warehouse/detail');
  }
}

module.exports = WarehouseModule;
