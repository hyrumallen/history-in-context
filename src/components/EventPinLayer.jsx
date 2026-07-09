import events from '../data/events.json'
import { TYPE_COLORS } from '../eventTypeColors'
import { pinsInWindow, pinEmphasis } from '../mapPins'

const W = 800
const H = 400

function project(lng, lat) {
  return [(lng + 180) * (W / 360), (90 - lat) * (H / 180)]
}

export default function EventPinLayer({ currentYear, onPinClick, selectedIds }) {
  const pins = pinsInWindow(events, currentYear, selectedIds)

  return (
    <g>
      {pins.map(event => {
        const [cx, cy] = project(event.lng, event.lat)
        const { r, opacity } = pinEmphasis(event.year, currentYear)
        return (
          <circle
            key={event.id}
            cx={cx}
            cy={cy}
            r={r}
            fill={TYPE_COLORS[event.type] ?? TYPE_COLORS.other}
            stroke="white"
            strokeWidth={0.8}
            opacity={opacity}
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
