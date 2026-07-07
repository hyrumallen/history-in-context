# Timeline Atlas Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the timeline grid to the "atlas + ruler ribbon" look (mockup panel D) — paper ground, serif text, reign ribbon with vertical ruler names — while fixing the scroll-year drift bug (B1) with measured row offsets.

**Architecture:** A `rowOffsets` utility measures each year row's real pixel offset (rows vary in height); the scroll-year badge, ruler labels, and century watermarks all position from those measurements. Ribbon *colors* are painted per year-cell (alignment is automatic); labels and watermarks live in overlay layers inside the scroll content. All v26.4 behavior (hover cards, pinning, era headers, map sync) is preserved.

**Tech Stack:** React 19, Vite 8, vitest. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-07-06-timeline-atlas-redesign-design.md`
**Reference mockup:** `mockups/timeline-style-playground.html` panel D

## Global Constraints

- Branch `feature/timeline-atlas-redesign`; commit per task; `npm run lint` (zero warnings) and `npm test` pass at every commit.
- Palette, verbatim from spec: paper `#f8f3e7`, hairline `#e5d9bd`, ink `#1a1a1a`, sepia accents `#a08c62` and `#7a6640`, header border `#d8c9a8`, hover-card paper `#fdf9ef`, warm dark `#4a3a22`, watermark `rgba(120,96,60,0.07)`.
- Serif stack, verbatim: `Georgia, 'Iowan Old Style', 'Times New Roman', serif` — grid content, headers, hover-card title, app title. UI chrome stays Inter.
- Ribbon: 15px wide, at each column's left edge. Reign shades alternate `country.mapColor` (dark) / `lighten(country.mapColor, 0.4)` (light). No ruler → no strip (paper shows).
- Ruler labels: reigns with `endYear - startYear + 1 >= 4` only; white `rgba(255,255,255,0.95)` on dark shade, `country.mapStroke` on light shade; hidden (not clipped) if taller than the reign's pixel span.
- The memoized `GridRows` must not re-render on scroll (measurements live in refs; overlay layers are separate components).
- Existing cell tooltips, hover cards, pin behavior, era headers unchanged.

---

### Task 1: Row-offset measurement + B1 scroll fix (TDD)

**Files:**
- Create: `src/rowOffsets.js`
- Test: `src/rowOffsets.test.js`
- Modify: `src/components/TimelineGrid.jsx` (year-label cells get `data-year-row`; scroller wraps content in a relative wrapper; scroll handler uses `yearAtOffset`)

**Interfaces:**
- Produces: `measureOffsets(container) -> number[]` (offsetTop per year row, index = `year - START_YEAR`); `yearAtOffset(offsets, scrollTop) -> number` (clamped to [START_YEAR, END_YEAR]).
- Produces: TimelineGrid keeps `offsetsRef` (ref to the offsets array) and `measureTick` (state counter bumped after each re-measure) — Task 4's overlays consume both.

- [ ] **Step 1: Write the failing tests** — `src/rowOffsets.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { yearAtOffset } from './rowOffsets'
import { START_YEAR, END_YEAR } from './constants'

describe('yearAtOffset', () => {
  const uniform = Array.from({ length: 501 }, (_, i) => i * 28)

  it('returns START_YEAR at the top', () => {
    expect(yearAtOffset(uniform, 0)).toBe(START_YEAR)
  })
  it('returns the year of the last row starting at or above scrollTop', () => {
    expect(yearAtOffset(uniform, 28)).toBe(START_YEAR + 1)
    expect(yearAtOffset(uniform, 55)).toBe(START_YEAR + 1)
    expect(yearAtOffset(uniform, 56)).toBe(START_YEAR + 2)
  })
  it('handles variable row heights (the B1 case)', () => {
    // year 0 row is 28px, year 1 row is 100px tall (events), year 2 starts at 128
    const uneven = [0, 28, 128, 156]
    expect(yearAtOffset(uneven, 127)).toBe(START_YEAR + 1)
    expect(yearAtOffset(uneven, 128)).toBe(START_YEAR + 2)
  })
  it('clamps below and above', () => {
    expect(yearAtOffset(uniform, -50)).toBe(START_YEAR)
    expect(yearAtOffset(uniform, 1e9)).toBe(END_YEAR)
  })
  it('is safe on empty input', () => {
    expect(yearAtOffset([], 100)).toBe(START_YEAR)
    expect(yearAtOffset(undefined, 100)).toBe(START_YEAR)
  })
})
```

