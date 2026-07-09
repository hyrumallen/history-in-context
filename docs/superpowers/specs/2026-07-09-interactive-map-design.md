# Design Spec: Interactive Expanded Map

**Date:** 2026-07-09
**Status:** Approved
**Topic:** Turn the expanded world map into an exploration tool — a year slider with play/time-lapse, Wikipedia hover cards on event pins, a rolling-window of pins, and a color legend.

## Goal

Today the expanded map is a passive, scroll-driven view: pins appear only for the
exact `currentYear`, there is no way to move through time except by scrolling the
timeline, and clicking a pin jumps back to the timeline. Make the expanded map a
first-class way to explore history: drag (or play) a year slider to sweep through
time, watch borders shift and events appear as a rolling window of pins, and hover
(or tap) a pin to get the same Wikipedia summary card the timeline offers, with
links to read the full page or jump to the event in the timeline.

## Background (what exists today)

- `WorldMap.jsx` renders an SVG (800×400 viewBox) with land, `TerritoryLayer`
  (borders by year, 30-year snapshots), and `EventPinLayer`. `mode` is `'mini'`
  or `'full'`; `useMapTransform` gives wheel-zoom / drag-pan (full mode only). A
  year badge shows `currentYear` bottom-left.
- `EventPinLayer.jsx` filters `events.filter(e => e.year === currentYear && …)`
  and renders `<circle r=4>` with a native `<title>` tooltip; `onClick` calls
  `onPinClick(event.id)` which (in `App.handlePinClick`) switches to the timeline
  and scrolls/flashes that event.
- The Wikipedia card is a reusable, decoupled stack:
  - `hoverCardStore.js` — module functions `showCard(event, anchorRect, pinned)`,
    `scheduleHide()`, `cancelHide()`, `closeCard()`; single shared card state.
  - `EventHoverCard.jsx` — one instance mounted in `App`; `useSyncExternalStore`;
    positions via `anchorRect` (fixed); fetches `wikipedia.fetchSummary(link)`
    (session-cached, offline-falls-back to `event.description`); renders title,
    thumbnail, extract, and a "Read on Wikipedia →" link. Pinned cards close on
    outside-click / Escape; hovering the card cancels hide.
  - `EventCell.jsx` (timeline) is the reference interaction: `onMouseEnter` →
    400 ms → `showCard(event, rect, false)`; `onMouseLeave` → `scheduleHide()`;
    `onClick` → `showCard(event, rect, true)` (pinned); keyboard Enter/Space.
- `currentYear` lives in `App` state, driven one-way by timeline scroll
  (`TimelineGrid` → `onYearChange`). `Legend.jsx` renders the event-type color key
  (used in the sidebar). `TYPE_COLORS` is in `eventTypeColors.js`.

## Requirements

1. **Hover/tap card on map pins.** On the expanded map, hovering a pin 400 ms (or
   tapping) shows the shared Wikipedia card anchored to the pin, exactly like the
   timeline. Moving into the card keeps it open; tap/click pins it.
2. **Year slider.** A slider on the expanded map spans `START_YEAR`–`END_YEAR`,
   bound to the shared `currentYear`. Dragging it updates the map (pins + borders)
   live and moves the shared year (so the timeline is at that year on return).
3. **Play / time-lapse.** A ▶/⏸ control auto-advances the year at a comfortable
   pace (full 1500→2000 sweep in ~45 s), stopping at `END_YEAR`; dragging the
   slider or pressing pause stops it.
4. **Rolling-window pins.** Pins show for events in the **decade** containing the
   slider year, not just the exact year. Exact-year events render at full size /
   opacity; others in the window are dimmer / slightly smaller so "now" stands out.
5. **Color legend.** The expanded map shows the event-type color key (reusing
   `Legend`) so pin colors are legible.
6. **"Show in timeline" in the card.** Because clicking a pin now opens the card
   (not a jump), the card gains a "Show in timeline ↦" action that performs the
   old jump-to-event behavior.
7. **Scope containment.** All of the above apply to the expanded (`mode==='full'`)
   map only. The floating mini-map and the mobile page-scroll behavior are
   unchanged.

## Design

### Pins: card interaction + rolling window (`EventPinLayer.jsx`)

