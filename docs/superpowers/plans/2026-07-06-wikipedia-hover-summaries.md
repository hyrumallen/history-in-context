# Wikipedia Hover Summaries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hovering (or clicking) a timeline event shows a card with the Wikipedia lead summary and thumbnail, with a "Read on Wikipedia →" link replacing today's direct click-through.

**Architecture:** A pure fetch/cache module (`src/wikipedia.js`), a tiny module-level store (`src/hoverCardStore.js`) that EventCell talks to via stable function imports (so the memoized 501-row grid never re-renders on hover), and a single `EventHoverCard` component mounted in App that subscribes to the store via `useSyncExternalStore`.

**Tech Stack:** React 19, Vite 8, vitest. No new dependencies. Wikipedia REST API `https://en.wikipedia.org/api/rest_v1/page/summary/<title>` (CORS-enabled, no key).

**Spec:** `docs/superpowers/specs/2026-07-06-wikipedia-hover-summaries-design.md`

## Global Constraints

- Branch `feature/wikipedia-hover-summaries`; commit after every task; `npm run lint` and `npm test` must pass at every commit.
- Hover-open delay: 400ms. Grace period before an unpinned card closes after mouse-leave: 250ms.
- Hover state must never flow through React props/context into `GridRows` or `EventCell` — cells import store functions directly and never re-render on hover.
- Card fallback text is the event's stored `description`; the card never shows an error state.
- Link copy, verbatim: `Read on Wikipedia →`. Opens in a new tab with `rel="noopener noreferrer"`.
- All fetch failures (non-OK status, network throw, malformed link) resolve to `null` and are cached for the session.

---

### Task 1: Extract TYPE_COLORS to its own module (fixes backlog B3)

**Files:**
- Create: `src/eventTypeColors.js`
- Modify: `src/components/EventCell.jsx:1-7` (remove export), `src/components/EventPinLayer.jsx:2` (import path)

**Interfaces:**
- Produces: `TYPE_COLORS` named export from `src/eventTypeColors.js` — object mapping event type → hex color string, exactly the values currently in EventCell.jsx lines 1-7.

- [ ] **Step 1: Create `src/eventTypeColors.js`**

```js
export const TYPE_COLORS = {
  monarch: '#c9a227',
  war: '#c0392b',
  birth: '#2980b9',
  death: '#7f8c8d',
  other: '#888',
}
```

- [ ] **Step 2: Update the two consumers**

In `src/components/EventCell.jsx`, delete the `export const TYPE_COLORS = {...}` block (lines 1-7) and add at the top:

```js
import { TYPE_COLORS } from '../eventTypeColors'
```

In `src/components/EventPinLayer.jsx` line 2, replace `import { TYPE_COLORS } from './EventCell'` with:

```js
import { TYPE_COLORS } from '../eventTypeColors'
```

- [ ] **Step 3: Verify** — `npm run lint` no longer emits the `react(only-export-components)` warning for EventCell.jsx; `npm test` passes (10 tests); `npm run build` succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/eventTypeColors.js src/components/EventCell.jsx src/components/EventPinLayer.jsx
git commit -m "refactor: extract TYPE_COLORS to fix fast-refresh warning (B3)"
```

---

### Task 2: Wikipedia summary module (TDD)

**Files:**
- Create: `src/wikipedia.js`
- Test: `src/wikipedia.test.js`

**Interfaces:**
- Produces: `titleFromLink(url) -> string | null` and `async fetchSummary(link) -> { extract: string|null, thumbnailUrl: string|null, pageUrl: string } | null`. Module-level session cache; `_clearCache()` exported for tests only.

- [ ] **Step 1: Write the failing tests** — `src/wikipedia.test.js`:

```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { titleFromLink, fetchSummary, _clearCache } from './wikipedia'

