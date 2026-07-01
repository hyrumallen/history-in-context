# World Map — Sub-project 2: Event Pins

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Prerequisite:** Sub-project 1 must be complete (the WorldMap component must exist and render).

**Goal:** Add a colored dot to the world map for each event happening in the currently visible year; clicking a dot scrolls the timeline grid to that event and briefly highlights it.

**Architecture:** Each event in `events.json` gets `lat`/`lng` fields. `EventPinLayer` reads those fields, filters to `currentYear`, and renders SVG circles using the same projection as the map. Clicking a circle calls `onPinClick(eventId)` which bubbles up to `App.jsx` and scrolls + flashes the grid row via DOM `data-event-id` selectors.

**Tech Stack:** React 18, plain SVG, DOM `querySelector` / `scrollIntoView`, existing CSS cascade.

## Global Constraints

- No new npm dependencies
- Projection: `x = (lng + 180) * (800 / 360)`, `y = (90 - lat) * (400 / 180)` — identical to Sub-project 1
- Pin colors match `TYPE_COLORS` already used in `EventCell.jsx`
- Flash duration: 1.5s fade-out using CSS transition
- Pins scale with map zoom (they live inside the same `<g transform>` as territories)
- `data-event-id` attribute is the join key between map pins and grid rows
- Pan clamping added to `useMapTransform` in Task 3: prevent map from dragging fully off-screen

---

### Task 1: Add coordinates to events.json

**Files:**
- Create (temporary): `scripts/add-coordinates.cjs`
- Modify: `src/data/events.json`

**Interfaces:**
- Produces: each event object gains `"lat": number` and `"lng": number` fields

- [ ] **Step 1: Create scripts/add-coordinates.cjs**

The project uses `"type": "module"` (ESM), so this helper script uses the `.cjs` extension to keep CommonJS `require()` syntax working. If the `scripts/` directory doesn't exist, create it first: `mkdir scripts`

