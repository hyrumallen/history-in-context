import { START_YEAR, END_YEAR } from './constants'

// offsets[i] = offsetTop of the row for year START_YEAR + i, measured from
// the scroll content. Rows vary in height (event rows stretch), so nothing
// may assume a fixed 28px row — this module is the single source of truth.
export function measureOffsets(container) {
  const cells = container.querySelectorAll('[data-year-row]')
  const offsets = new Array(cells.length)
  cells.forEach((el, i) => { offsets[i] = el.offsetTop })
  return offsets
}

// Year of the last row whose top is at or above scrollTop (binary search).
export function yearAtOffset(offsets, scrollTop) {
  if (!offsets || offsets.length === 0) return START_YEAR
  let lo = 0
  let hi = offsets.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (offsets[mid] <= scrollTop) lo = mid
    else hi = mid - 1
  }
  return Math.max(START_YEAR, Math.min(END_YEAR, START_YEAR + lo))
}
