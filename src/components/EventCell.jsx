import { useRef, useEffect } from 'react'
import { TYPE_COLORS } from '../eventTypeColors'
import { showCard, scheduleHide } from '../hoverCardStore'

const HOVER_DELAY_MS = 400

export default function EventCell({ event }) {
  const color = TYPE_COLORS[event.type] ?? TYPE_COLORS.other
  const elRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const open = (pinned) => {
    clearTimeout(timerRef.current)
    showCard(event, elRef.current.getBoundingClientRect(), pinned)
  }

  const onMouseEnter = () => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => open(false), HOVER_DELAY_MS)
  }

  const onMouseLeave = () => {
    clearTimeout(timerRef.current)
    scheduleHide()
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      open(true)
    }
  }

  return (
    <div
      ref={elRef}
      className="event-cell"
      role="button"
      tabIndex={0}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={() => open(true)}
      onKeyDown={onKeyDown}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '5px',
        padding: '2px 6px',
        fontSize: '11.5px',
        lineHeight: '1.4',
        color: '#1a1a1a',
        cursor: 'pointer',
      }}
    >
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
        marginTop: '3px',
      }} />
      <span>
        <span style={{ color: '#a08c62', fontStyle: 'italic', marginRight: '4px', fontVariantNumeric: 'tabular-nums', fontSize: '11px' }}>
          {event.year}
        </span>
        {event.title}
        <span style={{ color: '#a08c62', fontSize: '10px', marginLeft: '3px' }}>↗</span>
      </span>
    </div>
  )
}
