# Update Parts Database

Update `data/parts-db.json` with the latest Toyota and Daihatsu maintenance intervals and part numbers from public sources.

## Instructions

Search for current maintenance intervals and OEM part numbers for each model listed below. Use these sources (in priority order):
1. Official Toyota/Daihatsu owner's manual PDFs (search "[model] owner's manual maintenance schedule")
2. Toyota Australia service intervals (toyota.com.au)
3. epc-data.com for part numbers (search by make/model)
4. NHTSA Technical Service Bulletins for any interval revisions

## Models to update

**Toyota:** Corolla, Camry, HiLux, HiAce, LandCruiser 200, LandCruiser Prado, Yaris, RAV4, Fortuner
**Daihatsu:** Terios, Sirion, Rocky, Copen, Move

## For each model, verify or update:

- `engine-oil`: kmInterval, daysInterval, recommended grade
- `oil-filter`: kmInterval (should match oil change)
- `timing-belt` or `timing-chain`: verify which applies per engine variant, kmInterval, critical flag
- `brake-fluid`: kmInterval, daysInterval
- `coolant`: kmInterval, type notes
- `spark-plugs-iridium` / `spark-plugs-standard`: kmInterval per engine
- Part numbers under `parts.*` — check for supersessions (newer part numbers replacing old ones)

## Output

Write the updated JSON to `data/parts-db.json`. Update the `"version"` field to today's date in `YYYY-MM-DD` format. Preserve the existing JSON structure exactly. Add a brief `"_updated"` note per model entry if a significant interval change was found.

After writing the file, run:
```
git diff data/parts-db.json
```
and summarise what changed.
