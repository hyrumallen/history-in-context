# Expand Timeline to 1500–2000 — Design

**Date:** 2026-07-06
**Branch:** `feature/expand-dates-1500-2000`
**Status:** Approved

## Goal

Extend the app's date range from 1500–1700 to 1500–2000. This branch delivers the
UI/range change, the successor-state data model, and full data for the six default
European countries. The remaining twelve countries follow in later regional batches,
matching the project's established workflow.

## Decisions (approved by Allen)

1. **Dissolved countries evolve into successors** — a country column continues
   through its successor states (HRE → German Confederation → Germany) rather than
   greying out or spawning separate country entries.
2. **Rulers generalize to heads of state** — presidents, general secretaries, etc.
   fill republican eras. Where a monarch remains head of state (UK), the monarch
   stays and prime ministers are not shown.
3. **Batch scope: UI + Europe six** on this branch — England/UK, France, Spain,
   HRE→Germany, Russia→USSR→Russian Federation, Ottoman Empire→Turkey.
4. **Successor model: `eras` array on the existing country entry** — no id
   migration; events, rulers, and territories keep their existing `countryId`.

## Code changes

- **`src/constants.js` (new)** — exports `START_YEAR = 1500`, `END_YEAR = 2000`.
- **`src/components/TimelineGrid.jsx`** — import the constants; remove the local
  `START_YEAR`/`END_YEAR`; replace the hardcoded `1700`/`1500` in the scroll-clamp
  (currently line 74) with the constants.
- **`src/App.jsx`** — header subtitle becomes dynamic from the constants:
  `1500 – 2000 · Five Centuries of History`.
- **Column headers** — show the country's era name for the year currently in view
  (scrolling from 1800 to 1880 changes "Holy Roman Empire" to "Germany"). For gap
  years between eras (e.g., 1806–1815), show the most recent era that has begun.
- **No changes** to `TerritoryLayer`, `WorldMap`, `EventPinLayer` — they are
  data-driven.
- **Performance note:** the grid grows from 201 to 501 rows. Verify scroll
  performance after the range change; virtualize only if actually sluggish.

## Data model

### `countries.json` — optional `eras` array

```json
{
  "id": "holy-roman-empire",
  "name": "Holy Roman Empire",
  "eras": [
    { "name": "Holy Roman Empire",   "startYear": 1500, "endYear": 1806 },
    { "name": "German Confederation", "startYear": 1815, "endYear": 1871 },
    { "name": "Germany",              "startYear": 1871, "endYear": 2000 }
  ]
}
```

Countries without `eras` behave exactly as today (static `name`).

### `rulers.json` (renamed from `monarchs.json`)

Same entry shape (`id`, `countryId`, `name`, `startYear`, `endYear`) plus an
optional `title` field ("Queen", "President", "General Secretary"). Existing ids
and countryIds are untouched, so localStorage selections keep working.

## Data content (this branch)

- **Eras, rulers, and events to 2000** for the Europe six:
  - England → Great Britain (1707) → United Kingdom (1801)
  - France: Kingdom → First Republic/Empire → Restoration → Second Republic/Empire
    → Third/Fourth/Fifth Republics
  - Spain (kingdom throughout, incl. Second Republic and Franco era)
  - Holy Roman Empire → German Confederation → Germany
  - Russia: Tsardom → Empire → USSR → Russian Federation
  - Ottoman Empire → Turkey (1923)
- **Events** at the existing density (~1 per country per decade): roughly 180–300
  new events covering 1700–2000.
- **Territory snapshots** continue the 30-year cadence: 1730, 1760, 1790, 1820,
  1850, 1880, 1910, 1940, 1970, 2000 — ten new snapshots containing **only the
  Europe six**. Other regions appear on the post-1700 map when their batches land
  (carrying stale 1700 borders forward was rejected: Qing-era borders in 1950 are
  worse than absence).
- The other twelve countries keep their 1500–1700 data unchanged; their columns
  have no events/rulers after 1700 until their batch.

## Verification

No test suite exists. Verification is:

1. `npm run lint`
2. `npm run build`
3. Drive the dev server: scroll to 1900 — era names flip, ruler shading continues,
   the map shows the 1880/1910 snapshots, event pins render.
