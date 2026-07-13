# Map-First with Live Event Rail — Design

**Date:** 2026-07-12

## Overview

Reposition the world map from a secondary mode into the app's primary experience, and add a **live event rail** that names events as their pins appear on the globe. The timeline grid is preserved unchanged as a "study mode" reached from the existing header toggle.

The goal is captivation for a history-buff audience: watching events fire across the whole world at once as time plays, with borders morphing — the map's version of the grid's cross-country simultaneity — made *readable* rather than requiring a hover per pin.

## Motivation

The app already has everything needed for a map-first experience: a `Timeline | Map` header toggle, a full-map mode with time-slider + ▶ play (`MapControls`), territory polygons, event pins, a type-color legend, and Wikipedia hover cards. Today the map is buried as an alternate mode behind a timeline default, and its popping pins are anonymous until hovered individually.

This design flips the default and closes the "anonymous pin" gap, with minimal disruption to existing work.

**Known constraint (accepted):** the dataset is Europe-heavy (22 countries; only Europe/Near East populated at 1500). "Global simultaneity" is richest in the 1700s–1900s and sparse early on. The event rail is what carries the experience through sparse early decades — the map may look nearly empty at 1500, but the rail still lists what happened. Auto-framing the map to the selection is **explicitly deferred** (see Out of Scope).

## Design

### 1. Flip the home view

- In `App.jsx`, the default `view` state becomes `'map'` instead of `'timeline'`. The app lands on the full-screen world map with the time-slider + play as the hero.
- The header `Timeline | Map` toggle is unchanged. The grid becomes the study mode users switch to for deep six-column reading. **No changes to the grid, its overlays, or the floating mini-map in timeline mode.**

*Net effect: the map is promoted to primary with a one-line default change plus the additions below.*

### 2. Event Rail (new component)

A docked panel on the **right side** of the full map (~320px wide, full height under the 52px header), collapsible via a toggle.

**Content** — the events currently represented as pins on the map:
- Derived from a new pure helper `railItems(events, year, selectedIds)` in `src/mapPins.js`, built on the existing `pinsInWindow` (same decade window that drives the pins, so rail and dots are always in lockstep).
- Returned rows are sorted chronologically (ascending year, stable tiebreak by event id) and each carries an `emphasis` flag: `true` when `event.year === year` (exact current year), `false` for the rest of the decade window.
- Each rendered row shows: `year · [type-color dot] · title · country`. Type color reuses `src/eventTypeColors.js`; country label from the country's display name.

**Live behavior:**
- As `currentYear` changes (slider scrub or ▶ playback), the rail re-filters from `railItems`. Exact-current-year rows render bold / full opacity; the rest of the decade window render dimmed — mirroring the existing `pinEmphasis` treatment on the map. Playing time = rows light up as their dots pop.

**Empty / sparse decades:**
- When the decade window has no events, the rail shows a decade header (e.g. `1500–1509`) plus "No recorded events this decade."
- When it has few, it still lists them. This is the graceful handling of the Euro-sparse early map — text carries the experience when the globe looks bare.

### 3. Rail ↔ map cross-highlight (data flow)

- Single source of truth remains `currentYear` in `App` (unchanged). Both the rail and `EventPinLayer` derive their contents from it — no new synchronization loop.
- Add one shared `focusedEventId` state (lifted to `WorldMap`, or `App` if simpler) with a setter passed to both the rail and `EventPinLayer`:
  - **Hover a rail row** → set `focusedEventId` (its pin enlarges/rings on the map) and show the existing `EventHoverCard` via `hoverCardStore`.
  - **Hover a pin** → set `focusedEventId` (its rail row highlights). Pins already drive `hoverCardStore`; this adds the reverse highlight into the rail.
- **Click a rail row** → "Show in timeline": switches to the grid and scrolls to that event with the existing yellow-flash highlight, reusing `App.handlePinClick` (or the same `onShowInTimeline` path the hover card already uses). The rail doubles as the bridge into study mode.

### 4. Mobile — bottom sheet

- Desktop: docked right panel (above).
- Mobile (`useIsMobile`): the rail becomes a **bottom sheet** — a collapsible list that slides up from the bottom over the full-screen map, with a drag/tap handle to expand and collapse. The map stays full-width behind it. Collapsed by default so the map is unobstructed on load; a peek header shows the current decade + event count.
- Reuses the same `railItems` data and row rendering; only the container/positioning differs (consistent with how `CountrySidebar` already branches between docked and overlay via an `overlay` prop).

## Components & Files

**Changed:**
- `src/App.jsx` — default `view` = `'map'`; thread `focusedEventId` where lifted; pass rail props into `WorldMap`.
- `src/components/WorldMap.jsx` — render `<EventRail>` in full mode (docked desktop / bottom-sheet mobile); pass `focusedEventId` + setter into `EventPinLayer`.
- `src/components/EventPinLayer.jsx` — accept `focusedEventId`; render the focused pin enlarged/ringed; emit focus on pin hover.
- `src/mapPins.js` — add pure `railItems(events, year, selectedIds)`.

**New:**
- `src/components/EventRail.jsx` — renders `railItems` output; docked vs bottom-sheet via prop; hover/click wiring to `hoverCardStore` and `onShowInTimeline`.

**Unchanged:** all grid/timeline code (`TimelineGrid`, `GridOverlays`, reign ribbons, mini-map), territory rendering, `MapControls`, `usePlayback`.

## Testing

Following the project's pure-function + vitest pattern (`pinsInWindow`, `isMobileViewport`):
- Unit-test `railItems` in `src/mapPins.test.js`: correct decade window, chronological sort, stable tiebreak, `emphasis` flag set only on exact-year rows, filtering by `selectedIds`, empty-window result.
- Existing `pinsInWindow` / `pinEmphasis` tests remain the source of truth for the pin windowing that the rail shares.

## Out of Scope

- **Auto-framing / auto-zoom the map to the selected countries** — deferred; may revisit if the empty early-map still bothers in practice.
- Any change to the timeline grid, its overlays, or the floating mini-map.
- New event/ruler/territory data.
- Removing the mini-map from timeline mode.
- Landing on a data-rich default year (kept at `START_YEAR`).
