// Ribbon shade helpers. Reigns alternate the country's mapColor and a
// lightened variant; index parity is computed over the full sorted reign
// list so a filtered subset (e.g. labeled reigns) keeps the same shades.
export function lighten(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const mix = c => Math.round(c + (255 - c) * amt)
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`
}

export function reignShade(reignIndex, country) {
  return reignIndex % 2 === 0 ? country.mapColor : lighten(country.mapColor, 0.4)
}

// Index of the reign covering `year` in a startYear-sorted list; on a shared
// transition year the incoming (later) reign wins. -1 if none.
export function reignIndexAt(reigns, year) {
  for (let i = reigns.length - 1; i >= 0; i--) {
    if (year >= reigns[i].startYear && year <= reigns[i].endYear) return i
  }
  return -1
}
