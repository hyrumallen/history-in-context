export default function MapControls({ year, onYearChange, playing, onTogglePlay, min, max, inline = false }) {
  const wrapperStyle = inline
    ? { display: 'flex', alignItems: 'center', gap: 12, padding: '4px 12px 10px' }
    : {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'rgba(26,26,46,0.82)',
        padding: '8px 12px',
        borderRadius: 6,
      }
  return (
    <div style={wrapperStyle}>
      <button
        onClick={onTogglePlay}
        aria-label={playing ? 'Pause' : 'Play'}
        style={{
          font: 'inherit',
          fontSize: 14,
          width: 30,
          height: 26,
          cursor: 'pointer',
          background: '#4a6fa5',
          color: 'white',
          border: 'none',
          borderRadius: 4,
        }}
      >
        {playing ? '⏸' : '▶'}
      </button>
      <input
        type="range"
        aria-label="Year"
        min={min}
        max={max}
        step={1}
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: '#4a6fa5' }}
      />
      <span style={{ color: inline ? '#4a3a22' : 'white', fontVariantNumeric: 'tabular-nums', minWidth: 40, textAlign: 'right', fontWeight: 600 }}>
        {year}
      </span>
    </div>
  )
}
