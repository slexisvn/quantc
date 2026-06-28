import { describe, it, expect } from 'vitest'
import { parseProduct } from '../../src/lang/parser'
import { calibrateHestonAndPrice } from '../../src/lang/calibrate'
import { hestonCf } from '../../src/analytics/characteristic'
import { cosEuropeanPrice } from '../../src/analytics/cos-method'

const spot = 100
const rate = 0.03
const maturity = 1
const truth = { initialVariance: 0.04, meanReversion: 1.5, longVariance: 0.05, volOfVol: 0.3, correlation: -0.6 }

// Synthetic market quotes generated from a known Heston model (Fourier/COS pricing).
const cf = hestonCf(rate, maturity, truth)
const quotes = [80, 90, 100, 110, 120].map((strike) => ({ strike, maturity, price: cosEuropeanPrice(cf, spot, strike, rate, maturity, true) }))

const product = parseProduct(`
  product HestonCall {
    underlying S model heston(kappa = 1.5, theta = 0.04, xi = 0.3, rho = -0.6, v0 = 0.04)
    param strike = 100
    event T = 1.0 { pay max(S(T) - strike, 0) at T }
  }
`)

describe('Quill calibration-in-the-loop — Heston', () => {
  const { result, calibration, modelParams } = calibrateHestonAndPrice(
    product,
    { spot, rate },
    { quotes, meanReversion: truth.meanReversion, correlation: truth.correlation, initial: { initialVariance: 0.03, longVariance: 0.03, volOfVol: 0.2 } },
    80000,
    20240628,
    { greeks: 'price-only' },
  )

  it('recovers the true Heston parameters from the quotes', () => {
    expect(calibration.residualNorm).toBeLessThan(1e-2)
    expect(Math.abs(calibration.initialVariance - truth.initialVariance)).toBeLessThan(5e-3)
    expect(Math.abs(calibration.longVariance - truth.longVariance)).toBeLessThan(5e-3)
    expect(Math.abs(calibration.volOfVol - truth.volOfVol)).toBeLessThan(5e-2)
  })

  it('feeds the calibrated parameters into the Quill pricer', () => {
    expect(modelParams.v0).toBeCloseTo(calibration.initialVariance, 10)
    expect(modelParams.theta).toBeCloseTo(calibration.longVariance, 10)
    const reference = cosEuropeanPrice(cf, spot, 100, rate, maturity, true)
    expect(Math.abs(result.price - reference)).toBeLessThan(0.6)
    expect(Number.isFinite(result.greeks.delta)).toBe(true)
  })
})
