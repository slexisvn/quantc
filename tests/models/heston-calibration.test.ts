import { describe, it, expect } from 'vitest'
import { calibrateHeston, type VanillaQuote } from '../../src/calibration/heston-calibration'
import { hestonCf } from '../../src/analytics/characteristic'
import { cosEuropeanPrice } from '../../src/analytics/cos-method'

describe('Heston calibration via COS', () => {
  it('recovers parameters from a synthetic vanilla surface', () => {
    const spot = 100
    const rate = 0.02
    const fixed = { meanReversion: 1.5, correlation: -0.6 }
    const truth = { initialVariance: 0.045, longVariance: 0.05, volOfVol: 0.4 }

    const quotes: VanillaQuote[] = []
    for (const maturity of [0.5, 1, 2]) {
      for (const strike of [80, 90, 100, 110, 120]) {
        const model = hestonCf(rate, maturity, { ...truth, meanReversion: fixed.meanReversion, correlation: fixed.correlation })
        quotes.push({ strike, maturity, price: cosEuropeanPrice(model, spot, strike, rate, maturity, true) })
      }
    }

    const calibrated = calibrateHeston(spot, rate, quotes, fixed, { initialVariance: 0.06, longVariance: 0.06, volOfVol: 0.3 })
    expect(calibrated.residualNorm).toBeLessThan(1e-3)
    expect(calibrated.initialVariance).toBeCloseTo(truth.initialVariance, 3)
    expect(calibrated.longVariance).toBeCloseTo(truth.longVariance, 3)
    expect(calibrated.volOfVol).toBeCloseTo(truth.volOfVol, 2)
  })
})
