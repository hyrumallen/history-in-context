import countries from '../data/countries.json'
import events from '../data/events.json'
import monarchs from '../data/monarchs.json'
import CountryHeader from './CountryHeader'
import EventCell from './EventCell'

const START_YEAR = 1500
const END_YEAR = 1700
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

// Build monarch lookup: countryId -> monarchs sorted by startYear
const monarchsByCountry = {}
for (const monarch of monarchs) {
  if (!monarchsByCountry[monarch.countryId]) monarchsByCountry[monarch.countryId] = []
  monarchsByCountry[monarch.countryId].push(monarch)
}
for (const countryId in monarchsByCountry) {
  monarchsByCountry[countryId].sort((a, b) => a.startYear - b.startYear)
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function getReigningMonarch(year, country) {
  const reigns = monarchsByCountry[country.id] || []
  for (let i = reigns.length - 1; i >= 0; i--) {
    if (year >= reigns[i].startYear && year <= reigns[i].endYear) {
      return reigns[i]
    }
  }
  return null
}

function getMonarchBg(year, country) {
  const reigns = monarchsByCountry[country.id] || []
  // Iterate from the end so that when two reigns share a start/end year,
  // the incoming monarch's shade takes effect on that year.
  for (let i = reigns.length - 1; i >= 0; i--) {
    if (year >= reigns[i].startYear && year <= reigns[i].endYear) {
      return hexToRgba(country.color, i % 2 === 0 ? 0.3 : 0.65)
    }
  }
  return 'white'
}

export default function TimelineGrid() {
  return (
    <div style={{ overflow: 'auto', height: '100%', width: '100%' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `${YEAR_COL_WIDTH} repeat(${countries.length}, ${COUNTRY_COL_WIDTH})`,
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
        {countries.map(country => (
          <div key={country.id} style={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            height: HEADER_HEIGHT,
            borderBottom: '2px solid #c8c8c8',
            borderRight: '1px solid #d0d0d0',
          }}>
            <CountryHeader country={country} />
          </div>
        ))}

        {/* One row per year */}
        {YEARS.map(year => (
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
            {countries.map(country => {
              const cellEvents = eventMap[`${year}-${country.id}`] || []
              const monarch = getReigningMonarch(year, country)
              const tooltip = monarch ? `${monarch.name} (${monarch.startYear}–${monarch.endYear})` : ''
              return (
                <div
                  key={`${year}-${country.id}`}
                  title={tooltip}
                  style={{
                    borderRight: '1px solid #e8e8e8',
                    borderBottom: '1px solid #ededed',
                    background: getMonarchBg(year, country),
                  }}
                >
                  {cellEvents.map(event => (
                    <EventCell key={event.id} event={event} />
                  ))}
                </div>
              )
            })}
          </>
        ))}

      </div>
    </div>
  )
}
