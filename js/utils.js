/**
 * utils.js — Pure utility functions (no DOM, no Alpine, no Dexie dependencies).
 * All functions are attached to window.Utils for global access.
 */
window.Utils = (() => {

  // ── Date helpers ────────────────────────────────────────────────

  function daysBetween(dateA, dateB) {
    const a = dateA instanceof Date ? dateA : new Date(dateA);
    const b = dateB instanceof Date ? dateB : new Date(dateB);
    return Math.round((b - a) / 86400000);
  }

  function addDays(date, days) {
    const d = new Date(date instanceof Date ? date : new Date(date));
    d.setDate(d.getDate() + days);
    return d;
  }

  function toISODate(date) {
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().split('T')[0];
  }

  function formatDate(isoOrDate) {
    if (!isoOrDate) return '—';
    const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
    const locale = window.I18n ? I18n.locale : undefined;
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // ── Distance / currency formatting ──────────────────────────────

  function formatDistance(km, unit = 'km') {
    if (km == null) return '—';
    if (unit === 'miles') {
      const m = Math.round(km * 0.621371);
      return `${m.toLocaleString()} mi`;
    }
    return `${Math.round(km).toLocaleString()} km`;
  }

  function formatCurrency(amount, currency = 'AUD') {
    if (amount == null || amount === '') return '—';
    return new Intl.NumberFormat(undefined, {
      style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2
    }).format(amount);
  }

  // ── Condition helpers ────────────────────────────────────────────

  const CONDITION_PRESETS = [
    { label: 'New',    pct: 100, colorClass: 'btn-success' },
    { label: 'Good',   pct: 80,  colorClass: 'btn-success' },
    { label: 'Fair',   pct: 50,  colorClass: 'btn-warning' },
    { label: 'Poor',   pct: 20,  colorClass: 'btn-error'   },
    { label: 'Failed', pct: 0,   colorClass: 'btn-error'   },
  ];

  function conditionLabel(pct) {
    const _t = window.I18n ? k => I18n.t(k) : k => ({ 'cond.unknown': 'Unknown', 'cond.good': 'Good', 'cond.fair': 'Fair', 'cond.poor': 'Poor', 'cond.failed': 'Failed' }[k] || k);
    if (pct == null) return { label: _t('cond.unknown'), colorClass: 'condition-bar-unknown', badgeClass: 'badge-ghost' };
    if (pct >= 75)  return { label: _t('cond.good'),    colorClass: 'condition-bar-good',     badgeClass: 'badge-success' };
    if (pct >= 40)  return { label: _t('cond.fair'),    colorClass: 'condition-bar-warning',  badgeClass: 'badge-warning' };
    if (pct >= 10)  return { label: _t('cond.poor'),    colorClass: 'condition-bar-critical', badgeClass: 'badge-error'   };
    return                 { label: _t('cond.failed'),  colorClass: 'condition-bar-critical', badgeClass: 'badge-error'   };
  }

  // ── Odometer interpolation ───────────────────────────────────────

  /**
   * Estimate odometer at a given date using a sorted array of {date, odometer} readings.
   * Returns null if fewer than 2 readings.
   */
  function interpolateOdometer(readings, targetDate) {
    if (!readings || readings.length < 2) return null;
    const sorted = [...readings].sort((a, b) => new Date(a.date) - new Date(b.date));
    const target = new Date(targetDate);

    // Find bracketing readings
    let before = null, after = null;
    for (const r of sorted) {
      const rd = new Date(r.date);
      if (rd <= target) before = r;
      else if (!after)  after = r;
    }

    if (before && after) {
      const t = (target - new Date(before.date)) / (new Date(after.date) - new Date(before.date));
      return Math.round(before.odometer + t * (after.odometer - before.odometer));
    }
    // Extrapolate from the two nearest readings
    const r1 = sorted[0], r2 = sorted[sorted.length - 1];
    const days = daysBetween(r1.date, r2.date);
    if (days === 0) return r2.odometer;
    const rate = (r2.odometer - r1.odometer) / days;
    const ref = before ? r2 : r1;
    return Math.round(ref.odometer + rate * daysBetween(ref.date, targetDate));
  }

  /**
   * Compute rolling daily km rate from the most recent N readings (default 5).
   */
  function dailyKmRate(readings, n = 5) {
    if (!readings || readings.length < 2) return null;
    const sorted = [...readings]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-n);
    const first = sorted[0], last = sorted[sorted.length - 1];
    const days = daysBetween(first.date, last.date);
    if (days === 0) return null;
    return (last.odometer - first.odometer) / days;
  }

  // ── Condition estimation ─────────────────────────────────────────

  /**
   * Estimate current condition (0–100) for an active partRecord.
   * Returns { value: 0–100, tooltip: string } or null.
   * value = 100 − max(km progress, time progress) × 100.
   * tooltip explains which interval is the binding constraint.
   *
   * @param {object}       part             - partRecord (installDate, installOdometer, expectedKmInterval, expectedDaysInterval)
   * @param {number}       currentOdometer
   * @param {Date|string}  currentDate
   * @param {number|null}  correctionFactor - optional scalar applied to progress (default 1)
   */
  function estimateCurrentCondition(part, currentOdometer, currentDate = new Date(), correctionFactor = 1) {
    if (!part) return null;
    let kmData = null, timeData = null;

    if (part.expectedKmInterval && part.installOdometer != null && currentOdometer != null) {
      const kmElapsed = currentOdometer - part.installOdometer;
      kmData = { progress: kmElapsed / part.expectedKmInterval, elapsed: Math.round(kmElapsed), interval: part.expectedKmInterval };
    }

    if (part.expectedDaysInterval) {
      const daysElapsed = daysBetween(part.installDate, currentDate);
      timeData = { progress: daysElapsed / part.expectedDaysInterval, elapsed: Math.round(daysElapsed), interval: part.expectedDaysInterval };
    }

    if (!kmData && !timeData) return null;

    const progresses = [kmData?.progress, timeData?.progress].filter(p => p != null);
    const progress = Math.max(...progresses) / correctionFactor;
    const value = Math.max(0, Math.round(100 - progress * 100));

    // Build tooltip — show only the limiting metric
    const kmIsLimiting = kmData && (!timeData || (kmData.progress / correctionFactor) >= (timeData.progress / correctionFactor));
    let tooltip = '';
    if (kmIsLimiting) {
      const tmpl = window.I18n ? I18n.t('tooltip.kmUsed') : '{elapsed} of {interval} km used';
      tooltip = tmpl
        .replace('{elapsed}', kmData.elapsed.toLocaleString())
        .replace('{interval}', kmData.interval.toLocaleString());
    } else if (timeData) {
      const tmpl = window.I18n ? I18n.t('tooltip.timeUsed') : '{elapsed} of {interval} used';
      tooltip = tmpl
        .replace('{elapsed}', formatDuration(timeData.elapsed))
        .replace('{interval}', formatDuration(timeData.interval));
    }

    return { value, tooltip };
  }

  // ── Due date / urgency prediction ───────────────────────────────

  /**
   * Predict next due date and urgency for a partRecord.
   * @param {object} part
   * @param {number} currentOdometer
   * @param {Array}  odometerReadings  - array of {date, odometer}
   * @param {Date}   currentDate
   * @returns {{ dueDate, dueOdometer, kmRemaining, daysRemaining, urgency, effectiveDate }}
   */
  function estimateDue(part, currentOdometer, odometerReadings = [], currentDate = new Date(), thresholds = {}) {
    const dueSoonDays    = thresholds.dueSoonDays   ?? 30;
    const dueSoonKm      = thresholds.dueSoonKm     ?? 1000;
    const dueSoonKmDays  = thresholds.dueSoonKmDays ?? 30;
    const upcomingDays   = dueSoonDays   * 2;
    const upcomingKm     = dueSoonKm     * 2;
    const upcomingKmDays = dueSoonKmDays * 2;

    const today = currentDate instanceof Date ? currentDate : new Date(currentDate);
    let dueOdometer = null, dueDate = null, kmDueDate = null;

    if (part.installOdometer != null && part.expectedKmInterval) {
      dueOdometer = part.installOdometer + part.expectedKmInterval;
    }

    if (part.expectedDaysInterval) {
      dueDate = addDays(part.installDate, part.expectedDaysInterval);
    }

    // Predict when km-due will be reached using daily rate
    if (dueOdometer != null && currentOdometer != null) {
      const rate = dailyKmRate(odometerReadings);
      if (rate && rate > 0) {
        const kmRemaining = dueOdometer - currentOdometer;
        kmDueDate = addDays(today, kmRemaining / rate);
      }
    }

    // Effective due = earliest of time-due and km-due (used for sorting/clustering)
    const candidates = [dueDate, kmDueDate].filter(Boolean);
    const effectiveDate = candidates.length ? new Date(Math.min(...candidates.map(d => d.getTime()))) : null;

    const kmRemaining    = dueOdometer != null && currentOdometer != null
      ? dueOdometer - currentOdometer : null;
    const daysRemaining  = dueDate    ? daysBetween(today, dueDate)    : null;
    const kmDaysEstimate = kmDueDate  ? daysBetween(today, kmDueDate)  : null;

    const overdue = (dueOdometer != null && currentOdometer != null && currentOdometer > dueOdometer)
                 || (dueDate != null && today > dueDate);

    let urgency = 'ok';
    if (overdue)                                                             urgency = 'overdue';
    else if (daysRemaining  != null && daysRemaining  <= dueSoonDays)       urgency = 'due-soon';
    else if (kmRemaining    != null && kmRemaining    <= dueSoonKm)         urgency = 'due-soon';
    else if (kmDaysEstimate != null && kmDaysEstimate <= dueSoonKmDays)     urgency = 'due-soon';
    else if (daysRemaining  != null && daysRemaining  <= upcomingDays)      urgency = 'upcoming';
    else if (kmRemaining    != null && kmRemaining    <= upcomingKm)        urgency = 'upcoming';
    else if (kmDaysEstimate != null && kmDaysEstimate <= upcomingKmDays)    urgency = 'upcoming';

    return { dueDate, dueOdometer, kmDueDate, effectiveDate, kmRemaining, daysRemaining, kmDaysEstimate, urgency };
  }

  // ── Urgency display helpers ──────────────────────────────────────

  function urgencyBadgeClass(urgency) {
    return { overdue: 'badge-error', 'due-soon': 'badge-warning', upcoming: 'badge-info', ok: 'badge-success' }[urgency] || 'badge-ghost';
  }

  function urgencyLabel(urgency) {
    if (window.I18n) return I18n.t('urgency.' + urgency) || urgency;
    return { overdue: 'Overdue', 'due-soon': 'Due Soon', upcoming: 'Upcoming', ok: 'OK' }[urgency] || urgency;
  }

  /**
   * Format a number of days as a human-readable duration using years + months only:
   *   ≥ 1 year  → "Xyr [Ymo]"  (e.g. "2yr 3mo")
   *   ≥ 1 month → "Xmo"        (e.g. "4mo")
   *   < 1 month → "Xd"         (e.g. "20d")
   * Days are never mixed with months — sub-month remainders are rounded away.
   */
  function formatDuration(days) {
    if (days == null || days < 0) return '—';
    const _t = window.I18n ? k => I18n.t(k) : k => ({ 'dur.yr': 'yr', 'dur.mo': 'mo', 'dur.d': 'd' }[k] || k);
    days = Math.round(days);
    if (days >= 365) {
      const y = Math.floor(days / 365);
      const rem = days - y * 365;
      let m = Math.round(rem / 30);
      if (m >= 12) return `${y + 1}${_t('dur.yr')}`;
      return m > 0 ? `${y}${_t('dur.yr')} ${m}${_t('dur.mo')}` : `${y}${_t('dur.yr')}`;
    }
    if (days >= 30) {
      const m = Math.floor(days / 30);
      const rem = days - m * 30;
      return rem > 0 ? `${m}${_t('dur.mo')} ${rem}${_t('dur.d')}` : `${m}${_t('dur.mo')}`;
    }
    return `${days}${_t('dur.d')}`;
  }

  function formatDueDescription(due, unit = 'km') {
    if (!due) return '—';
    const _over    = window.I18n ? I18n.t('due.over')    : 'over';
    const _overdue = window.I18n ? I18n.t('due.overdue') : 'Overdue';
    if (due.urgency === 'overdue') {
      const parts = [];
      if (due.kmRemaining  != null && due.kmRemaining  < 0)
        parts.push(`${formatDistance(Math.abs(due.kmRemaining), unit)} ${_over}`);
      if (due.daysRemaining != null && due.daysRemaining < 0)
        parts.push(`${formatDuration(Math.abs(due.daysRemaining))} ${_over}`);
      return parts.join(' / ') || _overdue;
    }
    const parts = [];
    if (due.daysRemaining != null && due.daysRemaining >= 0)
      parts.push(formatDuration(due.daysRemaining));
    if (due.kmRemaining != null && due.kmRemaining >= 0) {
      let kmStr = formatDistance(due.kmRemaining, unit);
      // Only show km-based time estimate if it's the binding constraint (shorter than time remaining)
      if (due.kmDaysEstimate != null && due.kmDaysEstimate >= 0 &&
          (due.daysRemaining == null || due.kmDaysEstimate < due.daysRemaining))
        kmStr += ` (≅${formatDuration(due.kmDaysEstimate)})`;
      parts.push(kmStr);
    }
    return parts.join(' / ') || '—';
  }

  // ── Vehicle health score ─────────────────────────────────────────

  const CRITICAL_PARTS = ['timing-belt', 'timing belt', 'brake pads', 'brake fluid'];
  const IMPORTANT_PARTS = ['engine oil', 'oil filter', 'coolant'];

  function partWeight(partName = '') {
    const n = partName.toLowerCase();
    if (CRITICAL_PARTS.some(k => n.includes(k))) return 3;
    if (IMPORTANT_PARTS.some(k => n.includes(k))) return 2;
    return 1;
  }

  function vehicleHealthScore(activeParts, currentOdometer, odometerReadings, thresholds = {}) {
    if (!activeParts || activeParts.length === 0) return null;
    let weightedSum = 0, totalWeight = 0, overdueCount = 0;

    for (const part of activeParts) {
      const conditionResult = estimateCurrentCondition(part, currentOdometer);
      const conditionValue  = conditionResult?.value ?? null;
      const due             = estimateDue(part, currentOdometer, odometerReadings, new Date(), thresholds);
      const weight          = partWeight(part.partName);

      if (conditionValue != null) {
        weightedSum  += conditionValue * weight;
        totalWeight  += weight;
      }
      if (due.urgency === 'overdue') overdueCount++;
    }

    if (totalWeight === 0) return null;
    const base  = Math.round(weightedSum / totalWeight);
    const score = Math.max(0, base - overdueCount * 10);
    return score;
  }

  // ── Service cluster planning ─────────────────────────────────────

  /**
   * Find clusters of parts that are due close together.
   * @param {Array} dueParts - [{ partName, effectiveDate, dueOdometer, urgency }]
   * @param {number} windowDays - tolerance window (default 15 days either side)
   * @param {number} windowKm   - tolerance km (default 1000)
   * @returns {Array} sorted clusters: [{ suggestedDate, suggestedOdometer, parts[], savedVisits }]
   */
  function findServiceClusters(dueParts, windowDays = 15, windowKm = 1000) {
    if (!dueParts || dueParts.length < 2) return [];

    const withDates = dueParts.filter(p => p.effectiveDate);
    if (withDates.length < 2) return [];

    const clusters = [];

    for (let i = 0; i < withDates.length; i++) {
      const anchor = withDates[i];
      const anchorTime = anchor.effectiveDate.getTime();
      const group = [anchor];

      for (let j = 0; j < withDates.length; j++) {
        if (i === j) continue;
        const other = withDates[j];
        const daysDiff = Math.abs(daysBetween(anchor.effectiveDate, other.effectiveDate));
        const kmDiff = (anchor.dueOdometer != null && other.dueOdometer != null)
          ? Math.abs(anchor.dueOdometer - other.dueOdometer) : Infinity;

        if (daysDiff <= windowDays || kmDiff <= windowKm) {
          group.push(other);
        }
      }

      if (group.length < 2) continue;

      // Suggested date = average of all effective dates in cluster
      const avgTime = group.reduce((s, p) => s + p.effectiveDate.getTime(), 0) / group.length;
      const suggestedDate = new Date(avgTime);

      // Suggested odometer = average of available dueOdometers
      const withOdo = group.filter(p => p.dueOdometer != null);
      const suggestedOdometer = withOdo.length
        ? Math.round(withOdo.reduce((s, p) => s + p.dueOdometer, 0) / withOdo.length) : null;

      // Score: count minus total deviation
      const totalDev = group.reduce((s, p) => s + Math.abs(daysBetween(p.effectiveDate, suggestedDate)), 0);
      const score = group.length * 10 - totalDev;

      clusters.push({ suggestedDate, suggestedOdometer, parts: group, savedVisits: group.length - 1, score });
    }

    // Deduplicate by largest overlapping group, sort by score desc
    const seen = new Set();
    const unique = clusters
      .sort((a, b) => b.score - a.score)
      .filter(c => {
        const key = c.parts.map(p => p.partName).sort().join('|');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    return unique.slice(0, 3);
  }

  // ── Outgoing part candidate matching ────────────────────────────

  /**
   * Score active part records as candidates for the "outgoing part" when
   * a new part type is being installed. Handles cross-type substitutions
   * (e.g. standard spark plugs → iridium).
   *
   * @param {object} selectedPartType - partType being installed
   * @param {Array}  activeParts      - all active partRecords for the vehicle (with partTypeName attached)
   * @returns {Array} candidates sorted by score desc
   */
  function findOutgoingCandidates(selectedPartType, activeParts) {
    if (!activeParts || activeParts.length === 0) return [];

    const selectedWords = (selectedPartType.name || '').toLowerCase().split(/\s+/);

    return activeParts
      .map(part => {
        let score = 0;
        if (part.partTypeId === selectedPartType.id)                          score += 3;
        if (part.category === selectedPartType.category)                      score += 1;
        const partWords = (part.partName || '').toLowerCase().split(/\s+/);
        const overlap   = selectedWords.filter(w => w.length > 2 && partWords.includes(w)).length;
        score += Math.min(overlap * 1, 2); // up to +2 for word overlap
        return { ...part, _matchScore: score };
      })
      .filter(p => p._matchScore > 0)
      .sort((a, b) => b._matchScore - a._matchScore);
  }

  // ── Interval scope logic ─────────────────────────────────────────

  /**
   * Determine default value for the "this install only" toggle.
   * Returns true (install-only) when entered intervals differ from type defaults.
   */
  function shouldDefaultToInstallOnly(enteredKm, enteredDays, partType) {
    if (!partType) return false;
    const kmDiffers   = enteredKm   != null && enteredKm   !== partType.defaultKmInterval;
    const daysDiffers = enteredDays != null && enteredDays !== partType.defaultDaysInterval;
    return kmDiffers || daysDiffers;
  }

  // ── Miscellaneous ────────────────────────────────────────────────

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function slugify(str) {
    return (str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  // ── Public API ───────────────────────────────────────────────────
  return {
    daysBetween, addDays, toISODate, formatDate,
    formatDistance, formatCurrency,
    CONDITION_PRESETS, conditionLabel,
    interpolateOdometer, dailyKmRate,
    estimateCurrentCondition, estimateDue,
    urgencyBadgeClass, urgencyLabel, formatDuration, formatDueDescription,
    vehicleHealthScore,
    findServiceClusters,
    findOutgoingCandidates,
    shouldDefaultToInstallOnly,
    capitalize, slugify, generateId,
  };
})();
