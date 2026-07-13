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

export default function EventPinLayer({ currentYear, selectedIds, isMini, focusedId, onFocus }) {
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
        const base = isMini ? { r: 4, opacity: undefined } : pinEmphasis(event.year, currentYear)
        const focused = event.id === focusedId
        const r = focused ? base.r + 2 : base.r
        const opacity = focused ? 1 : base.opacity
        return (
          <circle
            key={event.id}
            cx={cx}
            cy={cy}
            r={r}
            fill={TYPE_COLORS[event.type] ?? TYPE_COLORS.other}
            stroke={focused ? '#1a1a2e' : 'white'}
            strokeWidth={focused ? 1.6 : 0.8}
            opacity={opacity}
            style={{ cursor: 'pointer' }}
            onMouseEnter={(e) => {
              const target = e.currentTarget
              onFocus?.(event.id)
              clearTimeout(timerRef.current)
              timerRef.current = setTimeout(() => openCard(event, target, false), HOVER_DELAY_MS)
            }}
            onMouseLeave={() => { onFocus?.(null); clearTimeout(timerRef.current); scheduleHide() }}
            onClick={(e) => openCard(event, e.currentTarget, true)}
          />
        )
      })}
    </g>
  )
}
