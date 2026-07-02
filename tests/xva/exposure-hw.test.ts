import { describe, it, expect } from 'vitest'
import { DiscountCurve } from '../../src/marketdata/curve'
import { hwSwapTrade, hwSwapMtm, hwBond, type HwSwapSpec } from '../../src/xva/rates-trades'
import { simulateRatesExposure, type HwExposureConfig } from '../../src/xva/exposure-hw'
import { computeXva } from '../../src/risk/xva-suite'

const curve = new DiscountCurve([1, 10, 30], [0.03, 0.03, 0.03])
const periods = Array.from({ length: 5 }, (_, i) => ({ start: i, end: i + 1, accrual: 1 }))

function parRate(spec: HwSwapSpec): number {
  const bonds = periods.map((p) => hwBond(spec.curve, spec.a, spec.vol, 0, p.end, 0.03))
  const float = hwBond(spec.curve, spec.a, spec.vol, 0, 0, 0.03) - bonds[bonds.length - 1]
  let annuity = 0
  for (let i = 0; i < periods.length; i += 1) annuity += periods[i].accrual * bonds[i]
  return float / annuity
}

const grid = Array.from({ length: 20 }, (_, i) => (i + 1) * 0.25)

describe('Hull-White rates exposure', () => {
  it('collapses to the deterministic forward MTM when the vol vanishes', () => {
    const spec: HwSwapSpec = { curve, a: 0.05, vol: 1e-7, fixedRate: 0.03, periods, notional: 1_000_000, payer: true }
    const config: HwExposureConfig = { curve, a: 0.05, vol: 1e-7, grid, paths: 4000, seed: 11, quantile: 0.95, collateralThreshold: 0 }
    const profile = simulateRatesExposure([hwSwapTrade(spec)], config)
    for (let k = 0; k < grid.length; k += 1) {
      const deterministic = Math.max(hwSwapMtm(spec, grid[k], 0.03), 0)
      expect(Math.abs(profile.epe[k] - deterministic)).toBeLessThan(50)
    }
  })

  it('a par payer swap has a hump-shaped EPE that decays to zero at maturity', () => {
    const par = parRate({ curve, a: 0.05, vol: 0.01, fixedRate: 0, periods, notional: 1, payer: true })
    const spec: HwSwapSpec = { curve, a: 0.05, vol: 0.01, fixedRate: par, periods, notional: 1_000_000, payer: true }
    const config: HwExposureConfig = { curve, a: 0.05, vol: 0.01, grid, paths: 20000, seed: 23, quantile: 0.95, collateralThreshold: 0 }
    const profile = simulateRatesExposure([hwSwapTrade(spec)], config)
    const peak = Math.max(...profile.epe)
    expect(peak).toBeGreaterThan(profile.epe[0])
    expect(profile.epe[grid.length - 1]).toBeLessThan(0.1 * peak)
  })

  it('a payer and receiver swap net to zero exposure and produce a finite CVA', () => {
    const spec: HwSwapSpec = { curve, a: 0.05, vol: 0.01, fixedRate: 0.03, periods, notional: 1_000_000, payer: true }
    const opposite: HwSwapSpec = { ...spec, payer: false }
    const config: HwExposureConfig = { curve, a: 0.05, vol: 0.01, grid, paths: 8000, seed: 31, quantile: 0.95, collateralThreshold: 0 }
    const netted = simulateRatesExposure([hwSwapTrade(spec), hwSwapTrade(opposite)], config)
    for (const value of netted.epe) expect(value).toBeLessThan(1e-6)

    const single = simulateRatesExposure([hwSwapTrade(spec)], config)
    const xva = computeXva(single, { rate: 0.03, hazardRate: 0.02, recovery: 0.4, ownHazardRate: 0, ownRecovery: 0.4, fundingSpread: 0 })
    expect(Number.isFinite(xva.cva)).toBe(true)
    expect(xva.cva).toBeGreaterThan(0)
  })
})