```js
const fs = require('fs')
const path = require('path')

const COORDS = {
  e001: { lat: 51.5,   lng: -0.12  },  // London — Henry VIII
  e002: { lat: 51.87,  lng: 12.65  },  // Wittenberg — Luther's 95 Theses
  e003: { lat: 19.4,   lng: -99.1  },  // Mexico City — Cortés
  e004: { lat: 41.0,   lng: 29.0   },  // Constantinople — Suleiman
  e005: { lat: 48.2,   lng: 16.37  },  // Vienna — Siege 1529
  e006: { lat: 51.5,   lng: -0.12  },  // London — English Reformation
  e007: { lat: 55.75,  lng: 37.6   },  // Moscow — Ivan IV crowned
  e008: { lat: 48.37,  lng: 10.9   },  // Augsburg — Peace of Augsburg
  e009: { lat: 51.5,   lng: -0.12  },  // London — Elizabeth I
  e010: { lat: 46.05,  lng: 17.8   },  // Szigetvár — Suleiman dies
  e011: { lat: 38.38,  lng: 21.13  },  // Gulf of Patras — Lepanto
  e012: { lat: 48.85,  lng: 2.35   },  // Paris — St. Bartholomew's
  e013: { lat: 50.5,   lng: -4.0   },  // English Channel — Armada
  e014: { lat: 47.22,  lng: -1.55  },  // Nantes — Edict of Nantes
  e015: { lat: 51.5,   lng: -0.12  },  // London — James I
  e016: { lat: 55.75,  lng: 37.6   },  // Moscow — Romanov dynasty
  e017: { lat: 50.07,  lng: 14.43  },  // Prague — Thirty Years' War
  e018: { lat: 48.85,  lng: 2.35   },  // Paris — Louis XIV
  e019: { lat: 51.97,  lng: 7.63   },  // Münster — Peace of Westphalia
  e020: { lat: 51.5,   lng: -0.12  },  // London — Charles I executed
  e021: { lat: 55.75,  lng: 37.6   },  // Moscow — Peter the Great
  e022: { lat: 48.2,   lng: 16.37  },  // Vienna — Siege 1683
  e023: { lat: 55.75,  lng: 37.6   },  // Moscow — Vasily III
  e024: { lat: 41.0,   lng: 29.0   },  // Constantinople — Selim I
  e025: { lat: 48.85,  lng: 2.35   },  // Paris — Francis I
  e026: { lat: 40.4,   lng: -3.7   },  // Madrid — Charles I of Spain
  e027: { lat: 50.11,  lng: 8.68   },  // Frankfurt — Charles V Emperor
  e028: { lat: 51.5,   lng: -0.12  },  // London — Edward VI
  e029: { lat: 48.85,  lng: 2.35   },  // Paris — Henry II
  e030: { lat: 51.5,   lng: -0.12  },  // London — Mary I
  e031: { lat: 40.4,   lng: -3.7   },  // Madrid — Philip II
  e032: { lat: 48.2,   lng: 16.37  },  // Vienna — Ferdinand I
  e033: { lat: 48.85,  lng: 2.35   },  // Paris — Francis II
  e034: { lat: 48.85,  lng: 2.35   },  // Paris — Charles IX
  e035: { lat: 48.2,   lng: 16.37  },  // Vienna — Maximilian II
  e036: { lat: 41.0,   lng: 29.0   },  // Constantinople — Selim II
  e037: { lat: 48.85,  lng: 2.35   },  // Paris — Henry III
  e038: { lat: 41.0,   lng: 29.0   },  // Constantinople — Murad III
  e039: { lat: 50.07,  lng: 14.43  },  // Prague — Rudolf II
  e040: { lat: 55.75,  lng: 37.6   },  // Moscow — Feodor I
  e041: { lat: 48.85,  lng: 2.35   },  // Paris — Henry IV
  e042: { lat: 41.0,   lng: 29.0   },  // Constantinople — Mehmed III
  e043: { lat: 55.75,  lng: 37.6   },  // Moscow — Boris Godunov
  e044: { lat: 40.4,   lng: -3.7   },  // Madrid — Philip III
  e045: { lat: 41.0,   lng: 29.0   },  // Constantinople — Ahmed I
  e046: { lat: 48.85,  lng: 2.35   },  // Paris — Louis XIII
  e047: { lat: 48.2,   lng: 16.37  },  // Vienna — Matthias
  e048: { lat: 41.0,   lng: 29.0   },  // Constantinople — Mustafa I
  e049: { lat: 41.0,   lng: 29.0   },  // Constantinople — Osman II
  e050: { lat: 48.2,   lng: 16.37  },  // Vienna — Ferdinand II
  e051: { lat: 40.4,   lng: -3.7   },  // Madrid — Philip IV
  e052: { lat: 41.0,   lng: 29.0   },  // Constantinople — Mustafa I again
  e053: { lat: 41.0,   lng: 29.0   },  // Constantinople — Murad IV
  e054: { lat: 51.5,   lng: -0.12  },  // London — Charles I
  e055: { lat: 48.2,   lng: 16.37  },  // Vienna — Ferdinand III
  e056: { lat: 41.0,   lng: 29.0   },  // Constantinople — Ibrahim
  e057: { lat: 55.75,  lng: 37.6   },  // Moscow — Alexis I
  e058: { lat: 41.0,   lng: 29.0   },  // Constantinople — Mehmed IV
  e059: { lat: 48.2,   lng: 16.37  },  // Vienna — Leopold I
  e060: { lat: 51.5,   lng: -0.12  },  // London — Charles II restored
  e061: { lat: 40.4,   lng: -3.7   },  // Madrid — Charles II of Spain
  e062: { lat: 55.75,  lng: 37.6   },  // Moscow — Feodor III
  e063: { lat: 51.5,   lng: -0.12  },  // London — James II
  e064: { lat: 41.0,   lng: 29.0   },  // Constantinople — Suleiman II
  e065: { lat: 51.5,   lng: -0.12  },  // London — William III
  e066: { lat: 41.0,   lng: 29.0   },  // Constantinople — Ahmed II
  e067: { lat: 41.0,   lng: 29.0   },  // Constantinople — Mustafa II
  e068: { lat: 55.62,  lng: -2.17  },  // Flodden Field — Battle of Flodden
  e069: { lat: 39.0,   lng: 44.4   },  // Chaldiran — Battle of Chaldiran
  e070: { lat: 51.5,   lng: -0.12  },  // London — Thomas More's Utopia
  e071: { lat: 30.06,  lng: 31.24  },  // Cairo — Ottomans conquer Egypt
  e072: { lat: 37.39,  lng: -5.99  },  // Seville — Magellan begins
  e073: { lat: 47.41,  lng: 0.98   },  // Amboise — Leonardo dies
  e074: { lat: 44.82,  lng: 20.46  },  // Belgrade — Ottomans capture
  e075: { lat: 49.63,  lng: 8.36   },  // Worms — Diet of Worms
  e076: { lat: 10.3,   lng: 124.0  },  // Mactan, Philippines — Magellan killed
  e077: { lat: 36.43,  lng: 28.22  },  // Rhodes — Ottomans capture Rhodes
  e078: { lat: 45.99,  lng: 18.68  },  // Mohács — Battle of Mohács
  e079: { lat: 44.49,  lng: 11.34  },  // Bologna — Charles V crowned by Pope
  e080: { lat: -7.16,  lng: -78.51 },  // Cajamarca, Peru — Pizarro
  e081: { lat: 44.84,  lng: -0.58  },  // Bordeaux area — Montaigne born
  e082: { lat: 51.5,   lng: -0.12  },  // London — Henry VIII marries Anne Boleyn
  e083: { lat: 51.5,   lng: -0.12  },  // London — Dissolution of Monasteries
  e084: { lat: 38.96,  lng: 20.75  },  // Preveza — Battle of Preveza
  e085: { lat: 41.9,   lng: 12.5   },  // Rome — Jesuits founded
  e086: { lat: 47.49,  lng: 19.04  },  // Buda — Ottomans annex Hungary
  e087: { lat: 54.36,  lng: 19.68  },  // Frombork, Poland — Copernicus
  e088: { lat: 46.07,  lng: 11.12  },  // Trento — Council of Trent begins
  e089: { lat: -19.58, lng: -65.75 },  // Potosí, Bolivia — Silver
  e090: { lat: 40.48,  lng: -3.36  },  // Alcalá de Henares — Cervantes born
  e091: { lat: 55.79,  lng: 49.12  },  // Kazan — Ivan IV conquers Kazan
  e092: { lat: 46.35,  lng: 48.04  },  // Astrakhan — Ivan IV conquers
  e093: { lat: 51.5,   lng: -0.12  },  // London — Francis Bacon born
  e094: { lat: 48.38,  lng: 5.07   },  // Vassy — French Wars of Religion
  e095: { lat: 46.07,  lng: 11.12  },  // Trento — Council of Trent concludes
  e096: { lat: 52.19,  lng: -1.71  },  // Stratford-upon-Avon — Shakespeare born
  e097: { lat: 55.75,  lng: 37.6   },  // Moscow — Oprichnina
  e098: { lat: 50.85,  lng: 4.35   },  // Brussels — Dutch Revolt
  e099: { lat: 48.75,  lng: 8.87   },  // Weil der Stadt — Kepler born
  e100: { lat: 51.22,  lng: 4.4    },  // Antwerp — Sack of Antwerp
  e101: { lat: 50.88,  lng: 8.02   },  // Siegen — Rubens born
  e102: { lat: 56.4,   lng: 38.72  },  // Alexandrov — Ivan kills his son
  e103: { lat: 41.9,   lng: 12.5   },  // Rome — Gregorian calendar
  e104: { lat: 52.52,  lng: -0.47  },  // Fotheringhay — Mary Queen of Scots
  e105: { lat: 46.92,  lng: 0.7    },  // La Haye en Touraine — Descartes born
  e106: { lat: 51.5,   lng: -0.12  },  // London — East India Company
  e107: { lat: 51.5,   lng: -0.12  },  // London — Gunpowder Plot
  e108: { lat: 40.4,   lng: -3.7   },  // Madrid — Don Quixote
  e109: { lat: 55.75,  lng: 37.6   },  // Moscow — Time of Troubles
  e110: { lat: 37.2,   lng: -76.78 },  // Jamestown, Virginia — colony founded
  e111: { lat: 46.81,  lng: -71.21 },  // Quebec City — Champlain founds Quebec
  e112: { lat: 50.07,  lng: 14.43  },  // Prague — Kepler's laws
  e113: { lat: 51.5,   lng: -0.12  },  // London — King James Bible
  e114: { lat: 52.19,  lng: -1.71  },  // Stratford-upon-Avon — Shakespeare dies
  e115: { lat: 40.4,   lng: -3.7   },  // Madrid — Cervantes dies
  e116: { lat: 50.07,  lng: 14.3   },  // near Prague — Battle of White Mountain
  e117: { lat: 41.96,  lng: -70.67 },  // Plymouth, Massachusetts — Mayflower
  e118: { lat: 48.85,  lng: 2.35   },  // Paris — Richelieu
  e119: { lat: 51.5,   lng: -0.12  },  // London — Harvey on circulation
  e120: { lat: 46.16,  lng: -1.15  },  // La Rochelle — Siege
  e121: { lat: 49.02,  lng: 12.1   },  // Regensburg — Kepler dies
  e122: { lat: 51.42,  lng: 12.37  },  // Breitenfeld — Battle
  e123: { lat: 51.36,  lng: -2.77  },  // Wrington, Somerset — Locke born
  e124: { lat: 52.37,  lng: 4.9    },  // Amsterdam — Descartes publishes
  e125: { lat: 38.72,  lng: -9.14  },  // Lisbon — Portugal breaks from Spain
  e126: { lat: 52.95,  lng: -1.14  },  // Nottingham — English Civil War
  e127: { lat: 52.8,   lng: -0.63  },  // Woolsthorpe — Newton born
  e128: { lat: 49.89,  lng: 4.52   },  // Rocroi — Battle of Rocroi
  e129: { lat: 51.5,   lng: -0.12  },  // London — Hobbes Leviathan
  e130: { lat: 55.0,   lng: 3.0    },  // North Sea — Anglo-Dutch War
  e131: { lat: 50.06,  lng: 31.45  },  // Pereyaslav — Russia annexes Ukraine
  e132: { lat: 51.5,   lng: -0.12  },  // London — Royal Society
  e133: { lat: 40.71,  lng: -74.0  },  // New York — England seizes New Amsterdam
  e134: { lat: 51.5,   lng: -0.12  },  // London — Great Plague
  e135: { lat: 51.5,   lng: -0.12  },  // London — Great Fire
  e136: { lat: 35.34,  lng: 25.14  },  // Heraklion, Crete — Ottomans conquer
  e137: { lat: 52.37,  lng: 4.9    },  // Amsterdam — France invades Dutch
  e138: { lat: 55.75,  lng: 37.6   },  // Moscow — Peter born
  e139: { lat: 29.0,   lng: -89.25 },  // Mississippi delta — La Salle
  e140: { lat: 48.8,   lng: 2.12   },  // Versailles — Edict of Nantes revoked
  e141: { lat: 51.5,   lng: -0.12  },  // London — Newton Principia
  e142: { lat: 55.75,  lng: 37.6   },  // Moscow — Peter takes power
  e143: { lat: 51.5,   lng: -0.12  },  // London — Locke Essay
  e144: { lat: 52.37,  lng: 4.9    },  // Amsterdam — Peter tours Europe
  e145: { lat: 45.2,   lng: 20.0   },  // Sremski Karlovci — Treaty of Karlowitz
  e146: { lat: 40.4,   lng: -3.7   },  // Madrid — Charles II dies
  e147: { lat: 59.38,  lng: 28.17  },  // Narva, Estonia — Great Northern War
}

const eventsPath = path.join(__dirname, '../src/data/events.json')
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'))

let count = 0
const updated = events.map(event => {
  const coords = COORDS[event.id]
  if (!coords) {
    console.warn(`No coords for ${event.id} (${event.title})`)
    return event
  }
  count++
  return { ...event, lat: coords.lat, lng: coords.lng }
})

fs.writeFileSync(eventsPath, JSON.stringify(updated, null, 2))
console.log(`Added coordinates to ${count}/${events.length} events`)
```

