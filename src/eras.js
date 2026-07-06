// Latest era that has begun by `year`; assumes eras sorted by startYear.
export function getEraName(country, year) {
  const eras = country.eras
  if (!eras || eras.length === 0) return country.name
  for (let i = eras.length - 1; i >= 0; i--) {
    if (year >= eras[i].startYear) return eras[i].name
  }
  return country.name
}
