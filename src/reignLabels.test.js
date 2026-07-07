import { describe, it, expect } from 'vitest'
import { labeledReigns } from './reignLabels'

describe('labeledReigns', () => {
  const reigns = [
    { name: 'Anne', startYear: 1702, endYear: 1714 },
    { name: 'Edward VIII', startYear: 1936, endYear: 1936 },
    { name: 'FourYears', startYear: 1720, endYear: 1723 },
    { name: 'ThreeYears', startYear: 1724, endYear: 1726 },
  ]
  it('keeps reigns spanning >= 4 calendar years', () => {
    const names = labeledReigns(reigns).map(r => r.name)
    expect(names).toContain('Anne')
    expect(names).toContain('FourYears')     // 1720-1723 inclusive = 4 years
    expect(names).not.toContain('ThreeYears') // 1724-1726 inclusive = 3 years
    expect(names).not.toContain('Edward VIII')
  })
  it('preserves the original reign index for shade parity', () => {
    const four = labeledReigns(reigns).find(r => r.name === 'FourYears')
    expect(four.reignIndex).toBe(2)
  })
})
