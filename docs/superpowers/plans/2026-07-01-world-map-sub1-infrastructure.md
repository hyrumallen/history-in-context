# World Map — Sub-project 1: Infrastructure

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a world map panel below the timeline grid showing territory borders for the six tracked powers across 1500–1700, synced to the grid's scroll position, with zoom and pan.

**Architecture:** The page splits into two always-visible panels. App.jsx holds `currentYear` state fed by a scroll listener on the grid. WorldMap renders an SVG with a world coastline base layer and colored territory polygons from an 8-snapshot JSON file. A `useMapTransform` hook manages wheel-zoom and drag-pan.

**Tech Stack:** React 18, Vite, plain SVG (no mapping library), Natural Earth GeoJSON for coastline.

## Global Constraints

- No new npm dependencies
- All territory coordinates stored as `[longitude, latitude]` pairs
- Equirectangular projection: `x = (lng + 180) * (800 / 360)`, `y = (90 - lat) * (400 / 180)`
- SVG viewBox: `0 0 800 400`
- Territory polygons rendered at `fillOpacity={0.6}`, territory colors match `countries.json`
- Zoom scale clamped to 1–12; double-click resets to `{ scale: 1, translateX: 0, translateY: 0 }`
- Grid remains ~55% of viewport height; map takes remaining ~45%
- `currentYear` clamped to 1500–1700 inclusive
- Scroll throttle: 50ms

---

### Task 1: Source world-outline.json

**Files:**
- Create: `src/data/world-outline.json`

**Interfaces:**
- Produces: `worldOutline.features[]` — each feature has `.geometry.type` (`"Polygon"` or `"MultiPolygon"`) and `.geometry.coordinates` (GeoJSON format, outer ring first)

- [ ] **Step 1: Download the Natural Earth 110m land GeoJSON**

Open a browser and download this file:
```
https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson
```
Save it as `src/data/world-outline.json` in the project. The file is ~180KB and contains simplified outlines of all continents and major islands.

- [ ] **Step 2: Verify the file is valid JSON with the expected structure**

Run in the project root:
```bash
node --input-type=module -e "import {readFileSync} from 'fs'; const d=JSON.parse(readFileSync('./src/data/world-outline.json','utf8')); console.log(d.type, d.features.length, 'features')"
```
Expected output: something like `FeatureCollection 127 features`

- [ ] **Step 3: Commit**

```bash
git add src/data/world-outline.json
git commit -m "feat: add Natural Earth world outline data"
```

---

### Task 2: Create territories.json

**Files:**
- Create: `src/data/territories.json`

**Interfaces:**
- Produces: `territories` — array of 8 snapshot objects, each with `{ year: number, territories: [{ countryId: string, polygons: [{ name: string, coords: [number, number][] }] }] }`
- Consumed by: Task 5 (TerritoryLayer)

- [ ] **Step 1: Create src/data/territories.json with the complete content below**

