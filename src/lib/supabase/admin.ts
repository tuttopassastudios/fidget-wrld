/**
 * Supabase Admin Client
 * For use in API routes that need elevated permissions
 * Uses the service role key - bypasses RLS
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Singleton admin client
let adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function getAdminClient() {
  if (adminClient) return adminClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}
