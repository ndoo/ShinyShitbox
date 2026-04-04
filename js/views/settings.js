/**
 * settings.js — Settings view component.
 * Tabs: Vehicles | Preferences | Data
 */
document.addEventListener('alpine:init', () => {

  Alpine.data('settingsView', () => ({
    activeTab: 'vehicles',

    // ── Vehicle management ─────────────────────────────────────────
    vehicles: [],
    vehicleForm: { name: '', make: '', model: '', year: new Date().getFullYear(), vin: '', color: '#6b7280', notes: '' },
    vehicleFormError: '',

    async initSettings() {
      this.vehicles = await DB.getVehicles();
    },

    openAddVehicle() {
      this.vehicleForm = { name: '', make: '', model: '', year: new Date().getFullYear(), vin: '', color: '#6b7280', notes: '' };
      this.vehicleFormError = '';
      this.$nextTick(() => document.getElementById('vehicleModal').showModal());
    },

    openEditVehicle(v) {
      this.vehicleForm = { ...v };
      this.vehicleFormError = '';
      this.$nextTick(() => document.getElementById('vehicleModal').showModal());
    },

    async saveVehicle() {
      if (!this.vehicleForm.name.trim()) {
        this.vehicleFormError = 'Name is required.';
        return;
      }
      if (!this.vehicleForm.make.trim() || !this.vehicleForm.model.trim()) {
        this.vehicleFormError = 'Make and Model are required.';
        return;
      }
      if (!this.vehicleForm.year || this.vehicleForm.year < 1900) {
        this.vehicleFormError = 'Enter a valid year.';
        return;
      }
      const data = { ...this.vehicleForm };
      if (data.id) {
        await DB.updateVehicle(data.id, data);
        Alpine.store('app').notify('Vehicle updated.', 'success');
      } else {
        delete data.id;
        const id = await DB.addVehicle(data);
        Alpine.store('app').selectVehicle(id);
        Alpine.store('app').notify('Vehicle added.', 'success');
      }
      await Alpine.store('app').loadVehicles();
      this.vehicles = await DB.getVehicles();
      document.getElementById('vehicleModal').close();
      this.vehicleForm = null;
    },

    async confirmDeleteVehicle(v) {
      if (!confirm(`Delete "${v.name}" and all its records? This cannot be undone.`)) return;
      await DB.deleteVehicle(v.id);
      await Alpine.store('app').loadVehicles();
      this.vehicles = await DB.getVehicles();
      if (Alpine.store('app').currentVehicleId === v.id) {
        const remaining = Alpine.store('app').vehicles;
        Alpine.store('app').selectVehicle(remaining.length ? remaining[0].id : null);
      }
      Alpine.store('app').notify('Vehicle deleted.', 'info');
    },

    // ── Preferences ────────────────────────────────────────────────
    currencies: ['AUD','USD','EUR','GBP','CAD','NZD','JPY','SGD','MYR','THB','IDR','PHP'],

    get distanceUnit() { return Alpine.store('app').distanceUnit; },
    get currency()     { return Alpine.store('app').currency; },
    set currency(v)    { Alpine.store('app').setCurrency(v); },
    get theme()        { return Alpine.store('app').theme; },

    setUnit(u)       { Alpine.store('app').setDistanceUnit(u); },
    setCurrency(c)   { Alpine.store('app').setCurrency(c); },
    setTheme(t)      { Alpine.store('app').setTheme(t); },

    // ── Alert thresholds ───────────────────────────────────────────
    get alertThresholds() { return Alpine.store('app').alertThresholds; },
    setAlertThreshold(key, value) {
      const v = Number(value);
      if (!isNaN(v) && v > 0) {
        Alpine.store('app').setAlertThresholds({ ...Alpine.store('app').alertThresholds, [key]: v });
      }
    },

    // ── Data management ────────────────────────────────────────────
    importError: '',
    importSuccess: '',
    epcStatus: '',

    async exportData() {
      try {
        const blob = await DB.exportDB();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `vehicle-tracker-backup-${Utils.toISODate(new Date())}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Alpine.store('app').notify('Database exported.', 'success');
        Alpine.store('app').dismissBackupNudge(); // reset 30-day reminder
      } catch (e) {
        Alpine.store('app').notify('Export failed: ' + e.message, 'error');
      }
    },

    async importData(event) {
      this.importError = '';
      this.importSuccess = '';
      const file = event.target.files[0];
      if (!file) return;
      if (!confirm('This will OVERWRITE all existing data. Are you sure?')) {
        event.target.value = '';
        return;
      }
      try {
        const blob = new Blob([await file.arrayBuffer()], { type: 'application/json' });
        await DB.importDBFromBlob(blob);
        this.importSuccess = 'Import successful. Reloading…';
        await Alpine.store('app').loadVehicles();
        this.vehicles = await DB.getVehicles();
        Alpine.store('app').notify('Database imported successfully.', 'success');
        setTimeout(() => location.reload(), 1200);
      } catch (e) {
        this.importError = 'Import failed: ' + e.message;
      }
      event.target.value = '';
    },

    async clearAllData() {
      const first = confirm('This will permanently delete ALL vehicles, parts, and odometer records. Continue?');
      if (!first) return;
      const second = confirm('Are you absolutely sure? This CANNOT be undone.');
      if (!second) return;
      await DB._db.delete();
      location.reload();
    },

    async checkPartsDbUpdate() {
      this.epcStatus = 'Checking for updates…';
      try {
        const result = await EPC.fetchAndCache({ force: true });
        this.epcStatus = result.updated
          ? `Updated to ${result.version}.`
          : `Already up to date (${result.version}).`;
        localStorage.setItem('vat_partsDbChecked', String(Date.now()));
      } catch (e) {
        this.epcStatus = 'Update failed: ' + e.message;
      }
    },

    partsDbVersion: 'Loading…',
    async refreshPartsDbVersion() {
      // If not yet cached, attempt a fetch first (handles first-run on a local server)
      let cached = await DB.getPartsDbCache();
      if (!cached) {
        try { await EPC.fetchAndCache(); cached = await DB.getPartsDbCache(); } catch (e) { /* ignore */ }
      }
      this.partsDbVersion = cached ? cached.version : 'Not loaded';
    },
  }));
});
