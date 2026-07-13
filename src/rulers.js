// The ruler reigning over a country in a given year, or null if none (gap
// years like partitions or interregna). On a shared hand-off year (one reign's
// endYear == the next reign's startYear) the incoming ruler wins, matching how
// accession events read.
export function rulerAt(rulers, countryId, year) {
  let best = null
  for (const r of rulers) {
    if (r.countryId !== countryId) continue
    if (year < r.startYear || year > r.endYear) continue
    if (!best || r.startYear > best.startYear) best = r
  }
  return best
}
