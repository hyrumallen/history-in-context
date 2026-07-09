# Interactive Expanded Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the expanded world map into an exploration tool: a year slider with play/time-lapse, Wikipedia hover cards on event pins, rolling decade-window pins, and a color legend.

**Architecture:** Pins reuse the timeline's decoupled card stack (`hoverCardStore` + `EventHoverCard`). A new `MapControls` (slider + play) drives the shared `currentYear`; a new `usePlayback` hook auto-advances it. `TimelineGrid` exposes an imperative `scrollToYear` so the slider keeps the timeline in sync without a feedback loop. Pure helpers (`mapPins.js`, `usePlayback.nextYear`) are unit-tested; DOM/visual behavior is verified on the deployed site.

**Tech Stack:** React 19, Vite 8, vitest, SVG.

## Global Constraints

- All new behavior is for the **expanded map** (`mode === 'full'`) only. The mini-map and mobile page-scroll behavior must be unchanged.
- Shared year: the slider/play set `App`'s existing `currentYear`; do not introduce a second year source.
- Rolling window = the **decade** containing the year (`floor(year/10)*10 .. +9`); exact-year pins are emphasized.
- Reuse, don't duplicate: `hoverCardStore.showCard/scheduleHide`, `EventHoverCard`, `wikipedia.fetchSummary`, `TYPE_COLORS`, `Legend`, `useMapTransform`.
- Year range constants: `START_YEAR = 1500`, `END_YEAR = 2000` (from `src/constants.js`).
- Follow Allen's flow: branch `feature/interactive-map` → merge to `master` `--no-ff` → tag next `v26.x` → push → delete branch. Auto-deploys on merge.

---

### Task 1: Rolling-window pin logic (pure helpers + EventPinLayer)

**Files:**
- Create: `src/mapPins.js`
- Test: `src/mapPins.test.js`
- Modify: `src/components/EventPinLayer.jsx`

**Interfaces:**
- Produces: `pinsInWindow(events, year, selectedIds): Event[]` (decade window, has `lat`, selected); `pinEmphasis(eventYear, year): { r: number, opacity: number }`.

- [ ] **Step 1: Write the failing test**

Create `src/mapPins.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { pinsInWindow, pinEmphasis } from './mapPins'

const ev = (id, year, countryId, lat = 1) => ({ id, year, countryId, lat, lng: 1 })
const sel = new Set(['a', 'b'])

describe('pinsInWindow', () => {
  const events = [
    ev('e1', 1500, 'a'), ev('e2', 1509, 'a'), ev('e3', 1510, 'a'),
    ev('e4', 1505, 'c'),            // wrong country
    { id: 'e5', year: 1503, countryId: 'a', lat: null }, // no coords
  ]
  it('keeps events in the decade of the year, for selected countries with coords', () => {
    const ids = pinsInWindow(events, 1505, sel).map(e => e.id)
    expect(ids).toEqual(['e1', 'e2']) // 1500-1509 decade; e3 is next decade; e4/e5 excluded
  })
  it('moves the window as the year crosses a decade', () => {
    expect(pinsInWindow(events, 1510, sel).map(e => e.id)).toEqual(['e3'])
  })
})

describe('pinEmphasis', () => {
  it('is full size/opacity on the exact year', () => {
    expect(pinEmphasis(1600, 1600)).toEqual({ r: 4.6, opacity: 1 })
  })
  it('shrinks and fades with distance', () => {
    const near = pinEmphasis(1601, 1600)
    const far = pinEmphasis(1609, 1600)
    expect(near.r).toBeGreaterThan(far.r)
    expect(near.opacity).toBeGreaterThan(far.opacity)
    expect(far.opacity).toBeGreaterThanOrEqual(0.5)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- mapPins`
Expected: FAIL — `Failed to resolve import "./mapPins"`.

- [ ] **Step 3: Create the helper**

Create `src/mapPins.js`:

```js
// Pins shown on the map for a given year: the decade window around it, with
// per-pin emphasis that peaks on the exact year.
export function pinsInWindow(events, year, selectedIds) {
  const start = Math.floor(year / 10) * 10
  const end = start + 9
  return events.filter(e =>
    e.lat != null && e.year >= start && e.year <= end && selectedIds.has(e.countryId)
  )
}

export function pinEmphasis(eventYear, year) {
  const t = Math.min(1, Math.abs(eventYear - year) / 9)
  return { r: 4.6 - 1.8 * t, opacity: 1 - 0.5 * t }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- mapPins`
