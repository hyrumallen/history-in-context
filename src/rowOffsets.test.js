import { describe, it, expect } from 'vitest'
import { yearAtOffset } from './rowOffsets'
import { START_YEAR, END_YEAR } from './constants'

describe('yearAtOffset', () => {
  const uniform = Array.from({ length: 501 }, (_, i) => i * 28)

  it('returns START_YEAR at the top', () => {
    expect(yearAtOffset(uniform, 0)).toBe(START_YEAR)
  })
  it('returns the year of the last row starting at or above scrollTop', () => {
    expect(yearAtOffset(uniform, 28)).toBe(START_YEAR + 1)
    expect(yearAtOffset(uniform, 55)).toBe(START_YEAR + 1)
    expect(yearAtOffset(uniform, 56)).toBe(START_YEAR + 2)
  })
  it('handles variable row heights (the B1 case)', () => {
    // year 0 row is 28px, year 1 row is 100px tall (events), year 2 starts at 128
    const uneven = [0, 28, 128, 156]
    expect(yearAtOffset(uneven, 127)).toBe(START_YEAR + 1)
    expect(yearAtOffset(uneven, 128)).toBe(START_YEAR + 2)
  })
  it('clamps below and above', () => {
    expect(yearAtOffset(uniform, -50)).toBe(START_YEAR)
    expect(yearAtOffset(uniform, 1e9)).toBe(END_YEAR)
  })
  it('is safe on empty input', () => {
    expect(yearAtOffset([], 100)).toBe(START_YEAR)
    expect(yearAtOffset(undefined, 100)).toBe(START_YEAR)
  })
})
