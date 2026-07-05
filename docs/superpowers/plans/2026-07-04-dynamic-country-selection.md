# Dynamic Country Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** User-selectable timeline countries via a collapsible continent-grouped sidebar, plus 12 new countries (18 total) across four continents.

**Architecture:** `App.jsx` owns `selectedCountryIds` (persisted to localStorage) and `sidebarOpen`; a new `CountrySidebar` component renders continent-grouped checkboxes; `TimelineGrid`, `TerritoryLayer`, and `EventPinLayer` filter by the selection. Data for new countries lands in continent batches appended to the four existing JSON files, each batch gated on Allen's historical-accuracy review.

**Tech Stack:** React 19 + Vite, inline styles (project convention), shared CSS in `src/index.css`. No test framework — verification is `npm run lint`, `npm run build`, and manual checks in the dev server per project convention.

**Spec:** `docs/superpowers/specs/2026-07-04-dynamic-country-selection-design.md`

## Global Constraints

- Continent values, exactly: `"Europe"`, `"Asia & Middle East"`, `"Africa"`, `"Americas"`. Russia counts as Europe; Ottoman Empire counts as Asia & Middle East.
- localStorage key, exactly: `hic-selected-countries` (JSON array of country ids).
- Default selection: `["england","france","spain","holy-roman-empire","russia","ottoman-empire"]`.
- Sidebar: 230px wide when open, 0 when closed; CSS transitions must respect `prefers-reduced-motion: reduce`.
- Every country carries the color triple `color` (light reign band), `mapColor` (header + territory fill), `mapStroke` (territory outline). No per-country hex values hard-coded in components.
- Territory snapshot years, exactly: 1500, 1530, 1560, 1590, 1620, 1650, 1680, 1700. A country appears only in snapshots where it existed.
- Event ids continue the `eNNN` sequence from the current maximum in `events.json`.
- Timeline range stays 1500–1700; ruler entries may start before 1500 or end after 1700 (the grid clips them).
- Data batches (Tasks 6–9) PAUSE for Allen's review before committing.
- Dev server: `npm run dev` → `http://localhost:5173`.

---

### Task 1: Continent field on existing countries

**Files:**
- Modify: `src/data/countries.json`

**Interfaces:**
- Produces: every country object gains `"continent"` with one of the four exact values above. Task 2's grouping and Task 3's rendering rely on it.

- [ ] **Step 1: Add continent to the 6 existing entries**

Replace the full contents of `src/data/countries.json` with:

```json
[
  { "id": "england", "name": "England", "continent": "Europe", "color": "#c8d8e8", "mapColor": "#7d97b1", "mapStroke": "#5a7690" },
  { "id": "france", "name": "France", "continent": "Europe", "color": "#c8e8d0", "mapColor": "#7fae8d", "mapStroke": "#5d8a6b" },
  { "id": "spain", "name": "Spain", "continent": "Europe", "color": "#e8d8c8", "mapColor": "#b39a7e", "mapStroke": "#8f7659" },
  { "id": "holy-roman-empire", "name": "Holy Roman Empire", "continent": "Europe", "color": "#e8e8c8", "mapColor": "#aaa878", "mapStroke": "#868453" },
  { "id": "russia", "name": "Russia", "continent": "Europe", "color": "#e8c8c8", "mapColor": "#b18585", "mapStroke": "#8d6161" },
  { "id": "ottoman-empire", "name": "Ottoman Empire", "continent": "Asia & Middle East", "color": "#e0c8e8", "mapColor": "#9d80a8", "mapStroke": "#7a5e85" }
]
```

- [ ] **Step 2: Verify**

Run: `npm run lint` — Expected: no new errors (one pre-existing EventCell warning is normal).
Run: `npm run build` — Expected: success. App renders unchanged (nothing reads `continent` yet).

- [ ] **Step 3: Commit**

```bash
git add src/data/countries.json
git commit -m "feat: continent field on countries"
```

---

