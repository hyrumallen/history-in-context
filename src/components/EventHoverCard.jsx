import { useSyncExternalStore, useState, useEffect, useRef } from 'react'
import { getCardState, subscribeCard, cancelHide, scheduleHide, closeCard } from '../hoverCardStore'
import { fetchSummary } from '../wikipedia'

const CARD_WIDTH = 340
const EST_HEIGHT = 240
const GAP = 6

function cardPosition(rect) {
  const below = rect.bottom + GAP + EST_HEIGHT <= window.innerHeight
  const top = below ? rect.bottom + GAP : Math.max(8, rect.top - EST_HEIGHT - GAP)
  const left = Math.min(Math.max(8, rect.left), window.innerWidth - CARD_WIDTH - 8)
  return { top, left }
}

export default function EventHoverCard() {
  const card = useSyncExternalStore(subscribeCard, getCardState)
  const [summary, setSummary] = useState(null)
  const ref = useRef(null)

  const eventId = card?.event?.id
  const link = card?.event?.link

  useEffect(() => {
    setSummary(null)
    if (!link) return
    let live = true
    fetchSummary(link).then(s => { if (live) setSummary(s) })
    return () => { live = false }
  }, [eventId, link])

  useEffect(() => {
    if (!card?.pinned) return
    const onKey = (e) => { if (e.key === 'Escape') closeCard() }
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) closeCard() }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [card?.pinned])

  if (!card) return null

  const { event } = card
  const { top, left } = cardPosition(card.anchorRect)

  return (
    <div
      ref={ref}
      onMouseEnter={cancelHide}
      onMouseLeave={scheduleHide}
      style={{
        position: 'fixed',
        top,
        left,
        width: CARD_WIDTH,
        zIndex: 50,
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: 8,
        boxShadow: '0 6px 24px rgba(26, 26, 46, 0.25)',
        padding: '12px 14px',
        fontSize: '12.5px',
        lineHeight: 1.5,
        color: '#1a1a1a',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>
        <span style={{ color: '#aaa', marginRight: 6, fontVariantNumeric: 'tabular-nums' }}>{event.year}</span>
        {event.title}
      </div>
      {summary?.thumbnailUrl && (
        <img
          src={summary.thumbnailUrl}
          alt=""
          style={{ float: 'right', width: 82, marginLeft: 10, marginBottom: 4, borderRadius: 4 }}
        />
      )}
      <div style={{ maxHeight: 150, overflowY: 'auto' }}>
        {summary?.extract ?? event.description}
      </div>
      <div style={{ clear: 'both', marginTop: 8 }}>
        <a
          href={summary?.pageUrl ?? event.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '12px', fontWeight: 600, color: '#4a6fa5', textDecoration: 'none' }}
        >
          Read on Wikipedia →
        </a>
      </div>
    </div>
  )
}
