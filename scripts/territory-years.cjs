// The snapshot years, chosen to match the source dataset's timestamps — they
// land on years borders actually moved (1815, 1914, 1938, 1945) rather than on
// an even interval. TerritoryLayer's nearestSnapshot() works over any year list.
const SNAPSHOT_YEARS = [
  1500, 1530, 1600, 1650, 1700, 1715, 1783, 1800, 1815,
  1880, 1900, 1914, 1920, 1930, 1938, 1945, 1960, 1994, 2000,
]

module.exports = { SNAPSHOT_YEARS }
