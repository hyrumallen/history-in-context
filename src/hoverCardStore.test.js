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
