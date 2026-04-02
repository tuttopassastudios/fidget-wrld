import { NextRequest, NextResponse } from 'next/server';

/**
 * Generates a per-request nonce and sets a strict Content-Security-Policy.
 * Next.js automatically reads 'nonce-{value}' from the CSP header and applies
 * it to all framework scripts, bundles, and inline scripts it generates.
 *
 * The nonce is also forwarded via x-nonce so layout.tsx can attach it to any
 * dangerouslySetInnerHTML <script> tags (e.g. JSON-LD).
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';

  const csp = [
    "default-src 'self'",
    // 'strict-dynamic' lets nonce-trusted scripts load further scripts (Next.js chunks, etc.)
    // Domain allowlist is kept as fallback for browsers without strict-dynamic support.
    // sha256 hashes allow the static JSON-LD <script> tags in layout.tsx without needing a nonce.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ''} 'sha256-lO4GQukPg42KBBaAnD70/JRKOTARXfu/f1lSTVaqcyo=' 'sha256-GR8s0DkgZlcyMzejCnb2v+kOlHZh20EKoQmLcYIxXk4=' https://apis.google.com https://va.vercel-scripts.com`,
    // Styles: unsafe-inline is acceptable (styles cannot exfiltrate data like scripts can)
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co https://cf.cjdropshipping.com https://oss-cf.cjdropshipping.com https://cc-west-usa.oss-us-west-1.aliyuncs.com",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://accounts.google.com https://va.vercel-scripts.com",
    "frame-src https://accounts.google.com https://*.supabase.co",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: [
    // Run on all page routes; skip static assets, image optimizer, and prefetch requests
    {
      source: '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