- [ ] **Step 2: Run the script**

```bash
node scripts/add-coordinates.cjs
```

Expected output:
```
Added coordinates to 147/147 events
```

If any warnings appear about missing coords, add the missing IDs to the COORDS object and re-run.

- [ ] **Step 3: Verify events.json was updated correctly**

```bash
node --input-type=module -e "import {readFileSync} from 'fs'; const d=JSON.parse(readFileSync('./src/data/events.json','utf8')); const n=d.filter(e=>e.lat!=null).length; console.log(n, 'events have coordinates')"
```

Expected: `147 events have coordinates`

Also spot-check two known events:
```bash
node --input-type=module -e "import {readFileSync} from 'fs'; const d=JSON.parse(readFileSync('./src/data/events.json','utf8')); const e=d.find(x=>x.id==='e110'); console.log(e.title, e.lat, e.lng)"
```
Expected: `Jamestown colony founded 37.2 -76.78`

- [ ] **Step 4: Delete the temporary script**

```bash
rm scripts/add-coordinates.cjs
```

- [ ] **Step 5: Commit**

```bash
git add src/data/events.json
git commit -m "feat: add geographic coordinates to all 147 events"
```

---

### Task 2: EventPinLayer component

**Files:**
- Modify: `src/components/EventCell.jsx`
- Create: `src/components/EventPinLayer.jsx`

