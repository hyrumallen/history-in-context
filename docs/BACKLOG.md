# Backlog

Features and known bugs, in rough priority order. Updated 2026-07-06 (post v26.3).

## Features

### F1. Europe remainder batch (1700–2000) — DONE in v26.6
Portugal, Netherlands, Sweden, and Poland populated to 2000 (eras, rulers,
events, territory snapshots). Poland's partition era (1795–1918) keeps events
and an era label but no rulers and no map presence — the approved treatment
for long statelessness.

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
The 1730–2000 snapshots now cover all ten European countries (v26.6); the
eight Asia/Africa/Americas countries still disappear past 1700 until F2–F3
land. Intentional (stale borders were judged worse than absence), but it can
read as a bug.

### B3. EventCell fast-refresh lint warning — FIXED in v26.4
`TYPE_COLORS` moved to `src/eventTypeColors.js` as part of the Wikipedia hover
summaries feature; the `oxlint` warning is gone.
