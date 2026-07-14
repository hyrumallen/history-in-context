# Rail-click year jump + precise borders — design

Date: 2026-07-13
Branch: `precise-borders`

Two changes, independent of each other, shipped together.

1. Clicking an event in the map's event rail moves the map's year slider to that event's year, instead of leaving the map for the timeline.
2. Territory borders become real geometry imported from a historical GIS dataset, replacing the hand-drawn polygons that read as shaded boxes laid over the land.

---

## Part 1 — Rail click moves the slider

### Behavior

Clicking a row in the event rail:

- sets `currentYear` to the event's year (the slider handle moves; territories and pins re-render for that year),
- selects the row: it stays highlighted and its map pin stays ringed after the cursor leaves,
- pans the map to center that event's pin, keeping the current zoom.

The click no longer navigates to the timeline. That path stays available through the hover card's existing "Show in timeline ↦" action.

### Selection vs. focus

`WorldMap` today owns `focusedId`, which is hover-driven and cleared on `onMouseLeave`. It gains a sibling `selectedId`, set on row click. A row highlights and its pin rings when `event.id === focusedId || event.id === selectedId`. Hover behavior is unchanged; selection persists on top of it. `EventPinLayer` takes `selectedId` alongside the `focusedId` prop it already has.

`selectedId` is cleared by any *user-driven* year change — dragging the slider, or pressing play — and by clicking a different row. It is **not** cleared by the year change the click itself causes, which is the same `currentYear` state write. So the clear must hang off the slider's and playback's own handlers, not off a `currentYear` change effect; an effect watching `currentYear` would make every click clear its own selection.

### Pan to pin

`useMapTransform` gains `centerOn(lng, lat)`:

```
translateX = 400 - scale * projectX(lng)
translateY = 200 - scale * projectY(lat)
```

in the fixed 800×400 SVG user space, passed through the existing `clampT`. `clampT` zeroes the translation whenever `scale <= 1`, so at the default un-zoomed view this is a no-op — the whole world is already visible and there is nothing to center. Centering only takes effect once the user has zoomed in. This is intended, not a limitation.

### Projection helper

The equirectangular projection is duplicated across `TerritoryLayer`, `EventPinLayer`, and now `useMapTransform`. Lift it into `src/projection.js` (`project(lng, lat, width, height)`), unit-tested, and have all three use it. No fourth copy.

---

## Part 2 — Precise borders

### Problem

`territories.json` holds hand-drawn polygons — France is a 13-point outline — that spill past coastlines and sit on the water. They read as a shaded box over the land rather than a country.

### Source

[`aourednik/historical-basemaps`](https://github.com/aourednik/historical-basemaps): world borders as GeoJSON, one file per timestamp, features carrying `NAME`, `SUBJECTO`, `PARTOF`, `BORDERPRECISION`.

**License: GPL-3.0.** Shipping geometry derived from it makes this project GPL-3.0. The repo (currently unlicensed) gains a `LICENSE` file and credits the dataset. Accepted deliberately: this is a public hobby project with no commercial plans, and it is the only comprehensive free historical-borders source.

### Snapshot years

Adopt the dataset's year set rather than the current even 30-year spacing:

`1500, 1530, 1600, 1650, 1700, 1715, 1783, 1800, 1815, 1880, 1900, 1914, 1920, 1930, 1938, 1945, 1960, 1994, 2000`

These land on years borders actually moved (1815, 1914, 1938, 1945) instead of arbitrary intervals, which buys temporal precision as well as spatial. It accepts two coarse gaps — 1530→1600 and 1815→1880. `nearestSnapshot()` already works over an arbitrary year list and needs no change.

### Schema

Real geometry has multiple polygons and holes, which the current flat `coords` array cannot express. Each territory becomes GeoJSON MultiPolygon coordinates:

```json
{
  "year": 1650,
  "territories": [
    { "countryId": "france", "geometry": [ [ [ [lng, lat], ... ] ] ] }
  ]
}
```

— an array of polygons, each an array of rings (outer first, then holes), each ring an array of `[lng, lat]` pairs.

### Renderer

`TerritoryLayer` emits one `<path>` per country instead of an `<polygon>` per shape, with `fillRule="evenodd"` so holes render as holes. Fill and stroke colors continue to come from `countries.json` (`mapColor` / `mapStroke`).

The viewBox is a fixed 800×400 and the geometry is static, so each path's `d` string is a pure function of (snapshot year, countryId). Compute lazily and cache in a module-level `Map`. This is load-bearing: time-lapse playback advances a year every ~90 ms, and re-projecting hundreds of vertices per country on every tick would stutter.

### Import pipeline

`scripts/build-territories.cjs` — a dev-time script, not part of the app build.

- Reads raw `world_YYYY.geojson` from a gitignored local cache. The ~30 MB of source never enters the repo; only the built `territories.json` is committed.
- Driven by `scripts/territory-map.json`: for each `countryId` at each snapshot year, the source `NAME` / `SUBJECTO` features to union together. This file is hand-written and reviewable, and it is where the curated doctrines live explicitly — Poland has no entry for 1815–1900, which *is* the Poland treatment expressed as data. Same for the British Raj, the 1938–45 Anschluss gap, and the Songhai → Pashalik → Massina succession.
- Unions composites with `polygon-clipping` (MIT), so the Holy Roman Empire renders as one body rather than a mesh of internal border lines.
- Simplifies (Douglas–Peucker) and rounds coordinates to ~1 km, tuned to keep the shipped `territories.json` under ~500 KB (it is 98 KB today).

### Tests

- `src/projection.test.js` — new, covers the extracted projection.
- `src/data/data-validation.test.js` — extended for the new shape: rings closed, coordinates in bounds, `countryId`s known to `countries.json`, snapshot years sorted and unique.

Real acceptance is visual: load the map, sweep the slider across all 19 snapshots, compare against the current build.

### Scope of this pass

The six default countries only — England, France, Spain, Holy Roman Empire, Russia, Ottoman Empire — across the full new year set. They are what the app shows on load, so the result can be judged by using it, and they exercise the hardest mapping cases (HRE fragmentation, Ottoman reach, England's colonies). The other 16 countries have no polygons on this branch and follow as a second batch that only edits `territory-map.json` and re-runs the script.

## Out of scope

- Zooming (as opposed to panning) on rail click.
- Interpolating borders between snapshots.
- Re-drawing the coastline base layer (`world-outline.json` stays as is).
