# Backlog

Features and known bugs, in rough priority order. Updated 2026-07-06 (post v26.3).

## Features

### F1. Europe remainder batch (1700–2000) — DONE in v26.6
Portugal, Netherlands, Sweden, and Poland populated to 2000 (eras, rulers,
events, territory snapshots). Poland's partition era (1795–1918) keeps events
and an era label but no rulers and no map presence — the approved treatment
for long statelessness.

### F2. Asia & Middle East batch (1700–2000) — DONE in v26.7
China, Japan, India, and Iran populated to 2000. India's colonial period uses
the Poland treatment (era "British Raj", events continue, bare ribbon, absent
from map 1820–1940); China's warlord era and Persia's interregna are bare-ribbon
gaps; Deng Xiaoping and Iran's Supreme Leaders follow the de-facto-heads rule.

### F3. Africa & Americas batch (1700–2000) — DONE in v26.8
All three ended empires continue through successor eras (Songhai → Mali,
Aztec → Mexico, Inca → Peru), with colonial eras getting the Poland treatment.
Ethiopia runs continuously with a bare-ribbon Zemene Mesafint. Every column
now reaches 2000.

### F4. New countries beyond the original 18 — DONE in v26.9
USA, Brazil, Austria, and Italy added as full 1500–2000 columns (roster now
22). The "post-1500 problem" dissolved: predecessor eras (Colonial North
America, Portuguese Brazil, Italian States) with bare ribbons are the Poland
treatment run from the other direction — no model change was needed.

### F5. Timeline row virtualization
501 years × N countries renders fine today, but if row count or event density
grows (or low-end devices struggle), virtualize the grid body. `GridRows` is
already memoized and isolated in `TimelineGrid.jsx`, so it's the natural seam.

## Bugs

### B1. Scroll-year badge drifts from visible rows — FIXED in v26.5
`src/rowOffsets.js` measures each year row's real offset (re-measured on resize
and selection change); the scroll badge, ruler ribbon labels, and century
watermarks all position from those measurements.

### B2. Countries vanish from the map after 1700 — RESOLVED in v26.8
All 18 columns now appear on the map through 2000 (colonial/stateless periods
intentionally absent per the Poland rule).

### B3. EventCell fast-refresh lint warning — FIXED in v26.4
`TYPE_COLORS` moved to `src/eventTypeColors.js` as part of the Wikipedia hover
summaries feature; the `oxlint` warning is gone.
