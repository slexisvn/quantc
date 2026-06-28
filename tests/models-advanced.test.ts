import { describe, it, expect } from 'vitest'
import { cirSurvival } from '../src/models/credit/cir'
import { defaultProbability, creditSpread } from '../src/models/credit/merton-structural'
import { g2ppBondToday, g2ppPayerSwaptionMc, g2ppPayerSwaption, type G2ppSpec, type SwaptionTerms } from '../src/models/rates/g2pp'
import { priceHybridCall } from '../src/models/equity/hybrid'
import { priceRoughBergomiCall } from '../src/models/equity/rough-bergomi'
import { priceStochasticLocalVolCall } from '../src/models/equity/slv'
import { blackScholes } from '../src/numerics/analytic/black-scholes'

describe('CIR++ intensity', () => {
  it('survival is in (0,1) and decreasing', () => {
    const spec = { initialIntensity: 0.02, meanReversion: 0.3, longIntensity: 0.03, vol: 0.1 }
    let previous = 1
    for (const t of [1, 2, 5, 10]) {
      const survival = cirSurvival(spec, t)
      expect(survival).toBeGreaterThan(0)
      expect(survival).toBeLessThan(previous)
      previous = survival
    }
  })
})

describe('Merton structural credit', () => {
  it('credit spread is positive and rises with leverage and asset vol', () => {
    const base = { firmValue: 120, debt: 100, rate: 0.02, assetVol: 0.2, maturity: 5 }
    expect(creditSpread(base)).toBeGreaterThan(0)
    expect(defaultProbability(base)).toBeGreaterThan(0)
    expect(creditSpread({ ...base, debt: 110 })).toBeGreaterThan(creditSpread(base))
    expect(creditSpread({ ...base, assetVol: 0.3 })).toBeGreaterThan(creditSpread(base))
  })
})

describe('G2++ two-factor short rate', () => {
  const spec: G2ppSpec = { flatRate: 0.03, meanReversionA: 0.5, meanReversionB: 0.1, volA: 0.01, volB: 0.008, correlation: -0.7 }
  it('bond prices decrease with maturity and carry a positive convexity adjustment', () => {
    expect(g2ppBondToday(spec, 5)).toBeLessThan(g2ppBondToday(spec, 2))
    expect(g2ppBondToday(spec, 5)).toBeGreaterThan(Math.exp(-0.03 * 5))
  })
  it('a payer swaption is positive and the second factor changes its value', () => {
    const terms: SwaptionTerms = { expiry: 1, times: [2, 3, 4, 5], accruals: [1, 1, 1, 1], fixedRate: 0.03 }
    const twoFactor = g2ppPayerSwaptionMc(spec, terms, 50, 60000, 11)
    const oneFactor = g2ppPayerSwaptionMc({ ...spec, volB: 0 }, terms, 50, 60000, 11)
    expect(twoFactor).toBeGreaterThan(0)
    expect(Math.abs(twoFactor - oneFactor)).toBeGreaterThan(1e-4)
  })
  it('the Brigo-Mercurio analytic swaption matches the Monte Carlo within its error', () => {
    const terms: SwaptionTerms = { expiry: 1, times: [2, 3, 4, 5], accruals: [1, 1, 1, 1], fixedRate: 0.03 }
    const analytic = g2ppPayerSwaption(spec, terms, 200)
    const mc = g2ppPayerSwaptionMc(spec, terms, 100, 400000, 23)
    expect(Math.abs(analytic - mc)).toBeLessThan(5e-4)
  })
})

describe('hybrid equity-rates (BS-Hull-White)', () => {
  it('reduces to Black-Scholes when the rate vol vanishes', () => {
    const result = priceHybridCall({
      spot: 100, strike: 100, equityVol: 0.2, maturity: 1,
      shortRate: 0.03, rateMeanReversion: 0.1, rateLong: 0.03, rateVol: 0, correlation: 0,
      steps: 100, paths: 100000, seed: 5,
    })
    const reference = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
    expect(Math.abs(result.price - reference.price)).toBeLessThan(0.1)
  })
})

describe('rough Bergomi', () => {
  it('reduces to Black-Scholes when vol-of-vol vanishes', () => {
    const result = priceRoughBergomiCall({
      spot: 100, strike: 100, rate: 0.03, maturity: 1,
      forwardVariance: 0.04, hurst: 0.1, volOfVol: 0, correlation: -0.7, steps: 100, paths: 100000, seed: 6,
    })
    const reference = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
    expect(Math.abs(result.price - reference.price)).toBeLessThan(0.1)
  })
})

describe('stochastic-local volatility', () => {
  it('constant leverage with no vol-of-vol reduces to Black-Scholes', () => {
    const result = priceStochasticLocalVolCall(
      { spot: 100, strike: 100, rate: 0.03, maturity: 1, initialVariance: 0.04, meanReversion: 1, longVariance: 0.04, volOfVol: 0, correlation: 0, steps: 100, paths: 100000, seed: 7 },
      () => 1.5,
    )
    const reference = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 1.5 * 0.2, maturity: 1, isCall: true })
    expect(Math.abs(result.price - reference.price)).toBeLessThan(0.15)
  })

  it('a spot-dependent leverage changes the price', () => {
    const spec = { spot: 100, strike: 100, rate: 0.03, maturity: 1, initialVariance: 0.04, meanReversion: 1, longVariance: 0.04, volOfVol: 0.5, correlation: -0.5, steps: 100, paths: 80000, seed: 8 } as const
    const flat = priceStochasticLocalVolCall(spec, () => 1)
    const skewed = priceStochasticLocalVolCall(spec, (spot) => 1 + 0.5 * (100 - spot) / 100)
    expect(Math.abs(flat.price - skewed.price)).toBeGreaterThan(1e-2)
  })
})
