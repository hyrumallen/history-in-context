# Map Visibility Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stacked timeline/map layout with a full-screen timeline, a floating corner mini-map, and a header toggle that swaps to a full-screen map view.

**Architecture:** `App.jsx` gains a `view` state (`'timeline' | 'map'`) and renders one `WorldMap` instance inside a wrapper whose styling switches between a 380×210px floating corner panel and a full-screen fill. `WorldMap` gains a `mode` prop (`'mini' | 'full'`) that disables its internal interactions in mini mode. Darker per-country map colors are added to `countries.json` and consumed by both the map territory layer and the timeline column headers so columns visually link to territories.

**Tech Stack:** React 19 + Vite. Inline styles throughout (project convention), shared CSS in `src/index.css`. No test framework exists and the spec specifies manual verification — each task verifies via `npm run lint`, `npm run build`, and a manual check in the dev server instead of unit tests.

**Spec:** `docs/superpowers/specs/2026-07-04-map-visibility-redesign-design.md`

## Global Constraints

- Header height stays 52px; header background `#1a1a2e`.
- Mini-map panel: bottom-right, `right: 18px; bottom: 18px; width: 380px; height: 210px`, rounded border + shadow.
- Timeline scroll position must survive toggling to map view and back (hide with `visibility: hidden`, never `display: none`, and never unmount `TimelineGrid`).
- Reign shading bands inside timeline columns keep the existing light pastel `color` values — only headers and map territories use the new darker colors.
- Transitions must respect `prefers-reduced-motion: reduce`.
- All new colors come from `countries.json` fields `mapColor` / `mapStroke` — no hard-coded per-country hex values in components.
- Dev server: `npm run dev` in the repo root (`history-in-context/`), opens `http://localhost:5173`.

---

### Task 1: Darker map palette in data + territory layer

**Files:**
- Modify: `src/data/countries.json`
- Modify: `src/components/TerritoryLayer.jsx:5` (colorMap) and `:34-38` (polygon fill/stroke)

**Interfaces:**
- Produces: `countries.json` entries each gain `"mapColor"` and `"mapStroke"` string fields (hex colors). Task 2 reads `country.mapColor`; existing `color` field is unchanged and still used by reign shading.

- [ ] **Step 1: Add mapColor/mapStroke to countries.json**

Replace the full contents of `src/data/countries.json` with:

```json
[
  { "id": "england", "name": "England", "color": "#c8d8e8", "mapColor": "#7d97b1", "mapStroke": "#5a7690" },
  { "id": "france", "name": "France", "color": "#c8e8d0", "mapColor": "#7fae8d", "mapStroke": "#5d8a6b" },
  { "id": "spain", "name": "Spain", "color": "#e8d8c8", "mapColor": "#b39a7e", "mapStroke": "#8f7659" },
  { "id": "holy-roman-empire", "name": "Holy Roman Empire", "color": "#e8e8c8", "mapColor": "#aaa878", "mapStroke": "#868453" },
  { "id": "russia", "name": "Russia", "color": "#e8c8c8", "mapColor": "#b18585", "mapStroke": "#8d6161" },
  { "id": "ottoman-empire", "name": "Ottoman Empire", "color": "#e0c8e8", "mapColor": "#9d80a8", "mapStroke": "#7a5e85" }
]
```

- [ ] **Step 2: Use the new colors in TerritoryLayer**

In `src/components/TerritoryLayer.jsx`, replace line 5:

```js
const colorMap = Object.fromEntries(countries.map(c => [c.id, c.color]))
```

with:

```js
const colorMap = Object.fromEntries(countries.map(c => [c.id, c.mapColor]))
const strokeMap = Object.fromEntries(countries.map(c => [c.id, c.mapStroke]))
```

and replace the `<polygon>` props (currently `fill`/`fillOpacity={0.6}`/`stroke`/`strokeWidth={0.5}`/`strokeOpacity={0.9}`) with:

```jsx
<polygon
  key={`${territory.countryId}-${polygon.name}`}
  points={toPoints(polygon.coords, width, height)}
  fill={colorMap[territory.countryId] ?? '#ccc'}
  fillOpacity={0.75}
  stroke={strokeMap[territory.countryId] ?? '#999'}
  strokeWidth={0.5}
  strokeOpacity={0.9}
/>
```

