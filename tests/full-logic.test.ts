import { describe, it, expect } from 'vitest'
import { normalCdf } from '../src/numerics/analytic/black-scholes'
import { priceHestonCallQe } from '../src/models/equity/heston-qe'
import { priceHestonCall } from '../src/models/equity/heston'
import { hestonCf } from '../src/analytics/characteristic'
import { cosEuropeanPrice } from '../src/analytics/cos-method'
import { DiscountCurve } from '../src/marketdata/curve'
import { hullWhitePayerSwaption, hullWhitePayerSwaptionMc, hullWhiteBond, type HullWhiteSpec, type HullWhiteSwaption } from '../src/models/rates/hull-white-1f'
import { calibrateAndPriceSlvCall, type SlvCalibrationSpec } from '../src/models/equity/slv-calibration'
import { blackScholes } from '../src/numerics/analytic/black-scholes'
import { lmmCaplet, lmmSwaption, blackCapletPrice, type LmmMultiSpec } from '../src/models/rates/lmm-multifactor'
import { priceRoughBergomiCall } from '../src/models/equity/rough-bergomi'
import { impliedVolatility } from '../src/engines/calibration'
import { fullPathGradient, checkpointedPathGradient, pathAverage, type LocalVolMarket } from '../src/aad/checkpoint-path'
import { MersenneTwister } from '../src/numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../src/numerics/rng/inverse-normal-cdf'

describe('high-precision cumulative normal', () => {
  it('matches reference values to machine precision', () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 15)
    expect(normalCdf(1.959963984540054)).toBeCloseTo(0.975, 12)
    expect(normalCdf(-3)).toBeCloseTo(0.0013498980316300935, 14)
    expect(normalCdf(3)).toBeCloseTo(0.9986501019683699, 14)
  })
})

describe('Heston QE scheme (Andersen 2008)', () => {
  const params = { initialVariance: 0.04, meanReversion: 1.5, longVariance: 0.04, volOfVol: 0.6, correlation: -0.7 }
  const cos = cosEuropeanPrice(hestonCf(0.03, 1, params), 100, 100, 0.03, 1, true)

  it('is nearly unbiased with only 32 steps and beats Euler at the same step count', () => {
    const qe = priceHestonCallQe({ spot: 100, strike: 100, rate: 0.03, maturity: 1, ...params, steps: 32, paths: 200000, seed: 21 })
    const euler = priceHestonCall({ spot: 100, strike: 100, rate: 0.03, maturity: 1, ...params, steps: 32, paths: 200000, seed: 21 })
    expect(Math.abs(qe.price - cos)).toBeLessThan(3 * qe.standardError + 0.02)
    expect(Math.abs(qe.price - cos)).toBeLessThan(Math.abs(euler.price - cos))
  })
})

describe('Hull-White 1-factor fitting the initial curve', () => {
  const swaption: HullWhiteSwaption = { expiry: 1, times: [2, 3, 4, 5], accruals: [1, 1, 1, 1], fixedRate: 0.03 }

  it('analytic Jamshidian swaption matches the short-rate Monte Carlo on a flat curve', () => {
    const flat = new DiscountCurve([1, 2, 3, 5, 7, 10], [0.03, 0.03, 0.03, 0.03, 0.03, 0.03])
    const spec: HullWhiteSpec = { curve: flat, meanReversion: 0.1, vol: 0.01 }
    const analytic = hullWhitePayerSwaption(spec, swaption)
    const mc = hullWhitePayerSwaptionMc(spec, swaption, 100, 200000, 41)
    expect(Math.abs(analytic - mc)).toBeLessThan(3e-4)
  })

  it('matches the MC on an upward-sloping (non-flat) curve', () => {
    const sloped = new DiscountCurve([1, 2, 3, 5, 7, 10], [0.02, 0.025, 0.028, 0.032, 0.035, 0.037])
    const spec: HullWhiteSpec = { curve: sloped, meanReversion: 0.08, vol: 0.012 }
    expect(hullWhiteBond(spec, 0.5, 5, 0.03)).toBeGreaterThan(0)
    const analytic = hullWhitePayerSwaption(spec, swaption)
    const mc = hullWhitePayerSwaptionMc(spec, swaption, 100, 200000, 42)
    expect(Math.abs(analytic - mc)).toBeLessThan(5e-4)
  })
})

