import { START_YEAR, END_YEAR, SERIF } from '../constants'
import { labeledReigns } from '../reignLabels'

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

export function RibbonLabelLayer({ offsets, contentHeight, selectedCountries, rulersByCountry, yearColPx = 60, countryColPx = 180 }) {
  if (!offsets || offsets.length === 0) return null
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', height: contentHeight, zIndex: 2 }}>
      {selectedCountries.map((country, col) => {
        const left = yearColPx + col * countryColPx
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
