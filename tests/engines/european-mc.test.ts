import { describe, it, expect } from 'vitest'
import { priceEuropean, type EuropeanSpec } from '../../src/engines/mc-engine'
import { blackScholes } from '../../src/numerics/analytic/black-scholes'

describe('European call: Monte Carlo + AAD vs Black-Scholes', () => {
  const spec: EuropeanSpec = {
    payoff: 'max(spot - strike, 0)',
    spot: 100,
    strike: 100,
    rate: 0.03,
    vol: 0.2,
    maturity: 1,
    paths: 200000,
    seed: 20240627,
    model: 'gbm',
  }
  const reference = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
  const result = priceEuropean(spec)

  it('matches the closed-form price', () => {
    expect(Math.abs(result.price - reference.price)).toBeLessThan(0.2)
  })

  it('AAD delta matches the closed-form delta', () => {
    expect(Math.abs(result.greeks.delta - reference.delta)).toBeLessThan(0.01)
  })

  it('AAD delta matches a finite-difference bump on the same paths', () => {
    const h = 0.05
    const up = priceEuropean({ ...spec, spot: spec.spot + h })
    const down = priceEuropean({ ...spec, spot: spec.spot - h })
    const finiteDifference = (up.price - down.price) / (2 * h)
    expect(Math.abs(result.greeks.delta - finiteDifference)).toBeLessThan(5e-3)
  })

  it('AAD vega is positive and within Monte Carlo tolerance of closed form', () => {
    expect(Math.abs(result.greeks.vega - reference.vega)).toBeLessThan(0.5)
  })
})
