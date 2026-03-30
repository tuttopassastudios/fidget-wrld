/**
 * Custom error classes for CJ Dropshipping SDK
 * @module utils/errors
 */

/**
 * Base error class for CJ API errors
 */
class CJApiError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} [code] - CJ API error code
   * @param {Object} [response] - Raw API response
   */
  constructor(message, code = null, response = null) {
    super(message);
    this.name = 'CJApiError';
    this.code = code;
    this.response = response;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Authentication-specific errors
 */
class AuthenticationError extends CJApiError {
  /**
   * @param {string} message - Error message
   * @param {number} [code] - CJ API error code
   * @param {Object} [response] - Raw API response
   */
  constructor(message, code = null, response = null) {
    super(message, code, response);
    this.name = 'AuthenticationError';
  }
}

/**
 * Rate limit exceeded errors
 */
class RateLimitError extends CJApiError {
  /**
   * @param {string} message - Error message
   * @param {number} [retryAfter] - Seconds to wait before retry
   * @param {Object} [response] - Raw API response
   */
  constructor(message, retryAfter = null, response = null) {
    super(message, 429, response);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Validation errors for request parameters
 */
class ValidationError extends CJApiError {
  /**
   * @param {string} message - Error message
   * @param {string[]} [fields] - Fields that failed validation
   */
  constructor(message, fields = []) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

/**
 * Network or connection errors
 */
class NetworkError extends CJApiError {
  /**
   * @param {string} message - Error message
   * @param {Error} [originalError] - Original axios error
   */
  constructor(message, originalError = null) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

/**
 * Common CJ API error codes and their meanings
 */
const ERROR_CODES = {
  1600100: 'Invalid or expired access token',
  1600101: 'API key not found',
  1600102: 'API key disabled',
  1600200: 'Rate limit exceeded',
  1600300: 'Invalid request parameters',
  1600400: 'Resource not found',
  1600500: 'Internal server error',
};

/**
 * Parse CJ API error response and throw appropriate error
 * @param {Object} response - API response
 * @throws {CJApiError} Appropriate error based on response
 */
function parseApiError(response) {
  const { code, message, result } = response.data || {};

  // Check for authentication errors
  if (code === 1600100 || code === 1600101 || code === 1600102) {
    throw new AuthenticationError(
      message || ERROR_CODES[code] || 'Authentication failed',
      code,
      response.data
    );
  }

  // Check for rate limiting
  if (code === 1600200 || response.status === 429) {
    const retryAfter = response.headers?.['retry-after'];
    throw new RateLimitError(
      message || 'Rate limit exceeded',
      retryAfter ? parseInt(retryAfter, 10) : null,
      response.data
    );
  }

  // Generic API error
  throw new CJApiError(
    message || ERROR_CODES[code] || 'API request failed',
    code,
    response.data
  );
}

module.exports = {
  CJApiError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NetworkError,
  ERROR_CODES,
  parseApiError,
};