describe('titleFromLink', () => {
  it('extracts a plain title', () => {
    expect(titleFromLink('https://en.wikipedia.org/wiki/Battle_of_Waterloo')).toBe('Battle_of_Waterloo')
  })
  it('keeps percent-encoding intact', () => {
    expect(titleFromLink('https://en.wikipedia.org/wiki/Treaty_of_K%C3%BC%C3%A7%C3%BCk_Kaynarca'))
      .toBe('Treaty_of_K%C3%BC%C3%A7%C3%BCk_Kaynarca')
  })
  it('handles parenthesized titles', () => {
    expect(titleFromLink('https://en.wikipedia.org/wiki/Battle_of_Narva_(1700)')).toBe('Battle_of_Narva_(1700)')
  })
  it('strips fragments and query strings', () => {
    expect(titleFromLink('https://en.wikipedia.org/wiki/Napoleon#Legacy')).toBe('Napoleon')
    expect(titleFromLink('https://en.wikipedia.org/wiki/Napoleon?x=1')).toBe('Napoleon')
  })
  it('returns null for non-Wikipedia or missing URLs', () => {
    expect(titleFromLink('https://example.com/wiki/Foo')).toBe(null)
    expect(titleFromLink(undefined)).toBe(null)
  })
})

describe('fetchSummary', () => {
  beforeEach(() => _clearCache())
  afterEach(() => vi.unstubAllGlobals())

  const okResponse = (body) => ({ ok: true, json: async () => body })

  it('maps the API response to extract/thumbnailUrl/pageUrl', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({
      extract: 'The Battle of Waterloo was fought on 18 June 1815.',
      thumbnail: { source: 'https://upload.wikimedia.org/thumb.jpg' },
      content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Battle_of_Waterloo' } },
    }))
    vi.stubGlobal('fetch', fetchMock)
    const s = await fetchSummary('https://en.wikipedia.org/wiki/Battle_of_Waterloo')
    expect(s).toEqual({
      extract: 'The Battle of Waterloo was fought on 18 June 1815.',
      thumbnailUrl: 'https://upload.wikimedia.org/thumb.jpg',
      pageUrl: 'https://en.wikipedia.org/wiki/Battle_of_Waterloo',
    })
    expect(fetchMock).toHaveBeenCalledWith('https://en.wikipedia.org/api/rest_v1/page/summary/Battle_of_Waterloo')
  })
  it('returns null on non-OK response and caches the failure', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404 })
    vi.stubGlobal('fetch', fetchMock)
    expect(await fetchSummary('https://en.wikipedia.org/wiki/Gone')).toBe(null)
    expect(await fetchSummary('https://en.wikipedia.org/wiki/Gone')).toBe(null)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it('returns null when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    expect(await fetchSummary('https://en.wikipedia.org/wiki/Napoleon')).toBe(null)
  })
  it('returns null for a malformed link without fetching', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect(await fetchSummary('https://example.com/nope')).toBe(null)
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it('serves the second call from cache', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ extract: 'x', content_urls: { desktop: { page: 'p' } } }))
    vi.stubGlobal('fetch', fetchMock)
    await fetchSummary('https://en.wikipedia.org/wiki/Sputnik_1')
    await fetchSummary('https://en.wikipedia.org/wiki/Sputnik_1')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run to verify failure** — `npm test` → FAIL (`src/wikipedia.js` does not exist).

- [ ] **Step 3: Implement `src/wikipedia.js`**

```js
// Fetches Wikipedia lead summaries for event links, with a session-lifetime cache.
const cache = new Map()

export function titleFromLink(url) {
  const m = /^https:\/\/en\.wikipedia\.org\/wiki\/([^#?]+)/.exec(url ?? '')
  return m ? m[1] : null
}

export async function fetchSummary(link) {
  if (cache.has(link)) return cache.get(link)
  const title = titleFromLink(link)
  if (!title) {
    cache.set(link, null)
    return null
  }
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const summary = {
      extract: data.extract || null,
      thumbnailUrl: data.thumbnail?.source ?? null,
      pageUrl: data.content_urls?.desktop?.page ?? link,
    }
    cache.set(link, summary)
    return summary
  } catch {
    cache.set(link, null)
    return null
  }
}

export function _clearCache() {
  cache.clear()
}
```

- [ ] **Step 4: Run tests** — `npm test` → all pass (10 existing + 10 new).

- [ ] **Step 5: Commit**

```bash
git add src/wikipedia.js src/wikipedia.test.js
git commit -m "feat: wikipedia summary fetcher with session cache"
```

---

### Task 3: Hover-card store (TDD)

