import { describe, it, expect } from 'vitest'
import { getEraName } from './eras'

const germany = {
  id: 'holy-roman-empire',
  name: 'Holy Roman Empire',
  eras: [
    { name: 'Holy Roman Empire', startYear: 1500, endYear: 1806 },
    { name: 'German Confederation', startYear: 1815, endYear: 1871 },
    { name: 'German Empire', startYear: 1871, endYear: 1918 },
  ],
}

describe('getEraName', () => {
  it('returns country.name when there are no eras', () => {
    expect(getEraName({ name: 'Japan' }, 1600)).toBe('Japan')
  })
  it('returns the era containing the year', () => {
    expect(getEraName(germany, 1750)).toBe('Holy Roman Empire')
    expect(getEraName(germany, 1850)).toBe('German Confederation')
  })
  it('returns the most recent begun era during gap years', () => {
    expect(getEraName(germany, 1810)).toBe('Holy Roman Empire')
  })
  it('on a shared boundary year the newer era wins', () => {
    expect(getEraName(germany, 1871)).toBe('German Empire')
  })
  it('falls back to country.name before the first era', () => {
    expect(getEraName(germany, 1400)).toBe('Holy Roman Empire')
  })
})