Expected: PASS.

- [ ] **Step 5: Wire EventPinLayer to the helpers (styling only; keep current click for now)**

Replace `src/components/EventPinLayer.jsx` with:

```jsx
import events from '../data/events.json'
import { TYPE_COLORS } from '../eventTypeColors'
import { pinsInWindow, pinEmphasis } from '../mapPins'

const W = 800
const H = 400

function project(lng, lat) {
  return [(lng + 180) * (W / 360), (90 - lat) * (H / 180)]
}

export default function EventPinLayer({ currentYear, onPinClick, selectedIds }) {
  const pins = pinsInWindow(events, currentYear, selectedIds)

  return (
    <g>
      {pins.map(event => {
        const [cx, cy] = project(event.lng, event.lat)
        const { r, opacity } = pinEmphasis(event.year, currentYear)
        return (
          <circle
            key={event.id}
            cx={cx}
            cy={cy}
            r={r}
            fill={TYPE_COLORS[event.type] ?? TYPE_COLORS.other}
            stroke="white"
            strokeWidth={0.8}
            opacity={opacity}
            style={{ cursor: 'pointer' }}
            onClick={() => onPinClick(event.id)}
          >
            <title>{event.title}</title>
          </circle>
        )
      })}
    </g>
  )
}
```

- [ ] **Step 6: Verify lint, tests, build**

Run: `npm run lint && npm test && npm run build`
Expected: clean; all tests pass (including `mapPins`); build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/mapPins.js src/mapPins.test.js src/components/EventPinLayer.jsx
git commit -m "feat: rolling decade-window map pins with exact-year emphasis"
```

---

### Task 2: Wikipedia card on pins + "Show in timeline" action

**Files:**
- Modify: `src/components/EventPinLayer.jsx`
- Modify: `src/components/EventHoverCard.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `showCard`, `scheduleHide` from `hoverCardStore`; `handlePinClick(eventId)` from `App`.
- Produces: pins open the shared card (hover 400 ms / tap pins it); `EventHoverCard` takes `onShowInTimeline(eventId)` and renders a "Show in timeline ↦" action. Pins no longer call `onPinClick` directly.

- [ ] **Step 1: Add hover/tap card handlers to pins**

In `src/components/EventPinLayer.jsx`, update the imports and component. Change the import block to add:

```jsx
import { useRef } from 'react'
import { showCard, scheduleHide } from '../hoverCardStore'

const HOVER_DELAY_MS = 400
```

Change the signature `export default function EventPinLayer({ currentYear, onPinClick, selectedIds })` to `export default function EventPinLayer({ currentYear, selectedIds })` and add a hover timer + open helper at the top of the body:

```jsx
  const timerRef = useRef(null)
  const openCard = (event, target, pinned) => {
    clearTimeout(timerRef.current)
    showCard(event, target.getBoundingClientRect(), pinned)
  }
```

Replace the `<circle>`'s `onClick` and `<title>` with card handlers (remove the `<title>` element entirely):

```jsx
            onMouseEnter={(e) => {
              const target = e.currentTarget
              clearTimeout(timerRef.current)
              timerRef.current = setTimeout(() => openCard(event, target, false), HOVER_DELAY_MS)
            }}
            onMouseLeave={() => { clearTimeout(timerRef.current); scheduleHide() }}
            onClick={(e) => openCard(event, e.currentTarget, true)}
          />
```

(The circle becomes self-closing `/>` — delete the `>{...}<title>...</title></circle>` and the `onPinClick` usage.)

- [ ] **Step 2: Add the "Show in timeline" action to the card**

In `src/components/EventHoverCard.jsx`, change the signature to `export default function EventHoverCard({ onShowInTimeline })`. Replace the actions block:

```jsx
      <div style={{ clear: 'both', marginTop: 8 }}>
        <a
          href={summary?.pageUrl ?? event.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '12px', fontWeight: 600, color: '#4a6fa5', textDecoration: 'none' }}
        >
          Read on Wikipedia →
        </a>
      </div>
```

with:

```jsx
      <div style={{ clear: 'both', marginTop: 8, display: 'flex', gap: 16 }}>
        <a
          href={summary?.pageUrl ?? event.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '12px', fontWeight: 600, color: '#4a6fa5', textDecoration: 'none' }}
        >
          Read on Wikipedia →
        </a>
        {onShowInTimeline && (
          <button
            onClick={() => { onShowInTimeline(event.id); closeCard() }}
            style={{ font: 'inherit', fontSize: '12px', fontWeight: 600, color: '#4a6fa5', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            Show in timeline ↦
          </button>
        )}
      </div>
```

