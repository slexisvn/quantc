import { describe, it, expect } from 'vitest'
import { generateBlackScholesTrainingSet, fitDifferentialRidge, type DmlSpec } from '../../src/proxy/differential-ml'
import { polynomialBasis } from '../../src/numerics/basis'
import { blackScholes } from '../../src/numerics/analytic/black-scholes'

const spec: DmlSpec = {
  strike: 100,
  rate: 0.02,
  vol: 0.2,
  maturity: 1,
  isCall: true,
  samples: 12000,
  spotMin: 60,
  spotMax: 140,
  seed: 3141,
}

describe('differential machine learning', () => {
  const training = generateBlackScholesTrainingSet(spec)
  const basis = polynomialBasis(5)
  const differential = fitDifferentialRidge(training, basis, 1, 1e-3)
  const valueOnly = fitDifferentialRidge(training, basis, 0, 1e-3)
  const grid = [90, 95, 100, 105, 110]

  it('reproduces the Black-Scholes price and delta across a spot grid', () => {
    for (const spot of grid) {
      const bs = blackScholes({ spot, strike: spec.strike, rate: spec.rate, vol: spec.vol, maturity: spec.maturity, isCall: true })
      expect(differential.price(spot)).toBeCloseTo(bs.price, 0)
      expect(Math.abs(differential.delta(spot) - bs.delta)).toBeLessThan(0.05)
    }
  })

  it('fits the delta more accurately than a value-only ridge with the same basis and penalty', () => {
    const maxError = (proxy: { delta(s: number): number }): number => {
      let worst = 0
      for (const spot of grid) {
        const bs = blackScholes({ spot, strike: spec.strike, rate: spec.rate, vol: spec.vol, maturity: spec.maturity, isCall: true })
        worst = Math.max(worst, Math.abs(proxy.delta(spot) - bs.delta))
      }
      return worst
    }
    expect(maxError(differential)).toBeLessThan(maxError(valueOnly))
  })
})
