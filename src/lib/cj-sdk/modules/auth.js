/**
 * Authentication module for CJ Dropshipping API
 * @module modules/auth
 */

/**
 * Authentication endpoints
 */
class AuthModule {
  /**
   * @param {import('../client').default} client - CJ API client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Get access token using API key
   * @param {string} [apiKey] - API key (uses client's key if not provided)
   * @returns {Promise<Object>} Token data
   * @example
   * const tokenData = await cj.auth.getAccessToken();
   * // Returns: { accessToken, refreshToken, accessTokenExpiryDate, refreshTokenExpiryDate }
   */
  async getAccessToken(apiKey = null) {
    const key = apiKey || this.client.config.apiKey;

    const response = await this.client.axios.post('/authentication/getAccessToken', {
      apiKey: key,
    });

    if (response.data.code === 200 && response.data.result) {
      // Update client's token data
      this.client.tokenData = {
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
        accessTokenExpiryDate: response.data.data.accessTokenExpiryDate,
        refreshTokenExpiryDate: response.data.data.refreshTokenExpiryDate,
      };
    }

    return response.data;
  }

  /**
   * Refresh access token using refresh token
   * @param {string} [refreshToken] - Refresh token (uses cached if not provided)
   * @returns {Promise<Object>} New token data
   * @example
   * const newTokenData = await cj.auth.refreshAccessToken();
   */
  async refreshAccessToken(refreshToken = null) {
    const token = refreshToken || this.client.tokenData?.refreshToken;

    if (!token) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.axios.post('/authentication/refreshAccessToken', {
      refreshToken: token,
    });

    if (response.data.code === 200 && response.data.result) {
      // Update client's token data
      this.client.tokenData = {
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
        accessTokenExpiryDate: response.data.data.accessTokenExpiryDate,
        refreshTokenExpiryDate: response.data.data.refreshTokenExpiryDate,
      };
    }

    return response.data;
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
   * Get current token info
   * @returns {Object|null} Current token data or null
   */
  getTokenInfo() {
    if (!this.client.tokenData) return null;

    const accessExpiry = this._parseExpiry(this.client.tokenData.accessTokenExpiryDate);
    const refreshExpiry = this._parseExpiry(this.client.tokenData.refreshTokenExpiryDate);
    const now = Date.now();

    return {
      ...this.client.tokenData,
      isAccessTokenValid: now < accessExpiry,
      isRefreshTokenValid: now < refreshExpiry,
      accessTokenExpiresIn: Math.max(0, accessExpiry - now),
      refreshTokenExpiresIn: Math.max(0, refreshExpiry - now),
    };
  }
}

export default AuthModule;