### Task 2: CountrySidebar component + Legend restyle

**Files:**
- Create: `src/components/CountrySidebar.jsx`
- Modify: `src/components/Legend.jsx`
- Modify: `src/index.css` (append sidebar transition rules)

**Interfaces:**
- Consumes: `country.continent` from Task 1.
- Produces: `CountrySidebar({ countries, selectedIds, onChange, open })` — `countries`: full array from countries.json; `selectedIds`: `string[]`; `onChange(nextIds: string[])`; `open: boolean`. Task 3 renders it with exactly these props.

- [ ] **Step 1: Create src/components/CountrySidebar.jsx**

```jsx
import Legend from './Legend'

const CONTINENT_ORDER = ['Europe', 'Asia & Middle East', 'Africa', 'Americas']

function IndeterminateCheckbox({ checked, indeterminate, onChange, label, bold }) {
  return (
    <label style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '3px 0',
      cursor: 'pointer',
      fontWeight: bold ? 600 : 400,
      fontSize: bold ? '12.5px' : '12px',
      color: '#333',
    }}>
      <input
        type="checkbox"
        checked={checked}
        ref={el => { if (el) el.indeterminate = indeterminate }}
        onChange={onChange}
        style={{ accentColor: '#4a6fa5', margin: 0 }}
      />
      {label}
    </label>
  )
}

export default function CountrySidebar({ countries, selectedIds, onChange, open }) {
  const groups = CONTINENT_ORDER
    .map(continent => ({ continent, items: countries.filter(c => c.continent === continent) }))
    .filter(g => g.items.length > 0)

  const toggleCountry = (id) => {
    onChange(selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id])
  }

  const toggleContinent = (items, allSelected) => {
    const ids = items.map(c => c.id)
    onChange(allSelected
      ? selectedIds.filter(id => !ids.includes(id))
      : [...selectedIds, ...ids.filter(id => !selectedIds.includes(id))])
  }

  return (
    <div className="sidebar-panel" style={{
      width: open ? 230 : 0,
      flexShrink: 0,
      overflow: 'hidden',
      background: '#f7f7f8',
      borderLeft: open ? '1px solid #c8c8c8' : 'none',
    }}>
      <div style={{
        width: 230,
        height: '100%',
        overflowY: 'auto',
        padding: '14px 16px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.8px',
          color: '#888',
          marginBottom: 6,
        }}>
          EVENT TYPES
        </div>
        <Legend />

        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.8px',
          color: '#888',
          margin: '16px 0 2px',
        }}>
          COUNTRIES
        </div>
        {groups.map(({ continent, items }) => {
          const selectedCount = items.filter(c => selectedIds.includes(c.id)).length
          const all = selectedCount === items.length
          const some = selectedCount > 0 && !all
          return (
            <div key={continent} style={{ marginTop: 10 }}>
              <IndeterminateCheckbox
                bold
                checked={all}
                indeterminate={some}
                onChange={() => toggleContinent(items, all)}
                label={continent}
              />
              <div style={{ paddingLeft: 20, borderLeft: '2px solid #e3e3e6', marginLeft: 6 }}>
                {items.map(c => (
                  <label key={c.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '3px 0',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#333',
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(c.id)}
                      onChange={() => toggleCountry(c.id)}
                      style={{ accentColor: '#4a6fa5', margin: 0 }}
                    />
                    <span style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: c.mapColor,
                      flexShrink: 0,
                      display: 'inline-block',
                    }} />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Restyle Legend for the light sidebar**

Replace the full contents of `src/components/Legend.jsx` with:

```jsx
const ITEMS = [
  { color: '#c9a227', label: 'Monarch / Leadership' },
  { color: '#c0392b', label: 'War / Conflict' },
  { color: '#2980b9', label: 'Birth' },
  { color: '#7f8c8d', label: 'Death' },
  { color: '#888',    label: 'Other' },
]

