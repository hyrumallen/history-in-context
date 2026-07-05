import { useState, useCallback, useRef } from 'react'
import TimelineGrid from './components/TimelineGrid'
import Legend from './components/Legend'
import WorldMap from './components/WorldMap'

const MINI_PANEL_STYLE = {
  position: 'absolute',
  right: 18,
  bottom: 18,
  width: 380,
  height: 210,
  border: '2px solid #1a1a2e',
  borderRadius: 8,
  boxShadow: '0 6px 24px rgba(26, 26, 46, 0.35)',
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

function viewButtonStyle(active, side) {
  return {
    font: 'inherit',
    fontSize: '12.5px',
    fontWeight: 600,
    padding: '5px 14px',
    cursor: 'pointer',
    background: active ? '#4a6fa5' : '#2e2e4e',
    color: active ? 'white' : '#bbbbdd',
    border: `1px solid ${active ? '#4a6fa5' : '#44446a'}`,
    borderRadius: side === 'left' ? '5px 0 0 5px' : '0 5px 5px 0',
  }
}

function App() {
  const [currentYear, setCurrentYear] = useState(1500)
  const [view, setView] = useState('timeline')
  const highlightElRef = useRef(null)

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
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexShrink: 0,
        height: '52px',
      }}>
        <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.3px' }}>
          History in Context
        </span>
        <span style={{ fontSize: '13px', color: '#9999bb', letterSpacing: '0.5px' }}>
          1500 – 1700 · The Early Modern World
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex' }}>
            <button style={viewButtonStyle(view === 'timeline', 'left')} onClick={() => setView('timeline')}>
              Timeline
            </button>
            <button style={viewButtonStyle(view === 'map', 'right')} onClick={() => setView('map')}>
              Map
            </button>
          </div>
          <Legend />
        </div>
      </header>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, visibility: view === 'map' ? 'hidden' : 'visible' }}>
          <TimelineGrid onYearChange={handleYearChange} />
        </div>

        <div
          className="map-panel"
          style={isMini ? MINI_PANEL_STYLE : FULL_PANEL_STYLE}
          {...expandProps}
        >
          <WorldMap
            mode={isMini ? 'mini' : 'full'}
            currentYear={currentYear}
            onPinClick={handlePinClick}
          />
        </div>
      </div>
    </div>
  )
}

export default App
