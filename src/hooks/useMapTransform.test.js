import { describe, it, expect } from 'vitest'
import { centerTransform } from './useMapTransform'

const W = 800
const H = 400

describe('centerTransform', () => {
  it('is a no-op at scale 1 because the whole world is already visible', () => {
    const prev = { scale: 1, translateX: 0, translateY: 0 }
    expect(centerTransform(prev, 30, 60, W, H)).toEqual({ scale: 1, translateX: 0, translateY: 0 })
  })

  it('centers the given lng/lat when zoomed in', () => {
    const prev = { scale: 4, translateX: 0, translateY: 0 }
    // lng 0, lat 0 projects to [400, 200]; centered => translate = center - scale * point
    const t = centerTransform(prev, 0, 0, W, H)
    expect(t.scale).toBe(4)
    expect(t.translateX).toBeCloseTo(400 - 4 * 400)
    expect(t.translateY).toBeCloseTo(200 - 4 * 200)
  })

  it('keeps the result within the existing pan clamp', () => {
    const prev = { scale: 2, translateX: 0, translateY: 0 }
    const t = centerTransform(prev, -180, 90, W, H) // extreme north-west corner
    expect(t.translateX).toBeLessThanOrEqual(80)
    expect(t.translateY).toBeLessThanOrEqual(80)
  })
})
