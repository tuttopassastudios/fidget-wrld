import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/firebase-admin';
import { getAllCOAs, getCOAsByProduct, createCOA } from '@/lib/coas-db';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { checkOrigin } from '@/lib/origin-check';
import { audit } from '@/lib/audit-log';

/**
 * GET: List COAs — optionally filter by ?product=slug
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(getClientIp(request.headers), { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const caller = await verifyAdminRequest(request.headers.get('authorization'));
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const productSlug = request.nextUrl.searchParams.get('product');
    const coas = productSlug ? await getCOAsByProduct(productSlug) : await getAllCOAs();
    return NextResponse.json({ coas });
  } catch (error) {
    console.error('[Admin COAs GET]', error);
    return NextResponse.json({ error: 'Failed to fetch COAs' }, { status: 500 });
  }
}

/**
 * POST: Create a new COA record (admin only).
 * The PDF should already be uploaded to Firebase Storage by the client.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(ip, { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const originErr = checkOrigin(request.headers);
  if (originErr) return originErr;

  const caller = await verifyAdminRequest(request.headers.get('authorization'), 'admin');
  if (!caller) {
    audit({ action: 'auth.failed', detail: 'coas POST', ip });
    return NextResponse.json({ error: 'Unauthorized — admin role required' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = validateCOA(body);
  if (validation) {
    return NextResponse.json({ error: validation }, { status: 400 });
  }

  try {
    const id = await createCOA({
      productSlug: body.productSlug,
      productName: body.productName,
      batchLot: body.batchLot,
      testDate: body.testDate,
      expirationDate: body.expirationDate,
      uploadedAt: new Date().toISOString(),
      uploadedBy: caller.uid,
      fileName: body.fileName,
      storagePath: body.storagePath,
      downloadURL: body.downloadURL,
      fileSize: body.fileSize,
    });

    audit({ action: 'coa.create', actorUid: caller.uid, actorEmail: caller.email, targetId: id, ip });
    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error('[Admin COAs POST]', error);
    return NextResponse.json({ error: 'Failed to create COA' }, { status: 500 });
  }
}

function validateCOA(data: Record<string, unknown>): string | null {
  if (!data.productSlug || typeof data.productSlug !== 'string') return 'productSlug is required';
  if (!data.productName || typeof data.productName !== 'string') return 'productName is required';
  if (!data.batchLot || typeof data.batchLot !== 'string') return 'batchLot is required';
  if (!data.testDate || typeof data.testDate !== 'string') return 'testDate is required';
  if (!data.expirationDate || typeof data.expirationDate !== 'string') return 'expirationDate is required';
  if (!data.fileName || typeof data.fileName !== 'string') return 'fileName is required';
  if (!data.storagePath || typeof data.storagePath !== 'string') return 'storagePath is required';
  if (!data.downloadURL || typeof data.downloadURL !== 'string') return 'downloadURL is required';
  if (typeof data.fileSize !== 'number' || data.fileSize <= 0) return 'fileSize must be a positive number';
  return null;
}
