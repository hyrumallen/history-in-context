// Builds src/data/territories.json from the cached historical-basemaps GeoJSON.
// Dev-time only — the app never runs this. Run: npm run build:territories
//
// Source: https://github.com/aourednik/historical-basemaps (GPL-3.0)
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const polygonClipping = require('polygon-clipping')
const { SNAPSHOT_YEARS } = require('./territory-years.cjs')

const CACHE = path.join(__dirname, '..', '.cache', 'basemaps')
const OUT = path.join(__dirname, '..', 'src', 'data', 'territories.json')
const MAP = require('./territory-map.json')

const TOLERANCE = 0.4   // degrees; Douglas-Peucker. Raise if the output is too big.
const PRECISION = 2     // decimal places ~ 1km
// Minimum ring area in square degrees. Colonial empires drag in thousands of
// islets (Indonesia, the Philippines, the Caribbean) that cost a 4-point ring
// each — ring count, not vertex count, dominates the file size once every
// country is in. One pixel of the 800x400 map spans 0.45 deg, so 0.05 deg² is
// well under a pixel at world zoom. Japan keeps its four main islands; raising
// this much further starts eating real islands when the user zooms in.
const MIN_RING_AREA = 0.05
// The budget that matters is gzip, not raw bytes: the file ships compressed and
// JSON coordinates compress about 4x.
const GZIP_BUDGET_KB = 250

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

// Shoelace formula. Sign indicates winding, so callers take the absolute value.
function ringArea(ring) {
  let sum = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    sum += (ring[j][0] * ring[i][1]) - (ring[i][0] * ring[j][1])
  }
  return Math.abs(sum / 2)
}

function toMultiPolygon(geometry) {
  if (!geometry) return []
  if (geometry.type === 'Polygon') return [geometry.coordinates]
  if (geometry.type === 'MultiPolygon') return geometry.coordinates
  return []
}

// --- build ------------------------------------------------------------------

// A year's value is either a list of NAME/SUBJECTO strings, or an object
// { match: [...], exclude: [...] }. `exclude` drops features by NAME after
// matching — needed where the source mis-tags a feature's ruler (e.g. it gives
// "Kingdom of Brazil" SUBJECTO=Portugal in 1900, long after independence, which
// would otherwise make Portugal and Brazil both draw it).
function rulesFor(byYear, year) {
  const value = byYear[String(year)]
  if (!value) return null
  return Array.isArray(value)
    ? { match: value, exclude: [] }
    : { match: value.match, exclude: value.exclude ?? [] }
}

function featureMatches(feature, rules) {
  const { NAME, SUBJECTO } = feature.properties
  if (rules.exclude.includes(NAME)) return false
  return rules.match.includes(NAME) || rules.match.includes(SUBJECTO)
}

function buildYear(year) {
  const file = path.join(CACHE, `world_${year}.geojson`)
  if (!fs.existsSync(file)) throw new Error(`missing ${file} — run: npm run fetch:basemaps`)
  const world = JSON.parse(fs.readFileSync(file, 'utf8'))

  const territories = []
  for (const [countryId, byYear] of Object.entries(MAP)) {
    const rules = rulesFor(byYear, year)
    if (!rules) continue // absent this snapshot, by design
    const names = rules.match

    const parts = world.features
      .filter(f => featureMatches(f, rules))
      .flatMap(f => toMultiPolygon(f.geometry))
    if (parts.length === 0) {
      console.warn(`  !! ${countryId} ${year}: no source feature matched ${JSON.stringify(names)}`)
      continue
    }

    // Union so a composite (e.g. HRE + Prussia) renders as one body without
    // internal border lines showing through.
    const unioned = polygonClipping.union(...parts.map(p => [p]))

    const geometry = unioned
      // Drop islets before simplifying: a polygon whose outer ring is too small
      // to see goes entirely, along with any hole too small to see.
      .filter(polygon => ringArea(polygon[0]) >= MIN_RING_AREA)
      .map(polygon => polygon
        .filter((ring, i) => i === 0 || ringArea(ring) >= MIN_RING_AREA)
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
  const json = JSON.stringify(snapshots)
  fs.writeFileSync(OUT, json)
  const rawKb = (Buffer.byteLength(json) / 1024).toFixed(0)
  const gzipKb = (zlib.gzipSync(json).length / 1024).toFixed(0)
  console.log(`\nwrote ${OUT} (${rawKb} KB raw, ${gzipKb} KB gzip)`)
  if (gzipKb > GZIP_BUDGET_KB) {
    console.warn(`!! over the ${GZIP_BUDGET_KB} KB gzip budget — raise TOLERANCE or MIN_RING_AREA and rebuild`)
  }
}

main()
