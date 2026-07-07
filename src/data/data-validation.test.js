import { describe, it, expect } from 'vitest'
import countries from './countries.json'
import rulers from './rulers.json'
import events from './events.json'
import territories from './territories.json'
import { START_YEAR, END_YEAR } from '../constants'

const countryIds = new Set(countries.map(c => c.id))
const EVENT_TYPES = new Set(['monarch', 'other', 'war', 'death', 'birth', 'exploration'])

describe('rulers.json', () => {
  it('has valid entries', () => {
    const seen = new Set()
    for (const r of rulers) {
      expect(seen.has(r.id), `duplicate id ${r.id}`).toBe(false)
      seen.add(r.id)
      expect(countryIds.has(r.countryId), `bad countryId ${r.countryId}`).toBe(true)
      expect(r.name).toBeTruthy()
      expect(r.startYear).toBeLessThanOrEqual(r.endYear)
      expect(r.endYear).toBeLessThanOrEqual(END_YEAR)
    }
  })
  it('reigns per country do not overlap by more than a transition year', () => {
    const byCountry = {}
    for (const r of rulers) (byCountry[r.countryId] ??= []).push(r)
    for (const list of Object.values(byCountry)) {
      list.sort((a, b) => a.startYear - b.startYear)
      for (let i = 1; i < list.length; i++) {
        expect(list[i].startYear, `${list[i].name} overlaps ${list[i - 1].name}`)
          .toBeGreaterThanOrEqual(list[i - 1].endYear)
      }
    }
  })
})

describe('events.json', () => {
  it('has valid entries', () => {
    const seen = new Set()
    for (const e of events) {
      expect(seen.has(e.id), `duplicate id ${e.id}`).toBe(false)
      seen.add(e.id)
      expect(countryIds.has(e.countryId), `bad countryId ${e.countryId}`).toBe(true)
      expect(e.year).toBeGreaterThanOrEqual(START_YEAR)
      expect(e.year).toBeLessThanOrEqual(END_YEAR)
      expect(EVENT_TYPES.has(e.type), `bad type ${e.type} on ${e.id}`).toBe(true)
      expect(e.title).toBeTruthy()
      expect(e.description).toBeTruthy()
      expect(e.link).toMatch(/^https:\/\//)
    }
  })
})

describe('countries.json eras', () => {
  it('eras are sorted, non-overlapping, within range', () => {
    for (const c of countries) {
      if (!c.eras) continue
      expect(c.eras.length).toBeGreaterThan(0)
      expect(c.eras[0].startYear).toBe(START_YEAR)
      expect(c.eras[c.eras.length - 1].endYear).toBe(END_YEAR)
      for (let i = 0; i < c.eras.length; i++) {
        const era = c.eras[i]
        expect(era.name).toBeTruthy()
        expect(era.startYear).toBeLessThanOrEqual(era.endYear)
        if (i > 0) expect(era.startYear).toBeGreaterThanOrEqual(c.eras[i - 1].endYear)
      }
    }
  })
})

describe('territories.json', () => {
  it('snapshots have valid coords', () => {
    for (const snap of territories) {
      expect(snap.year).toBeGreaterThanOrEqual(START_YEAR)
      expect(snap.year).toBeLessThanOrEqual(END_YEAR)
      for (const t of snap.territories) {
        expect(countryIds.has(t.countryId), `bad countryId ${t.countryId} in ${snap.year}`).toBe(true)
        for (const p of t.polygons) {
          expect(p.coords.length).toBeGreaterThanOrEqual(4)
          for (const [lng, lat] of p.coords) {
            expect(lng).toBeGreaterThanOrEqual(-180); expect(lng).toBeLessThanOrEqual(180)
            expect(lat).toBeGreaterThanOrEqual(-90); expect(lat).toBeLessThanOrEqual(90)
          }
        }
      }
    }
  })
})
