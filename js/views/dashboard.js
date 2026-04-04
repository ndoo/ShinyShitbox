/**
 * dashboard.js — Insights landing page.
 * Shows: urgency list across all vehicles and compact vehicle health cards.
 */
document.addEventListener('alpine:init', () => {

  Alpine.data('dashboardView', () => ({
    urgentItems: [],    // [{vehicleName, partName, urgency, due, vehicleId, partTypeId, partId}]
    healthCards: [],    // [{vehicle, healthScore, overdueCount, dueSoonCount}]
    loading: true,

    async initDashboard() {
      this.loading = true;
      await this.loadAll();
      this.loading = false;
    },

    async loadAll() {
      const vehicles = await DB.getVehicles();
      if (!vehicles.length) { this.loading = false; return; }

      const urgentItems = [];
      const healthCards = [];
      const now        = new Date();
      const thresholds = Alpine.store('app').alertThresholds;

      for (const vehicle of vehicles) {
        const readings    = await DB.getOdometerHistory(vehicle.id);
        const latest      = readings.length ? readings[readings.length - 1] : null;
        const currentOdo  = latest?.odometer ?? null;
        const activeParts = await DB.getActivePartsForVehicle(vehicle.id);

        // Per-part due + condition
        let overdueCount = 0, dueSoonCount = 0;

        for (const part of activeParts) {
          const due = Utils.estimateDue(part, currentOdo, readings, now, thresholds);
          const condition = Utils.estimateCurrentCondition(part, currentOdo, now);
          part._due       = due;
          part._condition = condition;

          if (due.urgency === 'overdue')   overdueCount++;
          if (due.urgency === 'due-soon')  dueSoonCount++;

          // Show all overdue or due-soon parts
          if (['overdue', 'due-soon'].includes(due.urgency)) {
            urgentItems.push({
              vehicleName: vehicle.name,
              vehicleId:   vehicle.id,
              partName:    part.partName,
              partTypeId:  part.partTypeId,
              partId:      part.id,
              urgency:     due.urgency,
              due,
              condition,
            });
          }
        }

        // Health score
        const score = Utils.vehicleHealthScore(activeParts, currentOdo, readings, thresholds);
        healthCards.push({ vehicle, healthScore: score, overdueCount, dueSoonCount, currentOdo });
      }

      // Sort: overdue first, then due-soon; within each group worst condition first
      urgentItems.sort((a, b) => {
        if (a.urgency !== b.urgency) return a.urgency === 'overdue' ? -1 : 1;
        return (a.condition?.value ?? Infinity) - (b.condition?.value ?? Infinity);
      });

      this.urgentItems = urgentItems;
      this.healthCards = healthCards;
    },

    // ── Actions ───────────────────────────────────────────────────
    fixItem(item) {
      Alpine.store('app').selectVehicle(item.vehicleId);
      Alpine.store('app').navigate('wizard', {
        vehicleId: item.vehicleId,
        partTypeId: item.partTypeId,
      });
    },

    openVehicle(vehicleId) {
      Alpine.store('app').selectVehicle(vehicleId);
      Alpine.store('app').navigate('vehicle-detail');
    },

    // ── Formatting helpers ────────────────────────────────────────
    urgBadgeClass(u) { return Utils.urgencyBadgeClass(u); },
    urgLabel(u)      { return Utils.urgencyLabel(u); },
    fmt(km)          { return Utils.formatDistance(km, Alpine.store('app').distanceUnit); },
    fmtDate(d)       { return Utils.formatDate(d); },
    fmtDue(due)      { return Utils.formatDueDescription(due, Alpine.store('app').distanceUnit); },

    conditionColor(pct) {
      const t     = Alpine.store('app').alertThresholds;
      const amber = t.conditionAmber ?? 10;
      const red   = t.conditionRed   ?? 5;
      if (pct == null)   return 'condition-bar-unknown';
      if (pct >= amber)  return 'condition-bar-good';
      if (pct >= red)    return 'condition-bar-warning';
      return                    'condition-bar-critical';
    },

    healthColor(score) {
      if (score == null) return 'oklch(0.6 0 0)';
      if (score >= 70)   return 'oklch(0.65 0.2 145)';
      if (score >= 40)   return 'oklch(0.75 0.18 75)';
      return                    'oklch(0.6 0.22 25)';
    },
  }));
});
