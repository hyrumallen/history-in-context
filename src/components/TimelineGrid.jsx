import { useRef, useEffect, useState, memo, Fragment } from 'react'
import events from '../data/events.json'
import rulers from '../data/rulers.json'
import CountryHeader from './CountryHeader'
import EventCell from './EventCell'
import { WatermarkLayer, RibbonLabelLayer } from './GridOverlays'

import { START_YEAR, END_YEAR, SERIF } from '../constants'
import { measureOffsets, yearAtOffset } from '../rowOffsets'
import { reignShade, reignIndexAt } from '../reignShades'
import { useIsMobile } from '../hooks/useIsMobile'

const YEARS = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i)

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
  const isMobile = useIsMobile()
  const yearColPx = isMobile ? 44 : 60
  const countryColPx = isMobile ? 150 : 180
  const yearCol = `${yearColPx}px`
  const countryCol = `${countryColPx}px`
  const innerRef = useRef(null)
  const trackRef = useRef(null)
  const offsetsRef = useRef([])
  const [measureTick, setMeasureTick] = useState(0)
  void measureTick // overlays below re-read offsetsRef on every measure-triggered render

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
    if (!onYearChange) return
    // Desktop scrolls the inner container; mobile scrolls the page (window), so
    // derive the scroll offset from the inner content's position in the viewport.
    // 100 = sticky app header (52) + pinned title strip (48), so the reported
    // year is the one just below both.
    const target = isMobile ? window : scrollRef.current
    if (!target) return
    let timer = null
    const report = () => {
      let scrollTop
      if (isMobile) {
        const inner = innerRef.current
        if (!inner) return
        scrollTop = Math.max(0, -inner.getBoundingClientRect().top + 100)
      } else {
        scrollTop = scrollRef.current?.scrollTop ?? 0
      }
      onYearChange(yearAtOffset(offsetsRef.current, scrollTop))
    }
    const handleScroll = () => {
      if (timer) return
      timer = setTimeout(() => { timer = null; report() }, 50)
    }
    target.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      target.removeEventListener('scroll', handleScroll)
      if (timer) clearTimeout(timer)
    }
  }, [onYearChange, isMobile])

  // Mobile only: keep the pinned title strip aligned with the columns by
  // mirroring the horizontal scroll position of the grid onto the strip track.
  useEffect(() => {
    if (!isMobile) return
    const el = scrollRef.current
    if (!el) return
    const sync = () => {
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${yearColPx - el.scrollLeft}px)`
      }
    }
    sync()
    el.addEventListener('scroll', sync, { passive: true })
    return () => el.removeEventListener('scroll', sync)
  }, [isMobile, yearColPx, selectedCountries])

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

  const gridStrip = (
    <div ref={scrollRef} style={{
      // Mobile: scroll horizontally only, with natural height, so the page (not
      // this box) owns vertical scroll and iOS Safari can hide its toolbars.
      overflowX: 'auto',
      overflowY: isMobile ? 'visible' : 'auto',
      height: isMobile ? undefined : '100%',
      width: '100%',
      background: '#f8f3e7',
      scrollSnapType: isMobile ? 'x proximity' : undefined,
      scrollPaddingLeft: isMobile ? yearCol : undefined,
    }}>
      <div ref={innerRef} style={{ position: 'relative', minWidth: 'fit-content' }}>
      <WatermarkLayer
        offsets={offsetsRef.current}
        contentHeight={innerRef.current?.scrollHeight ?? 0}
      />
      <div style={{
        display: 'grid',
        gridTemplateColumns: `${yearCol} repeat(${selectedCountries.length}, ${countryCol})`,
        gridAutoRows: `minmax(${ROW_HEIGHT}, auto)`,
      }}>

        {/* Header row — desktop only (sticky). On mobile the pinned title strip
            below the app header shows the column titles instead. */}
        {!isMobile && (
          <>
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
          </>
        )}

        {/* One row per year */}
        <GridRows selectedCountries={selectedCountries} />

      </div>
      <RibbonLabelLayer
        offsets={offsetsRef.current}
        contentHeight={innerRef.current?.scrollHeight ?? 0}
        selectedCountries={selectedCountries}
        rulersByCountry={rulersByCountry}
        yearColPx={yearColPx}
        countryColPx={countryColPx}
      />
      </div>
    </div>
  )

  if (!isMobile) return gridStrip

  return (
    <div>
      {/* Pinned column titles: sticky just below the app header, slid
          horizontally in sync with the grid by the trackRef effect above. */}
      <div style={{
        position: 'sticky',
        top: 52,
        zIndex: 45,
        height: HEADER_HEIGHT,
        background: '#f8f3e7',
        borderBottom: '1px solid #d8c9a8',
        overflow: 'hidden',
      }}>
        <div ref={trackRef} style={{
          display: 'flex',
          height: '100%',
          transform: `translateX(${yearColPx}px)`,
          willChange: 'transform',
        }}>
          {selectedCountries.map(country => (
            <div key={country.id} style={{ width: countryColPx, flexShrink: 0, height: '100%' }}>
              <CountryHeader country={country} year={currentYear} />
            </div>
          ))}
        </div>
        {/* Cover the sticky year-gutter width so titles slide under it. */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: yearColPx, height: '100%', background: '#f8f3e7' }} />
      </div>
      {gridStrip}
    </div>
  )
}