**Interfaces:**
- Consumes: `currentYear: number`, `onPinClick: (eventId: string) => void` props
- Consumes: `events` from `../data/events.json` — each event has `lat: number`, `lng: number`, `year: number`, `type: string`, `id: string`, `title: string`
- Consumes: `TYPE_COLORS` exported from `EventCell.jsx`
- Produces: SVG `<g>` element with colored `<circle>` elements for each event in `currentYear`

- [ ] **Step 1: Export TYPE_COLORS from EventCell.jsx**

Open `src/components/EventCell.jsx`. Find the line:
```jsx
const TYPE_COLORS = {
```

Change it to:
```jsx
export const TYPE_COLORS = {
```

No other changes to EventCell.jsx.

- [ ] **Step 2: Create src/components/EventPinLayer.jsx**

```jsx
import events from '../data/events.json'
import { TYPE_COLORS } from './EventCell'

const W = 800
const H = 400

function project(lng, lat) {
  return [(lng + 180) * (W / 360), (90 - lat) * (H / 180)]
}

export default function EventPinLayer({ currentYear, onPinClick }) {
  const pins = events.filter(e => e.year === currentYear && e.lat != null)

  return (
    <g>
      {pins.map(event => {
        const [cx, cy] = project(event.lng, event.lat)
        return (
          <circle
            key={event.id}
            cx={cx}
            cy={cy}
            r={4}
            fill={TYPE_COLORS[event.type] ?? TYPE_COLORS.other}
            stroke="white"
            strokeWidth={0.8}
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

- [ ] **Step 3: Verify no red errors in the dev server**

Run `npm run dev` briefly. React components cannot be run directly by Node.js — Vite catches import errors on startup. Confirm the terminal shows no red errors, then proceed.

- [ ] **Step 4: Commit**

```bash
git add src/components/EventCell.jsx src/components/EventPinLayer.jsx
git commit -m "feat: add EventPinLayer component and export TYPE_COLORS"
```

---

### Task 3: Wire pin-click → grid scroll and add pan clamping

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/WorldMap.jsx`
- Modify: `src/components/TimelineGrid.jsx`
- Modify: `src/hooks/useMapTransform.js`
- Modify: `src/index.css`

