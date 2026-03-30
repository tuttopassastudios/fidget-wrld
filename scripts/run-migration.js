/**
 * Run Supabase migration script
 * Executes SQL migration using the Supabase REST API
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY');
  process.exit(1);
}

// Read the migration SQL
const migrationPath = path.join(__dirname, '../supabase/migrations/20260330_cj_fulfillment.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

// Split SQL into individual statements (remove comments and empty lines)
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--') && !s.startsWith('COMMENT'));

async function runMigration() {
  console.log('Running CJ fulfillment migration...\n');

  // Use the Supabase REST API to execute SQL via rpc
  // First, we need to create a function to execute raw SQL
  // But since we can't do that without access, let's use the postgres direct endpoint

  const baseUrl = SUPABASE_URL.replace('.supabase.co', '.supabase.co');

  for (const statement of statements) {
    if (!statement.trim()) continue;

    console.log(`Executing: ${statement.substring(0, 60)}...`);

    try {
      // Use the Supabase SQL endpoint (requires service role key)
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: statement }),
      });

      if (!response.ok) {
        const error = await response.text();
        // If exec_sql doesn't exist, we need a different approach
        if (error.includes('exec_sql') || error.includes('function')) {
          throw new Error('exec_sql function not found - need to run SQL manually');
        }
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      console.log('  ✓ Success\n');
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}\n`);
      throw error;
    }
  }

  console.log('Migration completed successfully!');
}

// Alternative: Print SQL for manual execution
function printManualInstructions() {
  console.log('='.repeat(60));
  console.log('MANUAL MIGRATION INSTRUCTIONS');
  console.log('='.repeat(60));
  console.log('\nGo to: https://supabase.com/dashboard/project/jzfesgxooirrjsnluphz/sql/new');
  console.log('\nPaste and run the following SQL:\n');
  console.log('-'.repeat(60));
  console.log(sql);
  console.log('-'.repeat(60));
}

runMigration().catch(() => {
  console.log('\nFalling back to manual instructions...\n');
  printManualInstructions();
});