- [ ] **Step 2: Run to verify failure** — `npm test` → FAIL (`src/rowOffsets.js` missing).

- [ ] **Step 3: Implement `src/rowOffsets.js`**

```js
import { START_YEAR, END_YEAR } from './constants'

// offsets[i] = offsetTop of the row for year START_YEAR + i, measured from
// the scroll content. Rows vary in height (event rows stretch), so nothing
// may assume a fixed 28px row — this module is the single source of truth.
export function measureOffsets(container) {
  const cells = container.querySelectorAll('[data-year-row]')
  const offsets = new Array(cells.length)
  cells.forEach((el, i) => { offsets[i] = el.offsetTop })
  return offsets
}

// Year of the last row whose top is at or above scrollTop (binary search).
export function yearAtOffset(offsets, scrollTop) {
  if (!offsets || offsets.length === 0) return START_YEAR
  let lo = 0
  let hi = offsets.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (offsets[mid] <= scrollTop) lo = mid
    else hi = mid - 1
  }
  return Math.max(START_YEAR, Math.min(END_YEAR, START_YEAR + lo))
}
```

- [ ] **Step 4: Run tests** — `npm test` → all pass (27 existing + 5 new).

- [ ] **Step 5: Wire measurement into TimelineGrid**

In `src/components/TimelineGrid.jsx`:

a) Import: `import { measureOffsets, yearAtOffset } from '../rowOffsets'` and add `useState` to the react import.

b) In `GridRows`, add `data-year-row={year}` to the year-label div (the sticky-left cell).

c) In `TimelineGrid`, add refs/state and a measuring effect:

```jsx
const innerRef = useRef(null)
const offsetsRef = useRef([])
const [measureTick, setMeasureTick] = useState(0)

useEffect(() => {
  const inner = innerRef.current
  if (!inner) return
  let raf = null
  const measure = () => {
    offsetsRef.current = measureOffsets(inner)
    setMeasureTick(t => t + 1)
  }
  measure()
  const ro = new ResizeObserver(() => {
    if (raf) cancelAnimationFrame(raf)
    raf = requestAnimationFrame(measure)
  })
  ro.observe(inner)
  return () => { ro.disconnect(); if (raf) cancelAnimationFrame(raf) }
}, [selectedCountries])
```

(`measureTick` is intentionally unused until Task 4 — add `void measureTick` after the state declaration so lint passes.)

d) Wrap the grid in a relative wrapper (overlays land here in Task 4). The scroller's direct child becomes:

```jsx
<div ref={scrollRef} style={{ overflow: 'auto', height: '100%', width: '100%' }}>
  <div ref={innerRef} style={{ position: 'relative', minWidth: 'fit-content' }}>
    <div style={{
      display: 'grid',
      gridTemplateColumns: `${YEAR_COL_WIDTH} repeat(${selectedCountries.length}, ${COUNTRY_COL_WIDTH})`,
      gridAutoRows: `minmax(${ROW_HEIGHT}, auto)`,
    }}>
      {/* corner, headers, <GridRows /> — unchanged */}
    </div>
  </div>
</div>
```

(the `minWidth: 'fit-content'` moves from the grid div to the wrapper.)

e) Replace the scroll handler's year computation (the `Math.round(el.scrollTop / parseInt(ROW_HEIGHT))` line):

```js
const year = yearAtOffset(offsetsRef.current, el.scrollTop)
```

