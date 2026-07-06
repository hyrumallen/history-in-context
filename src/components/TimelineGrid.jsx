import { useRef, useEffect, memo } from 'react'
import events from '../data/events.json'
import rulers from '../data/rulers.json'
import CountryHeader from './CountryHeader'
import EventCell from './EventCell'

import { START_YEAR, END_YEAR } from '../constants'

const YEARS = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i)

const YEAR_COL_WIDTH = '60px'
const COUNTRY_COL_WIDTH = '180px'
const HEADER_HEIGHT = '48px'
const ROW_HEIGHT = '28px'

// Build event lookup: "year-countryId" -> event[]
const eventMap = {}
for (const event of events) {
  const key = `${event.year}-${event.countryId}`
  if (!eventMap[key]) eventMap[key] = []
  eventMap[key].push(event)
}

// Build ruler lookup: countryId -> rulers sorted by startYear
const rulersByCountry = {}
for (const ruler of rulers) {
  if (!rulersByCountry[ruler.countryId]) rulersByCountry[ruler.countryId] = []
  rulersByCountry[ruler.countryId].push(ruler)
}
for (const countryId in rulersByCountry) {
  rulersByCountry[countryId].sort((a, b) => a.startYear - b.startYear)
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function getReigningRuler(year, country) {
  const reigns = rulersByCountry[country.id] || []
  for (let i = reigns.length - 1; i >= 0; i--) {
    if (year >= reigns[i].startYear && year <= reigns[i].endYear) {
      return reigns[i]
    }
  }
  return null
}

function getRulerBg(year, country) {
  const reigns = rulersByCountry[country.id] || []
  // Iterate from the end so that when two reigns share a start/end year,
  // the incoming ruler's shade takes effect on that year.
  for (let i = reigns.length - 1; i >= 0; i--) {
    if (year >= reigns[i].startYear && year <= reigns[i].endYear) {
      return hexToRgba(country.color, i % 2 === 0 ? 0.3 : 0.65)
    }
  }
  return 'white'
}

// Memoized so scroll-driven currentYear updates re-render only the headers,
// not the 501-row grid body.
const GridRows = memo(function GridRows({ selectedCountries }) {
  return YEARS.map(year => (
    <>
      {/* Year label */}
      <div
        key={`y-${year}`}
        style={{
          position: 'sticky',
          left: 0,
          zIndex: 1,
          background: '#f7f7f7',
          borderRight: '1px solid #d0d0d0',
          borderBottom: '1px solid #ededed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '8px',
          fontSize: '11px',
          letterSpacing: '0.2px',
          fontVariantNumeric: 'tabular-nums',
          color: year % 10 === 0 ? '#444' : '#ccc',
          fontWeight: year % 10 === 0 ? '600' : '400',
        }}
      >
        {year % 10 === 0 ? year : (year % 5 === 0 ? '·' : '')}
      </div>

      {/* Country cells */}
      {selectedCountries.map(country => {
        const cellEvents = eventMap[`${year}-${country.id}`] || []
        const ruler = getReigningRuler(year, country)
        const tooltip = ruler ? `${ruler.title ? ruler.title + ' ' : ''}${ruler.name} (${ruler.startYear}–${ruler.endYear})` : ''
        return (
          <div
            key={`${year}-${country.id}`}
            title={tooltip}
            style={{
              borderRight: '1px solid #e8e8e8',
              borderBottom: '1px solid #ededed',
              background: getRulerBg(year, country),
            }}
          >
            {cellEvents.map(event => (
              <div key={event.id} data-event-id={event.id}>
                <EventCell event={event} />
              </div>
            ))}
          </div>
        )
      })}
    </>
  ))
})

export default function TimelineGrid({ onYearChange, selectedCountries, onOpenSidebar, currentYear }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || !onYearChange) return
    let timer = null
    const handleScroll = () => {
      if (timer) return
      timer = setTimeout(() => {
        timer = null
        const year = Math.min(END_YEAR, Math.max(START_YEAR, Math.round(el.scrollTop / parseInt(ROW_HEIGHT)) + START_YEAR))
        onYearChange(year)
      }, 50)
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', handleScroll)
      if (timer) clearTimeout(timer)
    }
  }, [onYearChange])

  if (selectedCountries.length === 0) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        color: '#666',
        fontSize: 14,
      }}>
        <div>No countries selected</div>
        <button
          onClick={onOpenSidebar}
          style={{
            font: 'inherit',
            fontSize: '13px',
            fontWeight: 600,
            padding: '7px 16px',
            cursor: 'pointer',
            background: '#4a6fa5',
            color: 'white',
            border: 'none',
            borderRadius: 5,
          }}
        >
          Open the Countries panel
        </button>
      </div>
    )
  }

  return (
    <div ref={scrollRef} style={{ overflow: 'auto', height: '100%', width: '100%' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `${YEAR_COL_WIDTH} repeat(${selectedCountries.length}, ${COUNTRY_COL_WIDTH})`,
        gridAutoRows: `minmax(${ROW_HEIGHT}, auto)`,
        minWidth: 'fit-content',
      }}>

        {/* Top-left corner cell */}
        <div style={{
          position: 'sticky',
          top: 0,
          left: 0,
          zIndex: 3,
          height: HEADER_HEIGHT,
          background: '#f7f7f7',
          borderBottom: '2px solid #c8c8c8',
          borderRight: '1px solid #d0d0d0',
        }} />

        {/* Country header cells — sticky must be on the direct grid item */}
        {selectedCountries.map(country => (
          <div key={country.id} style={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            height: HEADER_HEIGHT,
            borderBottom: '2px solid #c8c8c8',
            borderRight: '1px solid #d0d0d0',
          }}>
            <CountryHeader country={country} year={currentYear} />
          </div>
        ))}

        {/* One row per year */}
        <GridRows selectedCountries={selectedCountries} />

      </div>
    </div>
  )
}
