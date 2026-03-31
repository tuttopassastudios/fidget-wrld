#!/usr/bin/env node
/**
 * Check CJ warehouse stock for all mapped variants.
 *
 * Rule: if a variant is tagged cjWarehouse='US', only US stock counts.
 *       CN stock is ignored even if it's non-zero.
 *       If no US stock exists, the variant is out of stock regardless of CN.
 *
 * Usage: node scripts/check-us-warehouse.js
 */

const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    process.env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
  }
}

const axios = require('axios');
const BASE_URL = 'https://developers.cjdropshipping.com/api2.0/v1';
let accessToken = null;

async function getToken() {
  const res = await axios.post(`${BASE_URL}/authentication/getAccessToken`, {
    apiKey: process.env.CJ_API_KEY,
  });
  if (!res.data.result) throw new Error(`CJ auth failed: ${res.data.message}`);
  accessToken = res.data.data.accessToken;
}

async function cjGet(endpoint, params = {}) {
  const res = await axios.get(`${BASE_URL}${endpoint}`, {
    params,
    headers: { 'CJ-Access-Token': accessToken },
  });
  return res.data;
}

// Extract all CJ-mapped variants including cjWarehouse field
function extractCJVariants() {
  const productsFile = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'data', 'products.ts'),
    'utf8'
  );
  const variants = [];
  // Match full variant objects — capture sku, cjPid, cjVid, and optional cjWarehouse
  const regex = /\{[^}]*?sku:\s*'([^']+)'[^}]*?cjPid:\s*'([^']+)'[^}]*?cjVid:\s*'([^']+)'[^}]*?\}/g;
  let match;
  while ((match = regex.exec(productsFile)) !== null) {
    const block = match[0];
    const whMatch = block.match(/cjWarehouse:\s*'(US|CN)'/);
    variants.push({
      sku: match[1],
      cjPid: match[2],
      cjVid: match[3],
      warehouse: whMatch ? whMatch[1] : 'CN',
    });
  }
  return variants;
}

async function main() {
  await getToken();
  console.log('Authenticated with CJ API\n');

  const variants = extractCJVariants();
  console.log(`Checking ${variants.length} variants (US-only rule applied to cjWarehouse=US)\n`);

  const results = [];

  for (const variant of variants) {
    try {
      const stockRes = await cjGet('/product/stock/queryByVid', { vid: variant.cjVid });
      const stocks = Array.isArray(stockRes.data) ? stockRes.data : (stockRes.data ? [stockRes.data] : []);

      const usStock = stocks.find(s => s.countryCode === 'US');
      const cnStock = stocks.find(s => s.countryCode === 'CN');

      // Apply rule: US warehouse products use US stock only
      const effectiveQty = variant.warehouse === 'US'
        ? (usStock?.storageNum ?? 0)
        : (cnStock?.storageNum ?? 0);

      results.push({
        sku: variant.sku,
        warehouse: variant.warehouse,
        usQty: usStock?.storageNum ?? null,
        cnQty: cnStock?.storageNum ?? null,
        effectiveQty,
        inStock: effectiveQty > 0,
      });
    } catch (err) {
      results.push({ sku: variant.sku, warehouse: variant.warehouse, error: err.message });
    }

    await new Promise(r => setTimeout(r, 150));
  }

  // Summary
  const outOfStock = results.filter(r => !r.error && !r.inStock);
  const inStock = results.filter(r => !r.error && r.inStock);
  const errors = results.filter(r => r.error);

  console.log(`✓ IN STOCK (${inStock.length}):`);
  for (const r of inStock) {
    const detail = r.warehouse === 'US'
      ? `US=${r.usQty}${r.cnQty !== null ? ` (CN=${r.cnQty} ignored)` : ''}`
      : `CN=${r.cnQty}`;
    console.log(`  ${r.sku} [${r.warehouse}] — ${detail}`);
  }

  console.log(`\n✗ OUT OF STOCK (${outOfStock.length}):`);
  for (const r of outOfStock) {
    const detail = r.warehouse === 'US'
      ? `no US stock${r.cnQty ? ` (CN=${r.cnQty} ignored per rule)` : ''}`
      : `CN=0`;
    console.log(`  ${r.sku} [${r.warehouse}] — ${detail}`);
  }

  if (errors.length) {
    console.log(`\n⚠ ERRORS (${errors.length}):`);
    for (const r of errors) console.log(`  ${r.sku}: ${r.error}`);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
