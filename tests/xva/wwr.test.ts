import { describe, it, expect } from 'vitest'
import { simulateExposure, europeanTrade, type MarketState, type ExposureConfig } from '../../src/risk/exposure'
import { computeXva } from '../../src/risk/xva-suite'
import { exponentialHazardLink, wrongWayCvaPathwise } from '../../src/xva/wwr'

const market: MarketState = { spot: 100, rate: 0.02, vol: 0.25 }
const grid = Array.from({ length: 20 }, (_, i) => (i + 1) * 0.1)
const config: ExposureConfig = { grid, paths: 30000, seed: 8080, quantile: 0.95, collateralThreshold: 0 }
const hazard = 0.04
const recovery = 0.4
const discount = (t: number): number => Math.exp(-market.rate * t)

describe('wrong-way risk', () => {
  const profile = simulateExposure([europeanTrade(100, 2, 0.02, 0.25, true, 1)], market, config)

  it('a flat hazard link with beta=0 reproduces the independent CVA', () => {
    const link = exponentialHazardLink(() => hazard, 0, market.spot)
    const wwr = wrongWayCvaPathwise(grid, profile.mtmPaths, profile.spotPaths, link, recovery, discount)
    const independent = computeXva(profile, { rate: 0.02, hazardRate: hazard, recovery, ownHazardRate: 0, ownRecovery: 0.4, fundingSpread: 0 }).cva
    expect(wwr.cva).toBeCloseTo(independent, 8)
  })

  it('increasing the wrong-way beta raises the CVA on a long call', () => {
    const driver = profile.spotPaths.map((row) => Float64Array.from(row, (s) => Math.log(s / market.spot)))
    const cvas = [0, 1, 2].map((beta) => {
      const link = exponentialHazardLink(() => hazard, beta, 0)
      return wrongWayCvaPathwise(grid, profile.mtmPaths, driver, link, recovery, discount).cva
    })
    expect(cvas[1]).toBeGreaterThan(cvas[0])
    expect(cvas[2]).toBeGreaterThan(cvas[1])
  })
})
