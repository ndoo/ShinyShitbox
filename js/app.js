/**
 * app.js — Alpine.js root store and hash router.
 * Must load after all view files; Alpine itself loads with defer.
 */
document.addEventListener('alpine:init', () => {

  Alpine.store('app', {
    // ── State ──────────────────────────────────────────────────────
    vehicles: [],
    currentVehicleId: null,
    currentView: 'dashboard',
    viewParams: {},
    theme: 'light',
    distanceUnit: 'km',
    currency: 'MYR',
    locale: I18n.locale,
    localeOverride: I18n.storedLocale,
    alertThresholds: { dueSoonDays: 30, dueSoonKm: 1000, dueSoonKmDays: 30, conditionAmber: 10, conditionRed: 5 },
    toasts: [],
    _toastSeq: 0,
    showBackupNudge: false,

    // ── Init ───────────────────────────────────────────────────────
    async init() {
      // Restore preferences
      this.theme        = localStorage.getItem('vat_theme')    || 'light';
      this.distanceUnit = localStorage.getItem('vat_unit')     || 'km';
      this.currency     = localStorage.getItem('vat_currency') || 'MYR';
      const savedThresholds = localStorage.getItem('vat_alertThresholds');
      if (savedThresholds) try {
        this.alertThresholds = { dueSoonDays: 30, dueSoonKm: 1000, dueSoonKmDays: 30, conditionAmber: 10, conditionRed: 5, ...JSON.parse(savedThresholds) };
      } catch(e) {}
      this._applyTheme();

      // Load vehicles
      await this.loadVehicles();

      // Restore last selected vehicle
      const saved = localStorage.getItem('vat_vehicleId');
      if (saved && this.vehicles.find(v => v.id === Number(saved))) {
        this.currentVehicleId = Number(saved);
      } else if (this.vehicles.length) {
        this.currentVehicleId = this.vehicles[0].id;
      }

      // Hash router
      this._handleHash();
      window.addEventListener('hashchange', () => this._handleHash());

      // EPC auto-update check (weekly)
      this._maybeUpdatePartsDb();

      // Backup reminder (every 30 days)
      this._checkBackupNudge();
    },

    // ── Vehicles ───────────────────────────────────────────────────
    async loadVehicles() {
      this.vehicles = await DB.getVehicles();
    },

    get currentVehicle() {
      return this.vehicles.find(v => v.id === this.currentVehicleId) || null;
    },

    selectVehicle(id) {
      this.currentVehicleId = Number(id);
      localStorage.setItem('vat_vehicleId', id);
    },

    // ── Router ─────────────────────────────────────────────────────
    _handleHash() {
      const hash   = location.hash.replace('#', '') || 'dashboard';
      const [view, ...rest] = hash.split('/');
      const params = {};
      rest.forEach((seg, i) => { if (i % 2 === 0) params[seg] = rest[i + 1]; });
      this.currentView = view;
      this.viewParams  = params;
    },

    navigate(view, params = {}) {
      let hash = view;
      const parts = Object.entries(params).flat();
      if (parts.length) hash += '/' + parts.join('/');
      location.hash = hash;
    },

    // ── Theme ──────────────────────────────────────────────────────
    toggleTheme() {
      this.setTheme(this.theme === 'light' ? 'dark' : 'light');
    },

    setTheme(t) {
      this.theme = t;
      localStorage.setItem('vat_theme', t);
      this._applyTheme();
    },

    _applyTheme() {
      document.documentElement.setAttribute('data-theme', this.theme);
    },

    // ── Preferences ────────────────────────────────────────────────
    setDistanceUnit(unit) {
      this.distanceUnit = unit;
      localStorage.setItem('vat_unit', unit);
    },

    setCurrency(currency) {
      this.currency = currency;
      localStorage.setItem('vat_currency', currency);
    },

    setLocale(code) {
      I18n.setLocale(code);
      this.locale = I18n.locale;
      this.localeOverride = I18n.storedLocale;
    },

    setAlertThresholds(t) {
      this.alertThresholds = t;
      localStorage.setItem('vat_alertThresholds', JSON.stringify(t));
    },

    // ── Toast notifications ────────────────────────────────────────
    notify(message, type = 'info', duration = 3500) {
      const id = ++this._toastSeq;
      this.toasts.push({ id, message, type });
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id);
      }, duration);
    },

    dismissToast(id) {
      this.toasts = this.toasts.filter(t => t.id !== id);
    },

    // ── Backup nudge (30-day reminder) ────────────────────────────
    _checkBackupNudge() {
      const last = localStorage.getItem('vat_lastBackupReminder');
      const THIRTY_DAYS = 30 * 24 * 3600 * 1000;
      if (!last || Date.now() - Number(last) > THIRTY_DAYS) {
        this.showBackupNudge = true;
      }
    },

    dismissBackupNudge() {
      this.showBackupNudge = false;
      localStorage.setItem('vat_lastBackupReminder', String(Date.now()));
    },

    // ── EPC weekly refresh ─────────────────────────────────────────
    async _maybeUpdatePartsDb() {
      const last = localStorage.getItem('vat_partsDbChecked');
      const now  = Date.now();
      if (last && now - Number(last) < 7 * 24 * 3600 * 1000) return;
      try {
        await EPC.fetchAndCache();
        localStorage.setItem('vat_partsDbChecked', String(now));
      } catch (e) {
        // Fail silently on auto-check
      }
    },
  });
});