```json
[
  {
    "year": 1500,
    "territories": [
      { "countryId": "england", "polygons": [
        { "name": "Great Britain", "coords": [[-5.7,50],[-2.9,51.1],[1.8,51.4],[1.5,52.9],[-0.1,54],[-2.5,55.3],[-3.5,57],[-4.5,58.6],[-6,58.3],[-5.5,56.5],[-4.6,53.4],[-5.2,52],[-5.7,50]] },
        { "name": "Ireland", "coords": [[-6.2,52],[-10.5,53.5],[-8,55.3],[-6,55],[-6.2,52]] }
      ]},
      { "countryId": "france", "polygons": [
        { "name": "France", "coords": [[-4.8,48.5],[-1.8,46.5],[1.4,43.5],[3,43.3],[7.5,43.8],[7.7,45],[7,47.5],[8.2,48],[7.6,49],[5,49.6],[2.6,51.1],[-1.5,49.5],[-2.5,48.5],[-4.8,48.5]] }
      ]},
      { "countryId": "spain", "polygons": [
        { "name": "Iberian Peninsula", "coords": [[-9.5,37],[-7,37],[-5.3,36],[-1.8,37.5],[0.5,39.5],[3.2,42.4],[1.5,43.4],[-1.7,43.4],[-8.9,42],[-9.5,37]] },
        { "name": "Sicily", "coords": [[12.4,37.8],[15.6,37.9],[15.7,38.2],[13.5,38.3],[12.4,37.8]] },
        { "name": "Naples", "coords": [[14.5,38],[16,38],[18.5,40.5],[16,41.5],[14.5,40],[14.5,38]] },
        { "name": "Sardinia", "coords": [[8.2,39],[9.5,41.5],[9.2,40],[8.2,39]] }
      ]},
      { "countryId": "holy-roman-empire", "polygons": [
        { "name": "Core", "coords": [[6,47.2],[10.4,47.5],[13.4,47.7],[16.9,48.1],[18,49.5],[16.5,50.5],[14.5,51.1],[10,54],[8.5,55],[6,53.5],[5.9,51],[6.5,49],[6.2,48],[6,47.2]] }
      ]},
      { "countryId": "russia", "polygons": [
        { "name": "Muscovy", "coords": [[28,57],[32,55],[37.5,55.8],[43,57],[44,60],[40,62],[33,62],[28,60],[28,57]] }
      ]},
      { "countryId": "ottoman-empire", "polygons": [
        { "name": "Anatolia and Balkans", "coords": [[20,40],[27,41],[30,43],[28,44],[24,43.5],[20,42],[17,41.5],[15.5,42],[18,39.5],[22.5,37.5],[26,36.5],[28,37],[30,36.5],[32,36.5],[36.5,36.5],[42,37],[44,39.5],[42,42.5],[40.5,43],[37,41.5],[33,42],[30,42],[28.5,41],[20,40]] }
      ]}
    ]
  },
  {
    "year": 1530,
    "territories": [
      { "countryId": "england", "polygons": [
        { "name": "Great Britain", "coords": [[-5.7,50],[-2.9,51.1],[1.8,51.4],[1.5,52.9],[-0.1,54],[-2.5,55.3],[-3.5,57],[-4.5,58.6],[-6,58.3],[-5.5,56.5],[-4.6,53.4],[-5.2,52],[-5.7,50]] },
        { "name": "Ireland", "coords": [[-6.2,52],[-10.5,53.5],[-8,55.3],[-6,55],[-6.2,52]] }
      ]},
      { "countryId": "france", "polygons": [
        { "name": "France", "coords": [[-4.8,48.5],[-1.8,46.5],[1.4,43.5],[3,43.3],[7.5,43.8],[7.7,45],[7,47.5],[8.2,48],[7.6,49],[5,49.6],[2.6,51.1],[-1.5,49.5],[-2.5,48.5],[-4.8,48.5]] }
      ]},
      { "countryId": "spain", "polygons": [
        { "name": "Iberian Peninsula", "coords": [[-9.5,37],[-7,37],[-5.3,36],[-1.8,37.5],[0.5,39.5],[3.2,42.4],[1.5,43.4],[-1.7,43.4],[-8.9,42],[-9.5,37]] },
        { "name": "Sicily", "coords": [[12.4,37.8],[15.6,37.9],[15.7,38.2],[13.5,38.3],[12.4,37.8]] },
        { "name": "Naples", "coords": [[14.5,38],[16,38],[18.5,40.5],[16,41.5],[14.5,40],[14.5,38]] },
        { "name": "Sardinia", "coords": [[8.2,39],[9.5,41.5],[9.2,40],[8.2,39]] },
        { "name": "New Spain", "coords": [[-118,30],[-95,14],[-86,14],[-86,17],[-90,20],[-95,19],[-105,20],[-118,30]] },
        { "name": "Caribbean", "coords": [[-75,17],[-70,17],[-70,20],[-75,20],[-75,17]] },
        { "name": "Peru", "coords": [[-82,-5],[-65,-5],[-65,-22],[-82,-22],[-82,-5]] }
      ]},
      { "countryId": "holy-roman-empire", "polygons": [
        { "name": "Core", "coords": [[6,47.2],[10.4,47.5],[13.4,47.7],[16.9,48.1],[18,49.5],[16.5,50.5],[14.5,51.1],[10,54],[8.5,55],[6,53.5],[5.9,51],[6.5,49],[6.2,48],[6,47.2]] }
      ]},
      { "countryId": "russia", "polygons": [
        { "name": "Expanded Muscovy", "coords": [[25,55],[28,53],[37.5,55.8],[43,57],[44,60],[40,62],[33,62],[28,60],[25,57],[25,55]] }
      ]},
      { "countryId": "ottoman-empire", "polygons": [
        { "name": "Anatolia and Balkans", "coords": [[20,40],[27,41],[30,43],[28,44],[24,43.5],[20,42],[17,41.5],[15.5,42],[18,39.5],[22.5,37.5],[26,36.5],[28,37],[30,36.5],[32,36.5],[36.5,36.5],[42,37],[44,39.5],[42,42.5],[40.5,43],[37,41.5],[33,42],[30,42],[28.5,41],[20,40]] },
        { "name": "Middle East", "coords": [[36.5,36.5],[42,37],[48,30],[50,26],[43,12.5],[37,15],[32,22],[32,30],[34.5,31.5],[36.5,33],[36.5,36.5]] },
        { "name": "North Africa", "coords": [[-5.5,35.8],[10,37],[13.5,33],[25,31.5],[32,30],[25,22],[15,23],[5,25],[-5.5,30],[-5.5,35.8]] },
        { "name": "Hungary", "coords": [[16,47.5],[22.5,48.5],[22,46],[18,45.5],[16,46],[16,47.5]] }
      ]}
    ]
  },
  {
    "year": 1560,
    "territories": [
      { "countryId": "england", "polygons": [
        { "name": "Great Britain", "coords": [[-5.7,50],[-2.9,51.1],[1.8,51.4],[1.5,52.9],[-0.1,54],[-2.5,55.3],[-3.5,57],[-4.5,58.6],[-6,58.3],[-5.5,56.5],[-4.6,53.4],[-5.2,52],[-5.7,50]] },
        { "name": "Ireland", "coords": [[-6.2,52],[-10.5,53.5],[-8,55.3],[-6,55],[-6.2,52]] }
      ]},
      { "countryId": "france", "polygons": [
        { "name": "France", "coords": [[-4.8,48.5],[-1.8,46.5],[1.4,43.5],[3,43.3],[7.5,43.8],[7.7,45],[7,47.5],[8.2,48],[7.6,49],[5,49.6],[2.6,51.1],[-1.5,49.5],[-2.5,48.5],[-4.8,48.5]] }
      ]},
      { "countryId": "spain", "polygons": [
        { "name": "Iberian Peninsula", "coords": [[-9.5,37],[-7,37],[-5.3,36],[-1.8,37.5],[0.5,39.5],[3.2,42.4],[1.5,43.4],[-1.7,43.4],[-8.9,42],[-9.5,37]] },
        { "name": "Sicily", "coords": [[12.4,37.8],[15.6,37.9],[15.7,38.2],[13.5,38.3],[12.4,37.8]] },
        { "name": "Naples", "coords": [[14.5,38],[16,38],[18.5,40.5],[16,41.5],[14.5,40],[14.5,38]] },
        { "name": "Sardinia", "coords": [[8.2,39],[9.5,41.5],[9.2,40],[8.2,39]] },
        { "name": "New Spain", "coords": [[-118,30],[-95,14],[-86,14],[-86,17],[-90,20],[-95,19],[-105,20],[-118,30]] },
        { "name": "Caribbean", "coords": [[-75,17],[-70,17],[-70,20],[-75,20],[-75,17]] },
        { "name": "Peru", "coords": [[-82,-5],[-65,-5],[-65,-22],[-82,-22],[-82,-5]] },
        { "name": "Philippines", "coords": [[117,7],[126,7],[126,18],[117,18],[117,7]] }
      ]},
      { "countryId": "holy-roman-empire", "polygons": [
        { "name": "Core", "coords": [[6,47.2],[10.4,47.5],[13.4,47.7],[16.9,48.1],[18,49.5],[16.5,50.5],[14.5,51.1],[10,54],[8.5,55],[6,53.5],[5.9,51],[6.5,49],[6.2,48],[6,47.2]] }
      ]},
      { "countryId": "russia", "polygons": [
        { "name": "Russia with Volga", "coords": [[25,55],[28,53],[37.5,55.8],[43,57],[48,52],[50,46],[48,44],[44,45],[44,60],[40,62],[33,62],[28,60],[25,57],[25,55]] }
      ]},
      { "countryId": "ottoman-empire", "polygons": [
        { "name": "Anatolia and Balkans", "coords": [[20,40],[27,41],[30,43],[28,44],[24,43.5],[20,42],[17,41.5],[15.5,42],[18,39.5],[22.5,37.5],[26,36.5],[28,37],[30,36.5],[32,36.5],[36.5,36.5],[42,37],[44,39.5],[42,42.5],[40.5,43],[37,41.5],[33,42],[30,42],[28.5,41],[20,40]] },
        { "name": "Middle East", "coords": [[36.5,36.5],[42,37],[48,30],[50,26],[43,12.5],[37,15],[32,22],[32,30],[34.5,31.5],[36.5,33],[36.5,36.5]] },
        { "name": "North Africa", "coords": [[-5.5,35.8],[10,37],[13.5,33],[25,31.5],[32,30],[25,22],[15,23],[5,25],[-5.5,30],[-5.5,35.8]] },
        { "name": "Hungary", "coords": [[16,47.5],[22.5,48.5],[22,46],[18,45.5],[16,46],[16,47.5]] }
      ]}
    ]
  },
  {
    "year": 1590,
    "territories": [
      { "countryId": "england", "polygons": [
        { "name": "Great Britain", "coords": [[-5.7,50],[-2.9,51.1],[1.8,51.4],[1.5,52.9],[-0.1,54],[-2.5,55.3],[-3.5,57],[-4.5,58.6],[-6,58.3],[-5.5,56.5],[-4.6,53.4],[-5.2,52],[-5.7,50]] },
        { "name": "Ireland", "coords": [[-6.2,52],[-10.5,53.5],[-8,55.3],[-6,55],[-6.2,52]] }
      ]},
      { "countryId": "france", "polygons": [
        { "name": "France", "coords": [[-4.8,48.5],[-1.8,46.5],[1.4,43.5],[3,43.3],[7.5,43.8],[7.7,45],[7,47.5],[8.2,48],[7.6,49],[5,49.6],[2.6,51.1],[-1.5,49.5],[-2.5,48.5],[-4.8,48.5]] }
      ]},
      { "countryId": "spain", "polygons": [
        { "name": "Iberian Peninsula", "coords": [[-9.5,37],[-7,37],[-5.3,36],[-1.8,37.5],[0.5,39.5],[3.2,42.4],[1.5,43.4],[-1.7,43.4],[-8.9,42],[-9.5,37]] },
        { "name": "Sicily", "coords": [[12.4,37.8],[15.6,37.9],[15.7,38.2],[13.5,38.3],[12.4,37.8]] },
        { "name": "Naples", "coords": [[14.5,38],[16,38],[18.5,40.5],[16,41.5],[14.5,40],[14.5,38]] },
        { "name": "Sardinia", "coords": [[8.2,39],[9.5,41.5],[9.2,40],[8.2,39]] },
        { "name": "New Spain", "coords": [[-118,30],[-95,14],[-86,14],[-86,17],[-90,20],[-95,19],[-105,20],[-118,30]] },
        { "name": "Caribbean", "coords": [[-75,17],[-70,17],[-70,20],[-75,20],[-75,17]] },
        { "name": "Peru", "coords": [[-82,-5],[-65,-5],[-65,-22],[-82,-22],[-82,-5]] },
        { "name": "Philippines", "coords": [[117,7],[126,7],[126,18],[117,18],[117,7]] }
      ]},
      { "countryId": "holy-roman-empire", "polygons": [
        { "name": "Core", "coords": [[6,47.2],[10.4,47.5],[13.4,47.7],[16.9,48.1],[18,49.5],[16.5,50.5],[14.5,51.1],[10,54],[8.5,55],[6,53.5],[5.9,51],[6.5,49],[6.2,48],[6,47.2]] }
      ]},
      { "countryId": "russia", "polygons": [
        { "name": "Russia Western", "coords": [[25,55],[28,53],[37.5,55.8],[43,57],[48,52],[50,46],[48,44],[44,45],[44,60],[40,62],[33,62],[28,60],[25,57],[25,55]] },
        { "name": "West Siberia", "coords": [[55,55],[80,58],[80,68],[55,68],[55,55]] }
      ]},
      { "countryId": "ottoman-empire", "polygons": [
        { "name": "Anatolia and Balkans", "coords": [[20,40],[27,41],[30,43],[28,44],[24,43.5],[20,42],[17,41.5],[15.5,42],[18,39.5],[22.5,37.5],[26,36.5],[28,37],[30,36.5],[32,36.5],[36.5,36.5],[42,37],[44,39.5],[42,42.5],[40.5,43],[37,41.5],[33,42],[30,42],[28.5,41],[20,40]] },
        { "name": "Middle East", "coords": [[36.5,36.5],[42,37],[48,30],[50,26],[43,12.5],[37,15],[32,22],[32,30],[34.5,31.5],[36.5,33],[36.5,36.5]] },
        { "name": "North Africa", "coords": [[-5.5,35.8],[10,37],[13.5,33],[25,31.5],[32,30],[25,22],[15,23],[5,25],[-5.5,30],[-5.5,35.8]] },
        { "name": "Hungary", "coords": [[16,47.5],[22.5,48.5],[22,46],[18,45.5],[16,46],[16,47.5]] }
      ]}
    ]
  },
  {
    "year": 1620,
    "territories": [
      { "countryId": "england", "polygons": [
        { "name": "Great Britain", "coords": [[-5.7,50],[-2.9,51.1],[1.8,51.4],[1.5,52.9],[-0.1,54],[-2.5,55.3],[-3.5,57],[-4.5,58.6],[-6,58.3],[-5.5,56.5],[-4.6,53.4],[-5.2,52],[-5.7,50]] },
        { "name": "Ireland", "coords": [[-6.2,52],[-10.5,53.5],[-8,55.3],[-6,55],[-6.2,52]] },
        { "name": "Virginia Colony", "coords": [[-80,36],[-75,36],[-75,38],[-80,38],[-80,36]] }
      ]},
      { "countryId": "france", "polygons": [
        { "name": "France", "coords": [[-4.8,48.5],[-1.8,46.5],[1.4,43.5],[3,43.3],[7.5,43.8],[7.7,45],[7,47.5],[8.2,48],[7.6,49],[5,49.6],[2.6,51.1],[-1.5,49.5],[-2.5,48.5],[-4.8,48.5]] },
        { "name": "New France", "coords": [[-80,45],[-60,45],[-60,52],[-80,52],[-80,45]] }
      ]},
      { "countryId": "spain", "polygons": [
        { "name": "Iberian Peninsula", "coords": [[-9.5,37],[-7,37],[-5.3,36],[-1.8,37.5],[0.5,39.5],[3.2,42.4],[1.5,43.4],[-1.7,43.4],[-8.9,42],[-9.5,37]] },
        { "name": "Sicily", "coords": [[12.4,37.8],[15.6,37.9],[15.7,38.2],[13.5,38.3],[12.4,37.8]] },
        { "name": "Naples", "coords": [[14.5,38],[16,38],[18.5,40.5],[16,41.5],[14.5,40],[14.5,38]] },
        { "name": "Sardinia", "coords": [[8.2,39],[9.5,41.5],[9.2,40],[8.2,39]] },
        { "name": "New Spain", "coords": [[-118,30],[-95,14],[-86,14],[-86,17],[-90,20],[-95,19],[-105,20],[-118,30]] },
        { "name": "Caribbean", "coords": [[-75,17],[-70,17],[-70,20],[-75,20],[-75,17]] },
        { "name": "Peru", "coords": [[-82,-5],[-65,-5],[-65,-22],[-82,-22],[-82,-5]] },
        { "name": "Philippines", "coords": [[117,7],[126,7],[126,18],[117,18],[117,7]] }
      ]},
      { "countryId": "holy-roman-empire", "polygons": [
        { "name": "Core", "coords": [[6,47.2],[10.4,47.5],[13.4,47.7],[16.9,48.1],[18,49.5],[16.5,50.5],[14.5,51.1],[10,54],[8.5,55],[6,53.5],[5.9,51],[6.5,49],[6.2,48],[6,47.2]] }
      ]},
      { "countryId": "russia", "polygons": [
        { "name": "Russia Western", "coords": [[25,55],[28,53],[37.5,55.8],[43,57],[48,52],[50,46],[48,44],[44,45],[44,60],[40,62],[33,62],[28,60],[25,57],[25,55]] },
        { "name": "Siberia", "coords": [[55,55],[110,58],[110,68],[55,68],[55,55]] }
      ]},
      { "countryId": "ottoman-empire", "polygons": [
        { "name": "Anatolia and Balkans", "coords": [[20,40],[27,41],[30,43],[28,44],[24,43.5],[20,42],[17,41.5],[15.5,42],[18,39.5],[22.5,37.5],[26,36.5],[28,37],[30,36.5],[32,36.5],[36.5,36.5],[42,37],[44,39.5],[42,42.5],[40.5,43],[37,41.5],[33,42],[30,42],[28.5,41],[20,40]] },
        { "name": "Middle East", "coords": [[36.5,36.5],[42,37],[48,30],[50,26],[43,12.5],[37,15],[32,22],[32,30],[34.5,31.5],[36.5,33],[36.5,36.5]] },
        { "name": "North Africa", "coords": [[-5.5,35.8],[10,37],[13.5,33],[25,31.5],[32,30],[25,22],[15,23],[5,25],[-5.5,30],[-5.5,35.8]] },
        { "name": "Hungary", "coords": [[16,47.5],[22.5,48.5],[22,46],[18,45.5],[16,46],[16,47.5]] }
      ]}
    ]
  },
  {
    "year": 1650,
    "territories": [
      { "countryId": "england", "polygons": [
        { "name": "Great Britain", "coords": [[-5.7,50],[-2.9,51.1],[1.8,51.4],[1.5,52.9],[-0.1,54],[-2.5,55.3],[-3.5,57],[-4.5,58.6],[-6,58.3],[-5.5,56.5],[-4.6,53.4],[-5.2,52],[-5.7,50]] },
        { "name": "Ireland", "coords": [[-6.2,52],[-10.5,53.5],[-8,55.3],[-6,55],[-6.2,52]] },
        { "name": "Virginia and New England", "coords": [[-80,36],[-74,36],[-70,41],[-70,43],[-74,43],[-80,43],[-80,36]] }
      ]},
      { "countryId": "france", "polygons": [
        { "name": "France", "coords": [[-4.8,48.5],[-1.8,46.5],[1.4,43.5],[3,43.3],[7.5,43.8],[7.7,45],[7,47.5],[8.2,48],[7.6,49],[5,49.6],[2.6,51.1],[-1.5,49.5],[-2.5,48.5],[-4.8,48.5]] },
        { "name": "New France", "coords": [[-80,45],[-60,45],[-60,52],[-80,52],[-80,45]] }
      ]},
      { "countryId": "spain", "polygons": [
        { "name": "Spain (excl. Portugal)", "coords": [[-7.1,37],[-5.3,36],[-1.8,37.5],[0.5,39.5],[3.2,42.4],[1.5,43.4],[-1.7,43.4],[-6.2,41.8],[-7.1,37]] },
        { "name": "Sicily", "coords": [[12.4,37.8],[15.6,37.9],[15.7,38.2],[13.5,38.3],[12.4,37.8]] },
        { "name": "Naples", "coords": [[14.5,38],[16,38],[18.5,40.5],[16,41.5],[14.5,40],[14.5,38]] },
        { "name": "Sardinia", "coords": [[8.2,39],[9.5,41.5],[9.2,40],[8.2,39]] },
        { "name": "New Spain", "coords": [[-118,30],[-95,14],[-86,14],[-86,17],[-90,20],[-95,19],[-105,20],[-118,30]] },
        { "name": "Caribbean", "coords": [[-75,17],[-70,17],[-70,20],[-75,20],[-75,17]] },
        { "name": "Peru", "coords": [[-82,-5],[-65,-5],[-65,-22],[-82,-22],[-82,-5]] },
        { "name": "Philippines", "coords": [[117,7],[126,7],[126,18],[117,18],[117,7]] }
      ]},
      { "countryId": "holy-roman-empire", "polygons": [
        { "name": "Core", "coords": [[6,47.2],[10.4,47.5],[13.4,47.7],[16.9,48.1],[18,49.5],[16.5,50.5],[14.5,51.1],[10,54],[8.5,55],[6,53.5],[5.9,51],[6.5,49],[6.2,48],[6,47.2]] }
      ]},
      { "countryId": "russia", "polygons": [
        { "name": "Russia Western", "coords": [[25,55],[28,53],[37.5,55.8],[43,57],[48,52],[50,46],[48,44],[44,45],[44,60],[40,62],[33,62],[28,60],[25,57],[25,55]] },
        { "name": "Siberia", "coords": [[55,55],[130,58],[130,68],[55,68],[55,55]] }
      ]},
      { "countryId": "ottoman-empire", "polygons": [
        { "name": "Anatolia and Balkans", "coords": [[20,40],[27,41],[30,43],[28,44],[24,43.5],[20,42],[17,41.5],[15.5,42],[18,39.5],[22.5,37.5],[26,36.5],[28,37],[30,36.5],[32,36.5],[36.5,36.5],[42,37],[44,39.5],[42,42.5],[40.5,43],[37,41.5],[33,42],[30,42],[28.5,41],[20,40]] },
        { "name": "Middle East", "coords": [[36.5,36.5],[42,37],[48,30],[50,26],[43,12.5],[37,15],[32,22],[32,30],[34.5,31.5],[36.5,33],[36.5,36.5]] },
        { "name": "North Africa", "coords": [[-5.5,35.8],[10,37],[13.5,33],[25,31.5],[32,30],[25,22],[15,23],[5,25],[-5.5,30],[-5.5,35.8]] },
        { "name": "Hungary", "coords": [[16,47.5],[22.5,48.5],[22,46],[18,45.5],[16,46],[16,47.5]] }
      ]}
    ]
  },
  {
    "year": 1680,
    "territories": [
      { "countryId": "england", "polygons": [
        { "name": "Great Britain", "coords": [[-5.7,50],[-2.9,51.1],[1.8,51.4],[1.5,52.9],[-0.1,54],[-2.5,55.3],[-3.5,57],[-4.5,58.6],[-6,58.3],[-5.5,56.5],[-4.6,53.4],[-5.2,52],[-5.7,50]] },
        { "name": "Ireland", "coords": [[-6.2,52],[-10.5,53.5],[-8,55.3],[-6,55],[-6.2,52]] },
        { "name": "East Coast Colonies", "coords": [[-80,32],[-75,32],[-70,41],[-70,43],[-75,43],[-80,43],[-80,32]] }
      ]},
      { "countryId": "france", "polygons": [
        { "name": "France", "coords": [[-4.8,48.5],[-1.8,46.5],[1.4,43.5],[3,43.3],[7.5,43.8],[7.7,45],[7,47.5],[8.2,48],[7.6,49],[5,49.6],[2.6,51.1],[-1.5,49.5],[-2.5,48.5],[-4.8,48.5]] },
        { "name": "New France", "coords": [[-80,45],[-60,45],[-60,52],[-80,52],[-80,45]] },
        { "name": "Louisiana", "coords": [[-100,28],[-88,28],[-88,38],[-100,38],[-100,28]] }
      ]},
      { "countryId": "spain", "polygons": [
        { "name": "Spain", "coords": [[-7.1,37],[-5.3,36],[-1.8,37.5],[0.5,39.5],[3.2,42.4],[1.5,43.4],[-1.7,43.4],[-6.2,41.8],[-7.1,37]] },
        { "name": "Sicily", "coords": [[12.4,37.8],[15.6,37.9],[15.7,38.2],[13.5,38.3],[12.4,37.8]] },
        { "name": "Naples", "coords": [[14.5,38],[16,38],[18.5,40.5],[16,41.5],[14.5,40],[14.5,38]] },
        { "name": "Sardinia", "coords": [[8.2,39],[9.5,41.5],[9.2,40],[8.2,39]] },
        { "name": "New Spain", "coords": [[-118,30],[-95,14],[-86,14],[-86,17],[-90,20],[-95,19],[-105,20],[-118,30]] },
        { "name": "Caribbean", "coords": [[-75,17],[-70,17],[-70,20],[-75,20],[-75,17]] },
        { "name": "Peru", "coords": [[-82,-5],[-65,-5],[-65,-22],[-82,-22],[-82,-5]] },
        { "name": "Philippines", "coords": [[117,7],[126,7],[126,18],[117,18],[117,7]] }
      ]},
      { "countryId": "holy-roman-empire", "polygons": [
        { "name": "Core", "coords": [[6,47.2],[10.4,47.5],[13.4,47.7],[16.9,48.1],[18,49.5],[16.5,50.5],[14.5,51.1],[10,54],[8.5,55],[6,53.5],[5.9,51],[6.5,49],[6.2,48],[6,47.2]] }
      ]},
      { "countryId": "russia", "polygons": [
        { "name": "Russia Western", "coords": [[25,55],[28,53],[37.5,55.8],[43,57],[48,52],[50,46],[48,44],[44,45],[44,60],[40,62],[33,62],[28,60],[25,57],[25,55]] },
        { "name": "Siberia", "coords": [[55,55],[162,55],[162,68],[55,68],[55,55]] }
      ]},
      { "countryId": "ottoman-empire", "polygons": [
        { "name": "Anatolia and Balkans", "coords": [[20,40],[27,41],[30,43],[28,44],[24,43.5],[20,42],[17,41.5],[15.5,42],[18,39.5],[22.5,37.5],[26,36.5],[28,37],[30,36.5],[32,36.5],[36.5,36.5],[42,37],[44,39.5],[42,42.5],[40.5,43],[37,41.5],[33,42],[30,42],[28.5,41],[20,40]] },
        { "name": "Middle East", "coords": [[36.5,36.5],[42,37],[48,30],[50,26],[43,12.5],[37,15],[32,22],[32,30],[34.5,31.5],[36.5,33],[36.5,36.5]] },
        { "name": "North Africa", "coords": [[-5.5,35.8],[10,37],[13.5,33],[25,31.5],[32,30],[25,22],[15,23],[5,25],[-5.5,30],[-5.5,35.8]] },
        { "name": "Hungary", "coords": [[16,47.5],[22.5,48.5],[22,46],[18,45.5],[16,46],[16,47.5]] }
      ]}
    ]
  },
  {
    "year": 1700,
    "territories": [
      { "countryId": "england", "polygons": [
        { "name": "Great Britain", "coords": [[-5.7,50],[-2.9,51.1],[1.8,51.4],[1.5,52.9],[-0.1,54],[-2.5,55.3],[-3.5,57],[-4.5,58.6],[-6,58.3],[-5.5,56.5],[-4.6,53.4],[-5.2,52],[-5.7,50]] },
        { "name": "Ireland", "coords": [[-6.2,52],[-10.5,53.5],[-8,55.3],[-6,55],[-6.2,52]] },
        { "name": "East Coast Colonies", "coords": [[-80,32],[-75,32],[-70,41],[-70,43],[-75,43],[-80,43],[-80,32]] }
      ]},
      { "countryId": "france", "polygons": [
        { "name": "France", "coords": [[-4.8,48.5],[-1.8,46.5],[1.4,43.5],[3,43.3],[7.5,43.8],[7.7,45],[7,47.5],[8.2,48],[7.6,49],[5,49.6],[2.6,51.1],[-1.5,49.5],[-2.5,48.5],[-4.8,48.5]] },
        { "name": "New France", "coords": [[-80,45],[-60,45],[-60,52],[-80,52],[-80,45]] },
        { "name": "Louisiana", "coords": [[-100,28],[-88,28],[-88,38],[-100,38],[-100,28]] }
      ]},
      { "countryId": "spain", "polygons": [
        { "name": "Spain", "coords": [[-7.1,37],[-5.3,36],[-1.8,37.5],[0.5,39.5],[3.2,42.4],[1.5,43.4],[-1.7,43.4],[-6.2,41.8],[-7.1,37]] },
        { "name": "Sicily", "coords": [[12.4,37.8],[15.6,37.9],[15.7,38.2],[13.5,38.3],[12.4,37.8]] },
        { "name": "Naples", "coords": [[14.5,38],[16,38],[18.5,40.5],[16,41.5],[14.5,40],[14.5,38]] },
        { "name": "Sardinia", "coords": [[8.2,39],[9.5,41.5],[9.2,40],[8.2,39]] },
        { "name": "New Spain", "coords": [[-118,30],[-95,14],[-86,14],[-86,17],[-90,20],[-95,19],[-105,20],[-118,30]] },
        { "name": "Caribbean", "coords": [[-75,17],[-70,17],[-70,20],[-75,20],[-75,17]] },
        { "name": "Peru", "coords": [[-82,-5],[-65,-5],[-65,-22],[-82,-22],[-82,-5]] },
        { "name": "Philippines", "coords": [[117,7],[126,7],[126,18],[117,18],[117,7]] }
      ]},
      { "countryId": "holy-roman-empire", "polygons": [
        { "name": "Core", "coords": [[6,47.2],[10.4,47.5],[13.4,47.7],[16.9,48.1],[18,49.5],[16.5,50.5],[14.5,51.1],[10,54],[8.5,55],[6,53.5],[5.9,51],[6.5,49],[6.2,48],[6,47.2]] }
      ]},
      { "countryId": "russia", "polygons": [
        { "name": "Russia Western", "coords": [[25,55],[28,53],[37.5,55.8],[43,57],[48,52],[50,46],[48,44],[44,45],[44,60],[40,62],[33,62],[28,60],[25,57],[25,55]] },
        { "name": "Siberia to Pacific", "coords": [[55,55],[180,55],[180,68],[55,68],[55,55]] }
      ]},
      { "countryId": "ottoman-empire", "polygons": [
        { "name": "Anatolia and Balkans", "coords": [[20,40],[27,41],[30,43],[28,44],[24,43.5],[20,42],[17,41.5],[15.5,42],[18,39.5],[22.5,37.5],[26,36.5],[28,37],[30,36.5],[32,36.5],[36.5,36.5],[42,37],[44,39.5],[42,42.5],[40.5,43],[37,41.5],[33,42],[30,42],[28.5,41],[20,40]] },
        { "name": "Middle East", "coords": [[36.5,36.5],[42,37],[48,30],[50,26],[43,12.5],[37,15],[32,22],[32,30],[34.5,31.5],[36.5,33],[36.5,36.5]] },
        { "name": "North Africa", "coords": [[-5.5,35.8],[10,37],[13.5,33],[25,31.5],[32,30],[25,22],[15,23],[5,25],[-5.5,30],[-5.5,35.8]] }
      ]}
    ]
  }
]
```

