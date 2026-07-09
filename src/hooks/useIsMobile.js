import { useState, useEffect } from 'react'

// Pure, unit-testable breakpoint decision.
export function isMobileWidth(width, breakpoint = 640) {
  return width <= breakpoint
}

// Orientation-independent phone check: a phone's *shorter* side is small in both
// portrait and landscape, while tablets/desktops have a short side >= 640px. Using
// the shorter dimension keeps a phone in mobile mode after it rotates to landscape.
export function isMobileViewport(width, height, breakpoint = 640) {
  return isMobileWidth(Math.min(width, height), breakpoint)
}

// True when the viewport is phone-sized. Updates on resize/orientation change.
export function useIsMobile(breakpoint = 640) {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' &&
      isMobileViewport(window.innerWidth, window.innerHeight, breakpoint)
  )

  useEffect(() => {
    const onResize = () => setMobile(
      isMobileViewport(window.innerWidth, window.innerHeight, breakpoint)
    )
    onResize()
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [breakpoint])

  return mobile
}
