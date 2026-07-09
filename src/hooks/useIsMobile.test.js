import { describe, it, expect } from 'vitest'
import { isMobileWidth } from './useIsMobile'

describe('isMobileWidth', () => {
  it('is true at or below the default 640px breakpoint', () => {
    expect(isMobileWidth(390)).toBe(true)
    expect(isMobileWidth(640)).toBe(true)
  })

  it('is false above the breakpoint', () => {
    expect(isMobileWidth(641)).toBe(false)
    expect(isMobileWidth(1140)).toBe(false)
  })

  it('respects a custom breakpoint', () => {
    expect(isMobileWidth(700, 768)).toBe(true)
    expect(isMobileWidth(800, 768)).toBe(false)
  })
})
