#!/usr/bin/env node
/**
 * Bambu Studio G-code pre-processor
 *
 * Parses a Bambu Studio .gcode file into a compact toolpath JSON
 * (print moves only, no travel moves), writes it locally, and uploads
 * it to Supabase Storage products bucket at gcode/{slug}-toolpath.json.
 *
 * Usage:
 *   node scripts/process-gcode.js <path/to/file.gcode> <product-slug>
 *
 * Example:
 *   node scripts/process-gcode.js ~/Downloads/yafic.gcode yafic-v2
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ---------------------------------------------------------------------------
// Args & env
// ---------------------------------------------------------------------------

const [,, gcodeFile, slug] = process.argv;

if (!gcodeFile || !slug) {
  console.error('Usage: node scripts/process-gcode.js <path/to/file.gcode> <product-slug>');
  process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const resolvedGcode = path.resolve(gcodeFile);
if (!fs.existsSync(resolvedGcode)) {
  console.error(`File not found: ${resolvedGcode}`);
  process.exit(1);
}

const outputFile = `${slug}-toolpath.json`;
const outputPath = path.resolve(outputFile);

// ---------------------------------------------------------------------------
// G-code param parser helper
// Parses a line like "G1 X12.3 Y-4.5 E0.8 F3600"
// Returns an object with lowercase keys, e.g. { g: 1, x: 12.3, y: -4.5, e: 0.8, f: 3600 }
// ---------------------------------------------------------------------------

function parseGcodeLine(line) {
  const params = {};
  const tokens = line.split(' ');
  for (const token of tokens) {
    if (token.length < 2) continue;
    const key = token[0].toLowerCase();
    const val = parseFloat(token.slice(1));
    if (!isNaN(val)) {
      params[key] = val;
    }
  }
  return params;
}

// ---------------------------------------------------------------------------
// Main parse routine (streaming)
// ---------------------------------------------------------------------------

async function parseGcode(filePath) {
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  // Printer state
  let currentX = 0;
  let currentY = 0;
  let currentZ = 0;
  let currentE = 0;

  // Layer accumulation
  let currentLayerVerts = [];
  const layers = [];

  // Header value
  let headerLayerCount = null;

  // Track lines processed for progress
  let linesProcessed = 0;

  for await (const rawLine of rl) {
    linesProcessed++;
    if (linesProcessed % 100000 === 0) {
      process.stdout.write(`\r  Parsed ${(linesProcessed / 1000).toFixed(0)}k lines, ${layers.length} layers…`);
    }

    // Strip inline comments for parsing (preserve original for comment checks)
    const semicolonIdx = rawLine.indexOf(';');
    const commentPart = semicolonIdx !== -1 ? rawLine.slice(semicolonIdx) : '';
    const codePart = semicolonIdx !== -1 ? rawLine.slice(0, semicolonIdx).trim() : rawLine.trim();

    // ------------------------------------------------------------------
    // 1. Check for layer_count header
    // ------------------------------------------------------------------
    if (headerLayerCount === null) {
      const lcMatch = rawLine.match(/;\s*layer_count\s*=\s*(\d+)/);
      if (lcMatch) {
        headerLayerCount = parseInt(lcMatch[1], 10);
      }
    }

    // ------------------------------------------------------------------
    // 2. Layer change marker
    // ------------------------------------------------------------------
    if (commentPart.trim() === '; CHANGE_LAYER') {
      // Finalize current layer (even if empty — will be filtered later)
      layers.push({ z: currentZ, verts: currentLayerVerts });
      currentLayerVerts = [];
      continue;
    }

    // ------------------------------------------------------------------
    // 3. G0 / G1 move commands
    // ------------------------------------------------------------------
    if (!codePart) continue;

    const firstChar = codePart[0];
    if (firstChar !== 'G' && firstChar !== 'g') continue;

    // Quick prefix check before full parse
    const upper = codePart.toUpperCase();
    const isG0 = upper.startsWith('G0 ') || upper === 'G0';
    const isG1 = upper.startsWith('G1 ') || upper === 'G1';
    const isG2 = upper.startsWith('G2 ') || upper === 'G2';
    const isG3 = upper.startsWith('G3 ') || upper === 'G3';

    if (isG2 || isG3) continue; // Skip arc commands

    if (!isG0 && !isG1) continue;

    const params = parseGcodeLine(codePart);

    // Save previous position before updating state
    const prevX = currentX;
    const prevY = currentY;
    const prevZ = currentZ;

    // Update state for params present on this line
    let zChanged = false;
    if ('x' in params) currentX = params.x;
    if ('y' in params) currentY = params.y;
    if ('z' in params) {
      if (params.z > prevZ) {
        zChanged = true;
      }
      currentZ = params.z;
    }

    // Fallback layer detection: Z increase (only if no CHANGE_LAYER comment used it already)
    if (zChanged) {
      layers.push({ z: prevZ, verts: currentLayerVerts });
      currentLayerVerts = [];
    }

    // Determine if this is a print move
    if (isG1 && 'e' in params) {
      const newE = params.e;
      if (newE > currentE) {
        // Print move — record segment as flat [prevX, prevY, newX, newY]
        currentLayerVerts.push(prevX, prevY, currentX, currentY);
      }
      currentE = newE;
    }
  }

  // Finalize last layer
  if (currentLayerVerts.length > 0) {
    layers.push({ z: currentZ, verts: currentLayerVerts });
  }

  if (linesProcessed >= 100000) {
    process.stdout.write('\n');
  }

  // Filter out empty layers
  const nonEmptyLayers = layers.filter(l => l.verts.length > 0);

  const layerCount = headerLayerCount !== null ? headerLayerCount : nonEmptyLayers.length;

  return {
    layerCount,
    layers: nonEmptyLayers,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Processing: ${resolvedGcode}`);
  console.log(`Slug:       ${slug}`);
  console.log('');

  console.log('Parsing G-code…');
  const toolpath = await parseGcode(resolvedGcode);

  console.log(`Done. ${toolpath.layers.length} non-empty layers, layerCount=${toolpath.layerCount}`);

  // Write JSON locally
  const jsonStr = JSON.stringify(toolpath);
  fs.writeFileSync(outputPath, jsonStr);
  console.log(`Written locally: ${outputPath} (${(jsonStr.length / 1024).toFixed(1)} KB)`);

  // Upload to Supabase Storage
  console.log('Uploading to Supabase Storage…');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const remotePath = `gcode/${slug}-toolpath.json`;
  const { error } = await supabase.storage
    .from('products')
    .upload(remotePath, Buffer.from(jsonStr), {
      contentType: 'application/json',
      upsert: true,
    });

  if (error) {
    console.error('Upload failed:', error.message);
    process.exit(1);
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/products/${remotePath}`;
  console.log('');
  console.log('Success!');
  console.log(`Local:  ${outputPath}`);
  console.log(`Remote: ${publicUrl}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
