# Map Visibility Redesign — Floating Mini-Map + View Toggle

**Date:** 2026-07-04
**Branch:** `feature/map-formatting`
**Status:** Approved by Allen (mockup validated in `mockups/map-layout-playground.html`, "★ Combined" mode)

## Problem

The world map currently sits below the timeline grid in a fixed 55vh/45vh vertical split. The map strip at the bottom is short, easy to ignore, and hard to read while reviewing the timeline.

## Solution Overview

Replace the stacked layout with a full-screen timeline plus a floating mini-map, and a header toggle to swap to a full-screen map view.

- **Timeline view (default):** The timeline grid fills the entire window below the 52px header. The map floats over it as a corner panel (bottom-right, 380px × 210px, matching the playground mockup), with a border, rounded corners, and drop shadow.
- **Map view:** The map fills the entire window below the header; the timeline is hidden (state preserved — scroll position must not reset when toggling back).
- **Switching:** Clicking anywhere on the mini-map expands to full-screen map view. A `Timeline | Map` segmented toggle in the header (right side, next to the Legend) switches both ways and reflects the current view.

## Component Changes

### `App.jsx`
- Replace the fixed 55vh/flex vertical split with a single full-height content area.
- New state: `view` — `'timeline' | 'map'`.
- Renders `TimelineGrid` (always mounted, hidden via CSS when in map view so scroll position survives) and `WorldMap` in either floating or fullscreen presentation.
- Header gains the `Timeline | Map` segmented toggle.

### `WorldMap.jsx`
- New prop: `mode` — `'mini' | 'full'`.
- **Mini mode:** container is absolutely positioned bottom-right (e.g. `right: 18px; bottom: 18px; width: 380px`), rounded border + shadow, `cursor: zoom-in`, click anywhere → parent callback `onExpand()`. Zoom/pan interactions disabled; pins render but are not individually clickable (too small at that size). Year badge stays visible.
- **Full mode:** current behavior — fills container, zoom/pan enabled, pin click scrolls the timeline. Pin-click first switches back to timeline view, then scrolls to and flash-highlights the event (existing highlight logic in `App.jsx` reused).

### `TimelineGrid.jsx`
- Column headers: background changes from neutral `#f7f7f7` to each country's darker map color (see palette below). Header text stays dark ink `#1a1a2e`.
- No other changes; the grid already handles arbitrary container sizes with its own scrolling.

### `TerritoryLayer.jsx` / data
- Territory fills change from the light pastel country colors to the darker mid-tones below, at ~0.75 fill opacity, with a darker stroke per country.
- Reign shading bands inside timeline columns keep the existing light pastels (darker versions would drown event text).

## Color Palette

| Country | Column pastel (unchanged, reign bands) | Map/header color (new) | Stroke (new) |
|---|---|---|---|
| England | `#c8d8e8` | `#7d97b1` | `#5a7690` |
| France | `#c8e8d0` | `#7fae8d` | `#5d8a6b` |
| Spain | `#e8d8c8` | `#b39a7e` | `#8f7659` |
| Holy Roman Empire | `#e8e8c8` | `#aaa878` | `#868453` |
| Russia | `#e8c8c8` | `#b18585` | `#8d6161` |
| Ottoman Empire | `#e0c8e8` | `#9d80a8` | `#7a5e85` |

Store the new colors in `countries.json` as a `mapColor` (and `mapStroke`) field alongside the existing `color`, so all components read from one source.

## Behavior Details

- **Year sync:** unchanged — timeline scroll drives `currentYear`, shown on the map's year badge in both modes.
- **Pin click (full map only):** switches to timeline view, scrolls to the event, flash-highlights it.
- **Mini-map size:** fixed 380px width for v1. No user resizing, no persistence. (The playground's size slider was an exploration tool, not a product feature.)
- **Transition:** a brief CSS transition on the mini-map expand is fine but must respect `prefers-reduced-motion`.
- **Keyboard/a11y:** the header toggle is two real buttons with a visible focus state; the mini-map panel is a button element (or `role="button"`, Enter/Space activates expand).

## Out of Scope

- Persisting the selected view across reloads.
- Draggable/resizable mini-map.
- Any change to event data, territory polygon data, or the reign shading logic.
- Mobile/responsive layout work.

## Testing

Manual verification (no test framework in the project):
1. Load app → timeline fills window, mini-map floats bottom-right with year badge.
2. Scroll timeline → year badge updates in mini mode.
3. Click mini-map → full-screen map; zoom/pan works; toggle shows "Map" active.
4. Click a pin → returns to timeline view, scrolled to the event with flash highlight.
5. Toggle back and forth → timeline scroll position preserved.
6. Column header colors match territory colors on the map.
