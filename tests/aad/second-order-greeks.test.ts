import { describe, it, expect } from 'vitest'
import { priceEuropean, type EuropeanSpec } from '../../src/engines/mc-engine'
import { blackScholes } from '../../src/numerics/analytic/black-scholes'

describe('second-order Greeks via AAD', () => {
  const spec: EuropeanSpec = {
    payoff: 'max(spot - strike, 0)',
    spot: 100,
    strike: 100,
    rate: 0.03,
    vol: 0.2,
    maturity: 1,
    paths: 400000,
    seed: 7,
    model: 'gbm',
  }
  const reference = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
  const result = priceEuropean(spec)

  it('gamma matches closed form', () => {
    expect(Math.abs(result.greeks.gamma - reference.gamma)).toBeLessThan(2e-3)
  })

  it('vanna matches closed form', () => {
    expect(Math.abs(result.greeks.vanna - reference.vanna)).toBeLessThan(0.05)
  })

  it('volga matches closed form', () => {
    expect(Math.abs(result.greeks.volga - reference.volga)).toBeLessThan(3)
  })
})