**Interfaces:**
- App.jsx adds `handlePinClick` callback and passes `onPinClick` to WorldMap
- WorldMap passes `onPinClick` to EventPinLayer and adds EventPinLayer to scene
- TimelineGrid wraps each EventCell in `<div data-event-id={event.id}>`
- useMapTransform gains clamping to prevent dragging map fully off-screen
- index.css gains `.event-highlight` class for flash animation

- [ ] **Step 1: Add pan clamping to useMapTransform.js**

Open `src/hooks/useMapTransform.js`. Add this helper function ABOVE the `export default` line (before the function declaration):

```js
function clampT(t) {
  if (t.scale <= 1.001) return { scale: Math.max(1, t.scale), translateX: 0, translateY: 0 }
  const margin = 80
  const maxX = margin
  const minX = -800 * (t.scale - 1) - margin
  const maxY = margin
  const minY = -400 * (t.scale - 1) - margin
  return {
    scale: t.scale,
    translateX: Math.min(maxX, Math.max(minX, t.translateX)),
    translateY: Math.min(maxY, Math.max(minY, t.translateY)),
  }
}
```

Then wrap the `apply(...)` calls in `onWheel`, `onMouseMove`, and `onDoubleClick` to pass through `clampT`:

In `onWheel`, change:
```js
    apply({
      scale: newScale,
      translateX: mx - ratio * (mx - prev.translateX),
      translateY: my - ratio * (my - prev.translateY),
    })
```
To:
```js
    apply(clampT({
      scale: newScale,
      translateX: mx - ratio * (mx - prev.translateX),
      translateY: my - ratio * (my - prev.translateY),
    }))
```

