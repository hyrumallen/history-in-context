import { describe, it, expect } from 'vitest'
import { rulerAt } from './rulers'

const rl = (countryId, name, startYear, endYear) => ({ countryId, name, startYear, endYear })

const rulers = [
  rl('a', 'First', 1500, 1520),
  rl('a', 'Second', 1520, 1540),
  rl('a', 'Fourth', 1560, 1580), // gap 1540–1560
  rl('b', 'Other', 1500, 1600),
]

describe('rulerAt', () => {
  it('returns the ruler whose reign contains the year', () => {
    expect(rulerAt(rulers, 'a', 1510).name).toBe('First')
  })
  it('returns the incoming ruler on a shared hand-off year', () => {
    expect(rulerAt(rulers, 'a', 1520).name).toBe('Second')
  })
  it('returns null for a gap year with no reigning ruler', () => {
    expect(rulerAt(rulers, 'a', 1550)).toBeNull()
  })
  it('filters by country', () => {
    expect(rulerAt(rulers, 'b', 1550).name).toBe('Other')
  })
})
