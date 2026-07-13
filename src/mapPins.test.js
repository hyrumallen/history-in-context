import { describe, it, expect } from 'vitest'
import { pinsInWindow, pinEmphasis, railItems } from './mapPins'

const ev = (id, year, countryId, lat = 1) => ({ id, year, countryId, lat, lng: 1 })
const sel = new Set(['a', 'b'])

describe('pinsInWindow', () => {
  const events = [
    ev('e1', 1500, 'a'), ev('e2', 1509, 'a'), ev('e3', 1510, 'a'),
    ev('e4', 1505, 'c'),            // wrong country
    { id: 'e5', year: 1503, countryId: 'a', lat: null }, // no coords
  ]
  it('keeps events in the decade of the year, for selected countries with coords', () => {
    const ids = pinsInWindow(events, 1505, sel).map(e => e.id)
    expect(ids).toEqual(['e1', 'e2']) // 1500-1509 decade; e3 is next decade; e4/e5 excluded
  })
  it('moves the window as the year crosses a decade', () => {
    expect(pinsInWindow(events, 1510, sel).map(e => e.id)).toEqual(['e3'])
  })
})

describe('pinEmphasis', () => {
  it('is full size/opacity on the exact year', () => {
    expect(pinEmphasis(1600, 1600)).toEqual({ r: 4.6, opacity: 1 })
  })
  it('shrinks and fades with distance', () => {
    const near = pinEmphasis(1601, 1600)
    const far = pinEmphasis(1609, 1600)
    expect(near.r).toBeGreaterThan(far.r)
    expect(near.opacity).toBeGreaterThan(far.opacity)
    expect(far.opacity).toBeGreaterThanOrEqual(0.5)
  })
})

describe('railItems', () => {
  const events = [
    ev('e3', 1508, 'a'), ev('e1', 1500, 'a'), ev('e2', 1500, 'b'), ev('e9', 1510, 'a'),
  ]
  it('returns decade-window events sorted by year then id, emphasis on the exact year', () => {
    const rows = railItems(events, 1500, sel)
    expect(rows.map(r => r.event.id)).toEqual(['e1', 'e2', 'e3'])
    expect(rows.map(r => r.emphasis)).toEqual([true, true, false])
  })
  it('is empty when no events fall in the decade window', () => {
    expect(railItems(events, 1520, sel)).toEqual([])
  })
})
