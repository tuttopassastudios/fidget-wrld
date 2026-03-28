/**
 * Central input sanitization module.
 *
 * All functions CLEAN input silently (never throw).
 * Validation (deciding if cleaned input is acceptable) is separate.
 */

// Control chars (U+0000–U+001F) except tab (0x09) and newline (0x0A)
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

// Zero-width & invisible formatting characters + RTL/LTR overrides
const INVISIBLE_CHARS =
  /[\u200B\u200C\u200D\u200E\u200F\u2028\u2029\u202A-\u202E\u2060\u2061\u2062\u2063\u2064\uFEFF\uFFF9-\uFFFB]/g;

// Collapse runs of whitespace (spaces/tabs) into a single space
const EXCESS_WHITESPACE = /[^\S\n]{2,}/g;

// Collapse 3+ consecutive newlines into 2
const EXCESS_NEWLINES = /\n{3,}/g;

/**
 * Sanitize a single-line text field (names, addresses, subjects, etc.).
 * Strips control chars, invisible Unicode, collapses whitespace, enforces maxLength.
 */
export function sanitizeText(input: string, maxLength = 500): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(CONTROL_CHARS, '')
    .replace(INVISIBLE_CHARS, '')
    .replace(/\n/g, ' ')          // flatten newlines for single-line fields
    .replace(EXCESS_WHITESPACE, ' ')
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitize a multiline text field (messages, descriptions).
 * Same as sanitizeText but preserves newlines.
 */
export function sanitizeMultiline(input: string, maxLength = 5000): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(CONTROL_CHARS, '')
    .replace(INVISIBLE_CHARS, '')
    .replace(EXCESS_WHITESPACE, ' ')
    .replace(EXCESS_NEWLINES, '\n\n')
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitize an email address. Trims, lowercases, basic format check.
 * Returns empty string if the format is clearly invalid.
 */
export function sanitizeEmail(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const cleaned = input
    .replace(CONTROL_CHARS, '')
    .replace(INVISIBLE_CHARS, '')
    .trim()
    .toLowerCase()
    .slice(0, 254);
  // Basic structural check — not a full RFC 5322 validator
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) return '';
  return cleaned;
}

/**
 * Sanitize a phone number. Only allows digits, +, -, (, ), and spaces.
 */
export function sanitizePhone(input: string, maxLength = 20): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/[^\d+\-() ]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitize to alphanumeric + hyphens + underscores only.
 * For promo codes, SKUs, order IDs, Firebase UIDs, tracking numbers.
 */
export function sanitizeAlphanumeric(input: string, maxLength = 128): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/[^a-zA-Z0-9\-_]/g, '')
    .slice(0, maxLength);
}

/**
 * Sanitize a URL slug. Lowercase, only a-z, 0-9, hyphens.
 */
export function sanitizeSlug(input: string, maxLength = 100): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')       // collapse double hyphens
    .replace(/^-|-$/g, '')        // strip leading/trailing hyphens
    .slice(0, maxLength);
}

/**
 * Recursively strip prototype-pollution keys from a plain object.
 * Removes __proto__, constructor, prototype at any depth.
 */
export function stripProtoPollution<T extends Record<string, unknown>>(obj: T): T {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return obj;

  const BANNED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
  const cleaned = {} as Record<string, unknown>;

  for (const [key, value] of Object.entries(obj)) {
    if (BANNED_KEYS.has(key)) continue;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      cleaned[key] = stripProtoPollution(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      cleaned[key] = value.map(item =>
        item !== null && typeof item === 'object' && !Array.isArray(item)
          ? stripProtoPollution(item as Record<string, unknown>)
          : item
      );
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned as T;
}