(`closeCard` is already imported in this file.)

- [ ] **Step 3: Pass `onShowInTimeline` and drop `onPinClick` in App**

In `src/App.jsx`, add `onShowInTimeline={handlePinClick}` to **both** `<EventHoverCard />` usages (mobile and desktop branches), i.e. `<EventHoverCard onShowInTimeline={handlePinClick} />`. Remove the `onPinClick={handlePinClick}` prop from **both** `<WorldMap ... />` usages (pins no longer use it). Leave `handlePinClick` itself defined — it's now used via the card.

- [ ] **Step 4: Verify lint, tests, build**

Run: `npm run lint && npm test && npm run build`
Expected: clean/passing (watch for any unused-var lint error from the removed `onPinClick` — remove leftover references if flagged).

- [ ] **Step 5: Commit**

```bash
git add src/components/EventPinLayer.jsx src/components/EventHoverCard.jsx src/App.jsx
git commit -m "feat: Wikipedia card on map pins + Show-in-timeline card action"
```

---

### Task 3: scrollToYear + App year/play plumbing

**Files:**
- Modify: `src/components/TimelineGrid.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Produces: `TimelineGrid` ref handle `{ scrollToYear(year) }`; `App` state `playing` + `handleMapYear(year)` + `togglePlay()`, and a `gridRef` attached to the timeline.

- [ ] **Step 1: Make TimelineGrid a forwardRef exposing scrollToYear**

In `src/components/TimelineGrid.jsx`, update the React import to include `forwardRef` and `useImperativeHandle` (add to the existing `import { useRef, useEffect, useState, memo, Fragment } from 'react'`).

Change the declaration `export default function TimelineGrid({ onYearChange, selectedCountries, onOpenSidebar, currentYear }) {` to:

```jsx
const TimelineGrid = forwardRef(function TimelineGrid({ onYearChange, selectedCountries, onOpenSidebar, currentYear }, ref) {
```

Immediately after the `yearColPx/countryColPx/yearCol/countryCol` derivations, add the handle:

```jsx
  useImperativeHandle(ref, () => ({
    scrollToYear(year) {
      const offsets = offsetsRef.current
      const top = offsets[year - START_YEAR]
      if (top == null) return
      if (isMobile) {
        const inner = innerRef.current
        if (!inner) return
        const innerDocTop = inner.getBoundingClientRect().top + window.scrollY
        window.scrollTo({ top: Math.max(0, innerDocTop + top - 100) })
      } else {
        scrollRef.current?.scrollTo({ top })
      }
    },
  }), [isMobile])
```

At the very end of the file, replace the closing `}` of the function and add:

```jsx
})

export default TimelineGrid
```

(i.e. the function passed to `forwardRef` now closes with `})`, followed by the default export. `offsetsRef`, `innerRef`, `scrollRef`, `isMobile`, and `START_YEAR` are all already in scope.)

- [ ] **Step 2: Add play state + handlers + gridRef in App**

In `src/App.jsx`: ensure `useRef`, `useState`, `useCallback`, `useEffect` are imported (they are). Add near the other hooks in `App()`:

```jsx
  const gridRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const yearRef = useRef(currentYear)
  yearRef.current = currentYear
  const prevPlayingRef = useRef(false)

  const handleMapYear = useCallback((y) => {
    setPlaying(false)
    setCurrentYear(y)
    gridRef.current?.scrollToYear(y)
  }, [])

  const togglePlay = useCallback(() => setPlaying(p => !p), [])
```

Add the import at the top: `import { usePlayback } from './hooks/usePlayback'` (created in Task 4 — it is imported here but only exercised once Task 4 lands; if running strictly in order, add this import in Task 4 Step 4 instead). Then add the playback + stop-sync:

```jsx
  usePlayback({ playing, year: currentYear, setYear: setCurrentYear, max: END_YEAR, onEnd: () => setPlaying(false) })

  useEffect(() => {
    if (prevPlayingRef.current && !playing) gridRef.current?.scrollToYear(yearRef.current)
    prevPlayingRef.current = playing
  }, [playing])
