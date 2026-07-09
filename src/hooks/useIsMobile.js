import { useState, useEffect } from 'react'

// Pure, unit-testable breakpoint decision.
export function isMobileWidth(width, breakpoint = 640) {
  return width <= breakpoint
}

// True when the viewport is phone-width. Updates on resize/orientation change.
export function useIsMobile(breakpoint = 640) {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && isMobileWidth(window.innerWidth, breakpoint)
  )

  useEffect(() => {
    const onResize = () => setMobile(isMobileWidth(window.innerWidth, breakpoint))
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])

  return mobile
}
