import { describe, it, expect } from 'vitest'
import { nextYear } from './usePlayback'

describe('nextYear', () => {
  it('advances by one year', () => {
    expect(nextYear(1600, 2000)).toBe(1601)
  })
  it('never exceeds max', () => {
    expect(nextYear(2000, 2000)).toBe(2000)
    expect(nextYear(1999, 2000)).toBe(2000)
  })
})
