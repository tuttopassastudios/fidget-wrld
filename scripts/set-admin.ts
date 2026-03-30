/**
 * One-time script to set a user's role to admin via Supabase.
 *
 * Usage:
 *   npx tsx scripts/set-admin.ts [email] [role]
 *
 * Defaults: email = tuttopassamusic@gmail.com, role = admin
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * in .env.local or the environment.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const email = process.argv[2] || 'tuttopassamusic@gmail.com';
const role = process.argv[3] || 'admin';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // Find user by email
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error('Failed to list users:', listErr.message);
    process.exit(1);
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    console.error(`User with email "${email}" not found in Supabase Auth.`);
    console.error('Make sure the user has signed up / logged in at least once.');
    process.exit(1);
  }

  console.log(`Found user: ${user.email} (${user.id})`);

  // Set role in app_metadata
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: { role },
  });

  if (error) {
    console.error('Failed to set role:', error.message);
    process.exit(1);
  }

  console.log(`✓ Set role "${role}" for ${email}`);
}

main();