export default function Legend() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '3px',
    }}>
      {ITEMS.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            background: item.color,
            flexShrink: 0,
            display: 'inline-block',
          }} />
          <span style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}
```

(Changes: vertical list instead of wrapping row; label color `#bbb` → `#555` for the light background. Note the header will stop rendering `<Legend />` in Task 3 — until then it looks slightly off in the dark header, which is fine for one task.)

- [ ] **Step 3: Append sidebar CSS to src/index.css**

Add at the end of `src/index.css`:

```css
.sidebar-panel {
  transition: width 200ms ease;
}

@media (prefers-reduced-motion: reduce) {
  .sidebar-panel { transition: none; }
}
```

- [ ] **Step 4: Verify**

Run: `npm run lint` — Expected: no new errors.
Run: `npm run build` — Expected: success. (Component isn't rendered yet; visual check comes in Task 3.)

- [ ] **Step 5: Commit**

```bash
git add src/components/CountrySidebar.jsx src/components/Legend.jsx src/index.css
git commit -m "feat: CountrySidebar component and sidebar-ready Legend"
```

---

### Task 3: App wiring — selection state, sidebar layout, header button, dynamic TimelineGrid

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/TimelineGrid.jsx`

**Interfaces:**
- Consumes: `CountrySidebar` props from Task 2; `WorldMap({ currentYear, onPinClick, mode })` unchanged (map filtering arrives in Task 4).
- Produces: `TimelineGrid({ onYearChange, selectedCountries, onOpenSidebar })` — `selectedCountries` is an array of country objects in countries.json order. App state `selectedIds: string[]` persisted under `hic-selected-countries`.

- [ ] **Step 1: Rewrite src/App.jsx**

```jsx
import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import countries from './data/countries.json'
import TimelineGrid from './components/TimelineGrid'
import CountrySidebar from './components/CountrySidebar'
import WorldMap from './components/WorldMap'

const DEFAULT_IDS = ['england', 'france', 'spain', 'holy-roman-empire', 'russia', 'ottoman-empire']
const STORAGE_KEY = 'hic-selected-countries'

function loadSelection() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(saved) && saved.every(id => countries.some(c => c.id === id))) {
      return saved
    }
  } catch {
    // corrupted storage — fall through to default
  }
  return DEFAULT_IDS
}

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

function headerButtonStyle(active, radius) {
  return {
    font: 'inherit',
    fontSize: '12.5px',
    fontWeight: 600,
    padding: '5px 14px',
    cursor: 'pointer',
    background: active ? '#4a6fa5' : '#2e2e4e',
    color: active ? 'white' : '#bbbbdd',
    border: `1px solid ${active ? '#4a6fa5' : '#44446a'}`,
    borderRadius: radius,
  }
}

function App() {
  const [currentYear, setCurrentYear] = useState(1500)
  const [view, setView] = useState('timeline')
  const [selectedIds, setSelectedIds] = useState(loadSelection)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const highlightElRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds))
  }, [selectedIds])

  const selectedCountries = useMemo(
    () => countries.filter(c => selectedIds.includes(c.id)),
    [selectedIds]
  )

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

  const openSidebar = useCallback(() => setSidebarOpen(true), [])

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
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex' }}>
            <button style={headerButtonStyle(view === 'timeline', '5px 0 0 5px')} onClick={() => setView('timeline')}>
              Timeline
            </button>
            <button style={headerButtonStyle(view === 'map', '0 5px 5px 0')} onClick={() => setView('map')}>
              Map
            </button>
          </div>
          <button
            style={headerButtonStyle(sidebarOpen, '5px')}
            onClick={() => setSidebarOpen(o => !o)}
            aria-expanded={sidebarOpen}
          >
            Countries
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minWidth: 0 }}>
          <div style={{ position: 'absolute', inset: 0, visibility: view === 'map' ? 'hidden' : 'visible' }}>
            <TimelineGrid
              onYearChange={handleYearChange}
              selectedCountries={selectedCountries}
              onOpenSidebar={openSidebar}
            />
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

        <CountrySidebar
          countries={countries}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
          open={sidebarOpen}
        />
      </div>
    </div>
  )
}

