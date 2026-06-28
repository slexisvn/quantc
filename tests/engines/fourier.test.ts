import { describe, it, expect } from 'vitest'
import { blackScholesCf, hestonCf, mertonCf } from '../../src/analytics/characteristic'
import { cosEuropeanPrice } from '../../src/analytics/cos-method'
import { blackScholes } from '../../src/numerics/analytic/black-scholes'
import { priceHestonCall } from '../../src/models/equity/heston'
import { priceMertonCall } from '../../src/models/equity/merton'

describe('COS method pricing from characteristic functions', () => {
  it('matches Black-Scholes exactly for the BS characteristic function', () => {
    const model = blackScholesCf(0.03, 0.2, 1)
    const cos = cosEuropeanPrice(model, 100, 100, 0.03, 1, true)
    const reference = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
    expect(cos).toBeCloseTo(reference.price, 6)
  })

  it('satisfies put-call parity', () => {
    const model = blackScholesCf(0.03, 0.25, 0.75)
    const call = cosEuropeanPrice(model, 100, 110, 0.03, 0.75, true)
    const put = cosEuropeanPrice(model, 100, 110, 0.03, 0.75, false)
    expect(call - put).toBeCloseTo(100 - 110 * Math.exp(-0.03 * 0.75), 6)
  })

  it('matches a Heston Monte Carlo within statistical error', () => {
    const params = { initialVariance: 0.04, meanReversion: 1.5, longVariance: 0.04, volOfVol: 0.3, correlation: -0.6 }
    const cos = cosEuropeanPrice(hestonCf(0.03, 1, params), 100, 100, 0.03, 1, true)
    const mc = priceHestonCall({ spot: 100, strike: 100, rate: 0.03, maturity: 1, ...params, steps: 200, paths: 200000, seed: 13 })
    expect(Math.abs(cos - mc.price)).toBeLessThan(3 * mc.standardError + 0.05)
  })

  it('matches a Merton jump-diffusion Monte Carlo within statistical error', () => {
    const jumps = { vol: 0.2, jumpIntensity: 0.5, jumpMean: -0.1, jumpVol: 0.15 }
    const cos = cosEuropeanPrice(mertonCf(0.03, 1, jumps), 100, 100, 0.03, 1, true)
    const mc = priceMertonCall({ spot: 100, strike: 100, rate: 0.03, maturity: 1, ...jumps, paths: 400000, seed: 23 })
    expect(Math.abs(cos - mc.price)).toBeLessThan(3 * mc.standardError + 0.05)
  })
})
