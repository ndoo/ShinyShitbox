/**
 * vehicle-detail.js — Vehicle detail view component.
 * Shows odometer history chart, parts grid grouped by category,
 * and provides the odometer entry modal.
 */
document.addEventListener('alpine:init', () => {

  const FIXED_COLUMNS = [
    { key: 'due',         labelKey: 'col.remaining',   visible: true },
    { key: 'installDate', labelKey: 'col.installDate',  visible: true },
    { key: 'brand',       labelKey: 'col.brand',        visible: true },
    { key: 'grade',       labelKey: 'col.grade',        visible: true },
  ];

  Alpine.data('vehicleDetailView', () => ({
    vehicle: null,
    odometerHistory: [],
    activeParts: [],
    partsByCategory: {},
    latestOdometer: null,
    forecastedOdometer: null,
    _odomChart: null,
    _chartRetryTimer: null,
    _loadSeq: 0,
    tableColumns: [],

    // Odometer history list + inline edit
    showOdoList: false,
    editingOdoId: null,
    editOdoForm: { date: '', odometer: '', notes: '' },
    editOdoError: '',


    async initVehicleDetail() {
      this.tableColumns = FIXED_COLUMNS;
      // Re-load whenever this view becomes the active view, or the vehicle changes.
      Alpine.effect(() => {
        const view = Alpine.store('app').currentView;
        const vid  = Alpine.store('app').currentVehicleId;
        if (view === 'vehicle-detail' && vid) {
          this.loadAll(vid);
        }
      });
      // Refresh after quickOdoModal saves (or any other external data change)
      window.addEventListener('vehicle-changed', () => {
        if (Alpine.store('app').currentView === 'vehicle-detail' && Alpine.store('app').currentVehicleId) {
          this.loadAll(Alpine.store('app').currentVehicleId);
        }
      });
    },

    async loadAll(vehicleId) {
      // Generation counter: if a newer loadAll call starts while this one is
      // still awaiting DB queries, the earlier call exits without rendering.
      // This prevents two concurrent loads (e.g. from Alpine.effect + vehicle-changed
      // event both firing on navigation) from double-rendering and trashing the chart.
      const seq = ++this._loadSeq;

      this.vehicle         = Alpine.store('app').currentVehicle;
      this.odometerHistory = await DB.getOdometerHistory(vehicleId);
      if (seq !== this._loadSeq) return;  // superseded

      this.latestOdometer  = this.odometerHistory.length
        ? this.odometerHistory[this.odometerHistory.length - 1] : null;

      // Compute ephemeral forecasted odometer for today based on rolling daily rate.
      // Never persisted — used only for condition/chart display.
      const _rate = Utils.dailyKmRate(this.odometerHistory);
      const _daysSinceLast = (_rate && this.latestOdometer)
        ? Utils.daysBetween(this.latestOdometer.date, new Date()) : 0;
      this.forecastedOdometer = (_rate && _rate > 0 && _daysSinceLast > 0)
        ? Math.round(this.latestOdometer.odometer + _rate * _daysSinceLast)
        : null;

      // Backfill / refresh interpolated odometers on every load so that legacy
      // records (saved before source-tracking) and any stale values are corrected.
      await DB.reinterpolateOdometers(vehicleId);
      if (seq !== this._loadSeq) return;  // superseded

      this.activeParts     = await DB.getActivePartsForVehicle(vehicleId);
      if (seq !== this._loadSeq) return;  // superseded

      this._buildPartsByCategory();
      this.$nextTick(() => this._renderChart());
    },

    _buildPartsByCategory() {
      const grouped    = {};
      const now        = new Date();
      const thresholds = Alpine.store('app').alertThresholds;

      for (const part of this.activeParts) {
        const cat = part._partType?.category || 'other';
        if (!grouped[cat]) grouped[cat] = [];
        const currentOdo = this.forecastedOdometer ?? this.latestOdometer?.odometer;
        const condition = Utils.estimateCurrentCondition(part, currentOdo, now);
        const due = Utils.estimateDue(part, currentOdo, this.odometerHistory, now, thresholds);
        grouped[cat].push({ ...part, _condition: condition, _due: due });
      }

      // Sort each group by urgency (overdue first)
      const urgencyOrder = { overdue: 0, 'due-soon': 1, upcoming: 2, ok: 3 };
      for (const cat of Object.keys(grouped)) {
        grouped[cat].sort((a, b) =>
          (urgencyOrder[a._due.urgency] || 3) - (urgencyOrder[b._due.urgency] || 3));
      }
      this.partsByCategory = grouped;
    },

    get categoryList() {
      return Object.keys(this.partsByCategory).sort();
    },

    // Flat list of { _type: 'category', cat } | { _type: 'part', ...partFields }
    // Used by the table to avoid invalid nested <tbody> elements.
    get flatPartsList() {
      const rows = [];
      for (const cat of this.categoryList) {
        rows.push({ _type: 'category', _cat: cat, id: 'cat-' + cat });
        for (const part of (this.partsByCategory[cat] || [])) {
          rows.push({ _type: 'part', ...part });
        }
      }
      return rows;
    },

    get visibleColumns() {
      return this.tableColumns.filter(c => c.visible);
    },

    // ── Table cell rendering ──────────────────────────────────────
    _esc(str) {
      return String(str ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },

    renderCell(key, part) {
      const esc = s => this._esc(s);
      switch (key) {
        case 'condition': {
          if (part._condition == null) return '<span class="opacity-40 text-xs">—</span>';
          const v          = part._condition.value ?? part._condition;
          const pct        = Math.round(v);
          const colorClass = this.conditionColor(pct);
          const rawTip     = part._condition.tooltip || '';
          const tipText    = rawTip ? `${pct}% \u2014 ${rawTip}` : `${pct}%`;
          const pie        = this.conditionPie(pct, colorClass);
          return `<div class="tooltip tooltip-right" data-tip="${esc(tipText)}">`
               + `<div class="flex items-center">${pie}</div>`
               + `</div>`;
        }
        case 'due':
          return `<span class="text-xs whitespace-nowrap">${esc(this.fmtDue(part._due))}</span>`;
        case 'installOdo':
          return part.installOdometer
            ? `<span class="text-xs tabular-nums">${esc(this.fmt(part.installOdometer))}</span>`
            : '<span class="opacity-40 text-xs">—</span>';
        case 'installDate':
          return part.installDate
            ? `<span class="text-xs whitespace-nowrap">${esc(this.fmtDate(part.installDate))}</span>`
            : '<span class="opacity-40 text-xs">—</span>';
        case 'brand':
          return part.brand
            ? `<span class="text-xs">${esc(part.brand)}</span>`
            : '<span class="opacity-40 text-xs">—</span>';
        case 'source': {
          const srcLabel = part.partSource ? I18n.t('source.' + part.partSource) : null;
          return srcLabel
            ? `<span class="badge badge-ghost badge-xs">${esc(srcLabel)}</span>`
            : '<span class="opacity-40 text-xs">—</span>';
        }
        case 'grade': {
          if (!part.grade) return '<span class="opacity-40 text-xs">—</span>';
          return `<span class="text-xs whitespace-nowrap">${esc(part.grade)}</span>`;
        }
        case 'partNumber':
          return part.partNumber
            ? `<code class="text-xs font-mono">${esc(part.partNumber)}</code>`
            : '<span class="opacity-40 text-xs">—</span>';
        case 'kmInterval':
          return part.expectedKmInterval
            ? `<span class="text-xs tabular-nums">${esc(this.fmt(part.expectedKmInterval))}</span>`
            : '<span class="opacity-40 text-xs">—</span>';
        case 'daysInterval':
          return part.expectedDaysInterval
            ? `<span class="text-xs tabular-nums">${Utils.formatDuration(part.expectedDaysInterval)}</span>`
            : '<span class="opacity-40 text-xs">—</span>';
        case 'cost': {
          const total = (part.partCost ?? 0) + (part.labourCost ?? 0);
          return (part.partCost != null || part.labourCost != null)
            ? `<span class="text-xs tabular-nums">${esc(this.fmtCur(total))}</span>`
            : '<span class="opacity-40 text-xs">—</span>';
        }
        default:
          return '—';
      }
    },

    conditionPie(pct, colorClass) {
      const colorMap = {
        'condition-bar-good':     '#22c55e',
        'condition-bar-warning':  '#f59e0b',
        'condition-bar-critical': '#ef4444',
        'condition-bar-unknown':  '#9ca3af',
      };
      const fill = colorMap[colorClass] || '#9ca3af';
      const cx = 9, cy = 9, r = 7;
      const bg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#d1d5db"/>`;
      if (pct <= 0) {
        return `<svg width="18" height="18" viewBox="0 0 18 18">${bg}</svg>`;
      }
      if (pct >= 100) {
        return `<svg width="18" height="18" viewBox="0 0 18 18">${bg}<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/></svg>`;
      }
      // Colored arc starts after the depleted (used) portion and runs clockwise back to 12
      const usedAngle = ((100 - pct) / 100) * 2 * Math.PI;
      const startX = cx + r * Math.sin(usedAngle);
      const startY = cy - r * Math.cos(usedAngle);
      const large  = pct > 50 ? 1 : 0;
      const d = `M ${cx} ${cy} L ${startX.toFixed(3)} ${startY.toFixed(3)} A ${r} ${r} 0 ${large} 1 ${cx} ${cy - r} Z`;
      return `<svg width="18" height="18" viewBox="0 0 18 18">${bg}<path d="${d}" fill="${fill}"/></svg>`;
    },

    conditionColor(pct) {
      const t     = Alpine.store('app').alertThresholds;
      const amber = t.conditionAmber ?? 10;
      const red   = t.conditionRed   ?? 5;
      if (pct == null)   return 'condition-bar-unknown';
      if (pct >= amber)  return 'condition-bar-good';
      if (pct >= red)    return 'condition-bar-warning';
      return                    'condition-bar-critical';
    },

    // ── Odometer chart ────────────────────────────────────────────
    _renderChart() {
      // Cancel any previously-scheduled retry so multiple rapid calls don't pile up.
      clearTimeout(this._chartRetryTimer);
      this._chartRetryTimer = null;

      const canvas = document.getElementById('odomChart');
      if (!canvas || this.odometerHistory.length < 2) return;

      // The canvas is inside nested x-show elements. Alpine may not have finished
      // applying display:none → block before this call. If it has no layout width
      // yet, schedule exactly one retry; the clearTimeout above ensures earlier
      // retries are cancelled so they can't pile up.
      if (canvas.offsetWidth === 0) {
        this._chartRetryTimer = setTimeout(() => this._renderChart(), 60);
        return;
      }

      // Destroy any existing instance — use Chart.getChart() as a safety net so
      // orphaned instances (where _odomChart lost sync) don't cause "canvas in use" errors.
      const existing = Chart.getChart(canvas);
      if (existing) existing.destroy();
      this._odomChart = null;

      // Plot only actual readings as {x: timestamp, y: odometer} so the X axis
      // is proportional to real time — gaps between readings are shown accurately.
      const sorted = [...this.odometerHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
      const isMiles = Alpine.store('app').distanceUnit === 'miles';
      const toDisplay = v => isMiles ? Math.round(v * 0.621371) : v;
      const data = sorted.map(r => ({
        x: new Date(r.date).getTime(),
        y: toDisplay(r.odometer),
      }));

      // Build optional forecast dataset: dotted segment from last real reading → today.
      const todayTs = new Date().setHours(0, 0, 0, 0); // midnight today, stable timestamp
      const forecastDataset = this.forecastedOdometer ? {
        label: I18n.t('vd.chart.forecast'),
        data: [data[data.length - 1], { x: todayTs, y: toDisplay(this.forecastedOdometer) }],
        borderColor: 'hsl(217, 91%, 60%)',
        borderDash: [6, 4],
        borderWidth: 2,
        fill: false,
        tension: 0,
        pointRadius: [0, 6],
        pointHoverRadius: [0, 8],
        pointStyle: ['circle', 'circle'],
        pointBackgroundColor: ['transparent', 'transparent'],
        pointBorderColor: 'hsl(217, 91%, 60%)',
        pointBorderWidth: 2,
        hitRadius: 8,
      } : null;

      const xMax = this.forecastedOdometer ? todayTs : data[data.length - 1].x;

      this._odomChart = new Chart(canvas, {
        type: 'line',
        data: {
          datasets: [
            {
              label: `${I18n.t('vd.odoTable.odometer')} (${Alpine.store('app').distanceUnit})`,
              data,
              borderColor: 'hsl(217, 91%, 60%)',          // blue — canvas-safe hsl
              backgroundColor: 'hsla(217, 91%, 60%, 0.1)',
              tension: 0,        // linear segments — mathematically honest
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
              hitRadius: 8,
              borderWidth: 2,
            },
            ...(forecastDataset ? [forecastDataset] : []),
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              filter: item => !(item.datasetIndex === 1 && item.dataIndex === 0),
              callbacks: {
                label: ctx => {
                  const base = `${ctx.parsed.y.toLocaleString()} ${Alpine.store('app').distanceUnit}`;
                  return ctx.datasetIndex === 1 ? `${base} (${I18n.t('vd.chart.forecast')})` : base;
                },
              },
            },
          },
          scales: {
            x: {
              type: 'linear',
              min: data[0].x,
              max: xMax,
              afterBuildTicks(scale) {
                // One tick per actual reading so data points always land on a tick.
                // autoSkip will drop labels that would overlap if readings are dense.
                scale.ticks = data.map(pt => ({ value: pt.x }));
                if (forecastDataset) scale.ticks.push({ value: todayTs });
              },
              ticks: {
                autoSkip: true,
                autoSkipPadding: 16,
                maxRotation: 45,
                callback: val => {
                  const d = new Date(val);
                  const rangeDays = (xMax - data[0].x) / 86400000;
                  return rangeDays <= 270
                    ? d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
                    : d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
                },
              },
            },
            y: { ticks: { callback: v => v.toLocaleString() } },
          },
        },
      });
    },

    // ── Odometer list / inline edit ──────────────────────────────
    get sortedOdoHistory() {
      return [...this.odometerHistory].sort((a, b) => b.date.localeCompare(a.date));
    },

    startEditOdo(reading) {
      this.editingOdoId  = reading.id;
      this.editOdoForm   = { date: reading.date, odometer: reading.odometer, notes: reading.notes || '' };
      this.editOdoError  = '';
    },

    cancelEditOdo() {
      this.editingOdoId = null;
      this.editOdoError = '';
    },

    async saveEditOdo() {
      const odo = Number(this.editOdoForm.odometer);
      const vid = Alpine.store('app').currentVehicleId;
      if (!this.editOdoForm.date)  { this.editOdoError = I18n.t('err.dateRequired'); return; }
      if (!odo || odo <= 0)        { this.editOdoError = I18n.t('err.odoInvalid'); return; }
      const err = await DB.validateOdometerReading(vid, this.editOdoForm.date, odo, this.editingOdoId);
      if (err) { this.editOdoError = err; return; }
      await DB.updateOdometerReading(this.editingOdoId, {
        date: this.editOdoForm.date,
        odometer: odo,
        notes: this.editOdoForm.notes || null,
      });
      await DB.reinterpolateOdometers(vid);
      this.editingOdoId = null;
      Alpine.store('app').notify(I18n.t('notif.odoUpdated'), 'success');
      await this.loadAll(vid);
    },

    async deleteOdo(reading) {
      const label = `${this.fmtDate(reading.date)} — ${this.fmt(reading.odometer)}`;
      if (!confirm(I18n.t('confirm.deleteOdo', { label }))) return;
      const vid = Alpine.store('app').currentVehicleId;
      await DB.deleteOdometerReading(reading.id);
      await DB.reinterpolateOdometers(vid);
      Alpine.store('app').notify(I18n.t('notif.odoDeleted'), 'info');
      if (this.editingOdoId === reading.id) this.editingOdoId = null;
      await this.loadAll(vid);
    },

    // ── Navigation helpers ────────────────────────────────────────
    openWizardForEdit(part) {
      Alpine.store('app').navigate('wizard', { editPartId: part.id });
    },

    openWizardForPart(part) {
      Alpine.store('app').navigate('wizard', { partTypeId: part.partTypeId, vehicleId: Alpine.store('app').currentVehicleId });
    },

    openWizardNew() {
      Alpine.store('app').navigate('wizard', { vehicleId: Alpine.store('app').currentVehicleId });
    },

    async deletePartRecord(part) {
      const label = part.partName + (part.installDate ? ` (${I18n.t('label.installed')} ${Utils.formatDate(part.installDate)})` : '');
      if (!confirm(I18n.t('confirm.deletePart', { label }))) return;
      await DB.deletePartRecord(part.id);
      Alpine.store('app').notify(I18n.t('notif.partDeleted'), 'info');
      await this.loadAll(Alpine.store('app').currentVehicleId);
    },

    // ── Formatting helpers (bound in template) ────────────────────
    fmt(km) {
      return Utils.formatDistance(km, Alpine.store('app').distanceUnit);
    },
    fmtDate(d) { return Utils.formatDate(d); },
    fmtCur(a)  { return Utils.formatCurrency(a, Alpine.store('app').currency); },
    condLabel(pct) { return Utils.conditionLabel(pct); },
    urgLabel(u)    { return Utils.urgencyLabel(u); },
    urgBadge(u)    { return Utils.urgencyBadgeClass(u); },
    fmtDue(due)    { return Utils.formatDueDescription(due, Alpine.store('app').distanceUnit); },
  }));
});
