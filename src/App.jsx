import { useState, useCallback } from 'react'
import TimelineGrid from './components/TimelineGrid'
import Legend from './components/Legend'
import WorldMap from './components/WorldMap'

function App() {
  const [currentYear, setCurrentYear] = useState(1500)

  const handleYearChange = useCallback((year) => {
    setCurrentYear(year)
  }, [])

  const handlePinClick = useCallback((eventId) => {
    const el = document.querySelector(`[data-event-id="${eventId}"]`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('event-highlight')
    setTimeout(() => el.classList.remove('event-highlight'), 1500)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{
        background: '#1a1a2e',
        color: 'white',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'baseline',
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
        <div style={{ marginLeft: 'auto' }}>
          <Legend />
        </div>
      </header>
      <div style={{ flex: '0 0 55vh', overflow: 'hidden' }}>
        <TimelineGrid onYearChange={handleYearChange} />
      </div>
      <div style={{ flex: 1, overflow: 'hidden', borderTop: '2px solid #c8c8c8' }}>
        <WorldMap currentYear={currentYear} onPinClick={handlePinClick} />
      </div>
    </div>
  )
}

export default App
