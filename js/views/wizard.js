/**
 * wizard.js — 3-step part replacement wizard.
 *
 * Step 1: Part type + date (outgoing part matching, nudge chips, EPC lookup)
 * Step 2: Service details (odometer, outgoing condition, new part info, intervals)
 * Step 3: Review & save
 */
document.addEventListener('alpine:init', () => {

  Alpine.data('wizardView', () => ({
    step: 1,
    saving: false,
    saveError: '',
    editMode:   false,
    editPartId: null,

    // ── Step 1 ───────────────────────────────────────────────────
    partTypeSearch: '',
    partTypes: [],
    filteredPartTypes: [],
    selectedPartType: null,
    installDate: '',
    // Outgoing part matching
    outgoingCandidates: [],
    selectedOutgoingId: null,   // null = no outgoing (new addition)
    showNewPartTypeForm: false,
    newPartTypeForm: {
      name: '', category: 'engine', customCategory: '',
      isFluid: false, defaultKmInterval: '', defaultDaysInterval: ''
    },
    newPartTypeCategories: [
      'engine','transmission','brakes','suspension','steering',
      'cooling','fuel','electrical','exhaust','body','tyres',
      'filters','interior','lighting','other'
    ],
    // Nudge items
    nudgeItems: [],
    // EPC
    epcLoading: false,
    epcData: null,

    // ── Step 2 (combined service details) ────────────────────────
    odometerInput: '',
    odometerSuggested: null,
    outgoingCondition: 50,
    outgoingConditionNotes: '',
    partSource: 'oem-genuine',
    brand: '',
    partNumber: '',
    grade: '',          // single field: variant label OR fluid subtype [+ grade]
    _fluidSubtype: '',  // UI-only temp state for fluid two-dropdown UX
    _fluidGrade: '',
    partCost: '',
    labourCost: '',
    showLabourCost: false,
    notes: '',
    kmInterval: '',
    daysIntervalYears:  0,
    daysIntervalMonths: 0,
    intervalScope: 'install-only',  // 'install-only' | 'update-default'
    intervalSource: '',

    // ── Init ─────────────────────────────────────────────────────
    async initWizard() {
      // Re-run full reset whenever the wizard view becomes active (handles
      // returning to the wizard after a previous completed save).
      Alpine.effect(() => {
        const view   = Alpine.store('app').currentView;
        const params = Alpine.store('app').viewParams;
        if (view === 'wizard') {
          this._resetAndInit(params);
        }
      });
    },

    async _resetAndInit(params = {}) {
      // ── Reset all step data ──────────────────────────────────────
      this.step                = 1;
      this.saving              = false;
      this.saveError           = '';
      this.editMode            = false;
      this.editPartId          = null;
      this.installDate         = Utils.toISODate(new Date());
      this.partTypeSearch      = '';
      this.filteredPartTypes   = [];
      this.selectedPartType    = null;
      this.outgoingCandidates  = [];
      this.selectedOutgoingId  = null;
      this.showNewPartTypeForm = false;
      this.newPartTypeForm     = { name: '', category: 'engine', customCategory: '', isFluid: false, defaultKmInterval: '', defaultDaysInterval: '' };
      this.nudgeItems          = [];
      this.epcLoading          = false;
      this.epcData             = null;
      this.odometerInput           = '';
      this.odometerSuggested       = null;
      this.outgoingCondition      = 50;
      this.outgoingConditionNotes = '';
      this.partSource          = 'oem-genuine';
      this.brand               = '';
      this.partNumber          = '';
      this.grade               = '';
      this._fluidSubtype       = '';
      this._fluidGrade         = '';
      this.partCost            = '';
      this.labourCost          = '';
      this.showLabourCost      = false;
      this.notes               = '';
      this.kmInterval          = '';
      this.daysIntervalYears   = 0;
      this.daysIntervalMonths  = 0;
      this.intervalScope       = 'install-only';
      this.intervalSource      = '';

      this.partTypes = await DB.getPartTypes();

      // Edit mode: pre-fill from existing record and skip to step 2
      if (params.editPartId) {
        const part = await DB.getPartRecord(Number(params.editPartId));
        if (part) {
          this.editMode   = true;
          this.editPartId = part.id;
          const pt = this.partTypes.find(p => p.id === part.partTypeId);
          if (pt) this.selectedPartType = pt;
          this.installDate         = part.installDate || Utils.toISODate(new Date());
          this.partSource          = (part.partSource === 'oem-brand' ? 'aftermarket' : part.partSource) || 'oem-genuine';
          this.brand               = part.brand        || '';
          this.partNumber          = part.partNumber   || '';
          this.grade               = part.grade        || '';
          this.partCost            = part.partCost   != null ? String(part.partCost)   : '';
          this.labourCost          = part.labourCost != null ? String(part.labourCost) : '';
          this.notes               = part.notes        || '';
          this.kmInterval          = part.expectedKmInterval != null ? String(part.expectedKmInterval) : '';
          this._setDaysInterval(part.expectedDaysInterval);
          this.step = 2;
        }
        this._filterPartTypes();
        return;
      }

      // Pre-select part type if passed via URL params
      if (params.partTypeId) {
        const pt = this.partTypes.find(p => p.id === Number(params.partTypeId));
        if (pt) { await this._selectPartType(pt); }
      }

      this._filterPartTypes();
      await this._loadNudges();
    },

    // ── Step 1 helpers ───────────────────────────────────────────
    _filterPartTypes() {
      const q = (this.partTypeSearch || '').toLowerCase().trim();
      this.filteredPartTypes = q
        ? this.partTypes.filter(p => p.name.toLowerCase().includes(q))
        : this.partTypes;
    },

    async _selectPartType(pt) {
      this.selectedPartType = pt;
      this.partTypeSearch   = pt.name;
      this.filteredPartTypes = [];
      await this._findOutgoingCandidates(pt);
      await this._triggerEpcLookup(pt);
      this._prefillIntervals(pt, null);
    },

    async _findOutgoingCandidates(pt) {
      const vehicleId = Alpine.store('app').currentVehicleId;
      if (!vehicleId) return;
      const activeParts = await DB.getActivePartsForVehicle(vehicleId);
      this.outgoingCandidates = Utils.findOutgoingCandidates(pt, activeParts);

      // Auto-select the best exact match (same partTypeId = score 3+).
      // Multiple exact matches means accidental duplicates already exist — pick the most recent.
      const exactMatches = this.outgoingCandidates.filter(c => c._matchScore >= 3);
      if (exactMatches.length > 0) {
        // Most recently installed first
        exactMatches.sort((a, b) => (b.installDate || '').localeCompare(a.installDate || ''));
        this.selectedOutgoingId = exactMatches[0].id;
      } else {
        this.selectedOutgoingId = null;
      }
    },

    get exactMatchCandidates() {
      return this.outgoingCandidates.filter(c => c._matchScore >= 3);
    },

    async _loadNudges() {
      const vehicleId = Alpine.store('app').currentVehicleId;
      if (!vehicleId) return;
      const readings    = await DB.getOdometerHistory(vehicleId);
      const latest      = readings.length ? readings[readings.length - 1] : null;
      const activeParts = await DB.getActivePartsForVehicle(vehicleId);
      const now        = new Date();
      const thresholds = Alpine.store('app').alertThresholds;
      this.nudgeItems = activeParts
        .map(p => ({ ...p, _due: Utils.estimateDue(p, latest?.odometer, readings, now, thresholds) }))
        .filter(p => ['overdue', 'due-soon'].includes(p._due.urgency))
        .filter(p => !this.selectedPartType || p.partTypeId !== this.selectedPartType.id)
        .sort((a, b) => (a._due.urgency === 'overdue' ? -1 : 1))
        .slice(0, 4);
    },

    async _triggerEpcLookup(pt) {
      const vehicle = Alpine.store('app').currentVehicle;
      if (!vehicle || !pt) return;
      this.epcLoading = true;
      this.epcData    = null;
      try {
        this.epcData = await EPC.lookup(vehicle, pt, this.grade || null);
        if (this.epcData) {
          // Pre-fill part number if suggested
          if (!this.partNumber && this.epcData.partNumbers?.length) {
            this.partNumber = this.epcData.partNumbers[0].partNumber;
          }
          // Refill intervals from EPC
          this._prefillIntervals(pt, this.epcData);
        }
      } catch (e) {
        // Fail silently
      } finally {
        this.epcLoading = false;
      }
    },

    // daysInterval is computed from years+months inputs (stored internally as days)
    get daysInterval() {
      const y = Number(this.daysIntervalYears  || 0);
      const m = Number(this.daysIntervalMonths || 0);
      const total = y * 365 + m * 30;
      return total > 0 ? String(total) : '';
    },

    // Decompose a days value into { years, months } for the UI inputs
    _decomposeDays(totalDays) {
      if (!totalDays) return { years: 0, months: 0 };
      const d = Math.round(Number(totalDays));
      if (d >= 365) {
        const y = Math.floor(d / 365);
        const rem = d - y * 365;
        let m = Math.round(rem / 30);
        if (m >= 12) return { years: y + 1, months: 0 };
        return { years: y, months: m };
      }
      return { years: 0, months: Math.round(d / 30) };
    },

    _setDaysInterval(val) {
      const { years, months } = this._decomposeDays(val);
      this.daysIntervalYears  = years;
      this.daysIntervalMonths = months;
    },

    _prefillIntervals(pt, epcData) {
      if (epcData?.maintenance) {
        this.kmInterval = epcData.maintenance.kmInterval ?? pt.defaultKmInterval ?? '';
        this._setDaysInterval(epcData.maintenance.daysInterval ?? pt.defaultDaysInterval);
        this.intervalSource = epcData.maintenance.kmInterval ? 'intervalSrc.epc' : 'intervalSrc.default';
      } else {
        this.kmInterval = pt.defaultKmInterval ?? '';
        this._setDaysInterval(pt.defaultDaysInterval);
        this.intervalSource = pt.defaultKmInterval ? 'intervalSrc.partType' : '';
      }
      // If a variant is already selected (e.g. edit flow), apply its intervals on top
      if (this.grade) this._applyVariantIntervals();
      // Also check last partRecord for this part type on this vehicle
      this._prefillFromHistory(pt);
    },

    async _prefillFromHistory(pt) {
      const vehicleId = Alpine.store('app').currentVehicleId;
      if (!vehicleId || !pt) return;
      const history = await DB.getPartHistory(vehicleId, pt.id);
      if (!history.length) return;
      const last = history[history.length - 1];
      if (last.expectedKmInterval   != null) { this.kmInterval = last.expectedKmInterval; this.intervalSource = 'intervalSrc.history'; }
      if (last.expectedDaysInterval != null) { this._setDaysInterval(last.expectedDaysInterval); this.intervalSource = 'intervalSrc.history'; }
    },

    async saveNewPartType() {
      const f = this.newPartTypeForm;
      if (!f.name.trim()) return;
      const category = f.category === 'custom' ? f.customCategory : f.category;
      const id = await DB.addPartType({
        name:                f.name.trim(),
        category,
        defaultKmInterval:   f.defaultKmInterval   ? Number(f.defaultKmInterval)   : null,
        defaultDaysInterval: f.defaultDaysInterval ? Number(f.defaultDaysInterval) : null,
        isFluid:             f.isFluid,
        fluidOptions:        f.isFluid ? { subtypes: [], grades: [], dotRatings: [] } : null,
      });
      this.partTypes = await DB.getPartTypes();
      const newPt = this.partTypes.find(p => p.id === id);
      if (newPt) await this._selectPartType(newPt);
      this.showNewPartTypeForm = false;
      this.newPartTypeForm = { name: '', category: 'engine', customCategory: '', isFluid: false, defaultKmInterval: '', defaultDaysInterval: '' };
    },

    // ── Step 2 helpers ───────────────────────────────────────────
    async initStep2() {
      const vehicleId = Alpine.store('app').currentVehicleId;
      const readings  = await DB.getOdometerHistory(vehicleId);
      const latest    = readings.length ? readings[readings.length - 1] : null;

      if (readings.length >= 2) {
        // Interpolate odometer at the exact service date — more accurate than latest reading
        const interpolated = Utils.interpolateOdometer(readings, this.installDate);
        this.odometerSuggested = interpolated != null ? {
          odometer:       interpolated,
          isInterpolated: true,
        } : null;
      } else {
        // Only one reading available — use it as-is
        this.odometerSuggested = latest ? { odometer: latest.odometer, isInterpolated: false } : null;
      }

      // Do NOT auto-fill odometerInput — leave it blank so we only record an
      // odometer on the part when the user explicitly enters or accepts a value.
    },

    useLatestOdometer() {
      if (this.odometerSuggested) {
        this.odometerInput          = String(this.odometerSuggested.odometer);
      }
    },

    // ── Step 3 helpers ───────────────────────────────────────────
    get outgoingPart() {
      if (!this.selectedOutgoingId) return null;
      return this.outgoingCandidates.find(p => p.id === this.selectedOutgoingId) || null;
    },

    setConditionPreset(pct) {
      this.outgoingCondition = pct;
    },

    conditionPresets: Utils.CONDITION_PRESETS,

    // ── Step 5 helpers ───────────────────────────────────────────
    get intervalScopeIsInstallOnly() { return this.intervalScope === 'install-only'; },

    updateIntervalScope(e) {
      this.intervalScope = e.target.value;
    },

    _autoSetScope() {
      const pt = this.selectedPartType;
      if (!pt) return;
      if (Utils.shouldDefaultToInstallOnly(
        this.kmInterval   ? Number(this.kmInterval)   : null,
        this.daysInterval ? Number(this.daysInterval) : null, pt)) {
        this.intervalScope = 'install-only';
      }
    },

    // ── Step navigation ──────────────────────────────────────────
    get canProceed() {
      if (this.step === 1) return !!this.selectedPartType && !!this.installDate;
      if (this.step === 2) {
        if (this.editMode) return !!this.installDate;
        const needsBrand = this.partSource === 'aftermarket';
        return (!needsBrand || !!this.brand.trim()) &&
               (this.kmInterval !== '' || this.daysInterval !== '');
      }
      return true;
    },

    async goNext() {
      if (!this.canProceed) return;
      if (this.step === 1) {
        await this.initStep2();
        this._autoSetScope();
      }
      this.step = Math.min(this.step + 1, 3);
    },

    goPrev() {
      if (this.editMode && this.step === 2) {
        Alpine.store('app').navigate('vehicle-detail');
        return;
      }
      this.step = Math.max(this.step - 1, 1);
    },

    // ── Review computed ──────────────────────────────────────────
    get reviewNextDue() {
      const km   = this.kmInterval   ? Number(this.kmInterval)   : null;
      const days = this.daysInterval ? Number(this.daysInterval) : null;
      const odo  = this.odometerInput ? Number(this.odometerInput) : null;
      const parts = [];
      if (km && odo)   parts.push(Utils.formatDistance(odo + km, Alpine.store('app').distanceUnit));
      if (days)        parts.push(`${Utils.formatDate(Utils.addDays(this.installDate, days))}`);
      return parts.length ? parts.join(' / ') : '—';
    },

    // ── Save ─────────────────────────────────────────────────────
    async save() {
      // Edit mode: update existing record fields, skip replacement logic
      if (this.editMode) {
        this.saving = true;
        this.saveError = '';
        try {
          await DB.updatePartRecord(this.editPartId, {
            partName:             this.selectedPartType?.name || '',
            installDate:          this.installDate,
            partSource:           this.partSource   || null,
            brand:                this.brand         || null,
            partNumber:           this.partNumber    || null,
            grade:                this.grade         || null,
            partCost:             this.partCost    !== '' ? Number(this.partCost)    : null,
            labourCost:           this.labourCost  !== '' ? Number(this.labourCost)  : null,
            expectedKmInterval:   this.kmInterval    ? Number(this.kmInterval)    : null,
            expectedDaysInterval: this.daysInterval  ? Number(this.daysInterval)  : null,
            notes:                this.notes         || null,
          });
          await DB.reinterpolateOdometers(Alpine.store('app').currentVehicleId);
          Alpine.store('app').notify(I18n.t('notif.partUpdated'), 'success');
          Alpine.store('app').navigate('vehicle-detail');
          window.dispatchEvent(new CustomEvent('vehicle-changed'));
        } catch (e) {
          this.saveError = I18n.t('err.saveFailed') + ' ' + e.message;
        } finally {
          this.saving = false;
        }
        return;
      }

      // Guard: exact-match outgoing parts exist but user chose "new addition" — confirm intent
      if (this.exactMatchCandidates.length > 0 && this.selectedOutgoingId === null) {
        const names = this.exactMatchCandidates.map(c => c.partName).join(', ');
        const ok = confirm(I18n.t('confirm.duplicatePart', { names }));
        if (!ok) return;
      }

      this.saving    = true;
      this.saveError = '';
      try {
        const vehicleId = Alpine.store('app').currentVehicleId;
        const odo       = this.odometerInput ? Number(this.odometerInput) : null;

        // Warn if an odometer reading already exists on this date
        if (odo) {
          const history  = await DB.getOdometerHistory(vehicleId);
          const existing = history.find(r => r.date === this.installDate);
          if (existing) {
            const existingFmt = Utils.formatDistance(existing.odometer, Alpine.store('app').distanceUnit);
            const newFmt      = Utils.formatDistance(odo, Alpine.store('app').distanceUnit);
            const ok = confirm(I18n.t('confirm.replaceOdo', { existing: existingFmt, date: Utils.formatDate(this.installDate), new: newFmt }));
            if (!ok) { this.saving = false; return; }
          }
        }

        const newPartData = {
          vehicleId,
          partTypeId:             this.selectedPartType.id,
          partName:               this.selectedPartType.name,
          installDate:            this.installDate,
          installOdometer:        odo,
          partSource:          this.partSource,
          brand:               this.brand      || null,
          partNumber:          this.partNumber  || null,
          grade:               this.grade       || null,
          partCost:            this.partCost   !== '' ? Number(this.partCost)   : null,
          labourCost:          this.labourCost !== '' ? Number(this.labourCost) : null,
          expectedKmInterval:  this.kmInterval   ? Number(this.kmInterval)   : null,
          expectedDaysInterval:this.daysInterval ? Number(this.daysInterval) : null,
          notes:               this.notes || null,
          removalDate:         null,
          removalOdometer:     null,
          conditionAtRemoval:  null,
          conditionNotes:      null,
          replacedByPartId:    null,
        };

        const removalData = this.outgoingPart ? {
          removalDate:        this.installDate,
          removalOdometer:    odo,
          conditionAtRemoval: this.outgoingCondition,
          conditionNotes:     this.outgoingConditionNotes || null,
        } : null;

        const odometerData = odo ? {
          vehicleId,
          date:     this.installDate,
          odometer: odo,
          source:   'from-service',
          notes:    null,
        } : null;

        await DB.savePartReplacement({
          outgoingPartId:        this.outgoingPart?.id ?? null,
          removalData,
          newPartData,
          odometerData,
          updatePartTypeInterval: this.intervalScope === 'update-default',
        });

        // Backfill any null odometer values that now have readings spanning them
        await DB.reinterpolateOdometers(vehicleId);

        Alpine.store('app').notify(I18n.t('notif.partRecorded', { name: this.selectedPartType.name }), 'success');
        Alpine.store('app').navigate('vehicle-detail');
        // Trigger vehicle-detail to reload its data
        window.dispatchEvent(new CustomEvent('vehicle-changed'));
      } catch (e) {
        this.saveError = I18n.t('err.saveFailed') + ' ' + e.message;
      } finally {
        this.saving = false;
      }
    },

    // ── Display helpers ──────────────────────────────────────────
    get hasFluidOptions() {
      return this.selectedPartType?.isFluid && this.selectedPartType?.fluidOptions?.subtypes?.length;
    },
    get fluidSubtypes() { return this.selectedPartType?.fluidOptions?.subtypes || []; },
    get fluidGrades()   { return this.selectedPartType?.fluidOptions?.grades   || []; },

    get partVariants()  { return this.selectedPartType?.variants || []; },
    get hasVariants()   { return this.partVariants.length > 0; },

    // Combine fluid subtype + grade dropdowns into the single grade field.
    _syncFluidGrade() {
      const parts = [this._fluidSubtype, this._fluidGrade].filter(Boolean);
      this.grade = parts.join(' ');
    },

    // Called when user picks a variant — writes to grade and pre-fills intervals.
    _applyVariantIntervals() {
      if (!this.grade) return;
      const epcVariant = this.epcData?.maintenance?.variants?.[this.grade];
      if (epcVariant) {
        this.kmInterval = epcVariant.kmInterval ?? this.kmInterval;
        if (epcVariant.daysInterval) this._setDaysInterval(epcVariant.daysInterval);
        this.intervalSource = 'intervalSrc.epc';
        return;
      }
      const ptVariant = this.partVariants.find(v => v.label === this.grade);
      if (ptVariant) {
        this.kmInterval = ptVariant.kmInterval ?? this.kmInterval;
        if (ptVariant.daysInterval) this._setDaysInterval(ptVariant.daysInterval);
        this.intervalSource = 'intervalSrc.variant';
      }
    },

    sourceLabel(s) {
      return s ? I18n.t('source.' + s) : s;
    },
    fmt(km)     { return Utils.formatDistance(km, Alpine.store('app').distanceUnit); },
    fmtDate(d)  { return Utils.formatDate(d); },
    fmtCur(a)   { return Utils.formatCurrency(a, Alpine.store('app').currency); },
    fmtDue(due) { return Utils.formatDueDescription(due, Alpine.store('app').distanceUnit); },
    urgBadge(u) { return Utils.urgencyBadgeClass(u); },
    urgLabel(u) { return Utils.urgencyLabel(u); },
  }));
});
