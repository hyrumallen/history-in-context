// Equirectangular projection onto a fixed lng/lat plane. The map SVG uses an
// 800x400 viewBox, so width/height are passed in rather than hard-coded.
export function project(lng, lat, width, height) {
  return [(lng + 180) * (width / 360), (90 - lat) * (height / 180)]
}
