#!/usr/bin/env node
/**
 * Query CJ Dropshipping freight options for US warehouse → US delivery
 * Usage: node scripts/cj-us-logistics.js
 */

const fs = require('fs');
const path = require('path');

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

const CJ_API_BASE = 'https://developers.cjdropshipping.com/api2.0/v1';

async function getToken() {
  const res = await fetch(`${CJ_API_BASE}/authentication/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: process.env.CJ_API_KEY }),
  });
  const json = await res.json();
  if (!json.result) throw new Error('Auth failed: ' + JSON.stringify(json));
  return json.data.accessToken;
}

async function main() {
  const token = await getToken();

  // Use a known US-warehouse VID (Cotton Cloud Slime Pink/Blue)
  const vid = '1604670736529108992';

  const res = await fetch(`${CJ_API_BASE}/logistic/freightCalculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CJ-Access-Token': token,
    },
    body: JSON.stringify({
      startCountryCode: 'US',
      endCountryCode: 'US',
      products: [{ vid, quantity: 1 }],
    }),
  });

  const json = await res.json();
  console.log('CJ US→US freight options:');
  if (json.result && Array.isArray(json.data)) {
    for (const opt of json.data) {
      console.log(`  logisticName: "${opt.logisticName}"  time: ${opt.logisticAging}  cost: $${opt.logisticPrice}`);
    }
  } else {
    console.log(JSON.stringify(json, null, 2));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
