import { describe, it, expect } from 'vitest'
import { lighten, reignShade, reignIndexAt } from './reignShades'

const country = { mapColor: '#7d97b1', mapStroke: '#5a7690' }
const reigns = [
  { name: 'A', startYear: 1700, endYear: 1710 },
  { name: 'B', startYear: 1710, endYear: 1720 },
]

describe('lighten', () => {
  it('mixes toward white', () => {
    expect(lighten('#000000', 0.5)).toBe('rgb(128, 128, 128)')
    expect(lighten('#ffffff', 0.4)).toBe('rgb(255, 255, 255)')
  })
})

describe('reignShade', () => {
  it('alternates dark then light', () => {
    expect(reignShade(0, country)).toBe('#7d97b1')
    expect(reignShade(1, country)).toBe(lighten('#7d97b1', 0.4))
  })
})

describe('reignIndexAt', () => {
  it('finds the reign covering a year; newer wins on shared boundary', () => {
    expect(reignIndexAt(reigns, 1705)).toBe(0)
    expect(reignIndexAt(reigns, 1710)).toBe(1)
  })
  it('returns -1 outside all reigns', () => {
    expect(reignIndexAt(reigns, 1650)).toBe(-1)
    expect(reignIndexAt(reigns, 1750)).toBe(-1)
  })
})
