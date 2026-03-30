import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { getAllProducts, createProduct } from '@/lib/products-db';
import type { ProductPage } from '@/types';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { checkOrigin } from '@/lib/origin-check';
import { audit } from '@/lib/audit-log';
import { sanitizeText, sanitizeMultiline, sanitizeSlug, sanitizeAlphanumeric, stripProtoPollution } from '@/lib/sanitize';

/**
 * GET: List all products from Firestore (admin/team)
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(getClientIp(request.headers), { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const caller = await verifyAdminRequest(request.headers.get('authorization'));
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const products = await getAllProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('[Admin Products GET]', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

/**
 * POST: Create a new product (admin only)
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(ip, { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const originErr = checkOrigin(request.headers);
  if (originErr) return originErr;

  const caller = await verifyAdminRequest(request.headers.get('authorization'), 'admin');
  if (!caller) {
    audit({ action: 'auth.failed', detail: 'products POST', ip });
    return NextResponse.json({ error: 'Unauthorized — admin role required' }, { status: 403 });
  }

  const rawBody = await request.json().catch(() => null);
  if (!rawBody) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const body = sanitizeProductBody(stripProtoPollution(rawBody));

  const validation = validateProduct(body);
  if (validation) {
    return NextResponse.json({ error: validation }, { status: 400 });
  }

  try {
    await createProduct(body as unknown as ProductPage);
    audit({ action: 'product.create', actorUid: caller.uid, actorEmail: caller.email, targetId: body.slug as string, ip });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('[Admin Products POST]', error);
    const isConflict = error instanceof Error && error.message.includes('already exists');
    return NextResponse.json(
      { error: isConflict ? 'Product already exists' : 'Failed to create product' },
      { status: isConflict ? 409 : 500 }
    );
  }
}

function sanitizeProductBody(data: Record<string, unknown>): Record<string, unknown> {
  const out = { ...data };
  if (typeof out.slug === 'string') out.slug = sanitizeSlug(out.slug);
  if (typeof out.name === 'string') out.name = sanitizeText(out.name, 200);
  if (typeof out.category === 'string') out.category = sanitizeText(out.category, 100);
  if (typeof out.metaTitle === 'string') out.metaTitle = sanitizeText(out.metaTitle, 200);
  if (typeof out.metaDescription === 'string') out.metaDescription = sanitizeText(out.metaDescription, 500);
  if (typeof out.description === 'string') out.description = sanitizeMultiline(out.description, 10000);
  if (typeof out.coaInfo === 'string') out.coaInfo = sanitizeMultiline(out.coaInfo, 5000);
  if (typeof out.storage === 'string') out.storage = sanitizeMultiline(out.storage, 2000);
  if (Array.isArray(out.variants)) {
    out.variants = out.variants.map((v: Record<string, unknown>) => ({
      ...v,
      ...(typeof v.sku === 'string' ? { sku: sanitizeAlphanumeric(v.sku, 50) } : {}),
      ...(typeof v.name === 'string' ? { name: sanitizeText(v.name, 200) } : {}),
      ...(typeof v.variant === 'string' ? { variant: sanitizeText(v.variant, 200) } : {}),
    }));
  }
  return out;
}

function validateProduct(data: Record<string, unknown>): string | null {
  if (!data.slug || typeof data.slug !== 'string') return 'slug is required';
  if (!data.name || typeof data.name !== 'string') return 'name is required';
  if (!data.category || typeof data.category !== 'string') return 'category is required';
  if (!Array.isArray(data.variants) || data.variants.length === 0) {
    return 'At least one variant is required';
  }
  for (const v of data.variants) {
    if (!v.sku || typeof v.sku !== 'string') return 'Each variant needs a sku';
    if (!v.name || typeof v.name !== 'string') return 'Each variant needs a name';
    if (typeof v.price !== 'number' || v.price < 0) return 'Each variant needs a valid price';
  }
  return null;
}
