# Timeline Atlas Redesign — Design

**Date:** 2026-07-06
**Branch:** `feature/timeline-atlas-redesign` (merges as v26.5)
**Status:** Approved (direction D from `mockups/timeline-style-playground.html`, plus
the four concern mitigations discussed)
**Fixes:** backlog bug B1 (scroll-year drift) as part of this work

## Goal

Replace the spreadsheet look of the timeline grid with the "atlas + ruler ribbon"
aesthetic (mockup panel D): warm paper ground, serif event text, and a slim
reign-colored ribbon on the left edge of each column with ruler names lettered
vertically inside it. Behavior is unchanged — hover cards, click-to-pin, scroll
sync, era headers, country selection all keep working exactly as in v26.4.

## What disappears (the Excel signals)

- Per-cell borders in both directions → gone entirely.
- Full-column reign background washes → replaced by the ribbon.
- Solid rectangular header color blocks → headers sit on the paper with a serif
  country name and the small-caps era subtitle beneath.
- Grey year gutter → sepia numerals on paper; bold at decades, light at
  half-decades, blank otherwise; hairline rule (#e5d9bd) across the full row at
  each decade. No other horizontal or vertical lines.

## Visual system

- **Paper ground:** `#f8f3e7` for the grid area. Hairlines `#e5d9bd`. Text ink
  `#1a1a1a`; sepia accents `#a08c62` (event years, era subtitles) and `#7a6640`
  (decade numerals).
- **Type:** grid content and headers use a serif stack
  (`Georgia, 'Iowan Old Style', 'Times New Roman', serif`). UI chrome (buttons,
  sidebar controls, map overlays) stays Inter.
- **Events:** small 6px type-color dot (TYPE_COLORS, kept for the war/birth/death
  at-a-glance signal) + italic sepia year + serif title + existing ↗ marker. No
  boxes, no chips.
- **Century watermarks:** a faint centered numeral ("1500" … "1900",
  `rgba(120,96,60,0.07)`, ~110px) behind the content at each century boundary,
  positioned from measured row offsets.
- **Theme extends beyond the grid** (concern 4 — no two-apps-stitched-together
  look):
  - Header: keeps the dark navy bar; the "History in Context" title switches to
    the serif stack.
  - Hover card: paper tone `#fdf9ef`, serif event title; body text stays Inter
    for readability at small sizes.
  - Country sidebar: paper background tint matching the grid.
  - Map panel: unchanged except its border color warms from `#1a1a2e` to a dark
    brown `#4a3a22`.

## The reign ribbon

- 15px-wide vertical ribbon at the left edge of every country column, rounded
  ends, subtle shadow.
- **Painted per year-cell** (each cell draws its reign's color on its left
  strip) so alignment with variable-height rows is automatic — segments can
  never drift (concern 2).
- Colors: alternating reigns use the country's `mapColor` and a lightened
  variant of it (~40% toward white), replacing today's alpha-based alternation.
- **Ruler name labels** (concern 1): only reigns spanning **≥ 4 years** get a
  vertical (writing-mode: vertical-rl) small-caps name label, centered within
  the reign's measured pixel span. Shorter reigns are unlabeled shade-changes;
  their names remain available via the existing cell tooltip. If a labeled
  reign's name is still taller than its span, the label is hidden (measure,
  don't clip).
- **Label contrast** (concern 3): labels on the dark shade are
  `rgba(255,255,255,0.95)`; labels on the light shade use the country's
  `mapStroke` (dark). No white-on-light combinations.
- **No-ruler gaps** (e.g., Occupied Germany 1945–49, countries without post-1700
  data yet): no strip — paper shows through. This is intentional and reads as
  "no sovereign".
- The existing cell tooltip (`title` attribute with ruler name and years) stays
  on the whole cell, unchanged.

## Measured row offsets (fixes B1)

The root cause of backlog B1 — code assuming rows are exactly 28px when event
rows are taller — also breaks ribbon labels and watermarks. One utility fixes
all three:

- `src/rowOffsets.js`: after the grid renders (and on selection change /
  container resize via ResizeObserver, debounced), measure each year row's
  `offsetTop` into an array indexed by `year - START_YEAR`. Rows get measured
  via the year-gutter cells, which always exist.
- Pure helper `yearAtOffset(offsets, scrollTop) -> year` (binary search),
  unit-tested. The TimelineGrid scroll handler uses it instead of
  `scrollTop / 28` — the badge, map, and era headers now match what's actually
  on screen (B1 fixed).
- Reign labels and century watermarks are absolutely positioned from the same
  offsets, overlaid on the grid (not inside cells), so they span rows
  correctly.

## Out of scope

- No layout restructuring (direction C), no row virtualization, no mobile work.
- Map rendering, sidebar behavior, and all v26.4 hover-card behavior unchanged.
- `EventPinLayer` / map pin colors unchanged (TYPE_COLORS still shared).

## Testing

- vitest: `yearAtOffset` (exact boundaries, between-rows, clamping at both
  ends); label-selection helper (reigns → which get labels, ≥4-year threshold,
  span math); existing 27 tests keep passing.
- Browser verification: no borders/washes remain; ribbon aligns with rows deep
  in the timeline (1900s, where drift was worst); scroll badge matches the
  visible rows (B1 gone); labels legible on both shades; watermarks sit at
  century rows; hover cards, pinning, era headers, map sync all still work;
  paper theme consistent across header, sidebar, and hover card.
