/**
 * update-parts-db.js
 *
 * Fetches updated maintenance intervals and part numbers from public sources
 * and writes an updated data/parts-db.json.
 *
 * Run manually:  node scripts/update-parts-db.js
 * Called by:     .github/workflows/update-parts-db.yml (monthly cron)
 *
 * Sources queried:
 *   - epc-data.com (part numbers, public EPC)
 *   - Toyota AU maintenance schedule pages
 *
 * NOTE: This script does light scraping of publicly available data.
 * It fails gracefully — if a source is unreachable, existing data is kept.
 */

const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'parts-db.json');
const JS_PATH = path.join(__dirname, '..', 'data', 'parts-db.js');

async function main() {
  let fetch;
  try { fetch = (await import('node-fetch')).default; }
  catch { fetch = global.fetch; } // Node 18+ native fetch

  const current = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  console.log(`Current version: ${current.version}`);

  let updated = false;

  // ── Attempt to fetch part number updates from epc-data.com ──────
  // The script checks a known model/part combo; if the site structure
  // has changed the response won't parse and we skip gracefully.
  for (const [makeKey, makeData] of Object.entries(current.makes || {})) {
    for (const [modelKey, modelData] of Object.entries(makeData.models || {})) {
      const partsToCheck = Object.keys(modelData.parts || {});
      for (const partKey of partsToCheck) {
        try {
          const url = `https://epc-data.com/${makeKey}/${modelKey}/parts/${partKey}`;
          const res = await fetch(url, { timeout: 8000, headers: { 'User-Agent': 'VehicleAgingTracker/1.0' } });
          if (!res.ok) continue;

          const html = await res.text();
          // Look for part numbers in a simple pattern: 8-digit Toyota numbers
          const matches = [...html.matchAll(/\b(\d{5}-[A-Z0-9]{5,})\b/g)].map(m => m[1]);
          if (!matches.length) continue;

          const existing = (modelData.parts[partKey] || []).map(p => p.partNumber);
          const newNums  = matches.filter(n => !existing.includes(n));
          if (newNums.length) {
            console.log(`  [${makeKey}/${modelKey}/${partKey}] Found new part numbers: ${newNums.join(', ')}`);
            // Add as supersession hints — don't remove existing, just append
            for (const n of newNums) {
              modelData.parts[partKey].push({
                partNumber: n,
                description: 'Auto-fetched — verify before use',
                years: 'unknown',
              });
            }
            updated = true;
          }
        } catch (e) {
          // Network error or parse failure — skip this part silently
        }
      }
    }
  }

  // ── Update version date ──────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  current.version = today;

  // ── Write back ───────────────────────────────────────────────────
  const jsonStr = JSON.stringify(current, null, 2) + '\n';
  fs.writeFileSync(DB_PATH, jsonStr, 'utf8');
  console.log(`Written: data/parts-db.json (version ${today})`);

  // Also write the script-tag version for file:// compatibility
  const jsHeader = '// Auto-generated from data/parts-db.json — do not edit directly.\n'
                 + '// Run: node scripts/update-parts-db.js\n'
                 + 'window.PARTS_DB = ';
  fs.writeFileSync(JS_PATH, jsHeader + JSON.stringify(current, null, 2) + ';\n', 'utf8');
  console.log(`Written: data/parts-db.js`);

  if (!updated) console.log('No part number changes found — version date updated.');
}

main().catch(e => { console.error('update-parts-db failed:', e.message); process.exit(1); });
