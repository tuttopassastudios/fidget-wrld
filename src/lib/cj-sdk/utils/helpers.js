/**
 * Utility functions for CJ Dropshipping SDK
 * @module utils/helpers
 */

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 * @param {number} attempt - Current attempt number (0-indexed)
 * @param {number} [baseDelay=1000] - Base delay in milliseconds
 * @param {number} [maxDelay=30000] - Maximum delay in milliseconds
 * @returns {number} Delay in milliseconds
 */
export function calculateBackoff(attempt, baseDelay = 1000, maxDelay = 30000) {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  // Add jitter (±25%)
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);
  return Math.floor(delay + jitter);
}

/**
 * Build query string from object
 * @param {Object} params - Query parameters
 * @returns {string} Encoded query string
 */
export function buildQueryString(params) {
  if (!params || typeof params !== 'object') return '';

  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }
  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

/**
 * Validate required parameters
 * @param {Object} params - Parameters to validate
 * @param {string[]} required - Required parameter names
 * @throws {Error} If required parameter is missing
 */
export function validateRequired(params, required) {
  const missing = [];
  for (const field of required) {
    if (params[field] === undefined || params[field] === null) {
      missing.push(field);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing required parameters: ${missing.join(', ')}`);
  }
}

/**
 * Check if value is a plain object
 * @param {*} item - Value to check
 * @returns {boolean}
 */
export function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge objects
 * @param {Object} target - Target object
 * @param {...Object} sources - Source objects
 * @returns {Object} Merged object
 */
export function deepMerge(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * Format date to ISO string without milliseconds
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Parse CJ API timestamp to Date
 * @param {string|number} timestamp - CJ timestamp
 * @returns {Date}
 */
export function parseTimestamp(timestamp) {
  if (typeof timestamp === 'number') {
    // Assume milliseconds if large enough, otherwise seconds
    return new Date(timestamp > 9999999999 ? timestamp : timestamp * 1000);
  }
  return new Date(timestamp);
}
