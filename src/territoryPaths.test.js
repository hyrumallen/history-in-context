import { describe, it, expect } from 'vitest'
import { multiPolygonPath } from './territoryPaths'

const W = 800
const H = 400

describe('multiPolygonPath', () => {
  it('emits a closed subpath per ring', () => {
    const square = [[[[0, 0], [10, 0], [10, -10], [0, -10], [0, 0]]]]
    const d = multiPolygonPath(square, W, H)
    expect(d.startsWith('M')).toBe(true)
    expect(d.endsWith('Z')).toBe(true)
    expect(d.match(/M/g)).toHaveLength(1)
  })

  it('emits one subpath per polygon and per hole', () => {
    const outer = [[0, 0], [10, 0], [10, -10], [0, -10], [0, 0]]
    const hole = [[2, -2], [4, -2], [4, -4], [2, -4], [2, -2]]
    const island = [[100, 0], [110, 0], [110, -10], [100, 0]]
    const d = multiPolygonPath([[outer, hole], [island]], W, H)
    expect(d.match(/M/g)).toHaveLength(3) // outer + hole + island
    expect(d.match(/Z/g)).toHaveLength(3)
  })

  it('projects coordinates through the shared projection', () => {
    const d = multiPolygonPath([[[[0, 0], [0, 0], [0, 0], [0, 0]]]], W, H)
    expect(d).toContain('400,200') // lng 0, lat 0 -> center of the 800x400 viewBox
  })

  it('returns an empty string for empty geometry', () => {
    expect(multiPolygonPath([], W, H)).toBe('')
  })
})
