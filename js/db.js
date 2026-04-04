/**
 * db.js — Dexie.js database layer.
 * Exposes window.DB with all async operations.
 */
(() => {
  const db = new Dexie('VehicleAgingTracker');

  db.version(1).stores({
    vehicles:        '++id, name, createdAt',
    odometerReadings:'++id, vehicleId, date, odometer',
    partTypes:       '++id, name, category, isFluid',
    partRecords:     '++id, vehicleId, partTypeId, installDate, removalDate',
    partsDbCache:    'key',           // key='partsDb', value=full JSON, version=string
  });

  // v2: Collapse "Spark Plugs (Standard)" + "Spark Plugs (Iridium)" into a
  //     single "Spark Plugs" type with per-grade variant intervals.
  //     (partVariant written here is consolidated into grade in v3)
  db.version(2).stores({
    vehicles:        '++id, name, createdAt',
    odometerReadings:'++id, vehicleId, date, odometer',
    partTypes:       '++id, name, category, isFluid',
    partRecords:     '++id, vehicleId, partTypeId, installDate, removalDate',
    partsDbCache:    'key',
  }).upgrade(async tx => {
    const SPARK_PLUG_VARIANTS = [
      { label: 'Copper/Nickel', kmInterval: 30000,  daysInterval: 1460 },
      { label: 'Platinum',      kmInterval: 60000,  daysInterval: 2190 },
      { label: 'Iridium',       kmInterval: 100000, daysInterval: 3650 },
    ];

    // Add unified type
    const newId = await tx.table('partTypes').add({
      name: 'Spark Plugs', category: 'engine',
      defaultKmInterval: 30000, defaultDaysInterval: 1460,
      isFluid: false, fluidOptions: null, isUserCreated: false,
      variants: SPARK_PLUG_VARIANTS,
    });

    const oldStd = await tx.table('partTypes').where('name').equals('Spark Plugs (Standard)').first();
    const oldIr  = await tx.table('partTypes').where('name').equals('Spark Plugs (Iridium)').first();

    if (oldStd) {
      await tx.table('partRecords').where('partTypeId').equals(oldStd.id)
        .modify({ partTypeId: newId, partName: 'Spark Plugs', partVariant: 'Copper/Nickel' });
      await tx.table('partTypes').delete(oldStd.id);
    }
    if (oldIr) {
      await tx.table('partRecords').where('partTypeId').equals(oldIr.id)
        .modify({ partTypeId: newId, partName: 'Spark Plugs', partVariant: 'Iridium' });
      await tx.table('partTypes').delete(oldIr.id);
    }
  });

  // v3: Consolidate partVariant + fluidSubtype + fluidGrade → single `grade` field.
  db.version(3).stores({
    vehicles:        '++id, name, createdAt',
    odometerReadings:'++id, vehicleId, date, odometer',
    partTypes:       '++id, name, category, isFluid',
    partRecords:     '++id, vehicleId, partTypeId, installDate, removalDate',
    partsDbCache:    'key',
  }).upgrade(async tx => {
    await tx.table('partRecords').toCollection().modify(record => {
      if (record.grade != null) return; // already has consolidated grade
      const parts = [record.fluidSubtype, record.fluidGrade].filter(Boolean);
      record.grade = record.partVariant || (parts.length ? parts.join(' ') : null) || null;
    });
  });

  // v4: Rename legacy 'oem-brand' source → 'aftermarket' on all part records.
  db.version(4).stores({
    vehicles:        '++id, name, createdAt',
    odometerReadings:'++id, vehicleId, date, odometer',
    partTypes:       '++id, name, category, isFluid',
    partRecords:     '++id, vehicleId, partTypeId, installDate, removalDate',
    partsDbCache:    'key',
  }).upgrade(async tx => {
    await tx.table('partRecords').toCollection().modify(record => {
      if (record.partSource === 'oem-brand') record.partSource = 'aftermarket';
    });
  });

  // ── Seed data ────────────────────────────────────────────────────

  db.on('populate', async () => {
    await db.partTypes.bulkAdd([
      // ── Engine ──────────────────────────────────────────────────
      {
        name: 'Engine Oil', category: 'engine',
        defaultKmInterval: 10000, defaultDaysInterval: 365,
        isFluid: true,
        fluidOptions: {
          subtypes: ['Mineral', 'Semi-Synthetic', 'Full Synthetic'],
          grades: ['0W-20','5W-20','5W-30','10W-30','10W-40','15W-40','15W-50','20W-50'],
          dotRatings: []
        },
        isUserCreated: false,
      },
      {
        name: 'Oil Filter', category: 'engine',
        defaultKmInterval: 10000, defaultDaysInterval: 365,
        isFluid: false, fluidOptions: null, isUserCreated: false,
      },
      {
        name: 'Spark Plugs', category: 'engine',
        defaultKmInterval: 30000, defaultDaysInterval: 1460,
        isFluid: false, fluidOptions: null, isUserCreated: false,
        variants: [
          { label: 'Copper/Nickel', kmInterval: 30000,  daysInterval: 1460 },
          { label: 'Platinum',      kmInterval: 60000,  daysInterval: 2190 },
          { label: 'Iridium',       kmInterval: 100000, daysInterval: 3650 },
        ],
      },
      {
        name: 'Timing Belt', category: 'engine',
        defaultKmInterval: 100000, defaultDaysInterval: 1825,
        isFluid: false, fluidOptions: null, isUserCreated: false,
        critical: true,
      },
      {
        name: 'Timing Chain', category: 'engine',
        defaultKmInterval: null, defaultDaysInterval: null,
        isFluid: false, fluidOptions: null, isUserCreated: false,
      },
      {
        name: 'Serpentine / Drive Belt', category: 'engine',
        defaultKmInterval: 80000, defaultDaysInterval: 1825,
        isFluid: false, fluidOptions: null, isUserCreated: false,
      },
      {
        name: 'PCV Valve', category: 'engine',
        defaultKmInterval: 60000, defaultDaysInterval: 1825,
        isFluid: false, fluidOptions: null, isUserCreated: false,
      },
      // ── Filters ──────────────────────────────────────────────────
      {
        name: 'Air Filter (Engine)', category: 'filters',
        defaultKmInterval: 40000, defaultDaysInterval: 730,
        isFluid: false, fluidOptions: null, isUserCreated: false,
      },
      {
        name: 'Cabin Air Filter', category: 'filters',
        defaultKmInterval: 20000, defaultDaysInterval: 365,
        isFluid: false, fluidOptions: null, isUserCreated: false,
      },
      {
        name: 'Fuel Filter', category: 'fuel',
        defaultKmInterval: 30000, defaultDaysInterval: 730,
        isFluid: false, fluidOptions: null, isUserCreated: false,
      },
      // ── Brakes ───────────────────────────────────────────────────
      {
        name: 'Brake Fluid', category: 'brakes',
        defaultKmInterval: 40000, defaultDaysInterval: 730,
        isFluid: true,
        fluidOptions: {
          subtypes: ['DOT 3', 'DOT 4', 'DOT 5', 'DOT 5.1'],
          grades: [], dotRatings: ['DOT 3', 'DOT 4', 'DOT 5', 'DOT 5.1']
        },
        isUserCreated: false,
      },
      {
        name: 'Brake Pads (Front)', category: 'brakes',
        defaultKmInterval: 40000, defaultDaysInterval: null,
        isFluid: false, fluidOptions: null, isUserCreated: false,
        critical: true,
      },
      {
        name: 'Brake Pads (Rear)', category: 'brakes',
        defaultKmInterval: 40000, defaultDaysInterval: null,
        isFluid: false, fluidOptions: null, isUserCreated: false,
        critical: true,
      },
      {
        name: 'Brake Rotors (Front)', category: 'brakes',
        defaultKmInterval: 80000, defaultDaysInterval: null,
        isFluid: false, fluidOptions: null, isUserCreated: false,
      },
      {
        name: 'Brake Rotors (Rear)', category: 'brakes',
        defaultKmInterval: 80000, defaultDaysInterval: null,
        isFluid: false, fluidOptions: null, isUserCreated: false,
      },
      // ── Cooling ──────────────────────────────────────────────────
      {
        name: 'Coolant', category: 'cooling',
        defaultKmInterval: 40000, defaultDaysInterval: 730,
        isFluid: true,
        fluidOptions: {
          subtypes: ['IAT (Inorganic)', 'OAT (Organic)', 'HOAT (Hybrid)', 'Toyota Super Long Life (Pink)', 'Toyota Long Life (Red)'],
          grades: [], dotRatings: []
        },
        isUserCreated: false,
      },
      // ── Transmission ─────────────────────────────────────────────
      {
        name: 'Transmission Fluid (Auto)', category: 'transmission',
        defaultKmInterval: 60000, defaultDaysInterval: 1825,
        isFluid: true,
        fluidOptions: {
          subtypes: ['Toyota WS (World Standard)', 'Dexron III', 'Dexron VI', 'ATF Type T-IV'],
          grades: [], dotRatings: []
        },
        isUserCreated: false,
      },
      {
        name: 'Transmission Fluid (Manual)', category: 'transmission',
        defaultKmInterval: 40000, defaultDaysInterval: 1460,
        isFluid: true,
        fluidOptions: {
          subtypes: ['GL-4', 'GL-5', 'MT Fluid'],
          grades: ['75W-90', '80W-90', '75W-85'],
          dotRatings: []
        },
        isUserCreated: false,
      },
      {
        name: 'Differential Fluid (Front)', category: 'transmission',
        defaultKmInterval: 60000, defaultDaysInterval: 1825,
        isFluid: true,
        fluidOptions: {
          subtypes: ['GL-5', 'LSD Fluid'],
          grades: ['75W-90', '80W-90'],
          dotRatings: []
        },
        isUserCreated: false,
      },
      {
        name: 'Differential Fluid (Rear)', category: 'transmission',
        defaultKmInterval: 60000, defaultDaysInterval: 1825,
        isFluid: true,
        fluidOptions: {
          subtypes: ['GL-5', 'LSD Fluid'],
          grades: ['75W-90', '80W-90'],
          dotRatings: []
        },
        isUserCreated: false,
      },
      // ── Steering ─────────────────────────────────────────────────
      {
        name: 'Power Steering Fluid', category: 'steering',
        defaultKmInterval: 60000, defaultDaysInterval: 1825,
        isFluid: true,
        fluidOptions: {
          subtypes: ['Toyota PSF', 'Dexron III', 'ATF'],
          grades: [], dotRatings: []
        },
        isUserCreated: false,
      },
      // ── Suspension ───────────────────────────────────────────────
      {
        name: 'Wheel Alignment', category: 'suspension',
        defaultKmInterval: 20000, defaultDaysInterval: 365,
        isFluid: false, fluidOptions: null, isUserCreated: false,
      },
      {
        name: 'Wheel Bearings (Front)', category: 'suspension',
        defaultKmInterval: 100000, defaultDaysInterval: null,
        isFluid: false, fluidOptions: null, isUserCreated: false,
      },
      {
        name: 'Wheel Bearings (Rear)', category: 'suspension',
        defaultKmInterval: 100000, defaultDaysInterval: null,
        isFluid: false, fluidOptions: null, isUserCreated: false,
      },
      {
        name: 'Shock Absorbers', category: 'suspension',
        defaultKmInterval: 80000, defaultDaysInterval: null,
        isFluid: false, fluidOptions: null, isUserCreated: false,
      },
      // ── Tyres ────────────────────────────────────────────────────
      {
        name: 'Tyres', category: 'tyres',
        defaultKmInterval: 40000, defaultDaysInterval: 1825,
        isFluid: false, fluidOptions: null, isUserCreated: false,
      },
      {
        name: 'Tyre Rotation', category: 'tyres',
        defaultKmInterval: 10000, defaultDaysInterval: 365,
        isFluid: false, fluidOptions: null, isUserCreated: false,
      },
      // ── Electrical ───────────────────────────────────────────────
      {
        name: 'Battery', category: 'electrical',
        defaultKmInterval: null, defaultDaysInterval: 1460,
        isFluid: false, fluidOptions: null, isUserCreated: false,
      },
      // ── Body / Wipers ────────────────────────────────────────────
      {
        name: 'Wiper Blades (Front)', category: 'body',
        defaultKmInterval: 20000, defaultDaysInterval: 365,
        isFluid: false, fluidOptions: null, isUserCreated: false,
      },
      {
        name: 'Wiper Blade (Rear)', category: 'body',
        defaultKmInterval: 20000, defaultDaysInterval: 365,
        isFluid: false, fluidOptions: null, isUserCreated: false,
      },
    ]);
  });

  // ── Vehicles ─────────────────────────────────────────────────────

  async function getVehicles() {
    return db.vehicles.orderBy('createdAt').toArray();
  }

  async function addVehicle(data) {
    return db.vehicles.add({ ...data, createdAt: new Date().toISOString() });
  }

  async function updateVehicle(id, data) {
    return db.vehicles.update(id, data);
  }

  async function deleteVehicle(id) {
    return db.transaction('rw',
      db.vehicles, db.odometerReadings, db.partRecords, async () => {
        await db.odometerReadings.where('vehicleId').equals(id).delete();
        await db.partRecords.where('vehicleId').equals(id).delete();
        await db.vehicles.delete(id);
      });
  }

  // ── Odometer readings ────────────────────────────────────────────

  async function addOdometerReading(data) {
    return db.odometerReadings.add({ ...data, createdAt: new Date().toISOString() });
  }

  async function getOdometerHistory(vehicleId) {
    return db.odometerReadings.where('vehicleId').equals(vehicleId)
      .sortBy('date');
  }

  async function getLatestOdometer(vehicleId) {
    const readings = await db.odometerReadings
      .where('vehicleId').equals(vehicleId)
      .sortBy('date');
    return readings.length ? readings[readings.length - 1] : null;
  }

  /**
   * Validate an odometer reading against its chronological neighbours.
   * Pass excludeId when editing an existing record (excludes it from neighbour lookup).
   * Returns an error string, or null if valid.
   */
  async function validateOdometerReading(vehicleId, date, odometer, excludeId = null) {
    const all = await getOdometerHistory(vehicleId);
    const readings = excludeId ? all.filter(r => r.id !== excludeId) : all;
    const dt = new Date(date).getTime();

    let prev = null, next = null;
    for (const r of readings) {
      const rdt = new Date(r.date).getTime();
      if (rdt <= dt) { if (!prev || rdt > new Date(prev.date).getTime()) prev = r; }
      else           { if (!next || rdt < new Date(next.date).getTime()) next = r; }
    }

    if (prev && odometer < prev.odometer) {
      return `Reading must be ≥ ${prev.odometer.toLocaleString()} km (the reading on ${prev.date}).`;
    }
    if (next && odometer > next.odometer) {
      return `Reading must be ≤ ${next.odometer.toLocaleString()} km (the reading on ${next.date}).`;
    }
    return null;
  }

  async function updateOdometerReading(id, { date, odometer, notes }) {
    return db.odometerReadings.update(id, { date, odometer, notes: notes || null });
  }

  async function deleteOdometerReading(id) {
    return db.odometerReadings.delete(id);
  }

  /**
   * After adding a new odometer reading, recalculate odometers for all part
   * records whose value was interpolated (source !== 'user') or not yet filled.
   * User-entered values (source === 'user') are never overwritten.
   */
  async function reinterpolateOdometers(vehicleId) {
    const readings = await getOdometerHistory(vehicleId);
    const parts    = await db.partRecords.where('vehicleId').equals(vehicleId).toArray();

    // installOdometer / removalOdometer are always derived by interpolation from
    // the odometerReadings table. No source tracking needed — if the user entered
    // an odometer during a service it was saved as a reading, so interpolation at
    // that date returns the same value. Clear stale values if readings drop below 2.
    if (readings.length < 2) {
      for (const part of parts) {
        const updates = {};
        if (part.installOdometer != null)  updates.installOdometer = null;
        if (part.removalOdometer != null)  updates.removalOdometer = null;
        if (Object.keys(updates).length)   await db.partRecords.update(part.id, updates);
      }
      return;
    }

    for (const part of parts) {
      const updates = {};

      if (part.installDate) {
        const est = window.Utils.interpolateOdometer(readings, part.installDate);
        if (est != null && est !== part.installOdometer)
          updates.installOdometer = est;
      }

      if (part.removalDate) {
        const est = window.Utils.interpolateOdometer(readings, part.removalDate);
        if (est != null && est !== part.removalOdometer)
          updates.removalOdometer = est;
      }

      if (Object.keys(updates).length) {
        await db.partRecords.update(part.id, updates);
      }
    }
  }

  // ── Part types ───────────────────────────────────────────────────

  async function getPartTypes() {
    return db.partTypes.orderBy('name').toArray();
  }

  async function addPartType(data) {
    return db.partTypes.add({ ...data, isUserCreated: true });
  }

  async function updatePartType(id, data) {
    return db.partTypes.update(id, data);
  }

  // ── Part records ─────────────────────────────────────────────────

  async function getActivePartsForVehicle(vehicleId) {
    const records = await db.partRecords
      .where('vehicleId').equals(vehicleId)
      .filter(r => r.removalDate == null)
      .toArray();
    // Attach partType name for display
    const types = await db.partTypes.bulkGet(records.map(r => r.partTypeId));
    return records.map((r, i) => ({
      ...r,
      _partType: types[i] || null,
    }));
  }

  async function getAllPartsForVehicle(vehicleId) {
    const records = await db.partRecords
      .where('vehicleId').equals(vehicleId)
      .sortBy('installDate');
    const types = await db.partTypes.bulkGet(records.map(r => r.partTypeId));
    return records.map((r, i) => ({ ...r, _partType: types[i] || null }));
  }

  async function getPartHistory(vehicleId, partTypeId) {
    // Returns chain of records for this part type on this vehicle, sorted oldest first
    const all = await db.partRecords
      .where('vehicleId').equals(vehicleId)
      .filter(r => r.partTypeId === partTypeId)
      .sortBy('installDate');
    return all;
  }

  async function addPartRecord(data) {
    return db.partRecords.add({ ...data, createdAt: new Date().toISOString() });
  }

  async function getPartRecord(id) {
    return db.partRecords.get(id);
  }

  /**
   * Update editable metadata on an existing part record.
   * Does not touch service-flow fields (removalDate, replacedByPartId, etc.).
   */
  async function updatePartRecord(id, data) {
    return db.partRecords.update(id, data);
  }

  /**
   * Permanently delete a single part record by id.
   * Also clears any replacedByPartId pointer on the record that was replaced by it.
   */
  async function deletePartRecord(id) {
    return db.transaction('rw', db.partRecords, async () => {
      // Clear any outgoing part's forward pointer to this record
      await db.partRecords.filter(r => r.replacedByPartId === id)
        .modify({ replacedByPartId: null, removalDate: null, removalOdometer: null });
      await db.partRecords.delete(id);
    });
  }

  /**
   * Atomic wizard save: close old part + create new part + optional odometer reading.
   */
  async function savePartReplacement({
    outgoingPartId,
    removalData,       // { removalDate, removalOdometer, conditionAtRemoval, conditionNotes }
    newPartData,
    odometerData,      // optional: { vehicleId, date, odometer, source }
    updatePartTypeInterval, // bool: should we also update the partType defaults?
  }) {
    return db.transaction('rw',
      db.partRecords, db.odometerReadings, db.partTypes, async () => {
        let newId;

        // 1. Create new part record first (we need its ID)
        newId = await db.partRecords.add({
          ...newPartData,
          createdAt: new Date().toISOString(),
        });

        // 2. Close outgoing part record
        if (outgoingPartId) {
          await db.partRecords.update(outgoingPartId, {
            ...removalData,
            replacedByPartId: newId,
          });
        }

        // 3. Optionally update partType default intervals
        if (updatePartTypeInterval && newPartData.partTypeId) {
          const updates = {};
          if (newPartData.expectedKmInterval  != null) updates.defaultKmInterval  = newPartData.expectedKmInterval;
          if (newPartData.expectedDaysInterval != null) updates.defaultDaysInterval = newPartData.expectedDaysInterval;
          if (Object.keys(updates).length) {
            await db.partTypes.update(newPartData.partTypeId, updates);
          }
        }

        // 4. Odometer reading (if provided) — upsert by date to avoid duplicates.
        //    Any existing reading for the same vehicle+date is replaced.
        if (odometerData && odometerData.odometer) {
          const existing = await db.odometerReadings
            .where('vehicleId').equals(odometerData.vehicleId)
            .filter(r => r.date === odometerData.date)
            .first();
          if (existing) {
            await db.odometerReadings.update(existing.id, {
              odometer:  odometerData.odometer,
              source:    odometerData.source,
              notes:     odometerData.notes ?? null,
              updatedAt: new Date().toISOString(),
            });
          } else {
            await db.odometerReadings.add({
              ...odometerData,
              createdAt: new Date().toISOString(),
            });
          }
        }

        return newId;
      });
  }

  // ── Parts DB cache (for EPC data) ────────────────────────────────

  async function getPartsDbCache() {
    return db.partsDbCache.get('partsDb');
  }

  async function setPartsDbCache(version, data) {
    return db.partsDbCache.put({ key: 'partsDb', version, data, updatedAt: new Date().toISOString() });
  }

  // ── Export / Import ──────────────────────────────────────────────

  async function exportDB() {
    const blob = await DexieExportImport.exportDB(db, { prettyJson: true });
    return blob;
  }

  async function importDBFromBlob(blob) {
    await DexieExportImport.importInto(db, blob, { clearTablesBeforeImport: true });
  }

  // ── Expose public API ────────────────────────────────────────────
  window.DB = {
    // Vehicles
    getVehicles, addVehicle, updateVehicle, deleteVehicle,
    // Odometer
    addOdometerReading, updateOdometerReading, deleteOdometerReading,
    getOdometerHistory, getLatestOdometer,
    validateOdometerReading, reinterpolateOdometers,
    // Part types
    getPartTypes, addPartType, updatePartType,
    // Part records
    getActivePartsForVehicle, getAllPartsForVehicle, getPartHistory,
    getPartRecord, addPartRecord, updatePartRecord, deletePartRecord, savePartReplacement,
    // Parts DB cache
    getPartsDbCache, setPartsDbCache,
    // Export / Import
    exportDB, importDBFromBlob,
    // Direct db access for advanced queries
    _db: db,
  };
})();
