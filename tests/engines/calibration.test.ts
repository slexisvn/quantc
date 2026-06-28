import { describe, it, expect } from 'vitest'
import { impliedVolatility } from '../../src/engines/calibration'
import { calibrateSabr } from '../../src/engines/sabr-calibration'
import { calibrateVolToPrice } from '../../src/risk/calibrate-vol-aad'
import { computeCva } from '../../src/risk/xva'
import { blackScholes } from '../../src/numerics/analytic/black-scholes'
import { sabrImpliedVol } from '../../src/models/fx/sabr'
import { priceEuropean, type EuropeanSpec } from '../../src/engines/mc-engine'

describe('implied volatility', () => {
  it('recovers the volatility from a Black-Scholes price', () => {
    const price = blackScholes({ spot: 100, strike: 110, rate: 0.02, vol: 0.27, maturity: 0.75, isCall: true }).price
    const vol = impliedVolatility({ price, spot: 100, strike: 110, rate: 0.02, maturity: 0.75, isCall: true })
    expect(Math.abs(vol - 0.27)).toBeLessThan(1e-6)
  })
})

describe('SABR smile calibration (Levenberg-Marquardt)', () => {
  it('recovers parameters from a synthetic smile', () => {
    const forward = 1.25
    const maturity = 1
    const beta = 0.5
    const truth = { alpha: 0.18, rho: -0.25, volOfVol: 0.45 }
    const strikes = [1.0, 1.1, 1.2, 1.25, 1.3, 1.4, 1.5]
    const quotes = strikes.map((strike) => ({
      strike,
      vol: sabrImpliedVol({ forward, strike, maturity, alpha: truth.alpha, beta, rho: truth.rho, volOfVol: truth.volOfVol }),
    }))

    const calibrated = calibrateSabr({ forward, maturity, beta, quotes, initialAlpha: 0.25, initialRho: 0, initialVolOfVol: 0.3 })
    expect(calibrated.residualNorm).toBeLessThan(1e-5)
    expect(Math.abs(calibrated.alpha - truth.alpha)).toBeLessThan(1e-3)
    expect(Math.abs(calibrated.rho - truth.rho)).toBeLessThan(1e-2)
    expect(Math.abs(calibrated.volOfVol - truth.volOfVol)).toBeLessThan(1e-2)
  })
})

describe('AAD-driven calibration', () => {
  it('solves for the volatility that reproduces a Monte Carlo price using AAD vega', () => {
    const spec: EuropeanSpec = {
      payoff: 'max(spot - strike, 0)',
      spot: 100, strike: 100, rate: 0.03, vol: 0.3, maturity: 1,
      paths: 60000, seed: 4242, model: 'gbm',
    }
    const target = priceEuropean(spec).price
    const result = calibrateVolToPrice(spec, target)
    expect(Math.abs(result.vol - 0.3)).toBeLessThan(1e-3)
    expect(Math.abs(result.priceError)).toBeLessThan(1e-6)
  })
})

describe('CVA (XVA)', () => {
  const base = {
    spot: 100, strike: 100, rate: 0.02, vol: 0.25, maturity: 2,
    hazardRate: 0.03, recovery: 0.4, exposureDates: 24, paths: 40000, seed: 808,
  }

  it('is positive', () => {
    expect(computeCva(base).cva).toBeGreaterThan(0)
  })

  it('increases with the counterparty hazard rate', () => {
    const low = computeCva({ ...base, hazardRate: 0.01 }).cva
    const high = computeCva({ ...base, hazardRate: 0.06 }).cva
    expect(high).toBeGreaterThan(low)
  })

  it('increases with volatility through larger exposures', () => {
    const low = computeCva({ ...base, vol: 0.15 }).cva
    const high = computeCva({ ...base, vol: 0.4 }).cva
    expect(high).toBeGreaterThan(low)
  })
})
