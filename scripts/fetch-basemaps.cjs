// Downloads the historical-basemaps source GeoJSON into a gitignored cache.
// Source: https://github.com/aourednik/historical-basemaps (GPL-3.0)
// The ~30MB of source never enters the repo; only the generated
// src/data/territories.json is committed.
const fs = require('fs')
const path = require('path')
const { SNAPSHOT_YEARS } = require('./territory-years.cjs')

const CACHE = path.join(__dirname, '..', '.cache', 'basemaps')
const BASE = 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson'

async function main() {
  fs.mkdirSync(CACHE, { recursive: true })
  for (const year of SNAPSHOT_YEARS) {
    const dest = path.join(CACHE, `world_${year}.geojson`)
    if (fs.existsSync(dest)) {
      console.log(`have  world_${year}.geojson`)
      continue
    }
    const res = await fetch(`${BASE}/world_${year}.geojson`)
    if (!res.ok) throw new Error(`world_${year}.geojson -> HTTP ${res.status}`)
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
    console.log(`fetch world_${year}.geojson`)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
