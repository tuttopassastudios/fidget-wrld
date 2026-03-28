import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

/**
 * POST /api/revalidate/products
 * Revalidates the products cache. Requires a secret token.
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // Simple token check - use the AGE_GATE_SECRET as a shared secret
  // Handle potential trailing \n from Vercel env format
  const expectedToken = (process.env.AGE_GATE_SECRET || '').replace(/\\n$/, '').trim();
  if (!token || token !== expectedToken) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    revalidateTag('products', 'max');
    return NextResponse.json({ revalidated: true, timestamp: Date.now() });
  } catch (error) {
    console.error('[Revalidate Products]', error);
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}