**Files:**
- Create: `src/hoverCardStore.js`
- Test: `src/hoverCardStore.test.js`

**Interfaces:**
- Produces (all stable module functions — this is what keeps grid re-renders at zero):
  - `showCard(event, anchorRect, pinned)` — opens/replaces the card. Rule: a hover (`pinned: false`) never alters a pinned card (not even for the same event — that would silently unpin it); a click (`pinned: true`) always wins.
  - `scheduleHide()` — closes an unpinned card after the 250ms grace period; no-op when pinned.
  - `cancelHide()` — cancels a pending scheduleHide (used when the pointer enters the card).
  - `closeCard()` — closes unconditionally (Escape, outside click, card link).
  - `getCardState() -> { event, anchorRect, pinned } | null` and `subscribeCard(listener) -> unsubscribe` — `useSyncExternalStore` contract for the card component.

- [ ] **Step 1: Write the failing tests** — `src/hoverCardStore.test.js`:

```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { showCard, scheduleHide, cancelHide, closeCard, getCardState, subscribeCard } from './hoverCardStore'

const evA = { id: 'e1', title: 'A' }
const evB = { id: 'e2', title: 'B' }
const rect = { top: 0, left: 0, bottom: 20, right: 100, width: 100, height: 20 }

beforeEach(() => { vi.useFakeTimers(); closeCard() })
afterEach(() => vi.useRealTimers())

describe('hoverCardStore', () => {
  it('shows a hover card and notifies subscribers', () => {
    const listener = vi.fn()
    const unsub = subscribeCard(listener)
    showCard(evA, rect, false)
    expect(getCardState()).toEqual({ event: evA, anchorRect: rect, pinned: false })
    expect(listener).toHaveBeenCalled()
    unsub()
  })
  it('a hover never alters a pinned card', () => {
    showCard(evA, rect, true)
    showCard(evB, rect, false)
    expect(getCardState().event).toBe(evA)
    showCard(evA, rect, false)
    expect(getCardState().pinned).toBe(true)
  })
  it('a click replaces a pinned card', () => {
    showCard(evA, rect, true)
    showCard(evB, rect, true)
    expect(getCardState()).toEqual({ event: evB, anchorRect: rect, pinned: true })
  })
  it('scheduleHide closes an unpinned card after the grace period', () => {
    showCard(evA, rect, false)
    scheduleHide()
    expect(getCardState()).not.toBe(null)
    vi.advanceTimersByTime(250)
    expect(getCardState()).toBe(null)
  })
  it('cancelHide keeps the card open', () => {
    showCard(evA, rect, false)
    scheduleHide()
    cancelHide()
    vi.advanceTimersByTime(1000)
    expect(getCardState()).not.toBe(null)
  })
  it('scheduleHide is a no-op when pinned', () => {
    showCard(evA, rect, true)
    scheduleHide()
    vi.advanceTimersByTime(1000)
    expect(getCardState()).not.toBe(null)
  })
  it('closeCard always closes', () => {
    showCard(evA, rect, true)
    closeCard()
    expect(getCardState()).toBe(null)
  })
})
```

- [ ] **Step 2: Run to verify failure** — `npm test` → FAIL (module does not exist).

- [ ] **Step 3: Implement `src/hoverCardStore.js`**

```js
// Single-card state shared between all EventCells and the one EventHoverCard.
// Plain module functions so cells can import them without subscribing —
// hovering must never re-render the memoized grid body.
const HIDE_GRACE_MS = 250

let state = null // { event, anchorRect, pinned } | null
let hideTimer = null
const listeners = new Set()

function set(next) {
  state = next
  for (const fn of listeners) fn()
}

export function getCardState() {
  return state
}

export function subscribeCard(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function showCard(event, anchorRect, pinned) {
  cancelHide()
  if (state?.pinned && !pinned) return
  set({ event, anchorRect, pinned })
}

export function scheduleHide() {
  if (state?.pinned) return
  cancelHide()
  hideTimer = setTimeout(() => {
    hideTimer = null
    if (!state?.pinned) set(null)
  }, HIDE_GRACE_MS)
}

export function cancelHide() {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

export function closeCard() {
  cancelHide()
  if (state) set(null)
}
```

- [ ] **Step 4: Run tests** — `npm test` → all pass.