describe('stochastic-local volatility — particle calibration', () => {
  const spec: SlvCalibrationSpec = {
    spot: 100, rate: 0.03, maturity: 1,
    initialVariance: 0.04, meanReversion: 1.5, longVariance: 0.06, volOfVol: 0.6, correlation: -0.5,
    steps: 100, paths: 120000, seed: 31, bins: 120,
  }

  it('calibrated leverage reprices a flat local-vol surface to Black-Scholes', () => {
    const target = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
    const slv = calibrateAndPriceSlvCall(spec, 100, () => 0.2)
    expect(Math.abs(slv.price - target.price)).toBeLessThan(0.1)
  })

  it('a skewed target local-vol changes the calibrated price', () => {
    const flat = calibrateAndPriceSlvCall(spec, 110, () => 0.2)
    const skewed = calibrateAndPriceSlvCall(spec, 110, (s) => 0.2 + 0.1 * (100 - s) / 100)
    expect(Math.abs(flat.price - skewed.price)).toBeGreaterThan(1e-2)
  })
})

describe('multi-factor Libor Market Model', () => {
  const base: LmmMultiSpec = { rateCount: 6, accrual: 0.5, initialForward: 0.03, vols: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2], correlationDecay: 0, paths: 200000, seed: 71 }

  it('caplet matches Black and is correlation-independent', () => {
    const lmm = lmmCaplet(base, 3, 0.03)
    const fixingTime = 3 * base.accrual
    const discount = 1 / Math.pow(1 + base.accrual * base.initialForward, 4)
    const black = blackCapletPrice(base.initialForward, 0.03, 0.2, fixingTime, base.accrual, discount)
    expect(Math.abs(lmm.price - black)).toBeLessThan(3 * lmm.standardError + 1e-5)
  })

  it('swaption value falls as forward-rate correlation decreases (a genuine multi-factor effect)', () => {
    const perfectlyCorrelated = lmmSwaption({ ...base, correlationDecay: 0 }, 2, 0.03)
    const decorrelated = lmmSwaption({ ...base, correlationDecay: 0.5 }, 2, 0.03)
    expect(decorrelated.price).toBeLessThan(perfectlyCorrelated.price)
  })
})

describe('rough Bergomi produces a rough-volatility skew', () => {
  it('implied vol is downward-sloping in strike for negative correlation', () => {
    const maturity = 0.3
    const config = { spot: 100, rate: 0.0, maturity, forwardVariance: 0.04, hurst: 0.1, volOfVol: 1.9, correlation: -0.9, steps: 60, paths: 200000, seed: 9 }
    const low = priceRoughBergomiCall({ ...config, strike: 90 })
    const high = priceRoughBergomiCall({ ...config, strike: 110 })
    const ivLow = impliedVolatility({ price: low.price, spot: 100, strike: 90, rate: 0, maturity, isCall: true })
    const ivHigh = impliedVolatility({ price: high.price, spot: 100, strike: 110, rate: 0, maturity, isCall: true })
    expect(ivLow).toBeGreaterThan(ivHigh + 0.01)
  })
})

describe('square-root checkpointing wired into a path-dependent adjoint', () => {
  const steps = 144
  const market: LocalVolMarket = { rate: 0.03, dt: 1 / steps, baseVol: 0.2, elasticity: -0.6, reference: 100, steps }
  const generator = new MersenneTwister(2024)
  const shocks = new Float64Array(steps)
  for (let i = 0; i < steps; i += 1) shocks[i] = inverseNormalCdf(generator.nextDouble())
  const logSpot0 = Math.log(100)

  it('checkpointed reverse equals the full reverse using O(sqrt T) live state', () => {
    const full = fullPathGradient(shocks, market, logSpot0)
    const checkpointed = checkpointedPathGradient(shocks, market, logSpot0, 12)
    expect(checkpointed.gradient).toBeCloseTo(full.gradient, 10)
    expect(checkpointed.maxStored).toBeLessThan(full.stored / 3)
  })

  it('matches a central finite-difference bump of the path', () => {
    const full = fullPathGradient(shocks, market, logSpot0)
    const bump = 1e-6
    const up = pathAverage(shocks, market, logSpot0 + bump)
    const down = pathAverage(shocks, market, logSpot0 - bump)
    expect(full.gradient).toBeCloseTo((up - down) / (2 * bump), 5)
  })
})