export default App
```

Key points: the sidebar is a flex **sibling** of the content area, so the mini-map's `right: 18px` is relative to the shrinking content area and can never sit under the open sidebar. `Legend` no longer renders in the header (it lives in the sidebar now).

- [ ] **Step 2: Make TimelineGrid dynamic**

In `src/components/TimelineGrid.jsx`:

a. Remove the countries import (line 2): delete `import countries from '../data/countries.json'`.

b. Change the signature (line 64) from:

```jsx
export default function TimelineGrid({ onYearChange }) {
```

to:

```jsx
export default function TimelineGrid({ onYearChange, selectedCountries, onOpenSidebar }) {
```

c. Immediately after the `useEffect` block (after line 84), add the empty state:

```jsx
  if (selectedCountries.length === 0) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        color: '#666',
        fontSize: 14,
      }}>
        <div>No countries selected</div>
        <button
          onClick={onOpenSidebar}
          style={{
            font: 'inherit',
            fontSize: '13px',
            fontWeight: 600,
            padding: '7px 16px',
            cursor: 'pointer',
            background: '#4a6fa5',
            color: 'white',
            border: 'none',
            borderRadius: 5,
          }}
        >
          Open the Countries panel
        </button>
      </div>
    )
  }
```

Note: this early return must come AFTER the `useEffect` call (hooks can't be conditional).

d. Replace every remaining use of `countries` with `selectedCountries` — three places: `gridTemplateColumns` (`repeat(${selectedCountries.length}, ${COUNTRY_COL_WIDTH})`), the header row `.map`, and the per-year cells `.map`.

The module-level `eventMap` / `monarchsByCountry` lookups don't change — they're keyed by countryId and unselected countries are simply never looked up.

- [ ] **Step 3: Verify**

Run: `npm run lint` — Expected: no new errors.
Run: `npm run build` — Expected: success.
Manual (dev server):
1. App loads exactly as before (6 columns; Legend gone from header).
2. "Countries" button opens/closes the sidebar (columns squeeze, mini-map slides with them).
3. Unchecking France removes its column immediately; re-checking restores it in position.
4. "Europe" continent checkbox unchecks all 5 European countries at once; indeterminate dash shows when only some are checked.
5. Uncheck everything → empty-state message; its button opens the sidebar.
6. Reload the page → selection remembered.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/components/TimelineGrid.jsx
git commit -m "feat: dynamic country selection with collapsible sidebar"
```

---

### Task 4: Map mirrors the selection

**Files:**
- Modify: `src/components/WorldMap.jsx`
- Modify: `src/components/TerritoryLayer.jsx`
- Modify: `src/components/EventPinLayer.jsx`
- Modify: `src/App.jsx` (pass the new prop)

**Interfaces:**
- Consumes: App's `selectedIds` state from Task 3.
- Produces: `WorldMap`, `TerritoryLayer`, `EventPinLayer` each accept `selectedIds: Set<string>` and render only matching countries.

- [ ] **Step 1: App passes a Set**

In `src/App.jsx`, add below the `selectedCountries` memo:

```jsx
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])
```

and add the prop to the WorldMap element:

```jsx
            <WorldMap
              mode={isMini ? 'mini' : 'full'}
              currentYear={currentYear}
              onPinClick={handlePinClick}
              selectedIds={selectedIdSet}
            />
```

- [ ] **Step 2: WorldMap forwards it**

In `src/components/WorldMap.jsx`, change the signature to:

```jsx
export default function WorldMap({ currentYear, onPinClick, mode = 'full', selectedIds }) {
```

and pass it to both layers:

```jsx
          <TerritoryLayer currentYear={currentYear} width={W} height={H} selectedIds={selectedIds} />
          <EventPinLayer currentYear={currentYear} onPinClick={onPinClick} selectedIds={selectedIds} />
```

