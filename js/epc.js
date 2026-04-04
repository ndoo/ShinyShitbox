/**
 * epc.js — Parts database loader and lookup.
 *
 * Data resolution order:
 *   1. In-memory cache (_memCache) — fastest, populated after first call
 *   2. IndexedDB cache — persists across page loads
 *   3. Fetch data/parts-db.json — works when served; skipped on file://
 *   4. window.PARTS_DB — set by data/parts-db.js loaded as a <script> tag;
 *      always available including file:// mode; seeds IndexedDB for next load
 *
 * Auto-updates weekly via app.js; manual update available in Settings → Data.
 */
window.EPC = (() => {

  const DB_URL = './data/parts-db.json';

  // ── Fetch and cache ───────────────────────────────────────────────

  /**
   * Fetch parts-db.json and store in IndexedDB.
   * @param {object} opts  { force: bool } - force even if version matches
   * @returns {{ updated: bool, version: string }}
   */
  async function fetchAndCache(opts = {}) {
    const res = await fetch(DB_URL + '?_=' + Date.now(), { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const cached = await DB.getPartsDbCache();
    if (!opts.force && cached && cached.version === json.version) {
      return { updated: false, version: json.version };
    }

    await DB.setPartsDbCache(json.version, json);
    return { updated: true, version: json.version };
  }

  // ── Get cached data ───────────────────────────────────────────────

  let _memCache = null;  // in-memory cache to avoid repeated IndexedDB hits

  async function getData() {
    if (_memCache) return _memCache;

    // 1. IndexedDB cache (populated by a previous fetch or seeded from the bundled file)
    const record = await DB.getPartsDbCache();
    if (record?.data) { _memCache = record.data; return _memCache; }

    // 2. Try fetching from the server (works when served; may fail on file://)
    try {
      await fetchAndCache();
      const fresh = await DB.getPartsDbCache();
      if (fresh?.data) { _memCache = fresh.data; return _memCache; }
    } catch (e) { /* fall through to bundled fallback */ }

    // 3. Bundled fallback — window.PARTS_DB is set by data/parts-db.js loaded as a
    //    <script> tag, which works in all environments including file:// mode.
    if (window.PARTS_DB) {
      _memCache = window.PARTS_DB;
      // Seed IndexedDB so future calls hit path 1 instead
      await DB.setPartsDbCache(window.PARTS_DB.version, window.PARTS_DB).catch(() => {});
      return _memCache;
    }

    return null;
  }

  // ── Lookup ────────────────────────────────────────────────────────

  /**
   * Look up maintenance data and part numbers for a vehicle + part type.
   * @param {object} vehicle   - { make, model, year }
   * @param {object} partType  - { name, category }
   * @param {string} [variant] - optional grade/variant label (e.g. "Iridium")
   * @returns {{ maintenance: { kmInterval, daysInterval, notes, critical, variants } | null,
   *             partNumbers:  [{ partNumber, description, years }],
   *             source:       string }} or null if no match
   */
  async function lookup(vehicle, partType, variant = null) {
    const data = await getData();
    if (!data) return null;

    const makeKey  = _normalise(vehicle.make);
    const makeData = data.makes?.[makeKey];
    if (!makeData) return null;

    // Find best matching model
    const modelKey  = _findModelKey(makeData.models || {}, vehicle.model, vehicle.year);
    const modelData = modelKey ? makeData.models[modelKey] : null;
    if (!modelData) return null;

    // Find part type key
    const partKey  = _findPartKey(modelData, partType);

    let maintenance = partKey ? modelData.maintenance?.[partKey] || null : null;

    // Apply variant-specific interval overrides when a variant is specified
    if (maintenance && variant && maintenance.variants?.[variant]) {
      maintenance = { ...maintenance, ...maintenance.variants[variant] };
    }

    const partNumbers = partKey ? (modelData.parts?.[partKey] || [])
      .filter(p => _yearInRange(vehicle.year, p.years))
      .filter(p => !variant || !p.variant || p.variant === variant) : [];

    if (!maintenance && !partNumbers.length) return null;

    return { maintenance, partNumbers, source: `${makeKey}/${modelKey}` };
  }

  // ── Internal helpers ──────────────────────────────────────────────

  function _normalise(str) {
    return (str || '').toLowerCase().trim().replace(/\s+/g, '-');
  }

  function _findModelKey(models, modelName, year) {
    const norm = _normalise(modelName);
    // 1. Exact match
    if (models[norm]) return norm;
    // 2. Partial match
    for (const key of Object.keys(models)) {
      if (norm.includes(key) || key.includes(norm)) return key;
    }
    // 3. Year-based search if model data has year ranges
    for (const [key, data] of Object.entries(models)) {
      if (data.years && _yearInRange(year, data.years)) return key;
    }
    return null;
  }

  function _findPartKey(modelData, partType) {
    const maintenance = modelData.maintenance || {};
    const parts       = modelData.parts       || {};
    const allKeys     = new Set([...Object.keys(maintenance), ...Object.keys(parts)]);

    const partNameNorm = _normalise(partType.name);
    const partCatNorm  = _normalise(partType.category);

    // 1. Exact slug match
    const slug = partNameNorm;
    if (allKeys.has(slug)) return slug;

    // 2. Word overlap
    const words = partNameNorm.split('-').filter(w => w.length > 2);
    let bestKey = null, bestScore = 0;
    for (const key of allKeys) {
      const keyWords = key.split('-');
      const overlap  = words.filter(w => keyWords.includes(w)).length;
      if (overlap > bestScore) { bestScore = overlap; bestKey = key; }
    }
    if (bestScore >= 1) return bestKey;

    // 3. Category fallback
    for (const key of allKeys) {
      if (key.includes(partCatNorm)) return key;
    }
    return null;
  }

  /**
   * Check if a year (number) is within a range string like "2002-2019" or "2010+".
   */
  function _yearInRange(year, rangeStr) {
    if (!rangeStr || !year) return true;  // no range = applies to all
    const m = rangeStr.match(/^(\d{4})(?:-(\d{4})|\+)?$/);
    if (!m) return true;
    const from = Number(m[1]);
    const to   = m[2] ? Number(m[2]) : (m[0].endsWith('+') ? 9999 : from);
    return year >= from && year <= to;
  }

  // ── Public API ────────────────────────────────────────────────────
  return { fetchAndCache, getData, lookup };
})();
