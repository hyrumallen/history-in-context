import { useRef, useEffect, useState, memo, Fragment } from 'react'
import events from '../data/events.json'
import rulers from '../data/rulers.json'
import CountryHeader from './CountryHeader'
import EventCell from './EventCell'

import { START_YEAR, END_YEAR, SERIF } from '../constants'
import { measureOffsets, yearAtOffset } from '../rowOffsets'
import { reignShade, reignIndexAt } from '../reignShades'

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

function getReigningRuler(year, country) {
  const reigns = rulersByCountry[country.id] || []
  for (let i = reigns.length - 1; i >= 0; i--) {
    if (year >= reigns[i].startYear && year <= reigns[i].endYear) {
      return reigns[i]
    }
  }
  return null
}

// Memoized so scroll-driven currentYear updates re-render only the headers,
// not the 501-row grid body.
const GridRows = memo(function GridRows({ selectedCountries }) {
  return YEARS.map(year => (
    <Fragment key={year}>
      {/* Year label */}
      <div
        key={`y-${year}`}
        data-year-row={year}
        style={{
          position: 'sticky',
          left: 0,
          zIndex: 1,
          background: '#f8f3e7',
          borderTop: year % 10 === 0 ? '1px solid #e5d9bd' : 'none',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          paddingRight: '8px',
          fontFamily: SERIF,
          fontVariantNumeric: 'tabular-nums',
          fontSize: year % 10 === 0 ? '11px' : '9.5px',
          color: year % 10 === 0 ? '#7a6640' : '#cdbd9a',
          fontWeight: year % 10 === 0 ? '700' : '400',
        }}
      >
        {year % 5 === 0 ? year : ''}
      </div>

      {/* Country cells */}
      {selectedCountries.map(country => {
        const cellEvents = eventMap[`${year}-${country.id}`] || []
        const ruler = getReigningRuler(year, country)
        const tooltip = ruler ? `${ruler.title ? ruler.title + ' ' : ''}${ruler.name} (${ruler.startYear}–${ruler.endYear})` : ''
        const idx = reignIndexAt(rulersByCountry[country.id] || [], year)
        const strip = idx >= 0 ? reignShade(idx, country) : null
        return (
          <div
            key={`${year}-${country.id}`}
            title={tooltip}
            style={{
              borderTop: year % 10 === 0 ? '1px solid #e5d9bd' : 'none',
              background: strip ? `linear-gradient(to right, ${strip} 15px, transparent 15px)` : 'transparent',
              paddingLeft: '19px',
              fontFamily: SERIF,
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
    </Fragment>
  ))
})

export default function TimelineGrid({ onYearChange, selectedCountries, onOpenSidebar, currentYear }) {
  const scrollRef = useRef(null)
  const innerRef = useRef(null)
  const offsetsRef = useRef([])
  const [measureTick, setMeasureTick] = useState(0)
  void measureTick

  useEffect(() => {
    const inner = innerRef.current
    if (!inner) return
    let raf = null
    const measure = () => {
      offsetsRef.current = measureOffsets(inner)
      setMeasureTick(t => t + 1)
    }
    measure()
    const ro = new ResizeObserver(() => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    })
    ro.observe(inner)
    return () => { ro.disconnect(); if (raf) cancelAnimationFrame(raf) }
  }, [selectedCountries])

  useEffect(() => {
    const el = scrollRef.current
    if (!el || !onYearChange) return
    let timer = null
    const handleScroll = () => {
      if (timer) return
      timer = setTimeout(() => {
        timer = null
        const year = yearAtOffset(offsetsRef.current, el.scrollTop)
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
    <div ref={scrollRef} style={{ overflow: 'auto', height: '100%', width: '100%', background: '#f8f3e7' }}>
      <div ref={innerRef} style={{ position: 'relative', minWidth: 'fit-content' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `${YEAR_COL_WIDTH} repeat(${selectedCountries.length}, ${COUNTRY_COL_WIDTH})`,
        gridAutoRows: `minmax(${ROW_HEIGHT}, auto)`,
      }}>

        {/* Top-left corner cell */}
        <div style={{
          position: 'sticky',
          top: 0,
          left: 0,
          zIndex: 5,
          height: HEADER_HEIGHT,
          background: '#f8f3e7',
          borderBottom: '1px solid #d8c9a8',
        }} />

        {/* Country header cells — sticky must be on the direct grid item */}
        {selectedCountries.map(country => (
          <div key={country.id} style={{
            position: 'sticky',
            top: 0,
            zIndex: 4,
            height: HEADER_HEIGHT,
            background: '#f8f3e7',
            borderBottom: '1px solid #d8c9a8',
          }}>
            <CountryHeader country={country} year={currentYear} />
          </div>
        ))}

        {/* One row per year */}
        <GridRows selectedCountries={selectedCountries} />

      </div>
      </div>
    </div>
  )
}
