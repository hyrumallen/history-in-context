# Backlog

Features and known bugs, in rough priority order. Updated 2026-07-06 (post v26.3).

## Features

### F1. Europe remainder batch (1700–2000)
Portugal, Dutch Republic, Sweden, Poland-Lithuania are still 1500–1700 only.
Needs eras (Dutch Republic → Batavian Republic → Netherlands; Poland-Lithuania →
partitions → Second Republic → People's Republic → Poland), rulers, events, and
inclusion in the ten 1730–2000 territory snapshots. Follows the v26.3 pattern;
the data-validation suite (`npm test`) guards the additions.

### F2. Asia & Middle East batch (1700–2000)
China (Qing → Republic → People's Republic), Japan (Tokugawa → Meiji → modern),
Mughal India (→ British Raj → India), Safavid Persia (→ Qajar → Pahlavi → Iran).
Same deliverables as F1.

### F3. Africa & Americas batch (1700–2000)
Ethiopia continues to 2000 (Empire → Derg → Federal Republic). Decide whether
ended countries get successor eras: Songhai (ended 1591), Aztec (→ New Spain →
Mexico?), Inca (→ Peru?). If they stay ended, only Ethiopia needs data.

### F4. New countries beyond the original 18
Candidates that only exist post-1700: United States, Brazil, Italy, Austria
(separate from HRE column after 1806). Needs a design decision — the current
model assumes every country exists at 1500.

### F5. Timeline row virtualization
501 years × N countries renders fine today, but if row count or event density
grows (or low-end devices struggle), virtualize the grid body. `GridRows` is
already memoized and isolated in `TimelineGrid.jsx`, so it's the natural seam.

## Bugs

### B1. Scroll-year badge drifts from visible rows — FIXED in v26.5
`src/rowOffsets.js` measures each year row's real offset (re-measured on resize
and selection change); the scroll badge, ruler ribbon labels, and century
watermarks all position from those measurements.

### B2. Countries vanish from the map after 1700
The 1730–2000 territory snapshots contain only the Europe six, so the other
twelve disappear from the map past the 1700 snapshot. Intentional until their
batches land (stale borders were judged worse than absence), but it can read as
a bug. Resolved incrementally by F1–F3.

### B3. EventCell fast-refresh lint warning — FIXED in v26.4
`TYPE_COLORS` moved to `src/eventTypeColors.js` as part of the Wikipedia hover
summaries feature; the `oxlint` warning is gone.
