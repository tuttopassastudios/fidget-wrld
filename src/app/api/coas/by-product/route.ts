import { NextRequest, NextResponse } from 'next/server';
import { getCOAsByProduct } from '@/lib/coas-db';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * GET: Public endpoint to fetch COAs for a product.
 * Used by the storefront ProductTabs component.
 * Query: ?slug=bpc-157
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(getClientIp(request.headers), { limit: 120, windowMs: 60_000 });
  if (limited) return limited;

  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'slug query parameter is required' }, { status: 400 });
  }

  try {
    const allCoas = await getCOAsByProduct(slug);

    // Return only public-safe fields
    const coas = allCoas.map((coa) => ({
      id: coa.id,
      productSlug: coa.productSlug,
      productName: coa.productName,
      batchLot: coa.batchLot,
      testDate: coa.testDate,
      expirationDate: coa.expirationDate,
      fileName: coa.fileName,
      downloadURL: coa.downloadURL,
      fileSize: coa.fileSize,
    }));

    return NextResponse.json({ coas });
  } catch (error) {
    console.error('[Public COAs by-product]', error);
    return NextResponse.json({ error: 'Failed to fetch COAs' }, { status: 500 });
  }
}
