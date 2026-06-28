import { describe, it, expect } from 'vitest'
import { ssviTotalVariance, ssviImpliedVol, calendarArbitrageFree, type SsviParams } from '../../src/marketdata/ssvi'
import { differentialEvolution } from '../../src/numerics/optimization/differential-evolution'

describe('differential evolution', () => {
  it('finds the global minimum of the Rastrigin function', () => {
    const rastrigin = (x: number[]): number => 10 * x.length + x.reduce((acc, xi) => acc + xi * xi - 10 * Math.cos(2 * Math.PI * xi), 0)
    const result = differentialEvolution(rastrigin, [-5.12, -5.12], [5.12, 5.12], { seed: 3 })
    expect(result.value).toBeLessThan(1e-3)
    for (const coordinate of result.point) expect(Math.abs(coordinate)).toBeLessThan(0.05)
  })
})

describe('SSVI surface', () => {
  const truth: SsviParams = { rho: -0.3, eta: 0.5, gamma: 0.4 }

  it('reproduces the ATM total variance and is calendar-arbitrage-free', () => {
    expect(ssviTotalVariance(0, 0.04, truth)).toBeCloseTo(0.04, 12)
    const kGrid = [-0.4, -0.2, 0, 0.2, 0.4]
    expect(calendarArbitrageFree(kGrid, 0.04, 0.08, truth)).toBe(true)
  })

  it('jointly calibrates to a synthetic two-expiry surface', () => {
    const expiries = [{ maturity: 0.5, atmVariance: 0.02 }, { maturity: 1, atmVariance: 0.045 }]
    const strikes = [-0.3, -0.15, 0, 0.15, 0.3]
    const quotes = expiries.flatMap((expiry) => strikes.map((k) => ({ maturity: expiry.maturity, atmVariance: expiry.atmVariance, k, vol: ssviImpliedVol(k, expiry.maturity, expiry.atmVariance, truth) })))

    const objective = (p: number[]): number => {
      const params: SsviParams = { rho: p[0], eta: p[1], gamma: p[2] }
      let error = 0
      for (const quote of quotes) {
        const diff = ssviImpliedVol(quote.k, quote.maturity, quote.atmVariance, params) - quote.vol
        error += diff * diff
      }
      return error
    }
    const result = differentialEvolution(objective, [-0.9, 0.05, 0.05], [0.9, 1.5, 0.9], { seed: 7, generations: 400 })
    expect(result.value).toBeLessThan(1e-6)
    expect(result.point[0]).toBeCloseTo(truth.rho, 2)
  })
})