- [ ] **Step 6: Verify B1 is fixed** — `npm run lint`, `npm test`, `npm run build` pass. Dev server: scroll until the map badge reads 1900 — the visible rows now show ~1900 (previously they trailed by decades). Scroll to both extremes; badge reads 1500 / 2000.

- [ ] **Step 7: Commit**

```bash
git add src/rowOffsets.js src/rowOffsets.test.js src/components/TimelineGrid.jsx
git commit -m "fix: scroll year derives from measured row offsets (B1)"
```

---

### Task 2: Paper ground, borders gone, serif gutter and headers

**Files:**
- Modify: `src/constants.js` (add SERIF), `src/components/TimelineGrid.jsx` (scroller bg, corner/header/gutter/cell styles), `src/components/CountryHeader.jsx` (serif name + subtitle)

**Interfaces:**
- Produces: `SERIF` string export from `src/constants.js`, used by Tasks 2–5.
- Note: full-column reign washes (`getRulerBg`) remain until Task 3 replaces them with the ribbon.

- [ ] **Step 1: Add to `src/constants.js`**

```js
export const SERIF = "Georgia, 'Iowan Old Style', 'Times New Roman', serif"
```

- [ ] **Step 2: Restyle the scroller and sticky cells in TimelineGrid**

- Scroller div: add `background: '#f8f3e7'`.
- Corner cell: `background: '#f8f3e7'`, remove both borders, add `borderBottom: '1px solid #d8c9a8'`.
- Country header cells (the sticky wrappers): `background: '#f8f3e7'` (opaque — rows must not show through when scrolled), remove `borderRight`, replace borderBottom with `'1px solid #d8c9a8'`.

- [ ] **Step 3: Restyle the year gutter in GridRows**

Year-label cell style becomes (keep `data-year-row`, sticky left, zIndex 1):

```jsx
<div
  key={`y-${year}`}
  data-year-row={year}
  style={{
    position: 'sticky',
    left: 0,
    zIndex: 1,
    background: '#f8f3e7',
    borderTop: year % 10 === 0 ? '1px solid #e5d9bd' : 'none',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    paddingRight: '8px',
    fontFamily: SERIF,
    fontVariantNumeric: 'tabular-nums',
    fontSize: year % 10 === 0 ? '11px' : '9.5px',
    color: year % 10 === 0 ? '#7a6640' : '#cdbd9a',
    fontWeight: year % 10 === 0 ? '700' : '400',
  }}
>
  {year % 5 === 0 ? year : ''}
</div>
```

(decades bold sepia, half-decades light sepia, all other years blank; the decade hairline replaces every per-year border.)

- [ ] **Step 4: Restyle country cells in GridRows**

The country cell keeps its tooltip and background wash (Task 3 replaces the wash) but loses its borders and gains the decade hairline + serif:

```jsx
style={{
  borderTop: year % 10 === 0 ? '1px solid #e5d9bd' : 'none',
  background: getRulerBg(year, country),
  fontFamily: SERIF,
}}
```

- [ ] **Step 5: Rewrite `src/components/CountryHeader.jsx`**

```jsx
import { getEraName } from '../eras'
import { SERIF } from '../constants'

export default function CountryHeader({ country, year }) {
  const era = getEraName(country, year)
  return (
    <div style={{
      fontFamily: SERIF,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '4px 8px',
      height: '100%',
    }}>
      <span style={{ fontSize: '14px', color: '#4a3a22', letterSpacing: '0.5px', fontWeight: 600 }}>
        {era}
      </span>
      {era !== country.name && (
        <span style={{
          fontSize: '8.5px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: '#a08c62',
          marginTop: '1px',
        }}>
          {country.name}
        </span>
      )}
    </div>
  )
}
```

(era name is the headline — scroll-aware behavior from v26.3 preserved; the base country name becomes the small-caps subtitle when it differs, e.g. era "Soviet Union", subtitle "RUSSIA".)

