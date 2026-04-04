# ShinyShitbox

Client-side vehicle maintenance tracker. All data lives in your browser's IndexedDB — no account, no server, no sync.

**Open `index.html` directly in any browser. No installation or local server needed.**

> [!WARNING]
> All data is stored only in your browser's IndexedDB. It will be lost if you clear browser data, switch browsers, or reinstall your OS. You should regularly export a backup via Settings → Data → Export.

## Features

- Multi-vehicle fleet with per-vehicle service history
- Part lifecycle tracking — install date, odometer, grade/variant, condition at removal
- Dual-interval due dates (km + calendar) with binding-constraint urgency
- Condition estimation (0–100%) and weighted vehicle health score
- Odometer interpolation — estimates install odometer from reading history
- Service clustering — groups parts due within ±15 days / ±1000 km
- Toyota/Daihatsu EPC data (`data/parts-db.json`) pre-fills intervals and OEM part numbers
- Full export/import backup as JSON
- Dark mode, configurable alert thresholds, km/miles, 12 currency options
- Localisation — English, Bahasa Melayu, Simplified Chinese, Traditional Chinese; auto-detected from browser language with a manual override in Settings

## Project layout

```
├── index.html                  # App shell — open this
├── css/custom.css              # Theme overrides, animations, condition bar colours
├── data/
│   ├── parts-db.json           # Toyota/Daihatsu intervals + OEM part numbers (source)
│   └── parts-db.js             # Same data as a <script> tag for file:// compatibility
├── js/
│   ├── app.js                  # Alpine.js root store + hash router
│   ├── db.js                   # Dexie.js schema, migrations, CRUD
│   ├── i18n.js                 # Localisation engine + all locale strings (en, ms, zh-Hans, zh-Hant)
│   ├── utils.js                # Pure utilities: date, formatting, estimation algorithms
│   ├── strings.js              # SVG icons and UI label constants
│   ├── epc.js                  # Parts DB loader and vehicle lookup
│   └── views/
│       ├── dashboard.js        # Urgency list + vehicle health cards
│       ├── vehicle-detail.js   # Odometer chart, parts table, inline editing
│       ├── wizard.js           # 3-step service logging form
│       └── settings.js         # Vehicles CRUD, preferences, data import/export
└── scripts/
    └── update-parts-db.js      # Node.js: refreshes data/parts-db.{json,js} from public sources
```

## Dependencies (CDN — no install)

