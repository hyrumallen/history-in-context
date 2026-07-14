import territories from '../data/territories.json'
import countries from '../data/countries.json'
import { pathFor } from '../territoryPaths'

const SNAPSHOT_YEARS = territories.map(s => s.year)
const colorMap = Object.fromEntries(countries.map(c => [c.id, c.mapColor]))
const strokeMap = Object.fromEntries(countries.map(c => [c.id, c.mapStroke]))

function nearestSnapshot(year) {
  return SNAPSHOT_YEARS.reduce((best, s) =>
    Math.abs(s - year) < Math.abs(best - year) ? s : best
  )
}

export default function TerritoryLayer({ currentYear, width, height, selectedIds }) {
  const snapshotYear = nearestSnapshot(currentYear)
  const snapshot = territories.find(s => s.year === snapshotYear)
  if (!snapshot) return null

  return (
    <g>
      {snapshot.territories
        .filter(territory => selectedIds.has(territory.countryId))
        .map(territory => (
          <path
            key={territory.countryId}
            d={pathFor(snapshotYear, territory.countryId, territory.geometry, width, height)}
            fillRule="evenodd"
            fill={colorMap[territory.countryId] ?? '#ccc'}
            fillOpacity={0.75}
            stroke={strokeMap[territory.countryId] ?? '#999'}
            strokeWidth={0.5}
            strokeOpacity={0.9}
          />
        ))}
    </g>
  )
}
