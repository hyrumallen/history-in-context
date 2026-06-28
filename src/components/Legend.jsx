const ITEMS = [
  { color: '#c9a227', label: 'Monarch / Leadership' },
  { color: '#c0392b', label: 'War / Conflict' },
  { color: '#2980b9', label: 'Birth' },
  { color: '#7f8c8d', label: 'Death' },
  { color: '#888',    label: 'Other' },
]

export default function Legend() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap',
    }}>
      {ITEMS.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            background: item.color,
            flexShrink: 0,
            display: 'inline-block',
          }} />
          <span style={{ fontSize: '12px', color: '#bbb', whiteSpace: 'nowrap' }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}
