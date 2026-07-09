# Design Spec: Mobile Adaptation

**Date:** 2026-07-09
**Status:** Approved
**Topic:** Make History in Context usable on phones (approach B — adapt the layout; swipe-through-columns navigation)

## Goal

The app works well on a PC but is barely usable on a phone. Make the timeline
genuinely usable on small screens **without** forking into a separate mobile app
and **without** dropping the side-by-side "parallel history" concept that makes it
special. The user keeps their full country selection and swipes horizontally
through columns; two columns are readable at once on a ~390px screen.

## Background (current state)

- No responsive breakpoints exist anywhere (`src/index.css` only has
  `prefers-reduced-motion` rules). Layout is sized for wide screens.
- Column widths are inline-style constants in `src/components/TimelineGrid.jsx`:
  `YEAR_COL_WIDTH = '60px'`, `COUNTRY_COL_WIDTH = '180px'`,
  `HEADER_HEIGHT = '48px'`, `ROW_HEIGHT = '28px'`. Default 6 countries →
  `60 + 6×180 = 1140px`, ~3× a 390px phone.
- The world map (`src/App.jsx`) is a fixed `380×210` floating panel
  (`MINI_PANEL_STYLE`) bottom-right; on a phone it covers nearly the whole width.
  A header "Map" button already switches `view` to `'map'`, which renders the
  same `WorldMap` full-screen (`FULL_PANEL_STYLE`). That full-screen path is
  reused as-is on mobile.
- The header (`src/App.jsx`) has title + subtitle + Timeline/Map toggle +
  Countries button at a fixed 52px height.
- `CountrySidebar` is a flex sibling with `width: open ? 230 : 0`, so opening it
  *pushes* the grid narrower — on a phone that crushes the timeline to ~160px.
- `index.html` already has `<meta name="viewport" content="width=device-width,
  initial-scale=1.0" />` — no change needed.

## Requirements

1. **Mobile trigger.** A reusable hook reports whether the viewport is a phone
   (≤ 640px), updating live on resize/orientation change.
2. **Narrower, swipeable grid.** On mobile, columns shrink to ~150px and the year
   gutter to ~44px so ~2 columns fit a 390px screen with a sliver of the next
   visible. Horizontal swipe (native scroll) moves between countries; the full
   selection is kept. CSS scroll-snap settles each swipe on a column boundary.
3. **Floating map hidden on mobile.** The always-on `380×210` mini-map is not
   rendered on phones; the existing header "Map" button opens the full-screen
   map. (Accepted tradeoff: no always-visible year-synced mini-map on phones.)
4. **Header fits mobile.** The subtitle is hidden and padding tightened on phones;
   title, Timeline/Map toggle, and Countries button remain reachable.
5. **Sidebar overlays on mobile.** On phones the Countries sidebar slides in as an
   overlay (~80% width, above the grid) instead of pushing the grid. Desktop
   behavior is unchanged.

## Design

### New unit: `src/hooks/useIsMobile.js`

`useIsMobile(breakpoint = 640)` — subscribes to
`window.matchMedia('(max-width: 640px)')`, returns a boolean, updates on change.
Cleans up its listener on unmount. Single responsibility: "is this a phone-width
viewport?" Consumed by `App.jsx` and `TimelineGrid.jsx`.

### `src/components/TimelineGrid.jsx`

- Read `useIsMobile()`. Derive column/gutter widths from it:
  - desktop: gutter `60px`, column `180px` (unchanged)
  - mobile: gutter `44px`, column `150px`
- The existing scroll container already does `overflow: auto`; on mobile add
  `scrollSnapType: 'x proximity'` to it and `scrollSnapAlign: 'start'` to each
  country header/column so swipes settle on a column. `proximity` (not
  `mandatory`) so vertical time-scroll isn't fought.
- Overlays (ribbon labels, watermarks) already position from measured offsets via
  `ResizeObserver`, so they re-measure when widths change — no extra work beyond
  confirming they look right at mobile widths.

### `src/App.jsx`

- Read `useIsMobile()`.
- **Map:** render the floating map panel only when `!isMobile || view === 'map'`.
  In practice: on mobile, skip the mini-panel branch entirely; the full-screen
  branch (`view === 'map'`) still renders. Desktop unchanged.
- **Header:** hide the subtitle span when `isMobile`; reduce header horizontal
  padding (e.g. `0 12px`) on mobile.
- **Sidebar:** pass an `overlay` flag (or apply overlay positioning) so that on
  mobile the sidebar is `position: absolute; right: 0; top: 0; bottom: 0;
  width: 80%` with a high z-index and a shadow, instead of participating in the
  flex row. Desktop keeps the current push behavior.

### `src/components/CountrySidebar.jsx`

Accept an `overlay` boolean prop. When true, use absolute overlay positioning and
full width regardless of `open` (visibility/transform driven by `open`). When
false, keep the existing `width: open ? 230 : 0` flex behavior.

## Out of Scope

- Compare-two country picker (swipe was chosen instead).
- Any separate/standalone mobile view (approach C, rejected).
- Converting ruler `title` hover tooltips to tap sheets — ruler names are already
  always-visible ribbon labels, and tapping an event already opens its card, so
  touch users retain the core information.
- A shrunk always-on map pill for phones (map is header-button-only on mobile).

## Verification / Definition of Done

1. At ≤ 640px width: exactly ~2 country columns are readable with a sliver of the
   third; horizontal swipe reveals the remaining selected countries and snaps to
   columns; vertical scroll still drives the year.
2. The floating mini-map does not appear on mobile; the header "Map" button opens
   the full-screen map, which works (pins, pan/zoom) as before.
3. The header shows no subtitle on mobile and nothing overflows; title + toggle +
   Countries remain tappable.
4. Opening Countries on mobile overlays the grid (does not shrink it); closing
   returns to the timeline.
5. Desktop (> 640px) layout and behavior are unchanged from today.
6. `npm run lint` and `npm test` pass.

## Rollout Notes

Standard flow: branch `feature/mobile-adaptation`, spec + plan under
`docs/superpowers/`, merge to `master` with `--no-ff`, tag the next `v26.x`, push,
delete the branch. Merging to `master` auto-deploys via the Pages workflow, so the
mobile changes go live on merge — verify on a real phone afterward.
