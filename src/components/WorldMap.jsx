import { useState } from 'react'
import worldOutline from '../data/world-outline.json'
import TerritoryLayer from './TerritoryLayer'
import EventPinLayer from './EventPinLayer'
import useMapTransform from '../hooks/useMapTransform'
import { START_YEAR, END_YEAR } from '../constants'
import Legend from './Legend'
import MapControls from './MapControls'
import EventRail from './EventRail'

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

export default function WorldMap({ currentYear, mode = 'mini', selectedIds, playing, onYearChange, onTogglePlay, onShowInTimeline }) {
  const { transform, handlers } = useMapTransform()
  const { scale, translateX, translateY } = transform
  const isMini = mode === 'mini'
  const [focusedId, setFocusedId] = useState(null)

  const mapArea = (
    <div style={{ flex: 1, minWidth: 0, height: '100%', overflow: 'hidden', position: 'relative', background: '#b8d4e8' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: !isMini && scale > 1 ? 'grab' : 'default',
          pointerEvents: isMini ? 'none' : 'auto',
        }}
        {...(isMini ? {} : handlers)}
      >
        <g transform={isMini ? undefined : `translate(${translateX},${translateY}) scale(${scale})`}>
          <g fill="#e0e0e0" stroke="#c0c0c0" strokeWidth={0.3}>
            {worldOutline.features.map((f, i) =>
              featureRings(f).map((ring, j) => (
                <polygon key={`land-${i}-${j}`} points={ring.map(project).join(' ')} />
              ))
            )}
          </g>
          <TerritoryLayer currentYear={currentYear} width={W} height={H} selectedIds={selectedIds} />
          <EventPinLayer
            currentYear={currentYear}
            selectedIds={selectedIds}
            isMini={isMini}
            focusedId={focusedId}
            onFocus={setFocusedId}
          />
        </g>
      </svg>

      <div style={{
        position: 'absolute', bottom: 12, left: 16,
        background: 'rgba(26,26,46,0.82)', color: 'white', padding: '3px 10px',
        borderRadius: 4, fontSize: 13, fontWeight: 600, letterSpacing: '0.3px',
        pointerEvents: 'none', fontFamily: 'inherit',
      }}>
        {currentYear}
      </div>

      {!isMini && (
        <div style={{
          position: 'absolute', bottom: 12, right: 16, color: 'rgba(255,255,255,0.5)',
          fontSize: 11, pointerEvents: 'none', fontFamily: 'inherit',
        }}>
          Scroll to zoom · drag to pan · double-click to reset
        </div>
      )}

      {!isMini && (
        <div style={{
          position: 'absolute', top: 12, left: 16,
          background: 'rgba(253,249,239,0.92)', border: '1px solid #d8c9a8',
          borderRadius: 6, padding: '8px 10px', pointerEvents: 'none',
        }}>
          <Legend />
        </div>
      )}

      {!isMini && (
        <MapControls
          year={currentYear}
          onYearChange={onYearChange}
          playing={playing}
          onTogglePlay={onTogglePlay}
          min={START_YEAR}
          max={END_YEAR}
        />
      )}
    </div>
  )

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      {mapArea}
      {!isMini && (
        <EventRail
          currentYear={currentYear}
          selectedIds={selectedIds}
          focusedId={focusedId}
          onFocus={setFocusedId}
          onShowInTimeline={onShowInTimeline}
        />
      )}
    </div>
  )
}
