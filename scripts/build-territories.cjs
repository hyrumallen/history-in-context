// Builds src/data/territories.json from the cached historical-basemaps GeoJSON.
// Dev-time only — the app never runs this. Run: npm run build:territories
//
// Source: https://github.com/aourednik/historical-basemaps (GPL-3.0)
const fs = require('fs')
const path = require('path')
const polygonClipping = require('polygon-clipping')
const { SNAPSHOT_YEARS } = require('./territory-years.cjs')

const CACHE = path.join(__dirname, '..', '.cache', 'basemaps')
const OUT = path.join(__dirname, '..', 'src', 'data', 'territories.json')
const MAP = require('./territory-map.json')

const TOLERANCE = 0.2 // degrees; Douglas-Peucker. Raise if the output is too big.
const PRECISION = 2    // decimal places ~ 1km

// --- geometry helpers -------------------------------------------------------

function perpDistance(p, a, b) {
  const [px, py] = p, [ax, ay] = a, [bx, by] = b
  const dx = bx - ax, dy = by - ay
  if (dx === 0 && dy === 0) return Math.hypot(px - ax, py - ay)
  const t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)
  const cx = ax + t * dx, cy = ay + t * dy
  return Math.hypot(px - cx, py - cy)
}

function simplifyRing(ring, tolerance) {
  if (ring.length <= 4) return ring
  const keep = new Array(ring.length).fill(false)
  keep[0] = keep[ring.length - 1] = true
  const stack = [[0, ring.length - 1]]
  while (stack.length) {
    const [first, last] = stack.pop()
    let maxDist = 0, index = -1
    for (let i = first + 1; i < last; i++) {
      const d = perpDistance(ring[i], ring[first], ring[last])
      if (d > maxDist) { maxDist = d; index = i }
    }
    if (maxDist > tolerance && index !== -1) {
      keep[index] = true
      stack.push([first, index], [index, last])
    }
  }
  const out = ring.filter((_, i) => keep[i])
  // A ring needs 4 points (3 distinct + closure) to enclose any area.
  return out.length >= 4 ? out : ring
}

function roundRing(ring) {
  const f = 10 ** PRECISION
  const out = ring.map(([lng, lat]) => [Math.round(lng * f) / f, Math.round(lat * f) / f])
  // Rounding can collapse consecutive points; drop the duplicates.
  const dedup = out.filter((p, i) => i === 0 || p[0] !== out[i - 1][0] || p[1] !== out[i - 1][1])
  const [fx, fy] = dedup[0]
  const [lx, ly] = dedup[dedup.length - 1]
  if (fx !== lx || fy !== ly) dedup.push([fx, fy]) // keep the ring closed
  return dedup
}

function toMultiPolygon(geometry) {
  if (!geometry) return []
  if (geometry.type === 'Polygon') return [geometry.coordinates]
  if (geometry.type === 'MultiPolygon') return geometry.coordinates
  return []
}

// --- build ------------------------------------------------------------------

function featureMatches(feature, names) {
  const { NAME, SUBJECTO } = feature.properties
  return names.includes(NAME) || names.includes(SUBJECTO)
}

function buildYear(year) {
  const file = path.join(CACHE, `world_${year}.geojson`)
  if (!fs.existsSync(file)) throw new Error(`missing ${file} — run: npm run fetch:basemaps`)
  const world = JSON.parse(fs.readFileSync(file, 'utf8'))

  const territories = []
  for (const [countryId, byYear] of Object.entries(MAP)) {
    const names = byYear[String(year)]
    if (!names) continue // absent this snapshot, by design

    const parts = world.features
      .filter(f => featureMatches(f, names))
      .flatMap(f => toMultiPolygon(f.geometry))
    if (parts.length === 0) {
      console.warn(`  !! ${countryId} ${year}: no source feature matched ${JSON.stringify(names)}`)
      continue
    }

    // Union so a composite (e.g. HRE + Prussia) renders as one body without
    // internal border lines showing through.
    const unioned = polygonClipping.union(...parts.map(p => [p]))

    const geometry = unioned
      .map(polygon => polygon
        .map(ring => roundRing(simplifyRing(ring, TOLERANCE)))
        .filter(ring => ring.length >= 4))
      .filter(polygon => polygon.length > 0)

    if (geometry.length === 0) continue
    territories.push({ countryId, geometry })
  }
  return { year, territories }
}

function main() {
  const snapshots = SNAPSHOT_YEARS.map(year => {
    const snapshot = buildYear(year)
    console.log(`${year}: ${snapshot.territories.map(t => t.countryId).join(', ')}`)
    return snapshot
  })
  fs.writeFileSync(OUT, JSON.stringify(snapshots))
  const kb = (fs.statSync(OUT).size / 1024).toFixed(0)
  console.log(`\nwrote ${OUT} (${kb} KB)`)
  if (kb > 500) console.warn('!! over the 500 KB budget — raise TOLERANCE and rebuild')
}

main()