- [ ] **Step 6: Verify** — lint/test pass. Dev server: paper background, no vertical lines anywhere, hairlines only at decades, serif headers with subtitle after eras diverge (scroll to 1950: "Soviet Union" over "RUSSIA"). Washes still present (expected until Task 3).

- [ ] **Step 7: Commit**

```bash
git add src/constants.js src/components/TimelineGrid.jsx src/components/CountryHeader.jsx
git commit -m "feat: atlas paper ground, decade hairlines, serif headers and gutter"
```

---

### Task 3: Reign ribbon strips (replaces column washes)

**Files:**
- Create: `src/reignShades.js`
- Test: `src/reignShades.test.js`
- Modify: `src/components/TimelineGrid.jsx` (cell background + padding; delete `getRulerBg` and `hexToRgba`)

**Interfaces:**
- Consumes: `rulersByCountry` lookup already in TimelineGrid.
- Produces: `lighten(hex, amt) -> 'rgb(r, g, b)'` and `reignShade(reignIndex, country) -> string` (even index → `country.mapColor`, odd → `lighten(country.mapColor, 0.4)`); `reignIndexAt(reigns, year) -> number` (index into the sorted reigns array, or -1). Task 4 uses `reignShade` for label contrast decisions.

- [ ] **Step 1: Write the failing tests** — `src/reignShades.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { lighten, reignShade, reignIndexAt } from './reignShades'

const country = { mapColor: '#7d97b1', mapStroke: '#5a7690' }
const reigns = [
  { name: 'A', startYear: 1700, endYear: 1710 },
  { name: 'B', startYear: 1710, endYear: 1720 },
]

describe('lighten', () => {
  it('mixes toward white', () => {
    expect(lighten('#000000', 0.5)).toBe('rgb(128, 128, 128)')
    expect(lighten('#ffffff', 0.4)).toBe('rgb(255, 255, 255)')
  })
})

describe('reignShade', () => {
  it('alternates dark then light', () => {
    expect(reignShade(0, country)).toBe('#7d97b1')
    expect(reignShade(1, country)).toBe(lighten('#7d97b1', 0.4))
  })
})

describe('reignIndexAt', () => {
  it('finds the reign covering a year; newer wins on shared boundary', () => {
    expect(reignIndexAt(reigns, 1705)).toBe(0)
    expect(reignIndexAt(reigns, 1710)).toBe(1)
  })
  it('returns -1 outside all reigns', () => {
    expect(reignIndexAt(reigns, 1650)).toBe(-1)
    expect(reignIndexAt(reigns, 1750)).toBe(-1)
  })
})
```

- [ ] **Step 2: Run to verify failure** — `npm test` → FAIL (module missing).

- [ ] **Step 3: Implement `src/reignShades.js`**

```js
// Ribbon shade helpers. Reigns alternate the country's mapColor and a
// lightened variant; index parity is computed over the full sorted reign
// list so a filtered subset (e.g. labeled reigns) keeps the same shades.
export function lighten(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const mix = c => Math.round(c + (255 - c) * amt)
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`
}

export function reignShade(reignIndex, country) {
  return reignIndex % 2 === 0 ? country.mapColor : lighten(country.mapColor, 0.4)
}

