import { project } from './projection'

// One SVG subpath per ring. Holes are just further subpaths; the caller renders
// with fillRule="evenodd" so they punch through.
export function multiPolygonPath(geometry, width, height) {
  const subpaths = []
  for (const polygon of geometry) {
    for (const ring of polygon) {
      if (ring.length < 4) continue
      const points = ring.map(([lng, lat]) => project(lng, lat, width, height).join(','))
      subpaths.push(`M${points.join('L')}Z`)
    }
  }
  return subpaths.join('')
}

// Path strings are pure functions of (snapshot year, country) because the
// geometry is static and the viewBox is fixed. Playback steps a year every
// ~90ms, so re-projecting every tick would stutter — memoize instead.
const cache = new Map()

export function pathFor(snapshotYear, countryId, geometry, width, height) {
  const key = `${snapshotYear}:${countryId}:${width}x${height}`
  let d = cache.get(key)
  if (d === undefined) {
    d = multiPolygonPath(geometry, width, height)
    cache.set(key, d)
  }
  return d
}
