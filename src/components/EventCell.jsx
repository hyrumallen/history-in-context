const TYPE_COLORS = {
  monarch: '#c9a227',
  war: '#c0392b',
  birth: '#2980b9',
  death: '#7f8c8d',
  other: '#888',
}

export default function EventCell({ event }) {
  const color = TYPE_COLORS[event.type] ?? TYPE_COLORS.other

  const inner = (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '5px',
      padding: '2px 6px',
      fontSize: '11.5px',
      lineHeight: '1.4',
      color: '#1a1a1a',
    }}>
      <span style={{
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
        marginTop: '3px',
      }} />
      <span>
        <span style={{ color: '#aaa', marginRight: '4px', fontVariantNumeric: 'tabular-nums', fontSize: '11px' }}>
          {event.year}
        </span>
        {event.title}
      </span>
    </div>
  )

  if (event.link) {
    return (
      <a
        href={event.link}
        target="_blank"
        rel="noopener noreferrer"
        className="event-link"
        style={{ textDecoration: 'none', display: 'block' }}
      >
        {inner}
      </a>
    )
  }
  return inner
}
