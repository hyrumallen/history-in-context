import events from '../data/events.json'
import { TYPE_COLORS } from '../eventTypeColors'

const W = 800
const H = 400

function project(lng, lat) {
  return [(lng + 180) * (W / 360), (90 - lat) * (H / 180)]
}

export default function EventPinLayer({ currentYear, onPinClick, selectedIds }) {
  const pins = events.filter(e => e.year === currentYear && e.lat != null && selectedIds.has(e.countryId))

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
