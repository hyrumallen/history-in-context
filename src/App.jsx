import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import countries from './data/countries.json'
import { START_YEAR, END_YEAR, SERIF } from './constants'
import TimelineGrid from './components/TimelineGrid'
import CountrySidebar from './components/CountrySidebar'
import EventHoverCard from './components/EventHoverCard'
import WorldMap from './components/WorldMap'
import { useIsMobile } from './hooks/useIsMobile'

const DEFAULT_IDS = ['england', 'france', 'spain', 'holy-roman-empire', 'russia', 'ottoman-empire']
const STORAGE_KEY = 'hic-selected-countries'

function loadSelection() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(saved) && saved.every(id => countries.some(c => c.id === id))) {
      return saved
    }
  } catch {
    // corrupted storage — fall through to default
  }
  return DEFAULT_IDS
}

const MINI_PANEL_STYLE = {
  position: 'absolute',
  right: 18,
  bottom: 18,
  width: 380,
  height: 210,
  border: '2px solid #4a3a22',
  borderRadius: 8,
  boxShadow: '0 6px 24px rgba(74, 58, 34, 0.35)',
  overflow: 'hidden',
  cursor: 'zoom-in',
  zIndex: 10,
}

const FULL_PANEL_STYLE = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
  border: 'none',
  borderRadius: 0,
  overflow: 'hidden',
  zIndex: 10,
}

function headerButtonStyle(active, radius) {
  return {
    font: 'inherit',
    fontSize: '12.5px',
    fontWeight: 600,
    padding: '5px 14px',
    cursor: 'pointer',
    background: active ? '#4a6fa5' : '#2e2e4e',
    color: active ? 'white' : '#bbbbdd',
    border: `1px solid ${active ? '#4a6fa5' : '#44446a'}`,
    borderRadius: radius,
  }
}

function App() {
  const [currentYear, setCurrentYear] = useState(1500)
  const [view, setView] = useState('timeline')
  const [selectedIds, setSelectedIds] = useState(loadSelection)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const highlightElRef = useRef(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds))
  }, [selectedIds])

  const selectedCountries = useMemo(
    () => countries.filter(c => selectedIds.includes(c.id)),
    [selectedIds]
  )

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const handleYearChange = useCallback((year) => {
    setCurrentYear(year)
  }, [])

  const handlePinClick = useCallback((eventId) => {
    setView('timeline')
    const el = document.querySelector(`[data-event-id="${eventId}"]`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (highlightElRef.current && highlightElRef.current !== el) {
      highlightElRef.current.classList.remove('event-highlight')
    }
    highlightElRef.current = el
    el.classList.remove('event-highlight')
    void el.offsetWidth
    el.classList.add('event-highlight')
    el.addEventListener('animationend', () => {
      el.classList.remove('event-highlight')
      if (highlightElRef.current === el) highlightElRef.current = null
    }, { once: true })
  }, [])

  const openSidebar = useCallback(() => setSidebarOpen(true), [])

  const isMini = view === 'timeline'

  const expandProps = isMini ? {
    role: 'button',
    tabIndex: 0,
    'aria-label': 'Expand world map',
    onClick: () => setView('map'),
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setView('map')
      }
    },
  } : {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{
        background: '#1a1a2e',
        color: 'white',
        padding: isMobile ? '0 12px' : '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexShrink: 0,
        height: '52px',
      }}>
        <span style={{ fontFamily: SERIF, fontSize: '20px', fontWeight: '700', letterSpacing: '0.2px' }}>
          History in Context
        </span>
        {!isMobile && (
          <span style={{ fontSize: '13px', color: '#9999bb', letterSpacing: '0.5px' }}>
            {START_YEAR} – {END_YEAR} · Five Centuries of History
          </span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex' }}>
            <button style={headerButtonStyle(view === 'timeline', '5px 0 0 5px')} onClick={() => setView('timeline')}>
              Timeline
            </button>
            <button style={headerButtonStyle(view === 'map', '0 5px 5px 0')} onClick={() => setView('map')}>
              Map
            </button>
          </div>
          <button
            style={headerButtonStyle(sidebarOpen, '5px')}
            onClick={() => setSidebarOpen(o => !o)}
            aria-expanded={sidebarOpen}
          >
            Countries
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minWidth: 0 }}>
          <div style={{ position: 'absolute', inset: 0, visibility: view === 'map' ? 'hidden' : 'visible' }}>
            <TimelineGrid
              onYearChange={handleYearChange}
              selectedCountries={selectedCountries}
              onOpenSidebar={openSidebar}
              currentYear={currentYear}
            />
          </div>

          {(!isMobile || view === 'map') && (
            <div
              className="map-panel"
              style={isMini ? MINI_PANEL_STYLE : FULL_PANEL_STYLE}
              {...expandProps}
            >
              <WorldMap
                mode={isMini ? 'mini' : 'full'}
                currentYear={currentYear}
                onPinClick={handlePinClick}
                selectedIds={selectedIdSet}
              />
            </div>
          )}
        </div>

        <CountrySidebar
          countries={countries}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
          open={sidebarOpen}
          overlay={isMobile}
        />

        <EventHoverCard />
      </div>
    </div>
  )
}

export default App
