#!/usr/bin/env node
/**
 * Run the newsletter_subscribers migration on Supabase
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runMigration() {
  console.log('Running newsletter_subscribers migration...');

  const sql = `
    -- Create newsletter_subscribers table
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT UNIQUE NOT NULL,
      subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      source TEXT DEFAULT 'homepage',
      status TEXT DEFAULT 'active',
      ip TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Create index for email lookup
    CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
    CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);
  `;

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    // Try alternative: use the REST API directly
    console.log('RPC method not available, trying direct query...');

    // Create the table
    const { error: tableError } = await supabase.from('newsletter_subscribers').select('id').limit(1);

    if (tableError && tableError.code === '42P01') {
      // Table doesn't exist - we need to create it via SQL Editor in Supabase Dashboard
      console.log('\n⚠️  Table does not exist.');
      console.log('Please run the following SQL in the Supabase Dashboard SQL Editor:');
      console.log('https://supabase.com/dashboard/project/jzfesgxooirrjsnluphz/sql/new\n');
      console.log(sql);
      process.exit(1);
    } else if (tableError) {
      console.error('Error:', tableError.message);
      process.exit(1);
    } else {
      console.log('✓ Table newsletter_subscribers already exists');
    }
  } else {
    console.log('✓ Migration completed successfully');
  }
}

runMigration().catch(console.error);
