// Pins shown on the map for a given year: the decade window around it, with
// per-pin emphasis that peaks on the exact year.
export function pinsInWindow(events, year, selectedIds) {
  const start = Math.floor(year / 10) * 10
  const end = start + 9
  return events.filter(e =>
    e.lat != null && e.year >= start && e.year <= end && selectedIds.has(e.countryId)
  )
}

export function pinEmphasis(eventYear, year) {
  const t = Math.min(1, Math.abs(eventYear - year) / 9)
  return { r: 4.6 - 1.8 * t, opacity: 1 - 0.5 * t }
}

// Rows for the event rail: the same decade-window pins, sorted for reading,
// each flagged with whether it lands on the exact current year (emphasis).
export function railItems(events, year, selectedIds) {
  return pinsInWindow(events, year, selectedIds)
    .slice()
    .sort((a, b) => a.year - b.year || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map(event => ({ event, emphasis: event.year === year }))
}