// Index of the reign covering `year` in a startYear-sorted list; on a shared
// transition year the incoming (later) reign wins. -1 if none.
export function reignIndexAt(reigns, year) {
  for (let i = reigns.length - 1; i >= 0; i--) {
    if (year >= reigns[i].startYear && year <= reigns[i].endYear) return i
  }
  return -1
}
```

- [ ] **Step 4: Run tests** — `npm test` → all pass.

- [ ] **Step 5: Swap washes for ribbon strips in TimelineGrid**

a) Import: `import { reignShade, reignIndexAt } from '../reignShades'`.
b) Delete `getRulerBg` and `hexToRgba` (no longer used). Keep `getReigningRuler` (tooltips use it).
c) The country cell in `GridRows` becomes:

```jsx
{selectedCountries.map(country => {
  const cellEvents = eventMap[`${year}-${country.id}`] || []
  const ruler = getReigningRuler(year, country)
  const tooltip = ruler ? `${ruler.title ? ruler.title + ' ' : ''}${ruler.name} (${ruler.startYear}–${ruler.endYear})` : ''
  const idx = reignIndexAt(rulersByCountry[country.id] || [], year)
  const strip = idx >= 0 ? reignShade(idx, country) : null
  return (
    <div
      key={`${year}-${country.id}`}
      title={tooltip}
      style={{
        borderTop: year % 10 === 0 ? '1px solid #e5d9bd' : 'none',
        background: strip ? `linear-gradient(to right, ${strip} 15px, transparent 15px)` : 'transparent',
        paddingLeft: '19px',
        fontFamily: SERIF,
      }}
    >
      {cellEvents.map(event => (
        <div key={event.id} data-event-id={event.id}>
          <EventCell event={event} />
        </div>
      ))}
    </div>
  )
})}
```

(the 15px gradient stripe is the ribbon segment; per-cell painting keeps it aligned with variable-height rows by construction. 19px padding = 15px ribbon + 4px gap.)

- [ ] **Step 6: Restyle EventCell text for paper** — in `src/components/EventCell.jsx`, on the year span change `color: '#aaa'` to `color: '#a08c62'` and add `fontStyle: 'italic'`; on the ↗ span change `color: '#aaa'` to `color: '#a08c62'`. The 7px type-color dot stays (spec keeps the war/birth/death signal); shrink it to 6px (`width: '6px', height: '6px'`).

- [ ] **Step 7: Verify** — lint/test pass. Dev server: full-column washes gone; each column shows a 15px left ribbon whose shade changes at reign transitions; ribbon gaps show paper for Occupied Germany 1945–49 (select HRE, scroll to ~1947) and for the twelve non-Europe countries after 1700; tooltips still name the ruler; hover cards still open.

- [ ] **Step 8: Commit**

```bash
git add src/reignShades.js src/reignShades.test.js src/components/TimelineGrid.jsx src/components/EventCell.jsx
git commit -m "feat: reign ribbon strips replace column washes"
```

---

### Task 4: Overlay layers — ruler labels + century watermarks (TDD)

**Files:**
- Create: `src/reignLabels.js`, `src/components/GridOverlays.jsx`
- Test: `src/reignLabels.test.js`
- Modify: `src/components/TimelineGrid.jsx` (mount overlays inside the relative wrapper)

**Interfaces:**
- Consumes: `offsetsRef`/`measureTick` (Task 1), `reignShade`/`lighten` (Task 3), `rulersByCountry`, `START_YEAR`, `SERIF`, column constants (`YEAR_COL_WIDTH` 60px, `COUNTRY_COL_WIDTH` 180px).
- Produces: `labeledReigns(reigns) -> [{ name, startYear, endYear, reignIndex }]` (threshold ≥ 4 years, `reignIndex` = position in the full list so shade parity survives filtering).

- [ ] **Step 1: Write the failing tests** — `src/reignLabels.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { labeledReigns } from './reignLabels'

