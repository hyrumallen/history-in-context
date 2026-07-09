import { useEffect } from 'react'

export function nextYear(y, max) {
  return Math.min(max, y + 1)
}

// While `playing`, advance `year` by one per `stepMs` until `max`, then call onEnd.
export function usePlayback({ playing, year, setYear, max, onEnd, stepMs = 90 }) {
  useEffect(() => {
    if (!playing) return
    if (year >= max) { onEnd?.(); return }
    const id = setTimeout(() => setYear(y => nextYear(y, max)), stepMs)
    return () => clearTimeout(id)
  }, [playing, year, setYear, max, onEnd, stepMs])
}