- [ ] **Step 3: Verify**

Run: `npm run lint` — Expected: no errors.
Run: `npm run build` — Expected: build succeeds.
Manual: `npm run dev`, open `http://localhost:5173`. The territories at the bottom map should be clearly darker (England steel blue `#7d97b1`, not pale blue). Scroll the timeline to a few different years — all six countries' territories should look darker at every snapshot.

- [ ] **Step 4: Commit**

```bash
git add src/data/countries.json src/components/TerritoryLayer.jsx
git commit -m "feat: darker territory colors on the map"
```

---

### Task 2: Column headers match territory colors

**Files:**
- Modify: `src/components/CountryHeader.jsx`

**Interfaces:**
- Consumes: `country.mapColor` from Task 1.

- [ ] **Step 1: Switch header background to mapColor**

Replace the full contents of `src/components/CountryHeader.jsx` with:

```jsx
export default function CountryHeader({ country }) {
  return (
    <div style={{
      background: country.mapColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      fontSize: '12.5px',
      letterSpacing: '0.3px',
      textAlign: 'center',
      padding: '4px 8px',
      height: '100%',
      color: '#1a1a2e',
    }}>
      {country.name}
    </div>
  )
}
```

(Two changes: `background` uses `mapColor`, and text color becomes the app ink `#1a1a2e`.)

- [ ] **Step 2: Verify**

Run: `npm run lint` — Expected: no errors.
Manual: in the dev server, each column header now matches the color of that country's territory on the map (e.g. England header and England territory are the same steel blue). Header text must remain readable on all six colors.

- [ ] **Step 3: Commit**

```bash
git add src/components/CountryHeader.jsx
git commit -m "feat: column headers use matching map territory colors"
```

---

### Task 3: WorldMap mode prop (mini / full)

**Files:**
- Modify: `src/components/WorldMap.jsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `WorldMap({ currentYear, onPinClick, mode })` where `mode` is `'mini' | 'full'` (default `'full'`). In mini mode the component renders non-interactively (no zoom/pan, no pin clicks, no hint text, identity transform) — the parent wrapper handles clicks. Task 4 relies on exactly this prop name and these values.

- [ ] **Step 1: Add the mode prop**

Replace the full contents of `src/components/WorldMap.jsx` with:

```jsx
import worldOutline from '../data/world-outline.json'
import TerritoryLayer from './TerritoryLayer'
import EventPinLayer from './EventPinLayer'
import useMapTransform from '../hooks/useMapTransform'

const W = 800
const H = 400

function project([lng, lat]) {
  return `${(lng + 180) * (W / 360)},${(90 - lat) * (H / 180)}`
}

function featureRings(feature) {
  const { type, coordinates } = feature.geometry
  if (type === 'Polygon') return [coordinates[0]]
  if (type === 'MultiPolygon') return coordinates.map(p => p[0])
  return []
}

