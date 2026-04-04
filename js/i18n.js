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


  // ── Bahasa Melayu ──────────────────────────────────────────────────────────
  locales.ms = {
    'app.name': 'ShinyShitbox',
    'nav.settings': 'Tetapan',
    'nudge.message': "Data anda disimpan hanya dalam pelayar ini. Padam data pelayar dan ia hilang.",
    'nudge.exportLink': 'Eksport sandaran',
    'nudge.fromSettings': 'dari Tetapan → Data.',
    'nudge.dismiss': 'Tutup',

    'dash.noVehicles.title': 'Tiada kenderaan lagi',
    'dash.noVehicles.body': 'Tambah kenderaan pertama anda dalam Tetapan untuk mula menjejak selang penyelenggaraan dan keadaan bahagian.',
    'dash.noVehicles.addBtn': 'Tambah Kenderaan',
    'dash.upcomingMaintenance': 'Penyelenggaraan Akan Datang',
    'dash.items.one': '1 item',
    'dash.items.other': '{n} item',
    'dash.allGood': 'Semua bahagian dalam keadaan baik. ✅',
    'dash.table.condition': 'Keadaan',
    'dash.table.part': 'Bahagian',
    'dash.table.vehicle': 'Kenderaan',
    'dash.table.due': 'Tarikh Tiba',
    'dash.fleetOverview': 'Gambaran Keseluruhan Armada',
    'dash.card.noParts': 'Tiada bahagian',
    'dash.card.overdue': 'tertunggak',
    'dash.card.dueSoon': 'hampir tiba',
    'dash.card.allGood': 'Semua baik',
    'dash.addVehicle': 'Tambah Kenderaan',

    'vd.breadcrumb': 'Papan Pemuka',
    'vd.odo.btn': 'Odometer',
    'vd.odo.logTitle': 'Log bacaan odometer',
    'vd.logService': 'Log Servis',
    'vd.stats.currentOdo': 'Odometer Semasa',
    'vd.stats.readingsLogged': 'Bacaan Dilog',
    'vd.stats.activeParts': 'Bahagian Aktif',
    'vd.odoSection.title': 'Sejarah Odometer',
    'vd.odoSection.addTitle': 'Tambah bacaan odometer',
    'vd.odoSection.chartMsg': 'Tambah sekurang-kurangnya 2 bacaan odometer untuk melihat carta.',
    'vd.odoSection.noReadings': 'Tiada bacaan odometer lagi.',
    'vd.odoTable.date': 'Tarikh',
    'vd.odoTable.odometer': 'Odometer',
    'vd.odoTable.source': 'Sumber',
    'vd.odoTable.notes': 'Nota',
    'vd.odoTable.notesPlaceholder': 'Nota (pilihan)',
    'vd.installedParts': 'Bahagian Dipasang',
    'vd.logServiceTitle': 'Log servis',
    'vd.noParts.title': 'Tiada bahagian direkod lagi',
    'vd.noParts.body': 'Log servis pertama anda untuk mula menjejak kesihatan bahagian dan selang penyelenggaraan.',
    'vd.noParts.btn': 'Log Servis Pertama',
    'vd.editRecordTitle': 'Edit rekod',
    'vd.deleteRecordTitle': 'Padam rekod',
    'vd.chart.forecast': 'ramalan',

    'col.remaining': 'Baki',
    'col.installDate': 'Tarikh Pasang',
    'col.brand': 'Jenama',
    'col.grade': 'Gred',

    'wiz.breadcrumb.edit': 'Edit Rekod Servis',
    'wiz.breadcrumb.new': 'Rekod Servis Baharu',
    'wiz.step.part': 'Bahagian',
    'wiz.step.details': 'Butiran',
    'wiz.step.review': 'Semak',
    'wiz.s1.title': 'Apa yang anda servis?',
    'wiz.s1.partTypeLabel': 'Jenis Bahagian / Servis',
    'wiz.s1.partTypePlaceholder': 'Cari bahagian… (cth. Minyak Enjin, Palam Pencucuh)',
    'wiz.s1.noMatches': 'Tiada padanan ditemui.',
    'wiz.s1.addNewType': '+ Tambah sebagai jenis bahagian baharu',
    'wiz.s1.epcFound': 'Data EPC ditemui',
    'wiz.s1.newPartTypeTitle': 'Jenis Bahagian Baharu',
    'wiz.s1.namePlaceholder': 'Nama (cth. Kusyen Tempat Duduk, Kanta Lampu)',
    'wiz.s1.isFluid': 'Adalah cecair',
    'wiz.s1.defaultKm': 'Lalai km',
    'wiz.s1.defaultDays': 'Lalai hari',
    'wiz.s1.categoryCustomPlaceholder': 'Nama kategori',
    'wiz.s1.replacingExact': 'Menggantikan bahagian sedia ada — pilih yang mana:',
    'wiz.s1.replacingMaybe': 'Adakah anda menggantikan bahagian sedia ada?',
    'wiz.s1.exactMatch': 'padanan tepat',
    'wiz.s1.noReplDup': '⚠️ Tidak — tambah sebagai rekod berasingan baharu (mencipta pendua)',
    'wiz.s1.noReplNew': 'Tidak — ini adalah tambahan baharu',
    'wiz.s1.dateLabel': 'Tarikh',
    'wiz.s1.installed': 'Dipasang:',
    'wiz.s1.nudgeDue': 'Juga perlu pada kenderaan ini:',
    'wiz.s2.odoTitle': 'Bacaan Odometer',
    'wiz.s2.odoSubtitle': 'Pilihan — meningkatkan ketepatan ramalan.',
    'wiz.s2.estimatedAt': 'Dianggarkan pada tarikh servis:',
    'wiz.s2.interpolated': '(interpolasi)',
    'wiz.s2.lastRecorded': 'Terakhir direkod:',
    'wiz.s2.useThis': 'Gunakan ini',
    'wiz.s2.odoPlaceholder': 'cth. 82450',
    'wiz.s2.outgoingTitle': 'Keadaan Bahagian Dibuang',
    'wiz.s2.outgoingSubtitle': 'Bagaimana keadaan {part} yang anda buang?',
    'wiz.s2.condNotesPlaceholder': 'Nota tentang keadaan (pilihan)',
    'wiz.s2.newPartTitle': 'Butiran Bahagian Baharu',
    'wiz.s2.sourceLabel': 'Sumber Bahagian',
    'wiz.s2.brandLabel': 'Jenama',
    'wiz.s2.brandRequired': 'Diperlukan',
    'wiz.s2.brandOptional': 'Pilihan',
    'wiz.s2.brandPlaceholder': 'cth. Toyota, NGK, Denso',
    'wiz.s2.partNumLabel': 'Nombor Bahagian',
    'wiz.s2.epcSuggestion': 'Cadangan EPC',
    'wiz.s2.selectFromEPC': '— Pilih dari EPC —',
    'wiz.s2.partNumPlaceholder': 'cth. 90915-YZZD3',
    'wiz.s2.gradeLabel': 'Gred / Jenis',
    'wiz.s2.gradeIntervalNote': 'Selang dikemas kini secara automatik',
    'wiz.s2.fluidTypeLabel': 'Jenis Cecair',
    'wiz.s2.selectType': '— Pilih jenis —',
    'wiz.s2.gradeSpecLabel': 'Gred / Spesifikasi',
    'wiz.s2.selectGrade': '— Pilih gred —',
    'wiz.s2.partCostLabel': 'Kos Bahagian',
    'wiz.s2.labourCostLabel': 'Kos Buruh',
    'wiz.s2.notesTitle': 'Nota',
    'wiz.s2.notesOptional': '(pilihan)',
    'wiz.s2.notesPlaceholder': 'cth. menggunakan campuran sintetik, perasan sedikit bocor…',
    'wiz.s2.intervalTitle': 'Selang Penggantian',
    'wiz.s2.preFilledFrom': 'Pra-isi dari:',
    'wiz.s2.kmLabel': 'Setiap (km)',
    'wiz.s2.kmPlaceholder': 'cth. 10000',
    'wiz.s2.timeLabel': 'Atau setiap (masa)',
    'wiz.s2.yr': 'thn',
    'wiz.s2.mo': 'bln',
    'wiz.s2.intervalNote': 'Ambang mana yang dicapai dahulu akan mencetuskan amaran servis.',
    'wiz.s2.applyTo': 'Gunakan selang kepada:',
    'wiz.s2.installOnly.title': 'Pemasangan ini sahaja',
    'wiz.s2.installOnly.desc': 'Penggantian masa hadapan menggunakan lalai asal.',
    'wiz.s2.updateDefault.title': 'Kemas kini lalai untuk {name}',
    'wiz.s2.updateDefault.desc': 'Ini menjadi lalai baharu ke hadapan.',
    'wiz.s3.title': 'Semak & Simpan',
    'wiz.s3.vehicle': 'Kenderaan',
    'wiz.s3.part': 'Bahagian',
    'wiz.s3.date': 'Tarikh',
    'wiz.s3.odometer': 'Odometer',
    'wiz.s3.removedPart': 'Bahagian Dibuang',
    'wiz.s3.source': 'Sumber',
    'wiz.s3.brand': 'Jenama',
    'wiz.s3.partNum': 'No. Bahagian',
    'wiz.s3.grade': 'Gred / Jenis',
    'wiz.s3.partCost': 'Kos Bahagian',
    'wiz.s3.labour': 'Buruh',
    'wiz.s3.interval': 'Selang',
    'wiz.s3.thisInstallOnly': 'pemasangan ini sahaja',
    'wiz.s3.updatingDefault': 'mengemas kini lalai',
    'wiz.s3.nextDue': 'Tiba Seterusnya',
    'wiz.s3.notes': 'Nota',
    'wiz.nav.back': 'Balik',
    'wiz.nav.cancel': 'Batal',
    'wiz.nav.next': 'Seterusnya →',
    'wiz.nav.saving': 'Menyimpan…',
    'wiz.nav.saveRecord': 'Simpan Rekod',
    'wiz.nav.stepOf': 'Langkah {n} dari 3',

    'intervalSrc.epc': 'Data EPC',
    'intervalSrc.default': 'Lalai Toyota/Daihatsu',
    'intervalSrc.partType': 'Lalai jenis bahagian',
    'intervalSrc.history': 'Sejarah anda',
    'intervalSrc.variant': 'Lalai varian',

    'source.oem-genuine': 'OEM Tulen',
    'source.aftermarket': 'Selepas Pasaran',
    'source.generic': 'Generik/Tanpa Jenama',
    'source.oem-brand': 'Selepas Pasaran',
    'source.manual': 'manual',

    'settings.tab.vehicles': 'Kenderaan',
    'settings.tab.preferences': 'Keutamaan',
    'settings.tab.data': 'Data',
    'settings.vehicles.title': 'Kenderaan Anda',
    'settings.vehicles.addBtn': '+ Tambah Kenderaan',
    'settings.vehicles.empty': 'Tiada kenderaan lagi. Tambah satu untuk bermula.',
    'settings.vehicles.col.vehicle': 'Kenderaan',
    'settings.vehicles.col.year': 'Tahun',
    'settings.vehicles.col.vinNotes': 'VIN / Nota',
    'settings.pref.distanceUnit': 'Unit Jarak',
    'settings.pref.km': 'Kilometer (km)',
    'settings.pref.miles': 'Batu',
    'settings.pref.currency': 'Mata Wang',
    'settings.pref.currencyNote': 'Mengubah cara kos dipaparkan — tiada penukaran mata wang dilakukan.',
    'settings.pref.theme': 'Tema',
    'settings.pref.themeLight': '☀️ Cerah',
    'settings.pref.themeDark': '🌙 Gelap',
    'settings.pref.language': 'Bahasa',
    'settings.pref.alertThresholds': 'Had Amaran',
    'settings.pref.dueSoonBadge': '(lencana Hampir Tiba)',
    'settings.pref.remainingLife': 'Hayat tinggal',
    'settings.pref.remainingMileage': 'Jarak tinggal',
    'settings.pref.estFromMileage': 'Jangkaan hayat dari jarak',
    'settings.pref.days': 'hari',
    'settings.pref.upcomingNote': 'Lencana Akan Datang menyala pada 2× nilai ini.',
    'settings.pref.condTrafficLights': 'Lampu Isyarat Keadaan',
    'settings.pref.partHealthPct': '(% kesihatan bahagian)',
    'settings.pref.amberBelow': '🟡 Kuning di bawah',
    'settings.pref.redBelow': '🔴 Merah di bawah',
    'settings.pref.condNote': 'Hijau ≥ ambang kuning. Kuning ≥ ambang merah. Merah di bawah itu.',
    'settings.data.exportTitle': 'Eksport / Import',
    'settings.data.exportDesc': 'Simpan sandaran penuh semua kenderaan, bahagian, dan sejarah odometer.',
    'settings.data.exportBtn': '⬇ Eksport Pangkalan Data (JSON)',
    'settings.data.importBtn': '⬆ Import Pangkalan Data (JSON)',
    'settings.data.epcTitle': 'Pangkalan Data Bahagian (Toyota / Daihatsu)',
    'settings.data.epcCurrentVersion': 'Versi semasa:',
    'settings.data.epcDesc': 'Apl menyemak kemas kini secara automatik setiap minggu. Anda juga boleh kemaskini secara manual.',
    'settings.data.epcUpdateBtn': '🔄 Semak Kemas Kini Sekarang',
    'settings.data.dangerTitle': 'Zon Bahaya',
    'settings.data.dangerDesc': 'Padam semua data secara kekal. Ini tidak boleh dibuat alik.',
    'settings.data.clearBtn': '🗑 Padam Semua Data',
    'settings.data.loading': 'Memuatkan…',
    'settings.data.notLoaded': 'Tidak dimuatkan',
    'settings.vehicle.editTitle': 'Edit Kenderaan',
    'settings.vehicle.addTitle': 'Tambah Kenderaan',
    'settings.vehicle.nickname': 'Nama Panggilan / Label',
    'settings.vehicle.nicknamePlaceholder': 'cth. Pemandu Harian, Trak Kerja',
    'settings.vehicle.make': 'Jenama',
    'settings.vehicle.makePlaceholder': 'Toyota',
    'settings.vehicle.model': 'Model',
    'settings.vehicle.modelPlaceholder': 'Corolla',
    'settings.vehicle.year': 'Tahun',
    'settings.vehicle.colour': 'Warna',
    'settings.vehicle.vin': 'VIN (pilihan)',
    'settings.vehicle.vinPlaceholder': 'VIN 17 aksara',
    'settings.vehicle.notes': 'Nota',
    'settings.vehicle.notesPlaceholder': 'Varian enjin, pengubahsuaian, dll.',
    'odo.title': 'Log Bacaan Odometer',
    'odo.dateLabel': 'Tarikh',
    'odo.odoLabel': 'Odometer (km)',
    'odo.odoPlaceholder': 'cth. 82450',
    'odo.notesLabel': 'Nota (pilihan)',
    'odo.notesPlaceholder': 'cth. Bacaan pra-servis',
    'urgency.overdue': 'Tertunggak',
    'urgency.due-soon': 'Hampir Tiba',
    'urgency.upcoming': 'Akan Datang',
    'urgency.ok': 'OK',
    'cond.unknown': 'Tidak Diketahui',
    'cond.new': 'Baharu',
    'cond.good': 'Baik',
    'cond.fair': 'Sederhana',
    'cond.poor': 'Teruk',
    'cond.failed': 'Gagal',
    'dur.yr': 'thn',
    'dur.mo': 'bln',
    'dur.d': 'hr',
    'due.over': 'Lebih',
    'due.overdue': 'TERTUNGGAK',
    'tooltip.kmUsed': '{elapsed} km digunakan daripada {interval} km selang',
    'tooltip.timeUsed': '{elapsed} hari digunakan daripada {interval} hari selang',
    'action.save': 'Simpan',
    'action.cancel': 'Batal',
    'action.edit': 'Edit',
    'action.delete': 'Padam',
    'action.add': 'Tambah',
    'action.manage': 'Urus',
    'action.hideList': 'Sembunyikan Senarai',
    'action.logService': 'Log servis',
    'label.installed': 'dipasang',
    'err.nameRequired': 'Nama diperlukan.',
    'err.makeModelRequired': 'Jenama dan Model diperlukan.',
    'err.yearInvalid': 'Masukkan tahun yang sah.',
    'err.dateRequired': 'Tarikh diperlukan.',
    'err.odoInvalid': 'Masukkan bacaan odometer yang sah.',
    'err.saveFailed': 'Simpan gagal:',
    'notif.vehicleUpdated': 'Kenderaan dikemas kini.',
    'notif.vehicleAdded': 'Kenderaan ditambah.',
    'notif.vehicleDeleted': 'Kenderaan dipadam.',
    'notif.dbExported': 'Pangkalan data dieksport.',
    'notif.dbImported': 'Pangkalan data diimport berjaya.',
    'notif.importReloading': 'Import berjaya. Memuat semula…',
    'notif.odoSaved': 'Bacaan odometer disimpan.',
    'notif.odoUpdated': 'Bacaan odometer dikemas kini.',
    'notif.odoDeleted': 'Bacaan odometer dipadam.',
    'notif.partDeleted': 'Rekod bahagian dipadam.',
    'notif.partUpdated': 'Rekod bahagian dikemas kini.',
    'notif.partRecorded': '{name} berjaya direkod.',
    'confirm.deleteVehicle': 'Padam "{name}" dan semua rekornya? Ini tidak boleh dibuat alik.',
    'confirm.importOverwrite': 'Ini akan MENIMPA semua data sedia ada. Adakah anda pasti?',
    'confirm.clearAll1': 'Ini akan memadamkan SEMUA kenderaan, bahagian, dan rekod odometer secara kekal. Teruskan?',
    'confirm.clearAll2': 'Adakah anda benar-benar pasti? Ini TIDAK BOLEH dibuat alik.',
    'confirm.deleteOdo': 'Padam bacaan:\n{label}\n\nIni tidak boleh dibuat alik.',
    'confirm.deletePart': 'Padam "{label}"?\n\nIni memadamkan rekod secara kekal dan tidak boleh dibuat alik.',
    'confirm.duplicatePart': 'Anda sudah memasang "{names}" tetapi memilih untuk tidak menggantikannya.\n\nMeneruskan akan mencipta rekod pendua.\n\nTeruskan juga?',
    'confirm.replaceOdo': 'Bacaan odometer {existing} sudah wujud untuk {date}.\n\nGantikan dengan {new}?',
    'epc.checking': 'Menyemak kemas kini…',
    'epc.updated': 'Dikemaskini kepada {version}.',
    'epc.upToDate': 'Sudah terkini ({version}).',
    'epc.updateFailed': 'Kemas kini gagal:',
    'epc.exportFailed': 'Eksport gagal:',
    'epc.importFailed': 'Import gagal:',
  };


  // ── Supported locales ──────────────────────────────────────────────────────
  const SUPPORTED = ['en', 'ms'];
  const LOCALE_NAMES = {
    en: 'English',
    ms: 'Bahasa Melayu',
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
