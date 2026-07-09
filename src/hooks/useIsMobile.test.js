import { describe, it, expect } from 'vitest'
import { isMobileWidth, isMobileViewport } from './useIsMobile'

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

describe('isMobileViewport', () => {
  it('treats a phone as mobile in portrait', () => {
    expect(isMobileViewport(390, 844)).toBe(true)
  })

  it('treats a phone as mobile in landscape too (shorter side drives it)', () => {
    // Regression: a landscape phone is ~844px wide but only ~390px tall.
    // Width-only detection wrongly flipped this to desktop and showed the map.
    expect(isMobileViewport(844, 390)).toBe(true)
  })

  it('treats tablets and desktops as non-mobile in both orientations', () => {
    expect(isMobileViewport(768, 1024)).toBe(false) // iPad portrait
    expect(isMobileViewport(1024, 768)).toBe(false) // iPad landscape
    expect(isMobileViewport(1536, 800)).toBe(false) // desktop
  })

  it('respects a custom breakpoint', () => {
    expect(isMobileViewport(700, 500, 768)).toBe(true)
    expect(isMobileViewport(900, 800, 768)).toBe(false)
  })
})
