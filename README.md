# History in Context

**Live site:** https://hyrumallen.github.io/history-in-context/

A browser-based timeline of five centuries of history (1500–2000). Historical events didn't happen in isolation — this app shows 22 countries side by side so you can see what was happening everywhere at once. Countries evolve through their successor states as you scroll: the Holy Roman Empire becomes Germany, the Ottoman Empire becomes Turkey.

## Features

- **Timeline grid** — one column per country, one row per year, with events and color-coded ruler reign bands
- **Dynamic country selection** — a collapsible sidebar groups 22 countries by continent (Europe, Asia & Middle East, Africa, Americas) with per-country and per-continent checkboxes; your selection is remembered between visits
- **World map** — a floating mini-map follows your scroll year, showing shifting territorial borders and event pins; click it (or the header toggle) for a full-screen map with zoom and pan
- **Interactive map** — the expanded map has a year slider with a play/time-lapse button (borders morph and events appear as time flows), a color legend, and hover/tap cards on event pins with Wikipedia summaries and a jump-to-timeline link
- **Linked navigation** — click a map pin to jump to that event in the timeline
- **Mobile-friendly** — on phones (≤ 640px) columns narrow and become swipeable, the map opens full-screen from the header, and the Countries panel slides in as an overlay

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Tech

React 19 + Vite, no backend. All historical data lives in JSON files under `src/data/`:

- `countries.json` — the 22 countries with continent grouping, color palette, and successor-state eras
- `rulers.json` — ruler reigns from monarchs to presidents (shown as shaded bands in each column)
- `events.json` — 500+ dated events with coordinates, descriptions, and links
- `territories.json` — territorial borders (GeoJSON MultiPolygon coordinates) at 19 time snapshots (1500–2000)

All 22 countries are populated across the full 1500–2000 range, evolving through their successor states (Holy Roman Empire → Germany, Aztec Empire → Mexico, Songhai → Mali). Colonial and stateless periods show events under an era label with no ruler — history keeps happening even when the state is gone.

Design specs and implementation plans are under `docs/superpowers/`.

## Data & license

Historical border geometry in `src/data/territories.json` is derived from
[aourednik/historical-basemaps](https://github.com/aourednik/historical-basemaps),
licensed GPL-3.0. Because that data is included here, this project is likewise
licensed under the [GPL-3.0](LICENSE).

Coastlines in `src/data/world-outline.json` are from Natural Earth (public domain).

Regenerate the territory data with:

```bash
npm run fetch:basemaps      # downloads source GeoJSON into .cache/ (gitignored)
npm run build:territories   # writes src/data/territories.json
```

Which source features belong to which country in which snapshot year is defined
in `scripts/territory-map.json`.
