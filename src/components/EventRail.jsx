import { useState } from 'react'
import events from '../data/events.json'
import countries from '../data/countries.json'
import rulers from '../data/rulers.json'
import { TYPE_COLORS } from '../eventTypeColors'
import { railItems } from '../mapPins'
import { rulerAt } from '../rulers'
import { showCard, scheduleHide } from '../hoverCardStore'
import { useIsMobile } from '../hooks/useIsMobile'
import { SERIF } from '../constants'

const COUNTRY_NAME = Object.fromEntries(countries.map(c => [c.id, c.name]))

function decadeLabel(year) {
  const start = Math.floor(year / 10) * 10
  return `${start}–${start + 9}`
}

function RailRow({ event, emphasis, focused, onFocus, onShowInTimeline }) {
  const color = TYPE_COLORS[event.type] ?? TYPE_COLORS.other
  const country = COUNTRY_NAME[event.countryId] ?? event.countryId
  const ruler = rulerAt(rulers, event.countryId, event.year)
  return (
    <li
      onMouseEnter={(e) => { onFocus?.(event.id); showCard(event, e.currentTarget.getBoundingClientRect(), false) }}
      onMouseLeave={() => { onFocus?.(null); scheduleHide() }}
      onClick={() => onShowInTimeline?.(event.id)}
      style={{
        display: 'flex', alignItems: 'baseline', gap: 8, padding: '5px 10px',
        cursor: 'pointer', listStyle: 'none',
        background: focused ? 'rgba(74,111,165,0.15)' : 'transparent',
        opacity: emphasis ? 1 : 0.5,
        borderLeft: `3px solid ${emphasis ? color : 'transparent'}`,
      }}
    >
      <span style={{ fontVariantNumeric: 'tabular-nums', color: '#8a7a5a', fontWeight: 600, minWidth: 34 }}>{event.year}</span>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, alignSelf: 'center' }} />
      <span style={{ flex: 1 }}>
        <span style={{ fontFamily: SERIF }}>{event.title}</span>
        <span style={{ display: 'block', fontSize: 11, color: '#8a7a5a' }}>{ruler ? `${country} · ${ruler.name}` : country}</span>
      </span>
    </li>
  )
}

function MobileSheet({ list, rows, currentYear }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 45,
      background: 'rgba(253,249,239,0.97)', borderTop: '1px solid #d8c9a8',
      display: 'flex', flexDirection: 'column',
      maxHeight: open ? '45vh' : 40, transition: 'max-height 0.2s ease',
      color: '#1a1a1a', fontSize: 12.5,
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          font: 'inherit', width: '100%', textAlign: 'left', cursor: 'pointer',
          padding: '10px 12px', background: 'none', border: 'none',
          fontFamily: SERIF, fontWeight: 700, fontSize: 13, color: '#4a3a22',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span>{decadeLabel(currentYear)} · {rows.length} {rows.length === 1 ? 'event' : 'events'}</span>
        <span>{open ? '▾' : '▴'}</span>
      </button>
      {open && list}
    </div>
  )
}

export default function EventRail({ currentYear, selectedIds, focusedId, onFocus, onShowInTimeline }) {
  const isMobile = useIsMobile()
  const rows = railItems(events, currentYear, selectedIds)

  const header = (
    <div style={{
      padding: '8px 10px', fontFamily: SERIF, fontWeight: 700, fontSize: 13,
      color: '#4a3a22', borderBottom: '1px solid #d8c9a8', flexShrink: 0,
      fontVariantNumeric: 'tabular-nums',
    }}>
      {decadeLabel(currentYear)} · {rows.length} {rows.length === 1 ? 'event' : 'events'}
    </div>
  )

  const list = (
    <ul style={{ margin: 0, padding: 0, overflowY: 'auto', flex: 1 }}>
      {rows.length === 0 ? (
        <li style={{ listStyle: 'none', padding: '12px 10px', color: '#8a7a5a', fontStyle: 'italic' }}>
          No recorded events this decade.
        </li>
      ) : rows.map(({ event, emphasis }) => (
        <RailRow
          key={event.id}
          event={event}
          emphasis={emphasis}
          focused={event.id === focusedId}
          onFocus={onFocus}
          onShowInTimeline={onShowInTimeline}
        />
      ))}
    </ul>
  )

  if (isMobile) {
    return <MobileSheet list={list} rows={rows} currentYear={currentYear} />
  }

  return (
    <aside style={{
      width: 320, flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column',
      background: 'rgba(253,249,239,0.96)', borderLeft: '1px solid #d8c9a8',
      fontSize: 12.5, color: '#1a1a1a',
    }}>
      {header}
      {list}
    </aside>
  )
}
