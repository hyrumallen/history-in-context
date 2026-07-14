import { describe, it, expect } from 'vitest'
import { project } from './projection'

describe('project', () => {
  it('maps the origin to the center of the viewBox', () => {
    expect(project(0, 0, 800, 400)).toEqual([400, 200])
  })

  it('maps the north-west corner to [0, 0]', () => {
    expect(project(-180, 90, 800, 400)).toEqual([0, 0])
  })

  it('maps the south-east corner to [width, height]', () => {
    expect(project(180, -90, 800, 400)).toEqual([800, 400])
  })

  it('scales longitude and latitude linearly', () => {
    expect(project(-90, 45, 800, 400)).toEqual([200, 100])
  })
})
