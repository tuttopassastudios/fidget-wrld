/**
 * Core HTTP client with authentication handling
 * @module client
 */

import axios from 'axios';
import { createConfig } from './config.js';
import {
  AuthenticationError,
  NetworkError,
  RateLimitError,
  parseApiError,
} from './utils/errors.js';
import { sleep, calculateBackoff } from './utils/helpers.js';

/**
 * @typedef {Object} TokenData
 * @property {string} accessToken - Access token
 * @property {string} refreshToken - Refresh token
 * @property {number} accessTokenExpiryDate - Expiry timestamp in milliseconds
 * @property {number} refreshTokenExpiryDate - Refresh token expiry timestamp
 */

/**
 * CJ Dropshipping HTTP Client
 */
class CJClient {
  /**
   * @param {Object} options - Client configuration options
   * @param {string} options.apiKey - CJ API key
   * @param {string} [options.baseUrl] - Base URL override
   * @param {number} [options.timeout] - Request timeout
   * @param {number} [options.maxRetries] - Max retry attempts
   */
  constructor(options = {}) {
    this.config = createConfig(options);

    /** @type {TokenData|null} */
    this.tokenData = null;

    /** @type {Promise<TokenData>|null} */
    this._tokenRefreshPromise = null;

    this.axios = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling
    this.axios.interceptors.response.use(
      response => response,
      error => this._handleError(error)
    );
  }

  /**
   * Get valid access token, refreshing if necessary
   * @returns {Promise<string>} Valid access token
   */
  async getAccessToken() {
    // If we have a valid token, return it
    if (this.tokenData && this._isTokenValid()) {
      return this.tokenData.accessToken;
    }

    // If refresh is already in progress, wait for it
    if (this._tokenRefreshPromise) {
      await this._tokenRefreshPromise;
      return this.tokenData.accessToken;
    }

    // Need to get/refresh token
    this._tokenRefreshPromise = this._refreshOrGetToken();

    try {
      await this._tokenRefreshPromise;
      return this.tokenData.accessToken;
    } finally {
      this._tokenRefreshPromise = null;
    }
  }

  /**
   * Parse expiry date from CJ API (handles string or timestamp)
   * @param {string|number} expiry - Expiry value from API
   * @returns {number} Timestamp in milliseconds
   * @private
   */
  _parseExpiry(expiry) {
    if (typeof expiry === 'number') {
      return expiry > 9999999999 ? expiry : expiry * 1000;
    }
    return new Date(expiry).getTime();
  }

  /**
   * Check if current token is still valid
   * @returns {boolean}
   * @private
   */
  _isTokenValid() {
    if (!this.tokenData?.accessToken) return false;

    const bufferMs = this.config.tokenRefreshBuffer * 1000;
    const expiryTime = this._parseExpiry(this.tokenData.accessTokenExpiryDate);

    return Date.now() < (expiryTime - bufferMs);
  }

  /**
   * Check if refresh token is still valid
   * @returns {boolean}
   * @private
   */
  _isRefreshTokenValid() {
    if (!this.tokenData?.refreshToken) return false;
    return Date.now() < this._parseExpiry(this.tokenData.refreshTokenExpiryDate);
  }

  /**
   * Refresh existing token or get new one
   * @returns {Promise<TokenData>}
   * @private
   */
  async _refreshOrGetToken() {
    // Try to refresh if we have a valid refresh token
    if (this.tokenData && this._isRefreshTokenValid()) {
      try {
        return await this._refreshToken();
      } catch (_error) {
        // Fall through to get new token
        console.warn('Token refresh failed, getting new token');
      }
    }

    // Get new token
    return await this._getNewToken();
  }

  /**
   * Get new access token using API key
   * @returns {Promise<TokenData>}
   * @private
   */
  async _getNewToken() {
    const response = await this.axios.post('/authentication/getAccessToken', {
      apiKey: this.config.apiKey,
    });

    if (!response.data.result || response.data.code !== 200) {
      throw new AuthenticationError(
        response.data.message || 'Failed to get access token',
        response.data.code,
        response.data
      );
    }

    this.tokenData = {
      accessToken: response.data.data.accessToken,
      refreshToken: response.data.data.refreshToken,
      accessTokenExpiryDate: response.data.data.accessTokenExpiryDate,
      refreshTokenExpiryDate: response.data.data.refreshTokenExpiryDate,
    };

    return this.tokenData;
  }

  /**
   * Refresh access token using refresh token
   * @returns {Promise<TokenData>}
   * @private
   */
  async _refreshToken() {
    const response = await this.axios.post('/authentication/refreshAccessToken', {
      refreshToken: this.tokenData.refreshToken,
    });

    if (!response.data.result || response.data.code !== 200) {
      throw new AuthenticationError(
        response.data.message || 'Failed to refresh access token',
        response.data.code,
        response.data
      );
    }

    this.tokenData = {
      accessToken: response.data.data.accessToken,
      refreshToken: response.data.data.refreshToken,
      accessTokenExpiryDate: response.data.data.accessTokenExpiryDate,
      refreshTokenExpiryDate: response.data.data.refreshTokenExpiryDate,
    };

    return this.tokenData;
  }

  /**
   * Handle axios errors
   * @param {Error} error - Axios error
   * @throws {CJApiError}
   * @private
   */
  _handleError(error) {
    if (error.response) {
      // Server responded with error
      parseApiError(error.response);
    } else if (error.request) {
      // Request made but no response
      throw new NetworkError(
        'No response received from CJ API',
        error
      );
    } else {
      // Request setup error
      throw new NetworkError(
        `Request failed: ${error.message}`,
        error
      );
    }
  }

  /**
   * Make authenticated request with retry logic
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} [data] - Request body
   * @param {Object} [params] - Query parameters
   * @returns {Promise<Object>} API response data
   */
  async request(method, endpoint, data = null, params = null) {
    let lastError;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const token = await this.getAccessToken();

        const response = await this.axios.request({
          method,
          url: endpoint,
          data,
          params,
          headers: {
            'CJ-Access-Token': token,
          },
        });

        // Check for API-level success
        if (response.data.code !== 200 || !response.data.result) {
          parseApiError(response);
        }

        return response.data;
      } catch (error) {
        lastError = error;

        // Don't retry authentication errors
        if (error instanceof AuthenticationError) {
          // Clear token and try once more with fresh token
          if (attempt === 0) {
            this.tokenData = null;
            continue;
          }
          throw error;
        }

        // Handle rate limiting
        if (error instanceof RateLimitError) {
          const delay = error.retryAfter
            ? error.retryAfter * 1000
            : calculateBackoff(attempt);

          if (attempt < this.config.maxRetries) {
            await sleep(delay);
            continue;
          }
        }

        // Retry network errors
        if (error instanceof NetworkError && attempt < this.config.maxRetries) {
          await sleep(calculateBackoff(attempt));
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} [params] - Query parameters
   * @returns {Promise<Object>}
   */
  async get(endpoint, params = null) {
    return this.request('GET', endpoint, null, params);
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} [data] - Request body
   * @returns {Promise<Object>}
   */
  async post(endpoint, data = null) {
    return this.request('POST', endpoint, data);
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} [data] - Request body
   * @returns {Promise<Object>}
   */
  async patch(endpoint, data = null) {
    return this.request('PATCH', endpoint, data);
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} [params] - Query parameters
   * @returns {Promise<Object>}
   */
  async delete(endpoint, params = null) {
    return this.request('DELETE', endpoint, null, params);
  }

  /**
   * Clear cached token data
   */
  clearToken() {
    this.tokenData = null;
  }
}

export default CJClient;
