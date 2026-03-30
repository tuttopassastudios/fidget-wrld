/**
 * Setup Supabase Storage bucket and upload product images
 * Run with: npx tsx scripts/setup-storage.ts
 */
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const BUCKET_NAME = 'products';
const IMAGES_DIR = path.join(__dirname, '../public/images/products');

async function main() {
  console.log('Setting up Supabase Storage...\n');

  // 1. Create bucket if it doesn't exist
  console.log(`Creating bucket "${BUCKET_NAME}"...`);
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
    });
    if (error) {
      console.error('Error creating bucket:', error.message);
      process.exit(1);
    }
    console.log('Bucket created successfully!\n');
  } else {
    console.log('Bucket already exists.\n');
  }

  // 2. Remove backgrounds before uploading
  console.log('Removing backgrounds from product images...\n');
  const venvPython = path.join(__dirname, '../.venv/bin/python');
  const removeBgScript = path.join(__dirname, 'remove-bg.py');
  if (fs.existsSync(venvPython) && fs.existsSync(removeBgScript)) {
    const { execSync } = await import('child_process');
    try {
      execSync(`"${venvPython}" "${removeBgScript}"`, { stdio: 'inherit' });
      console.log('');
    } catch {
      console.warn('Warning: Background removal failed, uploading originals.\n');
    }
  } else {
    console.warn('Warning: .venv or remove-bg.py not found, skipping background removal.\n');
  }

  // 3. Upload images
  console.log('Uploading images...\n');
  const files = fs.readdirSync(IMAGES_DIR).filter(f =>
    f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp') || f.endsWith('.svg')
  );

  const uploadedUrls: Record<string, string> = {};

  for (const file of files) {
    const filePath = path.join(IMAGES_DIR, file);
    const fileBuffer = fs.readFileSync(filePath);
    const contentType = file.endsWith('.png') ? 'image/png'
      : file.endsWith('.webp') ? 'image/webp'
      : file.endsWith('.svg') ? 'image/svg+xml'
      : 'image/jpeg';

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(file, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`  ✗ ${file}: ${error.message}`);
    } else {
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${file}`;
      uploadedUrls[file] = publicUrl;
      console.log(`  ✓ ${file}`);
      console.log(`    ${publicUrl}`);
    }
  }

  console.log('\n--- Upload complete ---\n');
  console.log('Public URLs:');
  Object.entries(uploadedUrls).forEach(([file, url]) => {
    console.log(`  ${file}: ${url}`);
  });

  console.log('\nUpdate your products.ts image paths to use these URLs.');
}

main().catch(console.error);
