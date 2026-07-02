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

export default function WorldMap({ currentYear, onPinClick }) {
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
