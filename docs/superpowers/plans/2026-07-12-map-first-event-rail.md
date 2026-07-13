# Map-First with Live Event Rail — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the world map the app's default/primary view and add a live event rail that names events as their pins appear on the globe, while preserving the timeline grid as a secondary "study mode."

**Architecture:** Flip the default `view` in `App.jsx` from `'timeline'` to `'map'`. Add a pure `railItems()` helper (built on the existing `pinsInWindow`) and a new `EventRail` component that renders it — docked on the right of the full map (desktop) or as a bottom sheet (mobile). A `focusedId` state inside `WorldMap` cross-highlights rail rows and map pins. Everything reuses existing pieces: `pinsInWindow`, `hoverCardStore`/`EventHoverCard`, `TYPE_COLORS`, `MapControls`, `usePlayback`, and the existing `Timeline | Map` header toggle.

**Tech Stack:** React + Vite, plain inline styles (project convention), vitest for unit tests. No new dependencies.

## Global Constraints

- No new npm dependencies; inline styles only (match existing components).
- Pure list/derivation logic lives in `src/mapPins.js` and is unit-tested with vitest; React components are verified by build + lint + manual dev-server check (the project has no component-render test setup).
- Serif font for titles comes from `SERIF` in `src/constants.js`; event-type colors from `TYPE_COLORS` in `src/eventTypeColors.js`.
- Event fields: `{ id, year, countryId, type, title, description, link, lat, lng }`. Country fields include `{ id, name }`.
- Mini-map (`mode === 'mini'`) must NOT render the rail or any full-map controls.
- Desktop layout (grid, overlays, mini-map, `MapControls`, territories) stays behaviorally unchanged except for the default view flip.
- Verify against the dev server (`npm run dev`, http://localhost:5173) — NOT `vite preview` (serves wrong MIME type on this Windows box, blank page).

---

### Task 1: `railItems` pure helper

**Files:**
- Modify: `src/mapPins.js`
- Test: `src/mapPins.test.js`

**Interfaces:**
- Consumes: `pinsInWindow(events, year, selectedIds)` (existing, same file).
- Produces: `railItems(events, year, selectedIds)` → `Array<{ event, emphasis: boolean }>`, sorted by `event.year` ascending then `event.id` ascending; `emphasis` is `true` only when `event.year === year`.

- [ ] **Step 1: Write the failing test**

Add to `src/mapPins.test.js` (the `ev`/`sel` helpers already exist at the top of the file):

```js
import { pinsInWindow, pinEmphasis, railItems } from './mapPins'

describe('railItems', () => {
  const events = [
    ev('e3', 1508, 'a'), ev('e1', 1500, 'a'), ev('e2', 1500, 'b'), ev('e9', 1510, 'a'),
  ]
  it('returns decade-window events sorted by year then id, emphasis on the exact year', () => {
    const rows = railItems(events, 1500, sel)
    expect(rows.map(r => r.event.id)).toEqual(['e1', 'e2', 'e3'])
    expect(rows.map(r => r.emphasis)).toEqual([true, true, false])
  })
  it('is empty when no events fall in the decade window', () => {
    expect(railItems(events, 1520, sel)).toEqual([])
  })
})
```

Note: update the existing top-of-file import line to add `railItems` (shown above); do not add a second import line.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run mapPins`
Expected: FAIL — `railItems is not a function` (or export missing).

- [ ] **Step 3: Write minimal implementation**

Append to `src/mapPins.js`:

```js
// Rows for the event rail: the same decade-window pins, sorted for reading,
// each flagged with whether it lands on the exact current year (emphasis).
export function railItems(events, year, selectedIds) {
  return pinsInWindow(events, year, selectedIds)
    .slice()
    .sort((a, b) => a.year - b.year || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map(event => ({ event, emphasis: event.year === year }))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run mapPins`
Expected: PASS (both new tests plus the existing `pinsInWindow`/`pinEmphasis` tests).

- [ ] **Step 5: Commit**

```bash
git add src/mapPins.js src/mapPins.test.js
git commit -m "Add railItems helper for the map event rail"
```

---

### Task 2: EventRail component (desktop) + map-first default

**Files:**
- Create: `src/components/EventRail.jsx`
- Modify: `src/components/WorldMap.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `railItems` (Task 1); `showCard`, `scheduleHide` from `src/hoverCardStore.js`; `TYPE_COLORS` from `src/eventTypeColors.js`; `SERIF` from `src/constants.js`; `useIsMobile` from `src/hooks/useIsMobile.js`; `countries` from `src/data/countries.json`; `events` from `src/data/events.json`.
- Produces: `EventRail` default export with props `{ currentYear, selectedIds, focusedId, onFocus, onShowInTimeline }`. `WorldMap` gains a `focusedId` state and a new prop `onShowInTimeline`. `App` passes `onShowInTimeline={handlePinClick}` to both `WorldMap` instances and defaults `view` to `'map'`.

- [ ] **Step 1: Create `src/components/EventRail.jsx`**

```jsx
import events from '../data/events.json'
import countries from '../data/countries.json'
import { TYPE_COLORS } from '../eventTypeColors'
import { railItems } from '../mapPins'
import { showCard, scheduleHide } from '../hoverCardStore'
import { useIsMobile } from '../hooks/useIsMobile'
import { SERIF } from '../constants'

const COUNTRY_NAME = Object.fromEntries(countries.map(c => [c.id, c.name]))

function decadeLabel(year) {
  const start = Math.floor(year / 10) * 10
  return `${start}–${start + 9}`
}

function RailRow({ event, emphasis, focused, onFocus, onShowInTimeline }) {
  const color = TYPE_COLORS[event.type] ?? TYPE_COLORS.other
  return (
    <li
      onMouseEnter={(e) => { onFocus?.(event.id); showCard(event, e.currentTarget.getBoundingClientRect(), false) }}
      onMouseLeave={() => { onFocus?.(null); scheduleHide() }}
      onClick={() => onShowInTimeline?.(event.id)}
      style={{
        display: 'flex', alignItems: 'baseline', gap: 8, padding: '5px 10px',
        cursor: 'pointer', listStyle: 'none',
        background: focused ? 'rgba(74,111,165,0.15)' : 'transparent',
        opacity: emphasis ? 1 : 0.5,
        borderLeft: `3px solid ${emphasis ? color : 'transparent'}`,
      }}
    >
      <span style={{ fontVariantNumeric: 'tabular-nums', color: '#8a7a5a', fontWeight: 600, minWidth: 34 }}>{event.year}</span>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, alignSelf: 'center' }} />
      <span style={{ flex: 1 }}>
        <span style={{ fontFamily: SERIF }}>{event.title}</span>
        <span style={{ display: 'block', fontSize: 11, color: '#8a7a5a' }}>{COUNTRY_NAME[event.countryId] ?? event.countryId}</span>
      </span>
    </li>
  )
}

export default function EventRail({ currentYear, selectedIds, focusedId, onFocus, onShowInTimeline }) {
  const isMobile = useIsMobile()
  const rows = railItems(events, currentYear, selectedIds)

  const header = (
    <div style={{
      padding: '8px 10px', fontFamily: SERIF, fontWeight: 700, fontSize: 13,
      color: '#4a3a22', borderBottom: '1px solid #d8c9a8', flexShrink: 0,
      fontVariantNumeric: 'tabular-nums',
    }}>
      {decadeLabel(currentYear)} · {rows.length} {rows.length === 1 ? 'event' : 'events'}
    </div>
  )

  const list = (
    <ul style={{ margin: 0, padding: 0, overflowY: 'auto', flex: 1 }}>
      {rows.length === 0 ? (
        <li style={{ listStyle: 'none', padding: '12px 10px', color: '#8a7a5a', fontStyle: 'italic' }}>
          No recorded events this decade.
        </li>
      ) : rows.map(({ event, emphasis }) => (
        <RailRow
          key={event.id}
          event={event}
          emphasis={emphasis}
          focused={event.id === focusedId}
          onFocus={onFocus}
          onShowInTimeline={onShowInTimeline}
        />
      ))}
    </ul>
  )

  // Mobile bottom-sheet is added in Task 4; desktop docked panel for now.
  if (isMobile) return null

  return (
    <aside style={{
      width: 320, flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column',
      background: 'rgba(253,249,239,0.96)', borderLeft: '1px solid #d8c9a8',
      fontSize: 12.5, color: '#1a1a1a',
    }}>
      {header}
      {list}
    </aside>
  )
}
```

- [ ] **Step 2: Wrap the map in a flex row and render the rail in `WorldMap.jsx`**

Replace the entire body of `src/components/WorldMap.jsx` with the version below. Changes vs. current: adds `useState` import, `EventRail` import, `onShowInTimeline` prop, a `focusedId` state, wraps the existing map markup in a flex row, moves the map background onto the inner map area, passes `focusedId`/`onFocus` into `EventPinLayer`, and renders `<EventRail>` when not mini.

```jsx
import { useState } from 'react'
import worldOutline from '../data/world-outline.json'
import TerritoryLayer from './TerritoryLayer'
import EventPinLayer from './EventPinLayer'
import useMapTransform from '../hooks/useMapTransform'
import { START_YEAR, END_YEAR } from '../constants'
import Legend from './Legend'
import MapControls from './MapControls'
import EventRail from './EventRail'

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

export default function WorldMap({ currentYear, mode = 'mini', selectedIds, playing, onYearChange, onTogglePlay, onShowInTimeline }) {
  const { transform, handlers } = useMapTransform()
  const { scale, translateX, translateY } = transform
  const isMini = mode === 'mini'
  const [focusedId, setFocusedId] = useState(null)

  const mapArea = (
    <div style={{ flex: 1, minWidth: 0, height: '100%', overflow: 'hidden', position: 'relative', background: '#b8d4e8' }}>
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
          <TerritoryLayer currentYear={currentYear} width={W} height={H} selectedIds={selectedIds} />
          <EventPinLayer
            currentYear={currentYear}
            selectedIds={selectedIds}
            isMini={isMini}
            focusedId={focusedId}
            onFocus={setFocusedId}
          />
        </g>
      </svg>

      <div style={{
        position: 'absolute', bottom: 12, left: 16,
        background: 'rgba(26,26,46,0.82)', color: 'white', padding: '3px 10px',
        borderRadius: 4, fontSize: 13, fontWeight: 600, letterSpacing: '0.3px',
        pointerEvents: 'none', fontFamily: 'inherit',
      }}>
        {currentYear}
      </div>

      {!isMini && (
        <div style={{
          position: 'absolute', bottom: 12, right: 16, color: 'rgba(255,255,255,0.5)',
          fontSize: 11, pointerEvents: 'none', fontFamily: 'inherit',
        }}>
          Scroll to zoom · drag to pan · double-click to reset
        </div>
      )}

      {!isMini && (
        <div style={{
          position: 'absolute', top: 12, left: 16,
          background: 'rgba(253,249,239,0.92)', border: '1px solid #d8c9a8',
          borderRadius: 6, padding: '8px 10px', pointerEvents: 'none',
        }}>
          <Legend />
        </div>
      )}

      {!isMini && (
        <MapControls
          year={currentYear}
          onYearChange={onYearChange}
          playing={playing}
          onTogglePlay={onTogglePlay}
          min={START_YEAR}
          max={END_YEAR}
        />
      )}
    </div>
  )

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      {mapArea}
      {!isMini && (
        <EventRail
          currentYear={currentYear}
          selectedIds={selectedIds}
          focusedId={focusedId}
          onFocus={setFocusedId}
          onShowInTimeline={onShowInTimeline}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Flip default view and pass `onShowInTimeline` in `App.jsx`**

In `src/App.jsx`, change the default view state:

```jsx
const [view, setView] = useState('map')
```

Then add `onShowInTimeline={handlePinClick}` to BOTH `<WorldMap ... />` instances (the mobile branch around line 220 and the desktop branch around line 258). Example (desktop instance):

```jsx
<WorldMap
  mode={isMini ? 'mini' : 'full'}
  currentYear={currentYear}
  selectedIds={selectedIdSet}
  playing={playing}
  onYearChange={handleMapYear}
  onTogglePlay={togglePlay}
  onShowInTimeline={handlePinClick}
/>
```

Apply the same `onShowInTimeline={handlePinClick}` addition to the mobile `<WorldMap mode="full" ... />`.

- [ ] **Step 4: Verify build, lint, and unit tests**

Run: `npm run lint && npm test -- --run && npm run build`
Expected: lint clean, all tests pass, build succeeds.

- [ ] **Step 5: Manual verification on the dev server**

Run: `npm run dev` and open http://localhost:5173
Expected:
- App now **lands on the full-screen world map** (not the grid).
- A docked rail on the right lists the current decade's events (`1500–1509 · N events`); hovering a row opens the Wikipedia hover card; clicking a row switches to the timeline and flashes that event.
- Dragging the year slider / pressing ▶ updates the rail live; exact-current-year rows are full-opacity with a colored left border, others dimmed.
- Header `Timeline` button still shows the grid + mini-map; `Map` returns to the map + rail.

- [ ] **Step 6: Commit**

```bash
git add src/components/EventRail.jsx src/components/WorldMap.jsx src/App.jsx
git commit -m "Add desktop event rail and make the map the default view"
```

---

### Task 3: Rail ↔ pin cross-highlight

**Files:**
- Modify: `src/components/EventPinLayer.jsx`

**Interfaces:**
- Consumes: `focusedId` and `onFocus` props now passed by `WorldMap` (Task 2).
- Produces: pins that (a) enlarge/ring when `event.id === focusedId`, and (b) set `focusedId` via `onFocus` on hover — so hovering a pin highlights its rail row and vice-versa.

- [ ] **Step 1: Add `focusedId`/`onFocus` handling to `EventPinLayer.jsx`**

Update the component signature and the `<circle>` render. Replace the current `export default function EventPinLayer(...) { ... }` body with:

```jsx
export default function EventPinLayer({ currentYear, selectedIds, isMini, focusedId, onFocus }) {
  const pins = isMini
    ? events.filter(e => e.year === currentYear && e.lat != null && selectedIds.has(e.countryId))
    : pinsInWindow(events, currentYear, selectedIds)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const openCard = (event, target, pinned) => {
    clearTimeout(timerRef.current)
    showCard(event, target.getBoundingClientRect(), pinned)
  }

  return (
    <g>
      {pins.map(event => {
        const [cx, cy] = project(event.lng, event.lat)
        const base = isMini ? { r: 4, opacity: undefined } : pinEmphasis(event.year, currentYear)
        const focused = event.id === focusedId
        const r = focused ? base.r + 2 : base.r
        const opacity = focused ? 1 : base.opacity
        return (
          <circle
            key={event.id}
            cx={cx}
            cy={cy}
            r={r}
            fill={TYPE_COLORS[event.type] ?? TYPE_COLORS.other}
            stroke={focused ? '#1a1a2e' : 'white'}
            strokeWidth={focused ? 1.6 : 0.8}
            opacity={opacity}
            style={{ cursor: 'pointer' }}
            onMouseEnter={(e) => {
              const target = e.currentTarget
              onFocus?.(event.id)
              clearTimeout(timerRef.current)
              timerRef.current = setTimeout(() => openCard(event, target, false), HOVER_DELAY_MS)
            }}
            onMouseLeave={() => { onFocus?.(null); clearTimeout(timerRef.current); scheduleHide() }}
            onClick={(e) => openCard(event, e.currentTarget, true)}
          />
        )
      })}
    </g>
  )
}
```

- [ ] **Step 2: Verify build and lint**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 3: Manual verification on the dev server**

Run: `npm run dev` (if not already running) and open http://localhost:5173
Expected:
- Hovering a **rail row** enlarges/outlines its **pin** on the map.
- Hovering a **pin** highlights its **rail row** (light blue background).
- Mini-map (Timeline view) is unaffected — no `onFocus` passed, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/EventPinLayer.jsx
git commit -m "Cross-highlight event rail rows and map pins"
```

---

### Task 4: Mobile bottom-sheet rail

**Files:**
- Modify: `src/components/EventRail.jsx`

**Interfaces:**
- Consumes: same props as Task 2 (`currentYear`, `selectedIds`, `focusedId`, `onFocus`, `onShowInTimeline`) plus `useState` from React.
- Produces: on mobile, `EventRail` renders a collapsible bottom sheet instead of returning `null`.

- [ ] **Step 1: Replace the mobile `return null` with a bottom sheet**

In `src/components/EventRail.jsx`, add `useState` to the React import at the top:

```jsx
import { useState } from 'react'
```

Then replace the line `if (isMobile) return null` with the collapsible bottom-sheet branch below (it reuses the `list`/`rows` already defined above it in `EventRail`). The desktop return path below still uses `header`, so that variable stays in use:

```jsx
  if (isMobile) {
    return <MobileSheet list={list} rows={rows} currentYear={currentYear} />
  }
```

And add the `MobileSheet` component above `EventRail` (after `RailRow`):

```jsx
function MobileSheet({ header, list, rows, currentYear }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 45,
      background: 'rgba(253,249,239,0.97)', borderTop: '1px solid #d8c9a8',
      display: 'flex', flexDirection: 'column',
      maxHeight: open ? '45vh' : 40, transition: 'max-height 0.2s ease',
      color: '#1a1a1a', fontSize: 12.5,
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          font: 'inherit', width: '100%', textAlign: 'left', cursor: 'pointer',
          padding: '10px 12px', background: 'none', border: 'none',
          fontFamily: SERIF, fontWeight: 700, fontSize: 13, color: '#4a3a22',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span>{decadeLabel(currentYear)} · {rows.length} {rows.length === 1 ? 'event' : 'events'}</span>
        <span>{open ? '▾' : '▴'}</span>
      </button>
      {open && list}
    </div>
  )
}
```

- [ ] **Step 2: Verify build and lint**

Run: `npm run lint && npm run build`
Expected: clean (no unused-variable warnings — ensure `header` is still used by the desktop return path, which it is).

- [ ] **Step 3: Manual verification (mobile emulation)**

Run: `npm run dev`, open http://localhost:5173, and use browser devtools device toolbar at ≤640px width (or verify on the deployed site from a phone after merge).
Expected:
- Map is full-width; a collapsed bar sits at the bottom showing `1500–1509 · N events`.
- Tapping the bar expands a scrollable list (~45vh); tapping again collapses it.
- Rows behave as on desktop (hover/tap card, tap-through to timeline).

Note: desktop remains unaffected (the `isMobile` branch is not taken).

- [ ] **Step 4: Commit**

```bash
git add src/components/EventRail.jsx
git commit -m "Add mobile bottom-sheet variant of the event rail"
```

---

## Self-Review Notes

- **Spec coverage:** §1 flip home → Task 2 Step 3. §2 event rail (railItems, content, live emphasis, empty state) → Task 1 + Task 2. §3 cross-highlight + show-in-timeline → Task 2 (row click) + Task 3 (pin focus). §4 mobile bottom sheet → Task 4. Testing (pure `railItems`) → Task 1. Deferred framing / no data changes → not implemented, as specified.
- **Type consistency:** `railItems` returns `{ event, emphasis }` used identically in Task 2. `focusedId`/`onFocus` names match across `WorldMap`, `EventRail`, `EventPinLayer`. `onShowInTimeline` threads `App.handlePinClick` → `WorldMap` → `EventRail`.
- **No placeholders:** every code step contains complete code.