- [ ] **Step 5: Commit**

```bash
git add src/hoverCardStore.js src/hoverCardStore.test.js
git commit -m "feat: hover-card store with pin and grace-period rules"
```

---

### Task 4: EventHoverCard component + EventCell wiring

**Files:**
- Create: `src/components/EventHoverCard.jsx`
- Modify: `src/components/EventCell.jsx` (replace `<a>` wrapper with hover/click wiring), `src/App.jsx` (mount card), `src/index.css:16-19` (`a.event-link:hover` → `.event-cell:hover`)

**Interfaces:**
- Consumes: `getCardState`/`subscribeCard`/`showCard`/`scheduleHide`/`cancelHide`/`closeCard` from Task 3; `fetchSummary` from Task 2; `TYPE_COLORS` from Task 1.

- [ ] **Step 1: Create `src/components/EventHoverCard.jsx`**

```jsx
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
```

- [ ] **Step 2: Rewrite `src/components/EventCell.jsx`**

Full new content (replaces the `<a>` wrapper and native tooltip; hover delay 400ms):

```jsx
import { useRef, useEffect } from 'react'
import { TYPE_COLORS } from '../eventTypeColors'
import { showCard, scheduleHide } from '../hoverCardStore'

const HOVER_DELAY_MS = 400

export default function EventCell({ event }) {
  const color = TYPE_COLORS[event.type] ?? TYPE_COLORS.other
  const elRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const open = (pinned) => {
    clearTimeout(timerRef.current)
    showCard(event, elRef.current.getBoundingClientRect(), pinned)
  }

  const onMouseEnter = () => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => open(false), HOVER_DELAY_MS)
  }

  const onMouseLeave = () => {
    clearTimeout(timerRef.current)
    scheduleHide()
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      open(true)
    }
  }

  return (
    <div
      ref={elRef}
      className="event-cell"
      role="button"
      tabIndex={0}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={() => open(true)}
      onKeyDown={onKeyDown}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '5px',
        padding: '2px 6px',
        fontSize: '11.5px',
        lineHeight: '1.4',
        color: '#1a1a1a',
        cursor: 'pointer',
      }}
    >
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
        <span style={{ color: '#aaa', fontSize: '10px', marginLeft: '3px' }}>↗</span>
      </span>
    </div>
  )
}
```

- [ ] **Step 3: Update `src/index.css`** — replace the `a.event-link:hover` rule (lines 16-19) with:

```css
.event-cell:hover {
  background: rgba(0, 0, 0, 0.06);
  border-radius: 3px;
}
```

- [ ] **Step 4: Mount the card in `src/App.jsx`** — add `import EventHoverCard from './components/EventHoverCard'` and render `<EventHoverCard />` as the last child inside the root flex `<div>` (after `<CountrySidebar ... />`).

- [ ] **Step 5: Verify** — `npm run lint` (the only-export-components warning must NOT return), `npm test`, `npm run build` all pass. Dev server: hover an event ~400ms → card appears with stored description, then the Wikipedia paragraph and thumbnail; move mouse into card → stays open; click "Read on Wikipedia →" → article opens in new tab; click event → card pins; Escape and outside-click close it; with DevTools network offline the card shows the stored description only.

- [ ] **Step 6: Commit**

```bash
git add src/components/EventHoverCard.jsx src/components/EventCell.jsx src/App.jsx src/index.css
git commit -m "feat: wikipedia summary hover card with pin behavior"
```

---

### Task 5: Final verification and backlog update

- [ ] **Step 1: Full check** — `npm run lint` (zero warnings), `npm test` (all suites), `npm run build`.
- [ ] **Step 2: Drive the app in the browser** (per spec Testing): hover delay, keep-open over card, pin/unpin, link click-through, offline fallback, and confirm hovering does NOT re-render the grid body (add `console.count('GridRows render')` temporarily in GridRows, hover several events, count must not increase; remove the instrumentation after).
- [ ] **Step 3: Update `docs/BACKLOG.md`** — mark B3 as fixed in v26.4 (line stays with a "Fixed in v26.4" note or is deleted).
- [ ] **Step 4: Commit** — `git add -A && git commit -m "chore: verification pass and backlog update for hover summaries"`