- Change the filter to a decade window: with `decadeStart = Math.floor(year/10)*10`,
  keep events whose `e.year` is in `[decadeStart, decadeStart + 9]` (plus the
  existing `lat != null` and `selectedIds` checks).
- Per pin, compute `dist = Math.abs(e.year - year)`; map to opacity and radius
  (exact year: `r≈4.5`, opacity `1`; window edge: `r≈3`, opacity `~0.55`).
- Add pointer handlers mirroring `EventCell`, using `e.currentTarget.getBoundingClientRect()`
  as the anchor: `onMouseEnter` (400 ms → `showCard(event, rect, false)`),
  `onMouseLeave` (`scheduleHide()`), `onClick` (`showCard(event, rect, true)`).
  Remove the native `<title>` (the card replaces it). A per-layer timer ref holds
  the hover delay. `onPinClick` is no longer wired to the circle click.

### Controls (`MapControls.jsx`, new)

A bottom control bar rendered by `WorldMap` in full mode only. Props:
`year`, `onYearChange(year)`, `playing`, `onTogglePlay()`, `min`, `max`.
Layout: ▶/⏸ button, then `<input type="range" min max step=1 value={year}>`, then a
year readout. The range `onChange` calls `onYearChange(+e.target.value)`. Styled to
match the atlas theme; sits above the "scroll to zoom…" hint.

### Playback (`usePlayback.js`, new hook)

`usePlayback({ year, setYear, min, max, playing })` — while `playing`, a timer
advances `setYear(y => Math.min(max, y + 1))` at a fixed interval (~90 ms/yr →
~45 s sweep); auto-clears at `max` (and flips `playing` off via a callback).
Cleans up on unmount / when `playing` turns false. Manual `onYearChange` (drag)
sets `playing` false.

### Year ↔ slider ↔ timeline sync (`App.jsx`, `TimelineGrid.jsx`)

- `TimelineGrid` becomes a `forwardRef` exposing `scrollToYear(year)` via
  `useImperativeHandle`, using `offsetsRef` to compute the target offset:
  desktop scrolls `scrollRef` (`scrollTop = offsets[year-START]`); mobile scrolls
  the window (`innerRef` document top + `offsets[year-START] - 100`).
- `App` holds `gridRef`. Slider/play changes call `setCurrentYear(y)` **and**
  `gridRef.current?.scrollToYear(y)`. The timeline's own scroll handler then
  converges to the same year — no feedback loop (identical to the existing
  `handlePinClick` scroll, which coexists with the scroll handler safely).
- During playback, throttle the `scrollToYear` calls (e.g., only every ~0.5 s and
  once on stop) so the hidden timeline isn't thrashed every frame.

### Legend + card action

- `WorldMap` renders `<Legend />` in a small themed overlay box in full mode.
- `EventHoverCard` accepts an `onShowInTimeline(eventId)` prop (passed from `App`
  as `handlePinClick`); renders a "Show in timeline ↦" link next to "Read on
  Wikipedia →" that calls it and closes the card. Harmless when the card was
  opened from the timeline (it re-scrolls to the same event).

## Out of Scope

- Changes to the mini-map or mobile timeline behavior.
- New event data or coordinates; territory snapshot granularity (stays 30-year).
- Bidirectional live scroll during playback (timeline syncs on throttle/stop).
- Clustering/deduping overlapping pins at the same location.

## Verification / Definition of Done

1. Expanded map: dragging the slider updates pins and borders live and shows the
   year; returning to the timeline lands on that year.
2. ▶ plays a smooth time-lapse (borders shift, pins appear per decade), stops at
   2000, and pauses on drag or ⏸.
3. Hovering a pin (400 ms) shows the Wikipedia card with summary + thumbnail;
   moving into the card keeps it open; "Read on Wikipedia →" and "Show in
   timeline ↦" both work; tap pins the card on touch.
4. Pins reflect the decade window with the exact year emphasized.
5. The color legend is visible on the expanded map.
6. Mini-map, timeline hover cards, and mobile behavior are unchanged; `npm run
   lint` and `npm test` pass.

## Rollout Notes

Standard flow: branch `feature/interactive-map`, spec + plan under
`docs/superpowers/`, merge to `master` with `--no-ff`, tag the next `v26.x`,
push, delete the branch. Auto-deploys on merge; verify the expanded map on the
live site (desktop) and on-device for touch.