describe('labeledReigns', () => {
  const reigns = [
    { name: 'Anne', startYear: 1702, endYear: 1714 },
    { name: 'Edward VIII', startYear: 1936, endYear: 1936 },
    { name: 'FourYears', startYear: 1720, endYear: 1723 },
    { name: 'ThreeYears', startYear: 1724, endYear: 1726 },
  ]
  it('keeps reigns spanning >= 4 calendar years', () => {
    const names = labeledReigns(reigns).map(r => r.name)
    expect(names).toContain('Anne')
    expect(names).toContain('FourYears')     // 1720-1723 inclusive = 4 years
    expect(names).not.toContain('ThreeYears') // 1724-1726 inclusive = 3 years
    expect(names).not.toContain('Edward VIII')
  })
  it('preserves the original reign index for shade parity', () => {
    const four = labeledReigns(reigns).find(r => r.name === 'FourYears')
    expect(four.reignIndex).toBe(2)
  })
})
```

- [ ] **Step 2: Run to verify failure**, then **Step 3: implement `src/reignLabels.js`**

```js
// Which reigns get a vertical name label on the ribbon: only spans of at
// least 4 calendar years. reignIndex is the position in the FULL reign list
// so shade parity matches the per-cell strips.
export function labeledReigns(reigns) {
  return reigns
    .map((r, reignIndex) => ({ ...r, reignIndex }))
    .filter(r => r.endYear - r.startYear + 1 >= 4)
}
```

- [ ] **Step 4: Run tests** — all pass.

- [ ] **Step 5: Create `src/components/GridOverlays.jsx`**

Two layers: `WatermarkLayer` (behind the grid) and `RibbonLabelLayer` (above it). Both `pointerEvents: 'none'`, both positioned from measured offsets.

```jsx
import { START_YEAR, END_YEAR, SERIF } from '../constants'
import { labeledReigns } from '../reignLabels'

const YEAR_COL_PX = 60
const COUNTRY_COL_PX = 180
const RIBBON_PX = 15
// Vertical 8px small-caps text with 2px letter-spacing runs ~11px per character.
const PX_PER_CHAR = 11

function rowTop(offsets, year) {
  return offsets[year - START_YEAR]
}
function rowBottom(offsets, year, contentHeight) {
  const next = offsets[year - START_YEAR + 1]
  return next !== undefined ? next : contentHeight
}

export function WatermarkLayer({ offsets, contentHeight }) {
  if (!offsets || offsets.length === 0) return null
  const centuries = []
  for (let c = Math.ceil(START_YEAR / 100) * 100; c <= END_YEAR; c += 100) centuries.push(c)
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', height: contentHeight }}>
      {centuries.map(c => (
        <div key={c} style={{
          position: 'absolute',
          top: rowTop(offsets, c),
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: SERIF,
          fontSize: '110px',
          fontWeight: 700,
          letterSpacing: '8px',
          color: 'rgba(120, 96, 60, 0.07)',
        }}>
          {c}
        </div>
      ))}
    </div>
  )
}

export function RibbonLabelLayer({ offsets, contentHeight, selectedCountries, rulersByCountry }) {
  if (!offsets || offsets.length === 0) return null
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', height: contentHeight, zIndex: 2 }}>
      {selectedCountries.map((country, col) => {
        const left = YEAR_COL_PX + col * COUNTRY_COL_PX
        const reigns = rulersByCountry[country.id] || []
        return labeledReigns(reigns).map(r => {
          const startYear = Math.max(r.startYear, START_YEAR)
          const endYear = Math.min(r.endYear, END_YEAR)
          const top = rowTop(offsets, startYear)
          const height = rowBottom(offsets, endYear, contentHeight) - top
          if (r.name.length * PX_PER_CHAR > height) return null // hide, never clip
          const dark = r.reignIndex % 2 === 0 // strips paint the shade; parity picks text color
          return (
            <div key={`${country.id}-${r.reignIndex}`} style={{
              position: 'absolute',
              top,
              left,
              width: RIBBON_PX,
              height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              writingMode: 'vertical-rl',
              fontFamily: SERIF,
              fontSize: '8px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontWeight: 700,
              color: dark ? 'rgba(255,255,255,0.95)' : country.mapStroke,
            }}>
              {r.name}
            </div>
          )
        })
      })}
    </div>
  )
}
```

- [ ] **Step 6: Mount overlays in TimelineGrid**

Inside the `innerRef` wrapper, before the grid div add `<WatermarkLayer .../>`, after it add `<RibbonLabelLayer .../>`:

```jsx
<div ref={innerRef} style={{ position: 'relative', minWidth: 'fit-content' }}>
  <WatermarkLayer
    offsets={offsetsRef.current}
    contentHeight={innerRef.current?.scrollHeight ?? 0}
  />
  <div style={{ /* grid */ }}>…</div>
  <RibbonLabelLayer
    offsets={offsetsRef.current}
    contentHeight={innerRef.current?.scrollHeight ?? 0}
    selectedCountries={selectedCountries}
    rulersByCountry={rulersByCountry}
  />