| Library | Purpose |
|---------|---------|
| [Alpine.js 3](https://alpinejs.dev) | Reactive UI |
| [DaisyUI 4](https://daisyui.com) + [Tailwind CSS](https://tailwindcss.com) | Styles |
| [Dexie.js 3](https://dexie.org) | IndexedDB wrapper |
| [dexie-export-import](https://github.com/dexie/Dexie.js) | Backup/restore |
| [Chart.js 4](https://www.chartjs.org) | Odometer history chart |

## Parts database

`data/parts-db.json` contains Toyota/Daihatsu maintenance intervals and OEM part numbers. `data/parts-db.js` is the same data wrapped as `window.PARTS_DB = {...}` so it loads via `<script>` tag and works in `file://` mode without a fetch.

Both files are updated together by the monthly GitHub Actions cron (`.github/workflows/update-parts-db.yml`), or manually:

```sh
cd scripts && npm install && node update-parts-db.js
```

The app checks for an updated version weekly and caches it in IndexedDB. Manual check: **Settings → Data → Check for EPC update**.

## Deployment

Live at **[ndoo.github.io/ShinyShitbox](https://ndoo.github.io/ShinyShitbox/)**.

Push a `v*` tag — the workflow at `.github/workflows/deploy.yml` publishes to GitHub Pages automatically.

```sh
git tag v1.0.0 && git push origin v1.0.0
```

Enable Pages first: **GitHub repo → Settings → Pages → Source: GitHub Actions**.

---

## Built with Claude Code

This project was built entirely through vibe coding with [Claude Code](https://claude.ai/code). No production code was written by hand.

### How it was developed

The loop: describe what you want → Claude reads the relevant files and writes the code → open the browser and try it → give feedback → repeat. Architecture emerged from requirements through dialogue rather than upfront design.

Key decisions made during sessions:

- **No build step** — deliberate constraint so the app deploys anywhere static. Ruled out React, TypeScript, and any bundler. Alpine.js was chosen because it's reactive HTML with plain-object JS components.
- **Dexie.js** over raw IndexedDB for its promise API, schema declarations, and migration versioning.
- **Hash routing** instead of a router library — 15 lines, no server config, works on GitHub Pages.
- **Bundled parts DB** rather than live scraping — scraping is fragile, CORS-blocked in the browser, and legally grey. A curated JSON file updated on a cron is more reliable.
- **Odometer interpolation** — separating the odometer reading log from part install/removal odometers means you can backfill a reading and all condition bars update correctly.
- **Part record chaining** — closing old records via `removalDate` + `replacedByPartId` rather than deleting them gives a full audit trail.

### Tips for working on this with Claude

- Give Claude the relevant files to read before asking for changes. "Read `js/views/wizard.js` first" saves a round-trip.
- State your hard constraints upfront: no build step, no backend, full-width layout, IndexedDB only.
- Describe intent, not implementation — "track tyre rotation separately from replacement" rather than "add a boolean field". Claude will consider data model implications.
- DB schema changes need a new `db.version(N+1)` block. Current version is 4. Claude knows the Dexie migration pattern but you need to tell it the current version number.

---

## For AI assistants

**Hard constraints — do not violate:**

1. **No build step.** No `import`/`export`, no TypeScript, no bundler. All JS is plain ES2020 globals. The `scripts/` directory is Node.js tooling only — it does not touch production code.
2. **No backend.** Everything is client-side. Persist to IndexedDB via `window.DB`. Fetch only same-origin files.
3. **No `max-w-*` on `<main>`.** The layout is `class="w-full px-4 py-6"`. Parts tables need full horizontal space.
4. **Script load order matters.** `version.js` → `i18n.js` → `strings.js` → `utils.js` → `db.js` → `data/parts-db.js` → `epc.js` → views → `app.js` → Alpine (defer). Each file exposes a global (`window.APP_VERSION`, `window.I18n`, `window.Strings`, `window.Utils`, `window.DB`, `window.EPC`).

5. **Bumping the version:** edit `js/version.js` (the only place the version string lives), commit, then tag. The navbar reads `window.APP_VERSION` at runtime — nothing else needs changing.

**Key patterns:**

- **Global state** lives in `Alpine.store('app')` (`app.js`). Views are `Alpine.data()` blocks that read from it. Don't duplicate shared state into component scope.
- **Navigation:** `Alpine.store('app').navigate(view, params)` sets `location.hash`. Views use `x-show`. Params are key/value pairs in the hash: `#wizard/partTypeId/12`.
- **All DB methods are async** — `await` throughout. Never mix `.then()` with Alpine reactivity.
- **Migrations:** add `db.version(N+1)` to `js/db.js`. Never modify existing version blocks. Current version: **4**.
- **Condition vs urgency:** condition (0–100%) is current wear state; urgency (`ok`/`upcoming`/`due-soon`/`overdue`) is a prediction. Calculated separately in `utils.js`.
- **`grade` field** is the single source of truth for variant/fluid info — consolidates the old `partVariant`, `fluidSubtype`, `fluidGrade` fields (merged in v3 migration). Don't re-split.
- **`partSource` values:** `oem-genuine`, `oem-compatible`, `aftermarket`, `unknown`. The old `oem-brand` value was renamed to `aftermarket` in v4.
- **Call `DB.reinterpolateOdometers(vehicleId)`** after any odometer reading add/update/delete.

**What to read before changing things:**

| Area | File |
|------|------|
| DB schema / migrations | `js/db.js` (full file) |
| Condition + urgency logic | `js/utils.js` lines ~115–220 |
| Service wizard flow | `js/views/wizard.js` (full file) |
| Parts DB structure | `data/parts-db.json` (first ~80 lines) |

---

MIT — see [LICENSE](LICENSE).
