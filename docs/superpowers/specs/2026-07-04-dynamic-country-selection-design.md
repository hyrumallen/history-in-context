# Dynamic Country Selection — Design Spec

**Date:** 2026-07-04
**Branch:** `feature/dynamic-countries`
**Status:** Approved by Allen (via plan mode, 2026-07-04)
**Version target:** v26.2 on merge

## Problem

The timeline shows a fixed set of 6 European powers. Allen wants users to choose which countries appear, grouped by continent with continent-level select-all, and wants the app expanded beyond Europe so that grouping means something.

## Scope

Two kinds of work in one feature:

1. **Selector UI** — a collapsible right-hand sidebar for choosing timeline countries.
2. **Data expansion** — 12 new countries (18 total), added in reviewable continent batches:
   - **Europe +4:** Portugal, Dutch Republic, Sweden, Poland-Lithuania
   - **Asia & Middle East +4:** Ming/Qing China, Japan, Mughal India, Safavid Persia
   - **Africa +2:** Songhai Empire, Ethiopia
   - **Americas +2:** Aztec Empire, Inca Empire

## Decisions

- **Sidebar:** collapsible, ~230px, right side. Continent group checkboxes (select/deselect all in group, indeterminate when partial) with per-country checkboxes beneath. Header gains a "Countries" toggle button. The floating mini-map shifts left so it never sits under the open sidebar.
- **Map mirrors selection:** territory polygons and event pins render only for selected countries.
- **Default selection:** the original 6 countries. Selection persists in `localStorage` key `hic-selected-countries`.
- **Legend moves** from the header into a strip at the top of the sidebar (header was getting crowded; legend restyles dark-on-light).
- **Empty selection:** centered message in the grid area — "No countries selected — open the Countries panel to choose." with a button that opens the sidebar.

## Gap review resolutions

1. **Non-monarch polities** (stadtholders, shoguns, askias): keep `monarchs.json` schema/name; entries are "rulers." Tooltip copy (name + years) already generic.
2. **Aztec/Inca end mid-era** (1521/1533): reign shading naturally stops (existing `getMonarchBg` returns white when no ruler matches); each gets a final conquest event; territories absent from later map snapshots.
3. **Color system:** hue families by continent — Europe blues/greens (existing pastels stay), Asia & Middle East reds/oranges/golds, Africa earth tones, Americas purples. Every country keeps the triple: `color` (light, reign bands), `mapColor` (header + territory fill), `mapStroke` (territory outline).
4. **Deferred (out of scope):** URL-encoded selection sharing, selector search box, drag-to-reorder columns, mobile layout.

## Architecture

**State (App.jsx):** `selectedCountryIds: string[]` initialized from localStorage (fallback: original 6 ids), persisted on change; `sidebarOpen: boolean`.

**Data schema changes:**
- `countries.json`: all entries gain `"continent"`: `"Europe" | "Asia & Middle East" | "Africa" | "Americas"`; 12 new entries.
- `monarchs.json`, `events.json`, `territories.json`: new-country entries, existing schemas unchanged. Event ids continue the `eNNN` sequence.

**Components:**
- **New `CountrySidebar.jsx`** — props `{ countries, selectedIds, onChange, open }`; groups by continent; continent checkbox with indeterminate state; Legend strip at top. (The header Countries button owns open/close.)
- **`TimelineGrid.jsx`** — new prop `selectedCountries` (array of country objects, ordered as in countries.json); renders only those columns; empty-state message + "open panel" button (via new `onOpenSidebar` prop) when empty.
- **`TerritoryLayer.jsx` / `EventPinLayer.jsx`** — new prop `selectedIds` (Set); skip non-selected countries.
- **`WorldMap.jsx`** — accepts and forwards `selectedIds`.
- **`Legend.jsx`** — restyled for light sidebar background.
- **`App.jsx`** — layout `header / [content | sidebar]`; sidebar is a flex sibling (width 230px open / 0 closed, transition honoring `prefers-reduced-motion`); mini-map keeps `right: 18px` relative to the content area, which shrinks when the sidebar opens.

## Implementation phases

- **Phase A — selector UI** with the existing 6 countries end-to-end (data plumbing, sidebar, filtering, persistence, empty state).
- **Phase B — Europe batch**, **Phase C — Asia & Middle East batch**, **Phase D — Africa batch**, **Phase E — Americas batch**: each batch = countries.json entries + rulers + ~15-20 events with coordinates + territory polygons for the 8 snapshots, paused for Allen's historical-accuracy review before commit.

## Verification (manual, per project convention)

1. Default load identical to v26.1 (original 6, sidebar closed).
2. Sidebar: continent select-all adds/removes whole groups; single country toggles its column, territory, and pins together.
3. Continent checkbox indeterminate when group partially selected.
4. Empty selection shows the message; its button opens the sidebar.
5. Reload preserves selection (localStorage).
6. Mini-map never overlaps the open sidebar; pin-click round trip works for new countries.
7. Allen reviews each continent batch for historical accuracy before its commit.
