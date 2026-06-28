import { describe, it, expect } from 'vitest'
import { blackScholes } from '../../src/numerics/analytic/black-scholes'
import { standardNormals } from '../../src/numerics/sampling'

describe('numerics', () => {
  it('prices an at-the-money Black-Scholes call', () => {
    const result = blackScholes({ spot: 100, strike: 100, rate: 0.05, vol: 0.2, maturity: 1, isCall: true })
    expect(result.price).toBeCloseTo(10.4506, 3)
    expect(result.delta).toBeCloseTo(0.6368, 3)
  })

  it('produces standard normals with near-zero mean and unit variance', () => {
    const count = 100000
    const draws = standardNormals(count, 42)
    let mean = 0
    for (let i = 0; i < count; i += 1) mean += draws[i]
    mean /= count
    let variance = 0
    for (let i = 0; i < count; i += 1) variance += (draws[i] - mean) ** 2
    variance /= count
    expect(Math.abs(mean)).toBeLessThan(0.02)
    expect(Math.abs(variance - 1)).toBeLessThan(0.02)
  })
})