```

Attach the ref to **both** `<TimelineGrid ... />` usages: add `ref={gridRef}`.

> NOTE: To keep each task independently building, defer the `usePlayback` import + call to Task 4 (where the hook is created). In this task, add only `gridRef`, `playing`, `handleMapYear`, `togglePlay`, the stop-sync effect, and `ref={gridRef}`. The `playing` state is consumed by MapControls in Task 4.

- [ ] **Step 3: Verify lint, tests, build**

Run: `npm run lint && npm test && npm run build`
Expected: clean/passing. (`playing`/`handleMapYear`/`togglePlay` may be reported unused until Task 4 wires them to the UI — if lint errors on unused vars, proceed to Task 4 which consumes them, or temporarily reference them; prefer completing Task 4 before the shared lint gate.)

- [ ] **Step 4: Commit**

```bash
git add src/components/TimelineGrid.jsx src/App.jsx
git commit -m "feat: TimelineGrid scrollToYear + App play state and year plumbing"
```

---

### Task 4: MapControls + playback hook + WorldMap integration

**Files:**
- Create: `src/hooks/usePlayback.js`
- Test: `src/hooks/usePlayback.test.js`
- Create: `src/components/MapControls.jsx`
- Modify: `src/components/WorldMap.jsx`
- Modify: `src/App.jsx` (wire props + usePlayback import/call)

**Interfaces:**
- Consumes: `handleMapYear`, `togglePlay`, `playing`, `currentYear` from `App`.
- Produces: `usePlayback({ playing, year, setYear, max, onEnd, stepMs })`; `nextYear(y, max)`; `MapControls` component; `WorldMap` renders controls + legend in full mode.

- [ ] **Step 1: Write the failing test for the pure step**

Create `src/hooks/usePlayback.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { nextYear } from './usePlayback'

describe('nextYear', () => {
  it('advances by one year', () => {
    expect(nextYear(1600, 2000)).toBe(1601)
  })
  it('never exceeds max', () => {
    expect(nextYear(2000, 2000)).toBe(2000)
    expect(nextYear(1999, 2000)).toBe(2000)
  })
})
```

- [ ] **Step 2: Run it to verify failure**

Run: `npm test -- usePlayback`
Expected: FAIL — cannot resolve `./usePlayback`.

- [ ] **Step 3: Create the hook**

Create `src/hooks/usePlayback.js`:

```js
import { useEffect } from 'react'

export function nextYear(y, max) {
  return Math.min(max, y + 1)
}

// While `playing`, advance `year` by one per `stepMs` until `max`, then call onEnd.
export function usePlayback({ playing, year, setYear, max, onEnd, stepMs = 90 }) {
  useEffect(() => {
    if (!playing) return
    if (year >= max) { onEnd?.(); return }
    const id = setTimeout(() => setYear(y => nextYear(y, max)), stepMs)
    return () => clearTimeout(id)
  }, [playing, year, setYear, max, onEnd, stepMs])
}
```

- [ ] **Step 4: Run it to verify pass**

Run: `npm test -- usePlayback`
Expected: PASS (2 tests). Then add the `usePlayback` import and call in `App.jsx` (per Task 3 Step 2's note): `import { usePlayback } from './hooks/usePlayback'` and the `usePlayback({ ... })` line.

- [ ] **Step 5: Create MapControls**

Create `src/components/MapControls.jsx`:

```jsx
export default function MapControls({ year, onYearChange, playing, onTogglePlay, min, max }) {
  return (
    <div style={{
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 40,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: 'rgba(26,26,46,0.82)',
      padding: '8px 12px',
      borderRadius: 6,
    }}>
      <button
        onClick={onTogglePlay}
        aria-label={playing ? 'Pause' : 'Play'}
        style={{
          font: 'inherit',
          fontSize: 14,
          width: 30,
          height: 26,
          cursor: 'pointer',
          background: '#4a6fa5',
          color: 'white',
          border: 'none',
          borderRadius: 4,
        }}
      >
        {playing ? '⏸' : '▶'}
      </button>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: '#4a6fa5' }}
      />
      <span style={{ color: 'white', fontVariantNumeric: 'tabular-nums', minWidth: 40, textAlign: 'right', fontWeight: 600 }}>
        {year}
      </span>
    </div>
  )
}
```

- [ ] **Step 6: Mount controls + legend in WorldMap (full mode only)**

In `src/components/WorldMap.jsx`: add imports:

```jsx
import { START_YEAR, END_YEAR } from '../constants'
import Legend from './Legend'
import MapControls from './MapControls'
```

Change the signature to `export default function WorldMap({ currentYear, mode = 'mini', selectedIds, playing, onYearChange, onTogglePlay })` (remove `onPinClick`).

Update the `EventPinLayer` usage to drop `onPinClick`:

```jsx
          <EventPinLayer currentYear={currentYear} selectedIds={selectedIds} />