- [ ] **Step 2: Verify the file parses and has 8 snapshots**

```bash
node --input-type=module -e "import {readFileSync} from 'fs'; const d=JSON.parse(readFileSync('./src/data/territories.json','utf8')); console.log(d.length, 'snapshots, years:', d.map(s=>s.year).join(', '))"
```
Expected: `8 snapshots, years: 1500, 1530, 1560, 1590, 1620, 1650, 1680, 1700`

- [ ] **Step 3: Commit**

```bash
git add src/data/territories.json
git commit -m "feat: add historical territory snapshot data"
```

---

### Task 3: Layout split and year sync

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/TimelineGrid.jsx`

**Interfaces:**
- Produces: `onYearChange(year: number)` prop on `TimelineGrid`; `currentYear: number` state in `App`
- Produces: `WorldMap` placeholder `<div>` in `App` (actual `WorldMap` component wired in Task 6)

- [ ] **Step 1: Replace src/App.jsx with the new split-layout version**

```jsx
import { useState, useCallback } from 'react'
import TimelineGrid from './components/TimelineGrid'
import Legend from './components/Legend'

function App() {
  const [currentYear, setCurrentYear] = useState(1500)

  const handleYearChange = useCallback((year) => {
    setCurrentYear(year)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{
        background: '#1a1a2e',
        color: 'white',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'baseline',
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
        <div style={{ marginLeft: 'auto' }}>
          <Legend />
        </div>
      </header>
      <div style={{ flex: '0 0 55vh', overflow: 'hidden' }}>
        <TimelineGrid onYearChange={handleYearChange} />
      </div>
      <div style={{ flex: 1, overflow: 'hidden', borderTop: '2px solid #c8c8c8', background: '#b8d4e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#666', fontSize: '13px' }}>Map — {currentYear}</span>
      </div>
    </div>
  )
}

export default App
```

- [ ] **Step 2: Add scroll listener to TimelineGrid.jsx**

The existing `TimelineGrid` export starts with:
```jsx
export default function TimelineGrid() {
  return (
    <div style={{ overflow: 'auto', height: '100%', width: '100%' }}>
```

Replace it with:
```jsx
import { useRef, useEffect } from 'react'
// ... keep all other existing imports unchanged above this line

export default function TimelineGrid({ onYearChange }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || !onYearChange) return
    let timer = null
    const handleScroll = () => {
      if (timer) return
      timer = setTimeout(() => {
        timer = null
        const year = Math.min(1700, Math.max(1500, Math.round(el.scrollTop / ROW_HEIGHT) + START_YEAR))
        onYearChange(year)
      }, 50)
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', handleScroll)
      if (timer) clearTimeout(timer)
    }
  }, [onYearChange])

  return (
    <div ref={scrollRef} style={{ overflow: 'auto', height: '100%', width: '100%' }}>
```

The closing tag and all inner content remain identical to the original.

- [ ] **Step 3: Verify in browser**

Run `npm run dev`. The page should show:
- Timeline grid in the top ~55% of the screen
- A blue placeholder panel below it showing "Map — 1500"
- Scrolling the grid changes the year number in the placeholder in real time

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/components/TimelineGrid.jsx
git commit -m "feat: split layout with year sync between grid and map panel"
```

---

### Task 4: useMapTransform hook

**Files:**
- Create: `src/hooks/useMapTransform.js`

**Interfaces:**
- Produces: `useMapTransform()` → `{ transform: { scale, translateX, translateY }, handlers: { onWheel, onMouseDown, onMouseMove, onMouseUp, onDoubleClick } }`
- Consumed by: Task 6 (WorldMap)

- [ ] **Step 1: Create src/hooks/useMapTransform.js**

```js
import { useState, useCallback, useRef } from 'react'

const MIN_SCALE = 1
const MAX_SCALE = 12

export default function useMapTransform() {
  const [transform, setTransform] = useState({ scale: 1, translateX: 0, translateY: 0 })
  const transformRef = useRef({ scale: 1, translateX: 0, translateY: 0 })
  const dragRef = useRef(null)

  const apply = useCallback((t) => {
    transformRef.current = t
    setTransform(t)
  }, [])

  const onWheel = useCallback((e) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const prev = transformRef.current
    const factor = e.deltaY > 0 ? 0.85 : 1.18
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * factor))
    const ratio = newScale / prev.scale
    apply({
      scale: newScale,
      translateX: mx - ratio * (mx - prev.translateX),
      translateY: my - ratio * (my - prev.translateY),
    })
  }, [apply])

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      base: { ...transformRef.current },
    }
  }, [])

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current) return
    const { startX, startY, base } = dragRef.current
    apply({
      scale: base.scale,
      translateX: base.translateX + (e.clientX - startX),
      translateY: base.translateY + (e.clientY - startY),
    })
  }, [apply])

  const onMouseUp = useCallback(() => {
    dragRef.current = null
  }, [])

  const onDoubleClick = useCallback(() => {
    dragRef.current = null
    apply({ scale: 1, translateX: 0, translateY: 0 })
  }, [apply])

  return {
    transform,
    handlers: { onWheel, onMouseDown, onMouseMove, onMouseUp, onDoubleClick },
  }
}
```

- [ ] **Step 2: Verify the file has no syntax errors**

This hook imports from `react` and cannot be run directly by Node.js without the Vite bundler. Syntax errors will be caught by the dev server on first startup. Run `npm run dev` briefly and confirm no red error messages appear in the terminal — then stop the server and continue to Task 5.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useMapTransform.js
git commit -m "feat: add useMapTransform hook for zoom and pan"
```

---

### Task 5: TerritoryLayer component

**Files:**
- Create: `src/components/TerritoryLayer.jsx`

**Interfaces:**
- Consumes: `currentYear: number`, `width: number`, `height: number` props
- Consumes: `territories` from `../data/territories.json` — `[{ year, territories: [{ countryId, polygons: [{ name, coords }] }] }]`
- Consumes: `countries` from `../data/countries.json` — `[{ id, name, color }]`
- Produces: SVG `<g>` element containing colored `<polygon>` elements

- [ ] **Step 1: Create src/components/TerritoryLayer.jsx**

```jsx
import territories from '../data/territories.json'
import countries from '../data/countries.json'

const SNAPSHOT_YEARS = territories.map(s => s.year)
const colorMap = Object.fromEntries(countries.map(c => [c.id, c.color]))

function nearestSnapshot(year) {
  return SNAPSHOT_YEARS.reduce((best, s) =>
    Math.abs(s - year) < Math.abs(best - year) ? s : best
  )
}

function toPoints(coords, width, height) {
  return coords
    .map(([lng, lat]) => [
      (lng + 180) * (width / 360),
      (90 - lat) * (height / 180),
    ].join(','))
    .join(' ')
}

export default function TerritoryLayer({ currentYear, width, height }) {
  const snapshotYear = nearestSnapshot(currentYear)
  const snapshot = territories.find(s => s.year === snapshotYear)
  if (!snapshot) return null

  return (
    <g>
      {snapshot.territories.map(territory =>
        territory.polygons.map(polygon => (
          <polygon
            key={`${territory.countryId}-${polygon.name}`}
            points={toPoints(polygon.coords, width, height)}
            fill={colorMap[territory.countryId] ?? '#ccc'}
            fillOpacity={0.6}
            stroke={colorMap[territory.countryId] ?? '#ccc'}
            strokeWidth={0.5}
            strokeOpacity={0.9}
          />
        ))
      )}
    </g>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TerritoryLayer.jsx
git commit -m "feat: add TerritoryLayer component for territory polygons"
```

---

### Task 6: WorldMap component

**Files:**
- Create: `src/components/WorldMap.jsx`
- Modify: `src/App.jsx` (swap placeholder div for `<WorldMap>`)

**Interfaces:**
- Consumes: `currentYear: number` prop
- Consumes: `worldOutline` from `../data/world-outline.json` — GeoJSON FeatureCollection
- Consumes: `TerritoryLayer` (Task 5), `useMapTransform` (Task 4)

- [ ] **Step 1: Create src/components/WorldMap.jsx**

```jsx
import worldOutline from '../data/world-outline.json'
import TerritoryLayer from './TerritoryLayer'
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

export default function WorldMap({ currentYear }) {
  const { transform, handlers } = useMapTransform()
  const { scale, translateX, translateY } = transform

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', background: '#b8d4e8' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: '100%', display: 'block', cursor: scale > 1 ? 'grab' : 'default' }}
        {...handlers}
      >
        <g transform={`translate(${translateX},${translateY}) scale(${scale})`}>
          <g fill="#e0e0e0" stroke="#c0c0c0" strokeWidth={0.3}>
            {worldOutline.features.map((f, i) =>
              featureRings(f).map((ring, j) => (
                <polygon key={`land-${i}-${j}`} points={ring.map(project).join(' ')} />
              ))
            )}
          </g>
          <TerritoryLayer currentYear={currentYear} width={W} height={H} />
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
    </div>
  )
}
```

- [ ] **Step 2: Wire WorldMap into App.jsx**

In `src/App.jsx`, add the import at the top:
```jsx
import WorldMap from './components/WorldMap'
```

Replace the placeholder div:
```jsx
      <div style={{ flex: 1, overflow: 'hidden', borderTop: '2px solid #c8c8c8', background: '#b8d4e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#666', fontSize: '13px' }}>Map — {currentYear}</span>
      </div>
```

With:
```jsx
      <div style={{ flex: 1, overflow: 'hidden', borderTop: '2px solid #c8c8c8' }}>
        <WorldMap currentYear={currentYear} />
      </div>
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev` and check:
1. The world map renders in the bottom panel — gray continents on blue ocean
2. Territory polygons render in the correct country colors (blue tint for England, green for France, orange for Spain, etc.)
3. Scrolling the grid changes the year label on the map and the territory polygons update
4. Scroll wheel on the map zooms in and out centered on the cursor
5. Click and drag pans the map when zoomed in
6. Double-click resets to the full world view
7. At year 1500, the Ottoman Empire has no North Africa or Hungary polygons; at 1530 they appear
8. At year 1650, Spain's Iberian polygon is smaller (Portugal separated); at 1620 it is full size

- [ ] **Step 4: Commit**

```bash
git add src/components/WorldMap.jsx src/App.jsx
git commit -m "feat: add WorldMap component with territory layers and zoom/pan"
```