export default function WorldMap({ currentYear, onPinClick, mode = 'full' }) {
  const { transform, handlers } = useMapTransform()
  const { scale, translateX, translateY } = transform
  const isMini = mode === 'mini'

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', background: '#b8d4e8' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: !isMini && scale > 1 ? 'grab' : 'default',
          pointerEvents: isMini ? 'none' : 'auto',
        }}
        {...(isMini ? {} : handlers)}
      >
        <g transform={isMini ? undefined : `translate(${translateX},${translateY}) scale(${scale})`}>
          <g fill="#e0e0e0" stroke="#c0c0c0" strokeWidth={0.3}>
            {worldOutline.features.map((f, i) =>
              featureRings(f).map((ring, j) => (
                <polygon key={`land-${i}-${j}`} points={ring.map(project).join(' ')} />
              ))
            )}
          </g>
          <TerritoryLayer currentYear={currentYear} width={W} height={H} />
          <EventPinLayer currentYear={currentYear} onPinClick={onPinClick} />
        </g>
      </svg>

      <div style={{
        position: 'absolute',
        bottom: 12,
        left: 16,
        background: 'rgba(26,26,46,0.82)',
        color: 'white',
        padding: '3px 10px',
        borderRadius: 4,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '0.3px',
        pointerEvents: 'none',
        fontFamily: 'inherit',
      }}>
        {currentYear}
      </div>

      {!isMini && (
        <div style={{
          position: 'absolute',
          bottom: 12,
          right: 16,
          color: 'rgba(255,255,255,0.5)',
          fontSize: 11,
          pointerEvents: 'none',
          fontFamily: 'inherit',
        }}>
          Scroll to zoom · drag to pan · double-click to reset
        </div>
      )}
    </div>
  )
}
```

Changes from the current file: new `mode` prop with `isMini` flag; svg gets `pointerEvents: 'none'` and no handlers in mini mode; the zoom/pan `<g>` transform is identity (`undefined`) in mini mode so the mini-map always shows the whole world; the zoom/pan hint is hidden in mini mode. The year badge stays in both modes. `onPinClick` may be `undefined` in mini mode — that's safe because pointer events are disabled.

- [ ] **Step 2: Verify**

Run: `npm run lint` — Expected: no errors.
Run: `npm run build` — Expected: build succeeds.
Manual: dev server still renders the map at the bottom exactly as before (App still passes no `mode`, so it defaults to `'full'` — zoom, pan, and pin clicks all still work).

- [ ] **Step 3: Commit**

```bash
git add src/components/WorldMap.jsx
git commit -m "feat: WorldMap mini/full mode prop"
```

---

### Task 4: App layout — full-screen timeline, floating mini-map, header toggle

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/index.css` (append two rules)

**Interfaces:**
- Consumes: `WorldMap` `mode` prop from Task 3 (`'mini' | 'full'`); `TimelineGrid({ onYearChange })` unchanged.
- Produces: final user-facing behavior; nothing downstream.

- [ ] **Step 1: Append map-panel CSS to src/index.css**

Add at the end of `src/index.css`:

```css
.map-panel {
  transition: width 200ms ease, height 200ms ease,
              right 200ms ease, bottom 200ms ease, border-radius 200ms ease;
}

.map-panel:focus-visible {
  outline: 3px solid #4a6fa5;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .map-panel { transition: none; }
}
```

- [ ] **Step 2: Rewrite App.jsx**

Replace the full contents of `src/App.jsx` with:

```jsx
import { useState, useCallback, useRef } from 'react'
import TimelineGrid from './components/TimelineGrid'
import Legend from './components/Legend'
import WorldMap from './components/WorldMap'

const MINI_PANEL_STYLE = {
  position: 'absolute',
  right: 18,
  bottom: 18,
  width: 380,
  height: 210,
  border: '2px solid #1a1a2e',
  borderRadius: 8,
  boxShadow: '0 6px 24px rgba(26, 26, 46, 0.35)',
  overflow: 'hidden',
  cursor: 'zoom-in',
  zIndex: 10,
}

const FULL_PANEL_STYLE = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
  border: 'none',
  borderRadius: 0,
  overflow: 'hidden',
  zIndex: 10,
}

function viewButtonStyle(active, side) {
  return {
    font: 'inherit',
    fontSize: '12.5px',
    fontWeight: 600,
    padding: '5px 14px',
    cursor: 'pointer',
    background: active ? '#4a6fa5' : '#2e2e4e',
    color: active ? 'white' : '#bbbbdd',
    border: `1px solid ${active ? '#4a6fa5' : '#44446a'}`,
    borderRadius: side === 'left' ? '5px 0 0 5px' : '0 5px 5px 0',
  }
}

function App() {
  const [currentYear, setCurrentYear] = useState(1500)
  const [view, setView] = useState('timeline')
  const highlightElRef = useRef(null)

  const handleYearChange = useCallback((year) => {
    setCurrentYear(year)
  }, [])

  const handlePinClick = useCallback((eventId) => {
    setView('timeline')
    const el = document.querySelector(`[data-event-id="${eventId}"]`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (highlightElRef.current && highlightElRef.current !== el) {
      highlightElRef.current.classList.remove('event-highlight')
    }
    highlightElRef.current = el
    el.classList.remove('event-highlight')
    void el.offsetWidth
    el.classList.add('event-highlight')
    el.addEventListener('animationend', () => {
      el.classList.remove('event-highlight')
      if (highlightElRef.current === el) highlightElRef.current = null
    }, { once: true })
  }, [])

  const isMini = view === 'timeline'

  const expandProps = isMini ? {
    role: 'button',
    tabIndex: 0,
    'aria-label': 'Expand world map',
    onClick: () => setView('map'),
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setView('map')
      }
    },
  } : {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{
        background: '#1a1a2e',
        color: 'white',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexShrink: 0,
        height: '52px',
      }}>
        <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.3px' }}>
          History in Context
        </span>
        <span style={{ fontSize: '13px', color: '#9999bb', letterSpacing: '0.5px' }}>
          1500 – 1700 · The Early Modern World
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex' }}>
            <button style={viewButtonStyle(view === 'timeline', 'left')} onClick={() => setView('timeline')}>
              Timeline
            </button>
            <button style={viewButtonStyle(view === 'map', 'right')} onClick={() => setView('map')}>
              Map
            </button>
          </div>
          <Legend />
        </div>
      </header>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, visibility: view === 'map' ? 'hidden' : 'visible' }}>
          <TimelineGrid onYearChange={handleYearChange} />
        </div>

        <div
          className="map-panel"
          style={isMini ? MINI_PANEL_STYLE : FULL_PANEL_STYLE}
          {...expandProps}
        >
          <WorldMap
            mode={isMini ? 'mini' : 'full'}
            currentYear={currentYear}
            onPinClick={handlePinClick}
          />
        </div>
      </div>
    </div>
  )
}

export default App
```

