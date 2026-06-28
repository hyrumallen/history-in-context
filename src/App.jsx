import TimelineGrid from './components/TimelineGrid'
import Legend from './components/Legend'

function App() {
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
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <TimelineGrid />
      </div>
    </div>
  )
}

export default App