```

Before the closing `</div>` of the component, add the full-mode overlays:

```jsx
      {!isMini && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: 16,
          background: 'rgba(253,249,239,0.92)',
          border: '1px solid #d8c9a8',
          borderRadius: 6,
          padding: '8px 10px',
          pointerEvents: 'none',
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
```

- [ ] **Step 7: Pass the new props from App to WorldMap**

In `src/App.jsx`, add to **both** `<WorldMap ... />` usages (mobile full + desktop):

```jsx
              playing={playing}
              onYearChange={handleMapYear}
              onTogglePlay={togglePlay}
```

(These are ignored in mini mode since `MapControls`/`Legend` only render when `!isMini`.)

- [ ] **Step 8: Verify lint, tests, build**

Run: `npm run lint && npm test && npm run build`
Expected: clean; all tests pass (`mapPins`, `usePlayback`, existing); build succeeds.

- [ ] **Step 9: Commit**

```bash
git add src/hooks/usePlayback.js src/hooks/usePlayback.test.js src/components/MapControls.jsx src/components/WorldMap.jsx src/App.jsx
git commit -m "feat: map year slider, play/time-lapse, and color legend"
```

---

### Task 5: Verify, merge, deploy, confirm

**Files:** None (verification + integration).

- [ ] **Step 1: Full local gate**

Run: `npm run lint && npm test && npm run build`
Expected: all clean/passing.

- [ ] **Step 2: Merge to master (no fast-forward) and push**

```bash
git checkout master
git merge --no-ff feature/interactive-map -m "Merge feature/interactive-map: interactive expanded map"
git push origin master
```

- [ ] **Step 3: Watch the deploy to green**

Run: `gh run watch --exit-status $(gh run list --workflow=deploy.yml --branch=master --limit=1 --json databaseId --jq '.[0].databaseId')`
Expected: conclusion `success`. On failure, `gh run view --log-failed` and fix.

- [ ] **Step 4: Verify on the live site (desktop)**

Load `https://hyrumallen.github.io/history-in-context/` (cache-bust with `?v=map`), open the Map view, and confirm: the slider moves the year and pins/borders update; ▶ plays a time-lapse and stops at 2000; hovering a pin shows the Wikipedia card with "Read on Wikipedia →" and "Show in timeline ↦"; the legend shows; the mini-map and timeline hover cards are unchanged; returning to the timeline lands on the slider's year.

- [ ] **Step 5: Tag, push tag, delete branch**

```bash
git tag v26.16
git push origin v26.16
git branch -d feature/interactive-map
```

(Confirm the tag with Allen — `v26.16` continues the line. Consider on-device touch check for tap-to-open pins.)

- [ ] **Step 6: Update docs**

Add a note to `docs/BACKLOG.md` (interactive map shipped in v26.16) and a bullet to `README.md` Features. Commit to `master` and push.

---

## Self-Review Notes

- **Spec coverage:** Req 1 (card on pins) → Task 2; Req 2 (slider) → Task 4 + Task 3 (scrollToYear); Req 3 (play) → Task 4 (usePlayback + MapControls); Req 4 (rolling window) → Task 1; Req 5 (legend) → Task 4; Req 6 (show-in-timeline) → Task 2; Req 7 (scope) → constraints honored (all overlays gated on `!isMini`). DoD → Task 5 Step 4.
- **Placeholder scan:** No TBD/TODO; every code step shows exact content.
- **Type/name consistency:** `pinsInWindow(events, year, selectedIds)`, `pinEmphasis(eventYear, year) → {r,opacity}`, `nextYear(y, max)`, `usePlayback({playing, year, setYear, max, onEnd, stepMs})`, `scrollToYear(year)`, `MapControls({year,onYearChange,playing,onTogglePlay,min,max})`, and `EventHoverCard({onShowInTimeline})` are used identically across tasks. `EventPinLayer` loses `onPinClick`; `WorldMap` loses `onPinClick` and gains `playing/onYearChange/onTogglePlay`.
- **Ordering caveat (called out inline):** `App` imports/calls `usePlayback` (created in Task 4). Tasks 3–4 note this so the shared lint/build gate is green once Task 4 lands; if enforcing a strict per-task green build, complete Tasks 3 and 4 together before the Task 3 lint gate.
