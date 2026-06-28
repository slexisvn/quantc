import { describe, it, expect } from 'vitest'
import { sviImpliedVol, butterflyG, fitSvi, type SviParams } from '../src/marketdata/svi'
import { VolSurface } from '../src/marketdata/vol-surface'
import { localVol } from '../src/marketdata/dupire'

describe('SVI volatility slice', () => {
  const truth: SviParams = { a: 0.04, b: 0.1, rho: -0.3, m: 0.0, sigma: 0.2 }
  const maturity = 1
  const strikes = [-0.4, -0.2, -0.1, 0, 0.1, 0.2, 0.4]
  const vols = strikes.map((k) => sviImpliedVol(truth, k, maturity))

  it('fits a synthetic smile', () => {
    const fit = fitSvi(strikes, vols, maturity, { a: 0.05, b: 0.12, rho: 0, m: 0.05, sigma: 0.25 })
    expect(fit.residualNorm).toBeLessThan(1e-4)
    for (const k of strikes) expect(sviImpliedVol(fit.params, k, maturity)).toBeCloseTo(sviImpliedVol(truth, k, maturity), 4)
  })

  it('is free of butterfly arbitrage', () => {
    for (let k = -0.6; k <= 0.6; k += 0.05) expect(butterflyG(truth, k)).toBeGreaterThan(0)
  })
})

describe('Dupire local volatility', () => {
  it('recovers the constant vol from a flat surface', () => {
    const sigma = 0.25
    const slices = [0.5, 1, 2].map((maturity) => ({ maturity, params: { a: sigma * sigma * maturity, b: 0, rho: 0, m: 0, sigma: 0.1 } }))
    const surface = new VolSurface(slices)
    for (const strike of [80, 100, 120]) {
      expect(localVol(surface, strike, 100, 1)).toBeCloseTo(sigma, 8)
    }
  })

  it('produces positive finite local vols on a skewed surface', () => {
    const slices = [0.5, 1, 2].map((maturity) => ({ maturity, params: { a: 0.04 * maturity, b: 0.1 * maturity, rho: -0.3, m: 0, sigma: 0.2 } }))
    const surface = new VolSurface(slices)
    for (const strike of [70, 90, 100, 110, 130]) {
      const lv = localVol(surface, strike, 100, 1)
      expect(Number.isFinite(lv)).toBe(true)
      expect(lv).toBeGreaterThan(0)
    }
  })
})
