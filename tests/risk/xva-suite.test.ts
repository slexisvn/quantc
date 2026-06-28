import { describe, it, expect } from 'vitest'
import { simulateExposure, europeanTrade, forwardTrade, type ExposureConfig, type MarketState } from '../../src/risk/exposure'
import { computeXva, wrongWayCva } from '../../src/risk/xva-suite'
import { simulateFullExposure, computeFullXva, europeanFullTrade, type FullExposureConfig } from '../../src/risk/xva-full'

const market: MarketState = { spot: 100, rate: 0.02, vol: 0.25 }
const grid = Array.from({ length: 20 }, (_, i) => (i + 1) * 0.1)
const config: ExposureConfig = { grid, paths: 40000, seed: 909, quantile: 0.95, collateralThreshold: 0 }

describe('portfolio exposure', () => {
  const portfolio = [europeanTrade(100, 2, 0.02, 0.25, true, 1), forwardTrade(95, 2, 0.02, 0.5)]
  const profile = simulateExposure(portfolio, market, config)

  it('PFE dominates EPE and EEPE dominates the average EPE', () => {
    for (let k = 0; k < grid.length; k += 1) {
      expect(profile.pfe[k]).toBeGreaterThanOrEqual(profile.epe[k] - 1e-9)
      expect(profile.epe[k]).toBeGreaterThan(0)
    }
    const averageEpe = profile.epe.reduce((a, b) => a + b, 0) / profile.epe.length
    expect(profile.eepe).toBeGreaterThanOrEqual(averageEpe - 1e-9)
  })

  it('collateral reduces the expected positive exposure', () => {
    const collateralised = simulateExposure(portfolio, market, { ...config, collateralThreshold: 0 })
    for (let k = 1; k < grid.length; k += 1) expect(collateralised.collateralEpe[k]).toBeLessThanOrEqual(collateralised.epe[k] + 1e-9)
  })
})

describe('XVA suite', () => {
  const profile = simulateExposure([europeanTrade(100, 2, 0.02, 0.25, true, 1)], market, config)

  it('produces positive CVA, DVA, FVA and MVA', () => {
    const xva = computeXva(profile, { rate: 0.02, hazardRate: 0.03, recovery: 0.4, ownHazardRate: 0.015, ownRecovery: 0.4, fundingSpread: 0.005 })
    expect(xva.cva).toBeGreaterThan(0)
    expect(xva.dva).toBeGreaterThanOrEqual(0)
    expect(xva.fva).toBeGreaterThan(0)
    expect(xva.mva).toBeGreaterThan(0)
  })

  it('CVA increases with the counterparty hazard rate', () => {
    const low = computeXva(profile, { rate: 0.02, hazardRate: 0.01, recovery: 0.4, ownHazardRate: 0, ownRecovery: 0.4, fundingSpread: 0 }).cva
    const high = computeXva(profile, { rate: 0.02, hazardRate: 0.06, recovery: 0.4, ownHazardRate: 0, ownRecovery: 0.4, fundingSpread: 0 }).cva
    expect(high).toBeGreaterThan(low)
  })
})

describe('full XVA — collateral, MPoR and SIMM-style initial margin', () => {
  const portfolio = [europeanFullTrade(100, 2, 0.02, 0.25, true, 1)]
  const base: FullExposureConfig = { grid, paths: 40000, seed: 303, quantile: 0.99, threshold: 0, minimumTransfer: 0, mporSteps: 2, imRiskWeight: 0.1 }

  it('collateral reduces exposure and a longer margin period of risk raises residual exposure', () => {
    const uncollateralised = simulateFullExposure(portfolio, market, { ...base, threshold: 1e9 })
    const collateralised = simulateFullExposure(portfolio, market, base)
    const longerMpor = simulateFullExposure(portfolio, market, { ...base, mporSteps: 5 })
    const sum = (a: number[]): number => a.reduce((x, y) => x + y, 0)
    expect(sum(collateralised.collateralEpe)).toBeLessThan(sum(uncollateralised.collateralEpe))
    expect(sum(longerMpor.collateralEpe)).toBeGreaterThan(sum(collateralised.collateralEpe))
  })

  it('produces a positive initial-margin profile and a positive MVA', () => {
    const profile = simulateFullExposure(portfolio, market, base)
    expect(profile.imProfile.every((x) => x > 0)).toBe(true)
    const xva = computeFullXva(profile, { rate: 0.02, hazardRate: 0.03, recovery: 0.4, fundingSpread: 0.005 })
    expect(xva.cva).toBeGreaterThan(0)
    expect(xva.fva).toBeGreaterThan(0)
    expect(xva.mva).toBeGreaterThan(0)
  })
})

describe('wrong-way risk', () => {
  it('raises CVA when exposure is positively correlated with default (long put)', () => {
    const longPut = simulateExposure([europeanTrade(100, 2, 0.02, 0.25, false, 1)], market, config)
    const result = wrongWayCva(longPut, { rate: 0.02, hazardRate: 0.04, recovery: 0.4, correlation: 4, spot: 100 })
    expect(result.wrongWay).toBeGreaterThan(result.independent)
  })
})
