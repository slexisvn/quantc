import { describe, it, expect } from 'vitest'
import { sviImpliedVol, totalVariance, type SviParams } from '../../src/marketdata/svi'
import { repairCalendarArbitrage, type SviSlice } from '../../src/marketdata/svi-repair'

const logMoneyness = [-0.3, -0.15, 0, 0.15, 0.3]
const kGrid = Array.from({ length: 21 }, (_, i) => -0.5 + (i * 1) / 20)

function slice(maturity: number, params: SviParams): SviSlice {
  return { maturity, logMoneyness, vols: logMoneyness.map((k) => sviImpliedVol(params, k, maturity)), params }
}

const options = { kGrid, penaltyWeight: 1000, margin: 1e-4, maxIterations: 200 }

describe('SVI calendar-arbitrage repair', () => {
  it('restores monotone total variance for two crossing slices', () => {
    const near = slice(0.5, { a: 0.05, b: 0.1, rho: -0.3, m: 0, sigma: 0.2 })
    const far = slice(1, { a: 0.02, b: 0.1, rho: -0.3, m: 0, sigma: 0.2 })
    const result = repairCalendarArbitrage([near, far], options)
    expect(result.maxViolationBefore).toBeGreaterThan(0)
    expect(result.maxViolationAfter).toBeLessThan(1e-6)
    for (const k of kGrid) expect(totalVariance(result.slices[1].params, k) + 1e-9).toBeGreaterThanOrEqual(totalVariance(result.slices[0].params, k))
  })

  it('leaves an already arbitrage-free surface essentially unchanged', () => {
    const near = slice(0.5, { a: 0.02, b: 0.1, rho: -0.2, m: 0, sigma: 0.2 })
    const far = slice(1, { a: 0.05, b: 0.1, rho: -0.2, m: 0, sigma: 0.2 })
    const result = repairCalendarArbitrage([near, far], options)
    expect(result.maxViolationBefore).toBeLessThan(1e-9)
    for (const k of kGrid) {
      expect(Math.abs(sviImpliedVol(result.slices[1].params, k, 1) - sviImpliedVol(far.params, k, 1))).toBeLessThan(1e-6)
    }
  })
})
