import { useRef, useEffect } from 'react'
import events from '../data/events.json'
import { TYPE_COLORS } from '../eventTypeColors'
import { pinsInWindow, pinEmphasis } from '../mapPins'
import { showCard, scheduleHide } from '../hoverCardStore'

const W = 800
const H = 400

const HOVER_DELAY_MS = 400

function project(lng, lat) {
  return [(lng + 180) * (W / 360), (90 - lat) * (H / 180)]
}

export default function EventPinLayer({ currentYear, selectedIds, isMini }) {
  const pins = isMini
    ? events.filter(e => e.year === currentYear && e.lat != null && selectedIds.has(e.countryId))
    : pinsInWindow(events, currentYear, selectedIds)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const openCard = (event, target, pinned) => {
    clearTimeout(timerRef.current)
    showCard(event, target.getBoundingClientRect(), pinned)
  }

  return (
    <g>
      {pins.map(event => {
        const [cx, cy] = project(event.lng, event.lat)
        const { r, opacity } = isMini ? { r: 4, opacity: undefined } : pinEmphasis(event.year, currentYear)
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
            onMouseEnter={(e) => {
              const target = e.currentTarget
              clearTimeout(timerRef.current)
              timerRef.current = setTimeout(() => openCard(event, target, false), HOVER_DELAY_MS)
            }}
            onMouseLeave={() => { clearTimeout(timerRef.current); scheduleHide() }}
            onClick={(e) => openCard(event, e.currentTarget, true)}
          />
        )
      })}
    </g>
  )
}
