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
