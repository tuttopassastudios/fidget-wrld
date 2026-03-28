import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/firebase-admin';
import {
  getProductBySlug,
  updateProduct,
  deleteProduct,
} from '@/lib/products-db';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { checkOrigin } from '@/lib/origin-check';
import { audit } from '@/lib/audit-log';
import { stripProtoPollution } from '@/lib/sanitize';

/**
 * GET: Fetch a single product by slug (admin/team)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const limited = rateLimit(getClientIp(request.headers), { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const caller = await verifyAdminRequest(request.headers.get('authorization'));
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { slug } = await params;

  try {
    const product = await getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    console.error('[Admin Products GET single]', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

/**
 * PUT: Update an existing product (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(ip, { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const originErr = checkOrigin(request.headers);
  if (originErr) return originErr;

  const caller = await verifyAdminRequest(request.headers.get('authorization'), 'admin');
  if (!caller) {
    audit({ action: 'auth.failed', detail: 'products PUT', ip });
    return NextResponse.json({ error: 'Unauthorized — admin role required' }, { status: 403 });
  }

  const { slug } = await params;
  const rawBody = await request.json().catch(() => null);
  if (!rawBody) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const body = stripProtoPollution(rawBody);

  try {
    await updateProduct(slug, body);
    audit({ action: 'product.update', actorUid: caller.uid, actorEmail: caller.email, targetId: slug, ip });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Products PUT]', error);
    const msg = error instanceof Error ? error.message : '';
    const status = msg.includes('not found') ? 404 : msg.includes('already exists') ? 409 : 500;
    return NextResponse.json(
      { error: status === 404 ? 'Product not found' : status === 409 ? 'Slug already exists' : 'Failed to update product' },
      { status }
    );
  }
}

/**
 * DELETE: Remove a product (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(ip, { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const originErr = checkOrigin(request.headers);
  if (originErr) return originErr;

  const caller = await verifyAdminRequest(request.headers.get('authorization'), 'admin');
  if (!caller) {
    audit({ action: 'auth.failed', detail: 'products DELETE', ip });
    return NextResponse.json({ error: 'Unauthorized — admin role required' }, { status: 403 });
  }

  const { slug } = await params;

  try {
    await deleteProduct(slug);
    audit({ action: 'product.delete', actorUid: caller.uid, actorEmail: caller.email, targetId: slug, ip });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Products DELETE]', error);
    const isNotFound = error instanceof Error && error.message.includes('not found');
    return NextResponse.json(
      { error: isNotFound ? 'Product not found' : 'Failed to delete product' },
      { status: isNotFound ? 404 : 500 }
    );
  }
}