</div>
```

`measureTick` (Task 1) already forces a re-render after each measurement, so the overlays always see fresh offsets; the `void measureTick` placeholder from Task 1 can now be removed. Country cells need `position: 'relative', zIndex: 1` added? **No** — labels must sit above the strips: the label layer has `zIndex: 2` and the grid stays auto. Verify labels are visible; if strips paint over labels, add `zIndex: 0` to the grid div instead of touching cells.

Sticky concern: header cells use `zIndex: 2`/`3` — bump them to `4` and `5` so labels never float over the sticky headers while scrolling.

- [ ] **Step 7: Verify** — lint/test pass. Dev server: vertical ruler names centered in their reign spans (VICTORIA spans 1837–1901; check alignment at both ends against the shade change); short reigns (Russia 1725–1741, Edward VIII 1936) unlabeled but shaded; white text on dark shades, dark `mapStroke` text on light shades; century watermarks at 1500/1600/1700/1800/1900/2000 rows behind content; labels stay put when opening the sidebar (re-measure fires); labels never overlap sticky headers.

- [ ] **Step 8: Commit**

```bash
git add src/reignLabels.js src/reignLabels.test.js src/components/GridOverlays.jsx src/components/TimelineGrid.jsx
git commit -m "feat: ruler name labels and century watermarks from measured offsets"
```

---

### Task 5: Theme extension — header, hover card, sidebar, map border

**Files:**
- Modify: `src/App.jsx` (title serif, map border), `src/components/EventHoverCard.jsx` (paper + serif title), `src/components/CountrySidebar.jsx` (paper tint)

- [ ] **Step 1: App header + map border** — in `src/App.jsx`:
  - Import `SERIF` from `./constants`; on the "History in Context" title span add `fontFamily: SERIF`.
  - In `MINI_PANEL_STYLE`: `border: '2px solid #4a3a22'` and `boxShadow: '0 6px 24px rgba(74, 58, 34, 0.35)'`.

- [ ] **Step 2: Hover card** — in `src/components/EventHoverCard.jsx`: card `background: '#fdf9ef'`, `border: '1px solid #d8c9a8'`; import `SERIF` and add `fontFamily: SERIF` to the title row div (body text and link stay Inter).

- [ ] **Step 3: Sidebar** — in `src/components/CountrySidebar.jsx` root div (line ~24): `background: '#f8f3e7'`, `borderLeft: open ? '1px solid #d8c9a8' : 'none'`.

- [ ] **Step 4: Verify** — lint/test/build pass. Dev server: title in serif on the navy bar; hover card is warm paper with serif headline; sidebar matches the grid paper; mini-map border is warm dark brown. Nothing reads as "two different apps".

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/components/EventHoverCard.jsx src/components/CountrySidebar.jsx
git commit -m "feat: extend atlas theme to header, hover card, sidebar, and map frame"
```

---

### Task 6: Final verification + backlog update

- [ ] **Step 1: Full check** — `npm run lint` (zero warnings), `npm test` (all suites), `npm run build`.
- [ ] **Step 2: Browser drive** (per spec Testing): no borders/washes anywhere; scroll to the 1900s — ribbon shade changes align exactly with reign tooltips and the badge year matches visible rows (B1 gone); labels legible on both shades; watermarks at century rows; hover, pin, Escape, era headers, map sync, sidebar selection all work; scroll performance unchanged (GridRows still never re-renders on scroll/hover — re-measure fires only on resize/selection).
- [ ] **Step 3: Update `docs/BACKLOG.md`** — mark B1 fixed in v26.5 (same style as the B3 entry).
- [ ] **Step 4: Commit** — `git add -A && git commit -m "chore: verification pass and backlog update for atlas redesign"`
