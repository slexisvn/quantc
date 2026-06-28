import { describe, it, expect } from 'vitest'
import { riskParity, riskContributions, hierarchicalRiskParity, blackLitterman, constrainedMeanVariance } from '../../src/alpha/allocation'
import type { Matrix } from '../../src/alpha/types'

describe('advanced portfolio construction', () => {
  it('risk parity equalizes risk contributions', () => {
    const cov: Matrix = [[0.04, 0], [0, 0.01]]
    const w = riskParity(cov)
    const rc = riskContributions(cov, w)
    expect(rc[0]).toBeCloseTo(0.5, 4)
    expect(rc[1]).toBeCloseTo(0.5, 4)
  })

  it('HRP weights are positive and sum to one', () => {
    const cov: Matrix = [[0.04, 0.01, 0.0], [0.01, 0.09, 0.02], [0.0, 0.02, 0.16]]
    const w = hierarchicalRiskParity(cov)
    expect(w.reduce((s, x) => s + x, 0)).toBeCloseTo(1, 9)
    for (const x of w) expect(x).toBeGreaterThan(0)
  })

  it('Black-Litterman with no views returns the market portfolio', () => {
    const cov: Matrix = [[0.04, 0.01], [0.01, 0.09]]
    const market = [0.6, 0.4]
    const result = blackLitterman(cov, market)
    expect(result.weights).toEqual(market)
  })

  it('Black-Litterman tilts toward an out-performance view', () => {
    const cov: Matrix = [[0.04, 0.01], [0.01, 0.09]]
    const market = [0.5, 0.5]
    const base = blackLitterman(cov, market).expectedReturns
    const tilted = blackLitterman(cov, market, 2.5, 0.05, { pick: [[1, -1]], views: [0.05] }).expectedReturns
    expect(tilted[0]).toBeGreaterThan(base[0])
    expect(tilted[1]).toBeLessThan(base[1])
  })

  it('constrained mean-variance respects long-only and leverage', () => {
    const w = constrainedMeanVariance([0.1, 0.04], [[0.04, 0], [0, 0.04]], { longOnly: true, maxLeverage: 1 })
    for (const x of w) expect(x).toBeGreaterThanOrEqual(-1e-6)
    expect(w.reduce((s, x) => s + Math.abs(x), 0)).toBeCloseTo(1, 1)
    expect(w[0]).toBeGreaterThan(w[1])
  })
})
