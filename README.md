# History in Context

A browser-based timeline of the Early Modern world (1500–1700). Historical events didn't happen in isolation — this app shows 18 countries side by side so you can see what was happening everywhere at once.

## Features

- **Timeline grid** — one column per country, one row per year, with events and color-coded ruler reign bands
- **Dynamic country selection** — a collapsible sidebar groups 18 countries by continent (Europe, Asia & Middle East, Africa, Americas) with per-country and per-continent checkboxes; your selection is remembered between visits
- **World map** — a floating mini-map follows your scroll year, showing shifting territorial borders and event pins; click it (or the header toggle) for a full-screen map with zoom and pan
- **Linked navigation** — click a map pin to jump to that event in the timeline

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Tech

React 19 + Vite, no backend. All historical data lives in JSON files under `src/data/`:

- `countries.json` — the 18 countries with continent grouping and color palette
- `monarchs.json` — ruler reigns (shown as shaded bands in each column)
- `events.json` — 300 dated events with coordinates, descriptions, and links
- `territories.json` — territorial border polygons at 8 time snapshots (1500–1700)

Design specs and implementation plans are under `docs/superpowers/`.
