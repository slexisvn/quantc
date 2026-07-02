import { describe, it, expect } from 'vitest'
import { calibrateLeverageSurface, priceSlvWithSurface, type LeverageSurfaceSpec } from '../../src/models/equity/slv-particle'
import { blackScholes } from '../../src/numerics/analytic/black-scholes'

const base: LeverageSurfaceSpec = {
  spot: 100,
  rate: 0.02,
  maturity: 1,
  initialVariance: 0.04,
  meanReversion: 1.5,
  longVariance: 0.04,
  volOfVol: 0,
  correlation: -0.5,
  steps: 25,
  paths: 8000,
  seed: 4321,
  gridPoints: 25,
}

describe('SLV particle leverage surface', () => {
  it('recovers L ≈ targetLocalVol/√v0 and reprices Black-Scholes when the vol-of-vol vanishes', () => {
    const target = 0.25
    const surface = calibrateLeverageSurface(base, () => target)
    const expectedLeverage = target / Math.sqrt(base.initialVariance)
    for (const spot of [90, 100, 110]) expect(surface.leverage(0.5, spot)).toBeCloseTo(expectedLeverage, 6)
    const priced = priceSlvWithSurface(base, 100, surface)
    const bs = blackScholes({ spot: 100, strike: 100, rate: base.rate, vol: target, maturity: base.maturity, isCall: true }).price
    expect(Math.abs(priced.price - bs)).toBeLessThan(0.1)
  })

  it('the bins and kernel estimators agree on the leverage level', () => {
    const spec: LeverageSurfaceSpec = { ...base, volOfVol: 0.6 }
    const target = (spot: number): number => 0.2 + 0.05 * Math.tanh((spot - 100) / 20)
    const bins = calibrateLeverageSurface({ ...spec, estimator: 'bins' }, target)
    const kernel = calibrateLeverageSurface({ ...spec, estimator: 'kernel' }, target)
    const spots = [85, 90, 95, 100, 105, 110, 115]
    let binsSum = 0
    let kernelSum = 0
    for (const spot of spots) {
      binsSum += bins.leverage(0.5, spot)
      kernelSum += kernel.leverage(0.5, spot)
    }
    expect(Math.abs(binsSum - kernelSum) / kernelSum).toBeLessThan(0.1)
  })

  it('is deterministic given the seed', () => {
    const surface = calibrateLeverageSurface(base, () => 0.25)
    const a = priceSlvWithSurface(base, 100, surface).price
    const b = priceSlvWithSurface(base, 100, surface).price
    expect(a).toBe(b)
  })
})