- [ ] **Step 3: TerritoryLayer filters**

In `src/components/TerritoryLayer.jsx`, change the signature to:

```jsx
export default function TerritoryLayer({ currentYear, width, height, selectedIds }) {
```

and filter the territories before mapping:

```jsx
      {snapshot.territories
        .filter(territory => selectedIds.has(territory.countryId))
        .map(territory =>
```

(The closing parenthesis structure stays the same — `.map(...)` still returns the polygon array.)

- [ ] **Step 4: EventPinLayer filters**

In `src/components/EventPinLayer.jsx`, change the signature to:

```jsx
export default function EventPinLayer({ currentYear, onPinClick, selectedIds }) {
```

and the filter line to:

```jsx
  const pins = events.filter(e => e.year === currentYear && e.lat != null && selectedIds.has(e.countryId))
```

- [ ] **Step 5: Verify**

Run: `npm run lint` — Expected: no new errors.
Run: `npm run build` — Expected: success.
Manual: uncheck Spain → its territory and pins vanish from both mini-map and full map; recheck → they return. With all six unchecked, the map shows only the gray world outline.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/components/WorldMap.jsx src/components/TerritoryLayer.jsx src/components/EventPinLayer.jsx
git commit -m "feat: map territories and pins mirror country selection"
```

---

### Task 5: Phase A verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the spec's Phase-A checks**

With the dev server running:
1. Default load identical to v26.1 (original 6, sidebar closed) — except Legend now lives in the sidebar.
2. Continent select-all adds/removes whole groups; single country toggles column + territory + pins together.
3. Continent checkbox indeterminate when partially selected.
4. Empty selection: message + working button.
5. Reload preserves selection.
6. Mini-map never overlaps the open sidebar; keyboard: Tab reaches sidebar checkboxes and the mini-map.

- [ ] **Step 2: Fix anything that fails, commit fixes as `fix: <what>`**

---

### Task 6: Europe data batch (Portugal, Dutch Republic, Sweden, Poland-Lithuania)

**Files:**
- Modify: `src/data/countries.json` (append 4 entries)
- Modify: `src/data/monarchs.json` (append rulers)
- Modify: `src/data/events.json` (append events)
- Modify: `src/data/territories.json` (add polygons to the 8 snapshots)

**Interfaces:**
- Consumes: schemas as-is; sidebar/grid/map pick new countries up automatically from countries.json.
- Produces: 4 selectable European countries with full data.

- [ ] **Step 1: Append to countries.json**

```json
  { "id": "portugal", "name": "Portugal", "continent": "Europe", "color": "#cfe3e0", "mapColor": "#7fa8a3", "mapStroke": "#5f847f" },
  { "id": "dutch-republic", "name": "Dutch Republic", "continent": "Europe", "color": "#f3ddc2", "mapColor": "#c9995e", "mapStroke": "#a1793f" },
  { "id": "sweden", "name": "Sweden", "continent": "Europe", "color": "#cdd5ec", "mapColor": "#8494c4", "mapStroke": "#647199" },
  { "id": "poland-lithuania", "name": "Poland-Lithuania", "continent": "Europe", "color": "#e3ccd6", "mapColor": "#b57f9f", "mapStroke": "#8f617c" }
]
```

(Colors may be visually fine-tuned during Allen's review; keep the triple structure.)

- [ ] **Step 2: Append rulers to monarchs.json** (ids continue `mNNN` from current max)

- Portugal: Manuel I 1495–1521; John III 1521–1557; Sebastian 1557–1578; Henry 1578–1580; Philip I 1580–1598; Philip II 1598–1621; Philip III 1621–1640; John IV 1640–1656; Afonso VI 1656–1683; Peter II 1683–1706
- Dutch Republic (stadtholders): William I of Orange 1572–1584; Maurice 1585–1625; Frederick Henry 1625–1647; William II 1647–1650; First Stadtholderless Period 1650–1672 (SKIP — leave the gap unshaded); William III 1672–1702
- Sweden: Gustav I Vasa 1523–1560; Eric XIV 1560–1568; John III 1568–1592; Sigismund 1592–1599; Charles IX 1599–1611; Gustavus Adolphus 1611–1632; Christina 1632–1654; Charles X Gustav 1654–1660; Charles XI 1660–1697; Charles XII 1697–1718
- Poland-Lithuania: Alexander I 1501–1506; Sigismund I 1506–1548; Sigismund II Augustus 1548–1572; Henry Valois 1573–1575; Stephen Báthory 1576–1586; Sigismund III 1587–1632; Władysław IV 1632–1648; John II Casimir 1648–1668; Michael I 1669–1673; John III Sobieski 1674–1696; Augustus II 1697–1706

- [ ] **Step 3: Author 15–20 events per country** (same schema; lat/lng required; spread types across monarch/war/birth/death/exploration/other). Required anchor events:

- Portugal: Goa captured (1510), Portuguese reach China/Macau (1557), Luís de Camões publishes The Lusiads (1572), Battle of Alcácer Quibir (1578), Iberian Union (1580), Restoration of independence (1640)
- Dutch Republic: Dutch Revolt begins (1568), Union of Utrecht (1579), VOC founded (1602), Twelve Years' Truce (1609), Rembrandt's Night Watch (1642), Peace of Münster (1648), Rampjaar — disaster year (1672)
- Sweden: Gustav Vasa elected king / Kalmar Union ends (1523), Swedish Reformation (1527), warship Vasa sinks (1628), Sweden enters Thirty Years' War (1630), Battle of Lützen — death of Gustavus Adolphus (1632), Queen Christina abdicates (1654)
- Poland-Lithuania: Union of Lublin (1569), Warsaw Confederation religious tolerance (1573), Sigismund III moves capital to Warsaw (1596), The Deluge — Swedish invasion (1655), Battle of Vienna — Sobieski (1683)

- [ ] **Step 4: Add territory polygons** to ALL 8 snapshots for Portugal, Sweden, Poland-Lithuania; Dutch Republic only from the 1590 snapshot onward (before the revolt it was Habsburg). Rough polygon rings in the existing lng/lat format, following the style of existing entries (5–15 points per ring).

- [ ] **Step 5: Verify** — lint + build; dev server: select the new countries, check columns, reign shading, events, territories, pins.

- [ ] **Step 6: PAUSE — Allen reviews the batch for historical accuracy. Only after his approval:**

```bash
git add src/data/countries.json src/data/monarchs.json src/data/events.json src/data/territories.json
git commit -m "feat: Europe data batch - Portugal, Dutch Republic, Sweden, Poland-Lithuania"
```

---

### Task 7: Asia & Middle East data batch (China, Japan, Mughal India, Safavid Persia)

**Files:** same four data files as Task 6.

- [ ] **Step 1: Append to countries.json**

```json
  { "id": "china", "name": "China (Ming/Qing)", "continent": "Asia & Middle East", "color": "#f0d0c6", "mapColor": "#c07a62", "mapStroke": "#9a5c47" },
  { "id": "japan", "name": "Japan", "continent": "Asia & Middle East", "color": "#f2d3da", "mapColor": "#c26e7e", "mapStroke": "#9b5261" },
  { "id": "mughal-india", "name": "Mughal India", "continent": "Asia & Middle East", "color": "#eee0c2", "mapColor": "#c2a35a", "mapStroke": "#9a7f40" },
  { "id": "safavid-persia", "name": "Safavid Persia", "continent": "Asia & Middle East", "color": "#c9e0e6", "mapColor": "#5f9fb0", "mapStroke": "#457d8c" }
]
```

- [ ] **Step 2: Append rulers**

- China: Hongzhi 1487–1505; Zhengde 1505–1521; Jiajing 1521–1567; Longqing 1567–1572; Wanli 1572–1620; Tianqi 1620–1627; Chongzhen 1627–1644; Shunzhi (Qing) 1644–1661; Kangxi (Qing) 1661–1722
- Japan (effective rulers): Ashikaga shogunate 1500–1573 (one collective band, name "Ashikaga shoguns"); Oda Nobunaga 1573–1582; Toyotomi Hideyoshi 1582–1598; Tokugawa Ieyasu 1603–1605; Tokugawa Hidetada 1605–1623; Tokugawa Iemitsu 1623–1651; Tokugawa Ietsuna 1651–1680; Tokugawa Tsunayoshi 1680–1709 (1598–1603 gap unshaded)
- Mughal India: Babur 1526–1530; Humayun 1530–1540; Sher Shah Suri 1540–1545; Islam Shah Suri 1545–1554; Humayun (restored) 1555–1556; Akbar 1556–1605; Jahangir 1605–1627; Shah Jahan 1628–1658; Aurangzeb 1658–1707 (pre-1526 unshaded)
- Safavid Persia: Ismail I 1501–1524; Tahmasp I 1524–1576; Ismail II 1576–1577; Mohammad Khodabanda 1578–1587; Abbas I 1588–1629; Safi 1629–1642; Abbas II 1642–1666; Suleiman I 1666–1694; Sultan Husayn 1694–1722

- [ ] **Step 3: Author 15–20 events per country.** Required anchors:

- China: Portuguese reach China (1513), Wanli era begins (1572), Matteo Ricci in Beijing (1601), Manchu invasion / fall of Ming (1644), Kangxi begins reign (1661), Treaty of Nerchinsk with Russia (1689)
- Japan: Portuguese introduce firearms — Tanegashima (1543), Francis Xavier arrives (1549), Battle of Sekigahara (1600), Tokugawa shogunate founded (1603), Shimabara Rebellion (1637), sakoku isolation edicts (1639)
- Mughal India: First Battle of Panipat (1526), Akbar's reign begins (1556), Din-i Ilahi and religious tolerance (1582), Taj Mahal construction begins (1632), Aurangzeb seizes throne (1658)
- Safavid Persia: Ismail I founds Safavid dynasty / Twelver Shi'ism (1501), Battle of Chaldiran (1514), Abbas I begins reign (1588), capital moved to Isfahan (1598), Ottoman-Safavid Treaty of Zuhab (1639)

- [ ] **Step 4: Territory polygons** — China, Japan, Safavid Persia in all 8 snapshots; Mughal India from the 1530 snapshot onward (small Babur-era shape at 1530, expanding through Akbar/Aurangzeb snapshots).

- [ ] **Step 5: Verify** (lint + build + dev-server spot checks) — then **PAUSE for Allen's review**, then:

```bash
git add src/data/*.json
git commit -m "feat: Asia & Middle East data batch - China, Japan, Mughal India, Safavid Persia"
```

---

### Task 8: Africa data batch (Songhai, Ethiopia)

**Files:** same four data files.

- [ ] **Step 1: Append to countries.json**

```json
  { "id": "songhai", "name": "Songhai Empire", "continent": "Africa", "color": "#e6d5bd", "mapColor": "#a1743f", "mapStroke": "#7d5a30" },
  { "id": "ethiopia", "name": "Ethiopia", "continent": "Africa", "color": "#dde3c8", "mapColor": "#8a9a5b", "mapStroke": "#6b7845" }
]
```

- [ ] **Step 2: Append rulers**

- Songhai: Askia Mohammad I 1493–1528; Askia Musa 1528–1531; Askia Mohammad Benkan 1531–1537; Askia Ismail 1537–1539; Askia Ishaq I 1539–1549; Askia Daoud 1549–1582; Askia Al-Hajj 1582–1586; Askia Mohammad Bani 1586–1588; Askia Ishaq II 1588–1591 (nothing after 1591)
- Ethiopia: Na'od 1494–1508; Dawit II (Lebna Dengel) 1508–1540; Gelawdewos 1540–1559; Menas 1559–1563; Sarsa Dengel 1563–1597; Yaqob 1597–1603; Susenyos I 1606–1632; Fasilides 1632–1667; Yohannes I 1667–1682; Iyasu I 1682–1706

- [ ] **Step 3: Author 8–12 events per country.** Required anchors:

- Songhai: Askia Mohammad's hajj and reforms (~1497–1500s, use a 1500s event), Timbuktu scholarship under Askia Daoud (1550s), Moroccan invasion — Battle of Tondibi and fall of Songhai (1591)
- Ethiopia: Ahmad Gragn's invasion begins (1529), Portuguese military aid / Cristóvão da Gama (1541), Jesuit missions and Susenyos's Catholic conversion (1622), Fasilides founds Gondar (1636), expulsion of the Jesuits (1633)

- [ ] **Step 4: Territory polygons** — Songhai in 1500, 1530, 1560, 1590 snapshots only (falls 1591); Ethiopia in all 8.

- [ ] **Step 5: Verify → PAUSE for Allen's review → commit:**

```bash
git add src/data/*.json
git commit -m "feat: Africa data batch - Songhai, Ethiopia"
```

---

### Task 9: Americas data batch (Aztec, Inca)

**Files:** same four data files.

- [ ] **Step 1: Append to countries.json**

```json
  { "id": "aztec", "name": "Aztec Empire", "continent": "Americas", "color": "#dcd2e8", "mapColor": "#8b7bb5", "mapStroke": "#6c5f91" },
  { "id": "inca", "name": "Inca Empire", "continent": "Americas", "color": "#e2cfdc", "mapColor": "#8f5f7f", "mapStroke": "#714a64" }
]
```

- [ ] **Step 2: Append rulers**

- Aztec: Ahuitzotl 1486–1502; Moctezuma II 1502–1520; Cuitláhuac 1520–1520; Cuauhtémoc 1520–1521 (nothing after 1521)
- Inca: Huayna Capac 1493–1527; Huáscar 1527–1532; Atahualpa 1532–1533 (nothing after 1533; Vilcabamba holdout covered by events, not reigns)

- [ ] **Step 3: Author 6–10 events per country.** Required anchors:

- Aztec: Moctezuma II crowned (1502), Cortés lands / meeting with Moctezuma (1519), La Noche Triste (1520), smallpox epidemic (1520), fall of Tenochtitlan — conquest event (1521)
- Inca: Huayna Capac's death and succession crisis (1527), civil war Huáscar vs Atahualpa (1529–1532, one event), Cajamarca — Atahualpa captured (1532), execution of Atahualpa / fall of Cusco — conquest event (1533), Vilcabamba resistance ends (1572)

- [ ] **Step 4: Territory polygons** — Aztec and Inca in the 1500 snapshot ONLY (both fall before 1530).

- [ ] **Step 5: Verify → PAUSE for Allen's review → commit:**

```bash
git add src/data/*.json
git commit -m "feat: Americas data batch - Aztec, Inca"
```

---

### Task 10: Final verification and docs

**Files:**
- Modify: `README.md` (if it enumerates the 6 countries, update to describe dynamic selection and 18 countries)

- [ ] **Step 1: Full spec verification checklist**

1. Default load = original 6, sidebar closed.
2. All four continents appear in the sidebar; select-all works per continent.
3. All 18 countries individually toggle column + territory + pins.
4. Aztec/Inca columns show events early, blank shading after their falls.
5. Songhai territory absent from 1620+ snapshots; Dutch territory absent before 1590.
6. Empty selection, localStorage persistence, mini-map/sidebar layout all still correct.
7. `npm run lint` and `npm run build` clean.

- [ ] **Step 2: Update README.md if it names the fixed country list; commit as `docs: update README for dynamic country selection`**

- [ ] **Step 3: Confirm clean tree** — `git status` clean; `git log --oneline master..HEAD` shows spec + plan + one commit per task.
