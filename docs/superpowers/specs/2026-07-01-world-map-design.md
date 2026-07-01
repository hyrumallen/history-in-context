# World Map Design — History in Context

**Date:** 2026-07-01

## Overview

Phase 2 of the History in Context app. A world map panel lives below the timeline grid, stays synced to the grid's current scroll year, and shows shifting territory borders for the six tracked powers across 1500–1700. Delivered in two sequential sub-projects.

---

## Sub-project 1: Map Infrastructure

### Layout

The page becomes two stacked panels below the header, both always visible without page-level scrolling:

```
┌───────────────────────────────┐
│ Header (52px, unchanged)      │
├───────────────────────────────┤
│                               │
│  Timeline Grid  (~55% tall)   │
│  scrolls internally           │
│                               │
├───────────────────────────────┤
│                               │
│  World Map      (~45% tall)   │
│  syncs to grid scroll         │
│                               │
└───────────────────────────────┘
```

`App.jsx` controls the split via flexbox with the grid at `flex: 0 0 55vh` and the map at `flex: 1`. Both sections have `overflow: hidden` at the outer level; the grid's inner div keeps its existing `overflow: auto`.

### Year Sync

`App.jsx` holds `currentYear` state (number, default 1500). `TimelineGrid` accepts an `onYearChange` prop — a callback fired from a scroll event listener on the grid's scrollable div:

```js
const year = Math.round(scrollTop / ROW_HEIGHT) + START_YEAR
```

`ROW_HEIGHT` is 28 (already a constant in `TimelineGrid.jsx`). The listener is throttled to fire at most once every 50ms to avoid flooding renders. `currentYear` is passed as a prop to `WorldMap`.

### Map Rendering

`WorldMap` renders a single `<svg>` element sized to fill its container. Three child layers rendered in order (bottom to top):

1. **World outline** — static gray coastline paths loaded from `src/data/world-outline.json` (Natural Earth 1:110m land polygons, public domain, ~50kb). Color: `#e8e8e8`. Never changes.
2. **Territory layer** — `<TerritoryLayer currentYear={currentYear} />` — colored polygons for the six countries.
3. **Event pin layer** — `<EventPinLayer />` (Sub-project 2).

All geographic coordinates use **equirectangular projection**:

```js
x = (lng + 180) * (svgWidth / 360)
y = (90 - lat) * (svgHeight / 180)
```

No math library required.

A small year label in the bottom-left corner of the map displays "Showing: 1588" using `currentYear`.

### Territory Data

Stored in `src/data/territories.json`. Eight time snapshots, one every ~30 years:

```
1500, 1530, 1560, 1590, 1620, 1650, 1680, 1700
```

For a given `currentYear`, `TerritoryLayer` picks the snapshot with the nearest year (`Math.round` to closest snapshot). No interpolation between snapshots — borders jump at snapshot boundaries.

Data shape:

```json
[
  {
    "year": 1560,
    "territories": [
      {
        "countryId": "england",
        "polygons": [
          {
            "name": "England & Wales",
            "coords": [[-5.7, 50.0], [-3.0, 58.7], [1.8, 52.9], ...]
          }
        ]
      }
    ]
  }
]
```

Each polygon is an array of `[lng, lat]` pairs. `TerritoryLayer` renders each polygon as an SVG `<polygon>` filled with its country's color (from `countries.json`) at 60% opacity so the coastline shows through.

Territories covered per country across snapshots:

| Country | Core territory | Major changes tracked |
|---------|---------------|----------------------|
| England | British Isles | American colonies appear ~1620 |
| France | France proper | New France (Canada) appears ~1620; Louisiana ~1680 |
| Spain | Iberian Peninsula | Americas empire from 1500; loses Portugal ~1650 |
| Holy Roman Empire | Central Europe (Germany, Austria, Bohemia) | Slight contraction over time |
| Russia | Muscovy core | Eastward Siberian expansion visible by 1600, 1650, 1700 |
| Ottoman Empire | Anatolia + Balkans + Middle East + N. Africa | Peak ~1560–1590; retreats from Hungary ~1700 |

### Zoom and Pan

`useMapTransform.js` — a custom React hook managing a `transform` object `{ scale, translateX, translateY }`. Default: `{ scale: 1, translateX: 0, translateY: 0 }`.

Applied to a `<g>` element wrapping all three SVG layers:

```jsx
<g transform={`translate(${translateX}, ${translateY}) scale(${scale})`}>
  {/* layers */}
</g>
```

Interactions:

| Input | Behavior |
|-------|----------|
| Mouse wheel | Zoom in/out centered on cursor position. Scale clamped to 1–12. |
| Click + drag | Pan when scale > 1. No-op at scale 1. |
| Double-click | Reset to `{ scale: 1, translateX: 0, translateY: 0 }` |

The hook returns `{ transform, handlers }` where `handlers` is `{ onWheel, onMouseDown, onMouseMove, onMouseUp, onDoubleClick }` spread onto the `<svg>` element.

Pan is clamped so you cannot drag the map fully off screen.

---

## Sub-project 2: Event Pins

### Coordinate Data

Every event in `src/data/events.json` gets two new optional fields:

```json
{ "lat": 51.5, "lng": -0.1 }
```

All 147 events receive coordinates. For events that happened in a specific location (battles, sieges, cities), the pin goes to that location. For abstract events (a ruler becoming king, a book published), the pin goes to the capital or most associated city. For colonial events, the pin goes to the location in the new world (e.g., Cortés invading Mexico → Mexico City area).

### EventPinLayer

`EventPinLayer` receives `currentYear` and the full events array. It filters to only events where `event.year === currentYear`, projects each to SVG coordinates, and renders a `<circle>` for each:

- Radius: 5px (scales with map zoom)
- Fill: event type color (matching `TYPE_COLORS` in `EventCell.jsx`)
- Stroke: white, 1px
- Cursor: pointer

### Pin Click → Grid Scroll

Each pin has an `onClick` handler. `EventPinLayer` receives a `onPinClick(eventId)` prop from `WorldMap`, which receives it from `App.jsx`.

In `App.jsx`, `handlePinClick`:
1. Finds the DOM element with `data-event-id={eventId}` (added to each row in `TimelineGrid`)
2. Calls `scrollIntoView({ behavior: 'smooth', block: 'center' })`
3. Briefly adds a CSS class `event-highlight` to the element (removed after 1.5s)

`event-highlight` in `index.css`:
```css
.event-highlight {
  background: rgba(255, 220, 0, 0.4) !important;
  transition: background 1.5s ease-out;
}
```

---

## Out of Scope

- Animated border transitions between snapshots (borders jump, not animate)
- Zoom controls UI (buttons) — mouse/trackpad only
- Mobile touch support
- Showing non-tracked countries (e.g., Safavid Persia, Mughal Empire)
- Trade routes or exploration paths
- Map legend (territory colors match the existing grid column colors, which already have a legend)
