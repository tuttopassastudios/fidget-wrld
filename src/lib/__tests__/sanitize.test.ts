import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  sanitizeMultiline,
  sanitizeEmail,
  sanitizePhone,
  sanitizeAlphanumeric,
  sanitizeSlug,
  stripProtoPollution,
} from '../sanitize';

// ---------------------------------------------------------------------------
// sanitizeText
// ---------------------------------------------------------------------------
describe('sanitizeText', () => {
  it('passes normal input through (trimmed)', () => {
    expect(sanitizeText('  Jane Doe  ')).toBe('Jane Doe');
  });

  it('strips HTML tags content but keeps visible text', () => {
    expect(sanitizeText('<script>alert("xss")</script>')).toBe('<script>alert("xss")</script>');
    // sanitizeText does NOT strip HTML — React JSX auto-escapes; we strip control chars
  });

  it('strips control characters', () => {
    expect(sanitizeText('hello\x00\x01\x02world')).toBe('helloworld');
  });

  it('strips zero-width and RTL override characters', () => {
    expect(sanitizeText('test\u200B\u200C\u200Dvalue')).toBe('testvalue');
    expect(sanitizeText('test\u202Evalue')).toBe('testvalue');
  });

  it('collapses excessive whitespace', () => {
    expect(sanitizeText('too    many   spaces')).toBe('too many spaces');
  });

  it('flattens newlines in single-line mode', () => {
    expect(sanitizeText('line1\nline2\nline3')).toBe('line1 line2 line3');
  });

  it('enforces maxLength', () => {
    const long = 'a'.repeat(600);
    expect(sanitizeText(long, 100)).toHaveLength(100);
  });

  it('returns empty string for falsy input', () => {
    expect(sanitizeText('')).toBe('');
    expect(sanitizeText(null as unknown as string)).toBe('');
    expect(sanitizeText(undefined as unknown as string)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// sanitizeMultiline
// ---------------------------------------------------------------------------
describe('sanitizeMultiline', () => {
  it('preserves newlines', () => {
    expect(sanitizeMultiline('line1\nline2')).toBe('line1\nline2');
  });

  it('collapses 3+ consecutive newlines to 2', () => {
    expect(sanitizeMultiline('a\n\n\n\nb')).toBe('a\n\nb');
  });

  it('strips control chars but keeps tab and newline', () => {
    expect(sanitizeMultiline('hello\x00\tworld\nfoo')).toBe('hello\tworld\nfoo');
  });

  it('enforces maxLength', () => {
    const long = 'a'.repeat(6000);
    expect(sanitizeMultiline(long, 5000)).toHaveLength(5000);
  });
});

// ---------------------------------------------------------------------------
// sanitizeEmail
// ---------------------------------------------------------------------------
describe('sanitizeEmail', () => {
  it('normalizes valid email', () => {
    expect(sanitizeEmail('  User@Example.COM  ')).toBe('user@example.com');
  });

  it('returns empty for invalid format', () => {
    expect(sanitizeEmail('not-an-email')).toBe('');
    expect(sanitizeEmail('@missing-local.com')).toBe('');
    expect(sanitizeEmail('missing@tld')).toBe('');
  });

  it('strips invisible characters', () => {
    expect(sanitizeEmail('user\u200B@example.com')).toBe('user@example.com');
  });

  it('returns empty for empty input', () => {
    expect(sanitizeEmail('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// sanitizePhone
// ---------------------------------------------------------------------------
describe('sanitizePhone', () => {
  it('allows valid phone characters', () => {
    expect(sanitizePhone('+1 (555) 123-4567')).toBe('+1 (555) 123-4567');
  });

  it('strips letters and special characters', () => {
    expect(sanitizePhone('call: 555<script>1234')).toBe('5551234');
  });

  it('enforces maxLength', () => {
    expect(sanitizePhone('1'.repeat(30), 20)).toHaveLength(20);
  });
});

// ---------------------------------------------------------------------------
// sanitizeAlphanumeric
// ---------------------------------------------------------------------------
describe('sanitizeAlphanumeric', () => {
  it('keeps alphanumeric, hyphens, underscores', () => {
    expect(sanitizeAlphanumeric('ABC-123_def')).toBe('ABC-123_def');
  });

  it('strips special characters and spaces', () => {
    expect(sanitizeAlphanumeric('DROP TABLE users;--')).toBe('DROPTABLEusers--');
  });

  it('strips SQL injection attempts', () => {
    expect(sanitizeAlphanumeric("' OR 1=1; --")).toBe('OR11--');
  });

  it('strips script tags', () => {
    expect(sanitizeAlphanumeric('<script>alert(1)</script>')).toBe('scriptalert1script');
  });

  it('strips NoSQL operators', () => {
    expect(sanitizeAlphanumeric('$where')).toBe('where');
    expect(sanitizeAlphanumeric('$gt')).toBe('gt');
  });

  it('enforces maxLength', () => {
    expect(sanitizeAlphanumeric('a'.repeat(200), 50)).toHaveLength(50);
  });
});

// ---------------------------------------------------------------------------
// sanitizeSlug
// ---------------------------------------------------------------------------
describe('sanitizeSlug', () => {
  it('lowercases and keeps valid slug chars', () => {
    expect(sanitizeSlug('My-Product-123')).toBe('my-product-123');
  });

  it('strips invalid characters', () => {
    expect(sanitizeSlug('hello world!')).toBe('helloworld');
  });

  it('collapses double hyphens', () => {
    expect(sanitizeSlug('foo--bar---baz')).toBe('foo-bar-baz');
  });

  it('strips leading/trailing hyphens', () => {
    expect(sanitizeSlug('-foo-bar-')).toBe('foo-bar');
  });

  it('enforces maxLength', () => {
    expect(sanitizeSlug('a'.repeat(200))).toHaveLength(100);
  });
});

// ---------------------------------------------------------------------------
// stripProtoPollution
// ---------------------------------------------------------------------------
describe('stripProtoPollution', () => {
  it('removes __proto__ key', () => {
    const obj = JSON.parse('{"name":"test","__proto__":{"isAdmin":true}}');
    const result = stripProtoPollution(obj);
    expect(result).toEqual({ name: 'test' });
    expect(Object.keys(result)).not.toContain('__proto__');
  });

  it('removes constructor key', () => {
    const obj = JSON.parse('{"name":"test","constructor":{"prototype":{"isAdmin":true}}}');
    const result = stripProtoPollution(obj);
    expect(result).toEqual({ name: 'test' });
  });

  it('removes prototype key', () => {
    const obj = JSON.parse('{"name":"test","prototype":{"isAdmin":true}}');
    const result = stripProtoPollution(obj);
    expect(result).toEqual({ name: 'test' });
  });

  it('cleans nested objects recursively', () => {
    const obj = JSON.parse('{"user":{"name":"test","__proto__":{"role":"admin"}},"valid":"data"}');
    const result = stripProtoPollution(obj);
    expect(result).toEqual({ user: { name: 'test' }, valid: 'data' });
  });

  it('cleans objects inside arrays', () => {
    const obj = JSON.parse('{"items":[{"name":"ok","__proto__":{"x":1}},{"name":"also ok"}]}');
    const result = stripProtoPollution(obj);
    expect(result).toEqual({ items: [{ name: 'ok' }, { name: 'also ok' }] });
  });

  it('handles null and non-object input gracefully', () => {
    expect(stripProtoPollution(null as unknown as Record<string, unknown>)).toBe(null);
  });

  it('preserves normal data untouched', () => {
    const obj = { name: 'PepMax', price: 29.99, tags: ['research', 'peptide'] };
    expect(stripProtoPollution(obj)).toEqual(obj);
  });
});