Key points a reviewer should check:
- `TimelineGrid` is always mounted and hidden with `visibility: hidden` (not `display: none`, which would reset its scroll position).
- One `WorldMap` instance in one wrapper `div` — the wrapper's style object swaps, so the CSS transition in `.map-panel` animates the expand/collapse.
- `handlePinClick` calls `setView('timeline')` first; `scrollIntoView` works immediately because the hidden grid still has layout (`visibility` preserves it).
- The header switched `alignItems` from `baseline` to `center` so the buttons align; title/subtitle relationship is preserved visually.

- [ ] **Step 3: Verify**

Run: `npm run lint` — Expected: no errors.
Run: `npm run build` — Expected: build succeeds.
Manual (dev server):
1. Load → timeline fills the window; mini-map floats bottom-right with year badge; no bottom map strip.
2. Scroll timeline → year badge updates on the mini-map.
3. Click mini-map → map expands to full screen (animated); header shows "Map" active; zoom/pan works.
4. Click "Timeline" → back to full-screen timeline at the same scroll position, mini-map back in corner.
5. Tab key focuses the mini-map (visible outline); Enter expands it.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/index.css
git commit -m "feat: full-screen timeline with floating mini-map and view toggle"
```

---

### Task 5: Full manual verification pass (spec testing checklist)

**Files:** none (verification only)

**Interfaces:**
- Consumes: everything above.

- [ ] **Step 1: Run the spec's manual test checklist**

With `npm run dev` running, verify each item from the spec:

1. Load app → timeline fills window, mini-map floats bottom-right with year badge. Expected: PASS.
2. Scroll timeline → year badge updates in mini mode. Expected: PASS.
3. Click mini-map → full-screen map; zoom/pan works; toggle shows "Map" active. Expected: PASS.
4. In full map view, scroll to a year with pins (e.g. 1588) via the timeline first, then click a pin → returns to timeline view, scrolled to the event with a yellow flash highlight. Expected: PASS.
5. Toggle back and forth several times → timeline scroll position preserved every time. Expected: PASS.
6. Column header colors match territory colors on the map for all six countries. Expected: PASS.

- [ ] **Step 2: Fix anything that fails**

If any check fails, fix it within the task that introduced it (the fix belongs to this branch, same files as Tasks 1–4), re-run the checklist, and commit the fix with message `fix: <what was wrong>`.

- [ ] **Step 3: Final commit check**

Run: `git status` — Expected: clean working tree (mockups/playground changes were already committed earlier).
Run: `git log --oneline master..HEAD` — Expected: the spec commit plus one commit per task (and any fixes).
