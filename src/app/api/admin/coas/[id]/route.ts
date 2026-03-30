import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { deleteCOA } from '@/lib/coas-db';
import { getAdminClient } from '@/lib/supabase/admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { checkOrigin } from '@/lib/origin-check';
import { audit } from '@/lib/audit-log';

/**
 * DELETE: Remove a COA record and its PDF from Storage (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(ip, { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const originErr = checkOrigin(request.headers);
  if (originErr) return originErr;

  const caller = await verifyAdminRequest(request.headers.get('authorization'), 'admin');
  if (!caller) {
    audit({ action: 'auth.failed', detail: 'coas DELETE', ip });
    return NextResponse.json({ error: 'Unauthorized — admin role required' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const record = await deleteCOA(id);

    // Delete the file from Supabase Storage
    try {
      const supabase = getAdminClient();
      await supabase.storage.from('coas').remove([record.storagePath]);
    } catch (storageErr) {
      console.warn('[Admin COAs DELETE] Storage file deletion failed:', storageErr);
      // Continue — the database record is already deleted
    }

    audit({ action: 'coa.delete', actorUid: caller.uid, actorEmail: caller.email, targetId: id, ip });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin COAs DELETE]', error);
    const isNotFound = error instanceof Error && error.message.includes('not found');
    return NextResponse.json(
      { error: isNotFound ? 'COA not found' : 'Failed to delete COA' },
      { status: isNotFound ? 404 : 500 }
    );
  }
}