In `onMouseMove`, change:
```js
    apply({
      scale: base.scale,
      translateX: base.translateX + (e.clientX - startX),
      translateY: base.translateY + (e.clientY - startY),
    })
```
To:
```js
    apply(clampT({
      scale: base.scale,
      translateX: base.translateX + (e.clientX - startX),
      translateY: base.translateY + (e.clientY - startY),
    }))
```

`onDoubleClick` resets to `{ scale: 1, translateX: 0, translateY: 0 }` which is already clamped — no change needed there.

- [ ] **Step 2: Add event-highlight CSS to index.css**

Open `src/index.css` and append these two rules at the end:

```css
.event-highlight {
  background: rgba(255, 220, 0, 0.4) !important;
  transition: background 1.5s ease-out;
}
```

- [ ] **Step 3: Add data-event-id wrappers to TimelineGrid.jsx**

In `src/components/TimelineGrid.jsx`, find the place where events are rendered inside each cell. The pattern looks like:

```jsx
{cellEvents.map(event => (
  <EventCell key={event.id} event={event} />
))}
```

Replace it with:

```jsx
{cellEvents.map(event => (
  <div key={event.id} data-event-id={event.id}>
    <EventCell event={event} />
  </div>
))}
```

The `data-event-id` attribute on this div is how `handlePinClick` in App.jsx finds and scrolls to the right row.

- [ ] **Step 4: Add handlePinClick to App.jsx**

Open `src/App.jsx`. The imports at the top currently have `useState` and `useCallback` from react. Make sure `useCallback` is imported (it already is from Task 3 of Sub-project 1).

Add `handlePinClick` immediately after `handleYearChange`:

```jsx
  const handlePinClick = useCallback((eventId) => {
    const el = document.querySelector(`[data-event-id="${eventId}"]`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('event-highlight')
    setTimeout(() => el.classList.remove('event-highlight'), 1500)
  }, [])
```

Then update the WorldMap JSX to pass it:
```jsx
        <WorldMap currentYear={currentYear} onPinClick={handlePinClick} />
```

- [ ] **Step 5: Add EventPinLayer to WorldMap.jsx**

Open `src/components/WorldMap.jsx`. Add the import at the top:
```jsx
import EventPinLayer from './EventPinLayer'
```

Update the component signature to accept `onPinClick`:
```jsx
export default function WorldMap({ currentYear, onPinClick }) {
```

Inside the SVG `<g transform>` element, add `EventPinLayer` after `TerritoryLayer`:
```jsx
          <TerritoryLayer currentYear={currentYear} width={W} height={H} />
          <EventPinLayer currentYear={currentYear} onPinClick={onPinClick} />
```

- [ ] **Step 6: Verify in browser**

Run `npm run dev` and check all of the following:

1. Colored dots appear on the map for the current year's events. (Scroll the grid to 1571 — two dots should appear: Lepanto near Greece and Kepler's birth near Stuttgart.)
2. Hovering a dot shows a tooltip with the event title.
3. Clicking a dot scrolls the timeline grid to that event row.
4. The clicked event row briefly flashes yellow (for ~1.5 seconds).
5. Pan clamping works: when zoomed in, you cannot drag the map so far that it disappears off-screen entirely. After dragging to the edge and releasing, some land should still be visible.
6. Double-click resets the map to full-world view and dots return to their correct positions.
7. No console errors.

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx src/components/WorldMap.jsx src/components/TimelineGrid.jsx src/hooks/useMapTransform.js src/index.css
git commit -m "feat: wire event pins to grid scroll with yellow flash highlight"
```
