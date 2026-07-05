import territories from '../data/territories.json'
import countries from '../data/countries.json'

const SNAPSHOT_YEARS = territories.map(s => s.year)
const colorMap = Object.fromEntries(countries.map(c => [c.id, c.mapColor]))
const strokeMap = Object.fromEntries(countries.map(c => [c.id, c.mapStroke]))

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

export default function TerritoryLayer({ currentYear, width, height, selectedIds }) {
  const snapshotYear = nearestSnapshot(currentYear)
  const snapshot = territories.find(s => s.year === snapshotYear)
  if (!snapshot) return null

  return (
    <g>
      {snapshot.territories
        .filter(territory => selectedIds.has(territory.countryId))
        .map(territory =>
        territory.polygons.map(polygon => (
          <polygon
            key={`${territory.countryId}-${polygon.name}`}
            points={toPoints(polygon.coords, width, height)}
            fill={colorMap[territory.countryId] ?? '#ccc'}
            fillOpacity={0.75}
            stroke={strokeMap[territory.countryId] ?? '#999'}
            strokeWidth={0.5}
            strokeOpacity={0.9}
          />
        ))
      )}
    </g>
  )
}
