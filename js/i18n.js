/**
 * i18n.js — Lightweight internationalisation for VehicleAgingTracker.
 *
 * - Strings are keyed with dot-notation (e.g. 'dash.table.part').
 * - Active locale defaults to the user's browser language, falling back to 'en'.
 * - An override can be stored in localStorage under the key 'vat_locale'.
 * - Exposes window.I18n with .t(key, vars?) / .tn(key, n, vars?) / .setLocale(code) / .locale
 * - Registers Alpine magic $t and $tn during alpine:init.
 */
window.I18n = (() => {

  // ── Locale definitions ─────────────────────────────────────────────────────

  const locales = {};

  // ── English (default) ──────────────────────────────────────────────────────
  locales.en = {
    // App chrome
    'app.name': 'ShinyShitbox',
    'nav.settings': 'Settings',

    // Backup nudge banner
    'nudge.message': "Your data is stored only in this browser. Clear browser data and it's gone.",
    'nudge.exportLink': 'Export a backup',
    'nudge.fromSettings': 'from Settings → Data.',
    'nudge.dismiss': 'Dismiss',

    // Dashboard — empty state
    'dash.noVehicles.title': 'No vehicles yet',
    'dash.noVehicles.body': 'Add your first vehicle in Settings to start tracking maintenance intervals and part condition.',
    'dash.noVehicles.addBtn': 'Add a Vehicle',

    // Dashboard — urgency list
    'dash.upcomingMaintenance': 'Upcoming Maintenance',
    'dash.items.one': '1 item',
    'dash.items.other': '{n} items',
    'dash.allGood': 'All parts are in good shape. ✅',
    'dash.table.condition': 'Condition',
    'dash.table.part': 'Part',
    'dash.table.vehicle': 'Vehicle',
    'dash.table.due': 'Due',

    // Dashboard — fleet overview
    'dash.fleetOverview': 'Fleet Overview',
    'dash.card.noParts': 'No parts',
    'dash.card.overdue': 'overdue',
    'dash.card.dueSoon': 'due soon',
    'dash.card.allGood': 'All good',
    'dash.addVehicle': 'Add Vehicle',

    // Vehicle Detail
    'vd.breadcrumb': 'Dashboard',
    'vd.odo.btn': 'Odometer',
    'vd.odo.logTitle': 'Log odometer reading',
    'vd.logService': 'Log Service',
    'vd.stats.currentOdo': 'Current Odometer',
    'vd.stats.readingsLogged': 'Readings Logged',
    'vd.stats.activeParts': 'Active Parts',
    'vd.odoSection.title': 'Odometer History',
    'vd.odoSection.addTitle': 'Add odometer reading',
    'vd.odoSection.chartMsg': 'Add at least 2 odometer readings to see the chart.',
    'vd.odoSection.noReadings': 'No odometer readings yet.',
    'vd.odoTable.date': 'Date',
    'vd.odoTable.odometer': 'Odometer',
    'vd.odoTable.source': 'Source',
    'vd.odoTable.notes': 'Notes',
    'vd.odoTable.notesPlaceholder': 'Notes (optional)',
    'vd.installedParts': 'Installed Parts',
    'vd.logServiceTitle': 'Log service',
    'vd.noParts.title': 'No parts recorded yet',
    'vd.noParts.body': 'Log your first service to start tracking part health and maintenance intervals.',
    'vd.noParts.btn': 'Log First Service',
    'vd.editRecordTitle': 'Edit record',
    'vd.deleteRecordTitle': 'Delete record',
    'vd.chart.forecast': 'forecast',

    // Vehicle Detail — table column headers
    'col.remaining': 'Remaining',
    'col.installDate': 'Install Date',
    'col.brand': 'Brand',
    'col.grade': 'Grade',

    // Wizard — breadcrumb / steps
    'wiz.breadcrumb.edit': 'Edit Service Record',
    'wiz.breadcrumb.new': 'New Service Record',
    'wiz.step.part': 'Part',
    'wiz.step.details': 'Details',
    'wiz.step.review': 'Review',

    // Wizard — step 1
    'wiz.s1.title': 'What are you servicing?',
    'wiz.s1.partTypeLabel': 'Part / Service Type',
    'wiz.s1.partTypePlaceholder': 'Search parts… (e.g. Engine Oil, Spark Plugs)',
    'wiz.s1.noMatches': 'No matches found.',
    'wiz.s1.addNewType': '+ Add as new part type',
    'wiz.s1.epcFound': 'EPC data found',
    'wiz.s1.newPartTypeTitle': 'New Part Type',
    'wiz.s1.namePlaceholder': 'Name (e.g. Seat Cushion, Lamp Lens)',
    'wiz.s1.isFluid': 'Is a fluid',
    'wiz.s1.defaultKm': 'Default km',
    'wiz.s1.defaultDays': 'Default days',
    'wiz.s1.categoryCustomPlaceholder': 'Category name',
    'wiz.s1.replacingExact': 'Replacing an existing part — select which one:',
    'wiz.s1.replacingMaybe': 'Are you replacing an existing part?',
    'wiz.s1.exactMatch': 'exact match',
    'wiz.s1.noReplDup': '⚠️ No — add as a new separate record (creates duplicate)',
    'wiz.s1.noReplNew': 'No — this is a new addition',
    'wiz.s1.dateLabel': 'Date',
    'wiz.s1.installed': 'Installed:',
    'wiz.s1.nudgeDue': 'Also due on this vehicle:',

    // Wizard — step 2
    'wiz.s2.odoTitle': 'Odometer Reading',
    'wiz.s2.odoSubtitle': 'Optional — improves predictions.',
    'wiz.s2.estimatedAt': 'Estimated at service date:',
    'wiz.s2.interpolated': '(interpolated)',
    'wiz.s2.lastRecorded': 'Last recorded:',
    'wiz.s2.useThis': 'Use this',
    'wiz.s2.odoPlaceholder': 'e.g. 82450',
    'wiz.s2.outgoingTitle': 'Condition of Removed Part',
    'wiz.s2.outgoingSubtitle': "How was the {part} you're removing?",
    'wiz.s2.condNotesPlaceholder': 'Notes on condition (optional)',
    'wiz.s2.newPartTitle': 'New Part Details',
    'wiz.s2.sourceLabel': 'Part Source',
    'wiz.s2.brandLabel': 'Brand',
    'wiz.s2.brandRequired': 'Required',
    'wiz.s2.brandOptional': 'Optional',
    'wiz.s2.brandPlaceholder': 'e.g. Toyota, NGK, Denso',
    'wiz.s2.partNumLabel': 'Part Number',
    'wiz.s2.epcSuggestion': 'EPC suggestion',
    'wiz.s2.selectFromEPC': '— Select from EPC —',
    'wiz.s2.partNumPlaceholder': 'e.g. 90915-YZZD3',
    'wiz.s2.gradeLabel': 'Grade / Type',
    'wiz.s2.gradeIntervalNote': 'Interval updates automatically',
    'wiz.s2.fluidTypeLabel': 'Fluid Type',
    'wiz.s2.selectType': '— Select type —',
    'wiz.s2.gradeSpecLabel': 'Grade / Specification',
    'wiz.s2.selectGrade': '— Select grade —',
    'wiz.s2.partCostLabel': 'Part Cost',
    'wiz.s2.labourCostLabel': 'Labour Cost',
    'wiz.s2.notesTitle': 'Notes',
    'wiz.s2.notesOptional': '(optional)',
    'wiz.s2.notesPlaceholder': 'e.g. used synthetic blend, noticed slight leak…',
    'wiz.s2.intervalTitle': 'Replacement Interval',
    'wiz.s2.preFilledFrom': 'Pre-filled from:',
    'wiz.s2.kmLabel': 'Every (km)',
    'wiz.s2.kmPlaceholder': 'e.g. 10000',
    'wiz.s2.timeLabel': 'Or every (time)',
    'wiz.s2.yr': 'yr',
    'wiz.s2.mo': 'mo',
    'wiz.s2.intervalNote': 'Whichever threshold comes first triggers a service alert.',
    'wiz.s2.applyTo': 'Apply interval to:',
    'wiz.s2.installOnly.title': 'This installation only',
    'wiz.s2.installOnly.desc': 'Future replacements use the original default.',
    'wiz.s2.updateDefault.title': 'Update default for {name}',
    'wiz.s2.updateDefault.desc': 'This becomes the new default going forward.',

    // Wizard — step 3 review
    'wiz.s3.title': 'Review & Save',
    'wiz.s3.vehicle': 'Vehicle',
    'wiz.s3.part': 'Part',
    'wiz.s3.date': 'Date',
    'wiz.s3.odometer': 'Odometer',
    'wiz.s3.removedPart': 'Removed Part',
    'wiz.s3.source': 'Source',
    'wiz.s3.brand': 'Brand',
    'wiz.s3.partNum': 'Part #',
    'wiz.s3.grade': 'Grade / Type',
    'wiz.s3.partCost': 'Part Cost',
    'wiz.s3.labour': 'Labour',
    'wiz.s3.interval': 'Interval',
    'wiz.s3.thisInstallOnly': 'this install only',
    'wiz.s3.updatingDefault': 'updating default',
    'wiz.s3.nextDue': 'Next Due',
    'wiz.s3.notes': 'Notes',

    // Wizard — navigation
    'wiz.nav.back': 'Back',
    'wiz.nav.cancel': 'Cancel',
    'wiz.nav.next': 'Next →',
    'wiz.nav.saving': 'Saving…',
    'wiz.nav.saveRecord': 'Save Record',
    'wiz.nav.stepOf': 'Step {n} of 3',

    // Interval source labels (stored as keys in state)
    'intervalSrc.epc': 'EPC data',
    'intervalSrc.default': 'Toyota/Daihatsu default',
    'intervalSrc.partType': 'Part type default',
    'intervalSrc.history': 'Your history',
    'intervalSrc.variant': 'Variant default',

    // Part sources
    'source.oem-genuine': 'OEM Genuine',
    'source.aftermarket': 'Aftermarket',
    'source.generic': 'Generic/Unbranded',
    'source.oem-brand': 'Aftermarket',
    'source.manual': 'manual',

    // Settings — tabs
    'settings.breadcrumb': 'Settings',
    'settings.tab.vehicles': 'Vehicles',
    'settings.tab.preferences': 'Preferences',
    'settings.tab.data': 'Data',

    // Settings — vehicles tab
    'settings.vehicles.title': 'Your Vehicles',
    'settings.vehicles.addBtn': '+ Add Vehicle',
    'settings.vehicles.empty': 'No vehicles yet. Add one to get started.',
    'settings.vehicles.col.vehicle': 'Vehicle',
    'settings.vehicles.col.year': 'Year',
    'settings.vehicles.col.vinNotes': 'VIN / Notes',

    // Settings — preferences tab
    'settings.pref.distanceUnit': 'Distance Unit',
    'settings.pref.km': 'Kilometres (km)',
    'settings.pref.miles': 'Miles',
    'settings.pref.currency': 'Currency',
    'settings.pref.currencyNote': 'Changes how costs are displayed — no currency conversion is performed.',
    'settings.pref.theme': 'Theme',
    'settings.pref.themeLight': '☀️ Light',
    'settings.pref.themeDark': '🌙 Dark',
    'settings.pref.language': 'Language',
    'settings.pref.alertThresholds': 'Alert Thresholds',
    'settings.pref.dueSoonBadge': '(Due Soon badge)',
    'settings.pref.remainingLife': 'Remaining life',
    'settings.pref.remainingMileage': 'Remaining mileage',
    'settings.pref.estFromMileage': 'Est. life from mileage',
    'settings.pref.days': 'days',
    'settings.pref.upcomingNote': 'Upcoming badge fires at 2× these values.',
    'settings.pref.condTrafficLights': 'Condition Traffic Lights',
    'settings.pref.partHealthPct': '(part health %)',
    'settings.pref.amberBelow': '🟡 Amber below',
    'settings.pref.redBelow': '🔴 Red below',
    'settings.pref.condNote': 'Green ≥ amber threshold. Amber ≥ red threshold. Red below that.',

    // Settings — data tab
    'settings.data.exportTitle': 'Export / Import',
    'settings.data.exportDesc': 'Save a full backup of all vehicles, parts, and odometer history.',
    'settings.data.exportBtn': '⬇ Export Database (JSON)',
    'settings.data.importBtn': '⬆ Import Database (JSON)',
    'settings.data.epcTitle': 'Parts Database (Toyota / Daihatsu)',
    'settings.data.epcCurrentVersion': 'Current version:',
    'settings.data.epcDesc': 'The app auto-checks for updates weekly. You can also update manually.',
    'settings.data.epcUpdateBtn': '🔄 Check for Updates Now',
    'settings.data.dangerTitle': 'Danger Zone',
    'settings.data.dangerDesc': 'Permanently delete all data. This cannot be undone.',
    'settings.data.clearBtn': '🗑 Clear All Data',
    'settings.data.loading': 'Loading…',
    'settings.data.notLoaded': 'Not loaded',

    // Settings — vehicle modal
    'settings.vehicle.editTitle': 'Edit Vehicle',
    'settings.vehicle.addTitle': 'Add Vehicle',
    'settings.vehicle.nickname': 'Nickname / Label',
    'settings.vehicle.nicknamePlaceholder': 'e.g. Daily Driver, Work Ute',
    'settings.vehicle.make': 'Make',
    'settings.vehicle.makePlaceholder': 'Toyota',
    'settings.vehicle.model': 'Model',
    'settings.vehicle.modelPlaceholder': 'Corolla',
    'settings.vehicle.year': 'Year',
    'settings.vehicle.colour': 'Colour',
    'settings.vehicle.vin': 'VIN (optional)',
    'settings.vehicle.vinPlaceholder': '17-character VIN',
    'settings.vehicle.notes': 'Notes',
    'settings.vehicle.notesPlaceholder': 'Engine variant, mods, etc.',

    // Quick Odometer modal
    'odo.title': 'Log Odometer Reading',
    'odo.dateLabel': 'Date',
    'odo.odoLabel': 'Odometer (km)',
    'odo.odoPlaceholder': 'e.g. 82450',
    'odo.notesLabel': 'Notes (optional)',
    'odo.notesPlaceholder': 'e.g. Pre-service reading',

    // Urgency labels
    'urgency.overdue': 'Overdue',
    'urgency.due-soon': 'Due Soon',
    'urgency.upcoming': 'Upcoming',
    'urgency.ok': 'OK',

    // Condition labels
    'cond.unknown': 'Unknown',
    'cond.new': 'New',
    'cond.good': 'Good',
    'cond.fair': 'Fair',
    'cond.poor': 'Poor',
    'cond.failed': 'Failed',

    // Duration format units
    'dur.yr': 'yr',
    'dur.mo': 'mo',
    'dur.d': 'd',

    // "over" suffix in overdue display
    'due.over': 'over',
    'due.overdue': 'Overdue',

    // Condition tooltip templates
    'tooltip.kmUsed': '{elapsed} of {interval} km used',
    'tooltip.timeUsed': '{elapsed} of {interval} used',

    // Common actions
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.add': 'Add',
    'action.manage': 'Manage',
    'action.hideList': 'Hide List',
    'action.logService': 'Log service',

    // Generic label
    'label.installed': 'installed',

    // Error messages
    'err.nameRequired': 'Name is required.',
    'err.makeModelRequired': 'Make and Model are required.',
    'err.yearInvalid': 'Enter a valid year.',
    'err.dateRequired': 'Date is required.',
    'err.odoInvalid': 'Enter a valid odometer reading.',
    'err.saveFailed': 'Save failed:',

    // Notifications
    'notif.vehicleUpdated': 'Vehicle updated.',
    'notif.vehicleAdded': 'Vehicle added.',
    'notif.vehicleDeleted': 'Vehicle deleted.',
    'notif.dbExported': 'Database exported.',
    'notif.dbImported': 'Database imported successfully.',
    'notif.importReloading': 'Import successful. Reloading…',
    'notif.odoSaved': 'Odometer reading saved.',
    'notif.odoUpdated': 'Odometer reading updated.',
    'notif.odoDeleted': 'Odometer reading deleted.',
    'notif.partDeleted': 'Part record deleted.',
    'notif.partUpdated': 'Part record updated.',
    'notif.partRecorded': '{name} recorded successfully.',

    // Confirm dialogs
    'confirm.deleteVehicle': 'Delete "{name}" and all its records? This cannot be undone.',
    'confirm.importOverwrite': 'This will OVERWRITE all existing data. Are you sure?',
    'confirm.clearAll1': 'This will permanently delete ALL vehicles, parts, and odometer records. Continue?',
    'confirm.clearAll2': 'Are you absolutely sure? This CANNOT be undone.',
    'confirm.deleteOdo': 'Delete reading:\n{label}\n\nThis cannot be undone.',
    'confirm.deletePart': 'Delete "{label}"?\n\nThis permanently removes the record and cannot be undone.',
    'confirm.duplicatePart': 'You already have "{names}" installed but chose not to replace it.\n\nProceeding will create a duplicate record.\n\nContinue anyway?',
    'confirm.replaceOdo': 'An odometer reading of {existing} already exists for {date}.\n\nReplace it with {new}?',

    // EPC status
    'epc.checking': 'Checking for updates…',
    'epc.updated': 'Updated to {version}.',
    'epc.upToDate': 'Already up to date ({version}).',
    'epc.updateFailed': 'Update failed:',
    'epc.exportFailed': 'Export failed:',
    'epc.importFailed': 'Import failed:',
  };

  // ── Supported locales ──────────────────────────────────────────────────────
  const SUPPORTED = ['en'];
  const LOCALE_NAMES = {
    en: 'English',
  };

  // ── Locale detection ───────────────────────────────────────────────────────
  function detectLocale() {
    // 1. localStorage override
    const saved = localStorage.getItem('vat_locale');
    if (saved && locales[saved]) return saved;

    // 2. Browser language preference list
    const langs = (navigator.languages && navigator.languages.length)
      ? [...navigator.languages]
      : [navigator.language || 'en'];

    for (const lang of langs) {
      const lower = lang.toLowerCase();
      // Chinese variants — check specific tags before generic 'zh'
      if (lower === 'zh-tw' || lower === 'zh-hk' || lower === 'zh-mo' || lower.startsWith('zh-hant')) return 'zh-Hant';
      if (lower.startsWith('zh')) return 'zh-Hans';
      if (locales[lang]) return lang;
      const base = lang.split('-')[0];
      if (locales[base]) return base;
    }
    return 'en';
  }

  let _locale = detectLocale();

  // ── Core lookup ────────────────────────────────────────────────────────────
  /**
   * Translate a key, with optional {varName} substitution.
   */
  function t(key, vars) {
    const dict = locales[_locale] || locales.en;
    let   str  = dict[key];
    if (str === undefined) str = locales.en[key];
    if (str === undefined) str = key;   // key fallback
    if (vars && typeof str === 'string') {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), String(v ?? ''));
      }
    }
    return str;
  }

  /**
   * Plural-aware translate. Uses key + '.one' for n === 1, key + '.other' otherwise.
   * Substitutes {n} with the count.
   */
  function tn(key, n, vars) {
    const pluralKey = n === 1 ? key + '.one' : key + '.other';
    return t(pluralKey, { n, ...vars });
  }

  // ── Locale management ──────────────────────────────────────────────────────
  function setLocale(code) {
    if (!locales[code]) return;
    _locale = code;
    localStorage.setItem('vat_locale', code);
    // Update html[lang] for accessibility
    const htmlLang = code === 'zh-Hans' ? 'zh-Hans' : code === 'zh-Hant' ? 'zh-Hant' : code;
    document.documentElement.setAttribute('lang', htmlLang);
  }

  // ── Alpine integration ─────────────────────────────────────────────────────
  document.addEventListener('alpine:init', () => {
    // $t(key, vars?) — reactive translate
    Alpine.magic('t', () => (key, vars) => {
      Alpine.store('app').locale; // read → track as reactive dependency
      return t(key, vars);
    });
    // $tn(key, n, vars?) — reactive plural translate
    Alpine.magic('tn', () => (key, n, vars) => {
      Alpine.store('app').locale;
      return tn(key, n, vars);
    });
  });

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    get locale() { return _locale; },
    t,
    tn,
    setLocale,
    SUPPORTED,
    LOCALE_NAMES,
  };
})();
