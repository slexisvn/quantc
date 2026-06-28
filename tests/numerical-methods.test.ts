import { describe, it, expect } from 'vitest'
import { mlmcAsian, plainEulerAsian, asianLevel, type MlmcMarket } from '../src/numerics/mlmc'
import { importanceSampledCall } from '../src/numerics/variance-reduction/importance-sampling'
import { plainPayoffs } from '../src/engines/european-samples'
import { plainEstimate } from '../src/numerics/variance-reduction/estimators'
import { qmcEuropeanCall, qmcAsianCall } from '../src/engines/qmc-engine'
import { blackScholes } from '../src/numerics/analytic/black-scholes'

describe('multilevel Monte Carlo', () => {
  const market: MlmcMarket = { spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1 }

  it('agrees with a fine plain-Euler Asian estimate at lower cost', () => {
    const levels = 6
    const pathsPerLevel = [40000, 20000, 10000, 5000, 3000, 2000, 1500]
    const mlmc = mlmcAsian(market, levels, pathsPerLevel, 2024)
    const reference = plainEulerAsian(market, 2 ** levels, 200000, 7)
    expect(Math.abs(mlmc - reference)).toBeLessThan(0.1)
  })

  it('level correction variances decay with level', () => {
    const coarse = asianLevel(market, 1, 40000, 1).variance
    const fine = asianLevel(market, 4, 40000, 1).variance
    expect(fine).toBeLessThan(coarse)
  })
})

describe('importance sampling', () => {
  it('prices a deep-OTM call with far lower variance than plain Monte Carlo', () => {
    const market = { spot: 100, strike: 160, rate: 0.03, vol: 0.2, maturity: 1, paths: 100000, seed: 5, drift: 2.2 }
    const is = importanceSampledCall(market)
    const reference = blackScholes({ spot: 100, strike: 160, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
    const plain = plainEstimate(plainPayoffs({ spot: 100, strike: 160, rate: 0.03, vol: 0.2, maturity: 1, paths: 100000, seed: 5 }))
    expect(Math.abs(is.price - reference.price)).toBeLessThan(0.05)
    expect(is.standardError).toBeLessThan(plain.standardError)
  })
})

describe('quasi-Monte Carlo (Sobol + Brownian bridge)', () => {
  it('prices a European call accurately with few points', () => {
    const reference = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
    const qmc = qmcEuropeanCall({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1 }, 16384)
    expect(Math.abs(qmc - reference.price)).toBeLessThan(0.02)
  })

  it('prices an Asian call within a tight band', () => {
    const qmc = qmcAsianCall({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1 }, 8, 8192)
    const vanilla = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true }).price
    expect(qmc).toBeGreaterThan(0)
    expect(qmc).toBeLessThan(vanilla)
  })
})
