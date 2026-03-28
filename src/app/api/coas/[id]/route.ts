import { NextRequest, NextResponse } from 'next/server';
import { getCOAById } from '@/lib/coas-db';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * GET: Public endpoint to fetch a single COA by ID.
 * Used by the public COA viewer page (QR code target).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = rateLimit(getClientIp(request.headers), { limit: 120, windowMs: 60_000 });
  if (limited) return limited;

  const { id } = await params;

  try {
    const coa = await getCOAById(id);
    if (!coa) {
      return NextResponse.json({ error: 'COA not found' }, { status: 404 });
    }

    // Return only public-safe fields
    return NextResponse.json({
      coa: {
        id: coa.id,
        productSlug: coa.productSlug,
        productName: coa.productName,
        batchLot: coa.batchLot,
        testDate: coa.testDate,
        expirationDate: coa.expirationDate,
        fileName: coa.fileName,
        downloadURL: coa.downloadURL,
        fileSize: coa.fileSize,
      },
    });
  } catch (error) {
    console.error('[Public COA GET]', error);
    return NextResponse.json({ error: 'Failed to fetch COA' }, { status: 500 });
  }
}
