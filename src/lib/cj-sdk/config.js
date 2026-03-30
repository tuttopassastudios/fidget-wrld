/**
 * Configuration management for CJ Dropshipping SDK
 * @module config
 */

import 'dotenv/config';

/**
 * @typedef {Object} CJConfig
 * @property {string} apiKey - CJ Dropshipping API key
 * @property {string} baseUrl - API base URL
 * @property {number} timeout - Request timeout in milliseconds
 * @property {number} maxRetries - Maximum retry attempts for failed requests
 * @property {number} tokenRefreshBuffer - Seconds before expiry to refresh token
 */

export const DEFAULT_BASE_URL = 'https://developers.cjdropshipping.com/api2.0/v1';
export const DEFAULT_TIMEOUT = 30000;
export const DEFAULT_MAX_RETRIES = 3;
export const DEFAULT_TOKEN_REFRESH_BUFFER = 3600; // 1 hour before expiry

/**
 * Creates and validates configuration
 * @param {Partial<CJConfig>} options - Configuration options
 * @returns {CJConfig} Validated configuration
 * @throws {Error} If required configuration is missing
 */
export function createConfig(options = {}) {
  const config = {
    apiKey: options.apiKey || process.env.CJ_API_KEY,
    baseUrl: options.baseUrl || process.env.CJ_BASE_URL || DEFAULT_BASE_URL,
    timeout: options.timeout || DEFAULT_TIMEOUT,
    maxRetries: options.maxRetries ?? DEFAULT_MAX_RETRIES,
    tokenRefreshBuffer: options.tokenRefreshBuffer || DEFAULT_TOKEN_REFRESH_BUFFER,
  };

  // Validate required fields
  if (!config.apiKey) {
    throw new Error(
      'CJ API key is required. Provide it via options.apiKey or CJ_API_KEY environment variable.'
    );
  }

  // Ensure baseUrl doesn't have trailing slash
  config.baseUrl = config.baseUrl.replace(/\/+$/, '');

  return config;
}
