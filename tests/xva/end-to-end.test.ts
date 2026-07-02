import { describe, it, expect } from 'vitest'
import { forwardTrade, type MarketState, type ExposureConfig } from '../../src/risk/exposure'
import { amcTrade } from '../../src/xva/amc-exposure'
import { simulateNettingSetExposure, type NettingSet } from '../../src/xva/netting'
import { computeXva, type XvaSpec } from '../../src/risk/xva-suite'
import { DiscountCurve } from '../../src/marketdata/curve'
import { hwSwapTrade, type HwSwapSpec } from '../../src/xva/rates-trades'
import { simulateRatesExposure, type HwExposureConfig } from '../../src/xva/exposure-hw'
import { expectedImProfile, type DynamicImConfig } from '../../src/xva/dynamic-im'
import { computeMva } from '../../src/xva/mva'
import { computeKva, eadCapitalProfile } from '../../src/xva/kva'
import { saccrEad, type SaccrTrade } from '../../src/xva/sa-ccr'
import { SACCR_PARAMETERS_BASEL } from '../../src/xva/sa-ccr-parameters'
import { SIMM_PARAMETERS_ILLUSTRATIVE } from '../../src/xva/simm-parameters'
import { polynomialBasis } from '../../src/numerics/basis'
import type { SimmSensitivity } from '../../src/xva/simm'

const market: MarketState = { spot: 100, rate: 0.03, vol: 0.25 }
const grid = Array.from({ length: 16 }, (_, i) => (i + 1) * 0.25)
const config: ExposureConfig = { grid, paths: 20000, seed: 90210, quantile: 0.95, collateralThreshold: 0 }
const spec: XvaSpec = { rate: 0.03, hazardRate: 0.025, recovery: 0.4, ownHazardRate: 0.01, ownRecovery: 0.4, fundingSpread: 0.006 }

describe('XVA desk end-to-end', () => {
  const call = amcTrade({ spot: 100, strike: 100, rate: 0.03, vol: 0.25, maturity: 4, isCall: true, exerciseDates: 16, paths: 20000, seed: 4, basis: polynomialBasis(4), ridgeLambda: 1e-4, bermudan: false, quantity: 1 })

  it('assembles CVA, MVA and KVA across an equity and a rates netting set with a positive netting benefit', () => {
    const hedge = forwardTrade(100, 4, 0.03, -0.5)
    const nettedSet: NettingSet = { id: 'equity', trades: [call, hedge] }
    const standaloneSet: NettingSet = { id: 'equity-call', trades: [call] }
    const nettedProfile = simulateNettingSetExposure(nettedSet, market, config)
    const standaloneProfile = simulateNettingSetExposure(standaloneSet, market, config)
    const nettedCva = computeXva(nettedProfile, spec).cva
    const standaloneCva = computeXva(standaloneProfile, spec).cva
    expect(nettedCva).toBeLessThan(standaloneCva)
    expect(nettedCva).toBeGreaterThan(0)

    const curve = new DiscountCurve([1, 10, 30], [0.03, 0.03, 0.03])
    const periods = Array.from({ length: 4 }, (_, i) => ({ start: i, end: i + 1, accrual: 1 }))
    const swapSpec: HwSwapSpec = { curve, a: 0.05, vol: 0.01, fixedRate: 0.03, periods, notional: 1_000_000, payer: true }
    const ratesConfig: HwExposureConfig = { curve, a: 0.05, vol: 0.01, grid, paths: 12000, seed: 555, quantile: 0.95, collateralThreshold: 0 }
    const ratesProfile = simulateRatesExposure([hwSwapTrade(swapSpec)], ratesConfig)
    const ratesXva = computeXva(ratesProfile, spec)

    const sensitivities = (): SimmSensitivity[] => [{ riskClass: 'IR', bucket: '1', label: '5y', amount: 5000, kind: 'delta' }]
    const imConfig: DynamicImConfig = { times: grid, statePaths: ratesProfile.spotPaths, basis: polynomialBasis(2), ridgeLambda: 1e-4, subsample: 3000, params: SIMM_PARAMETERS_ILLUSTRATIVE, sensitivities }
    const expectedIm = expectedImProfile(imConfig)
    const mva = computeMva(expectedIm, grid, { fundingSpread: spec.fundingSpread, discount: (t) => Math.exp(-spec.rate * t) })

    const saccrTrade: SaccrTrade = { assetClass: 'IR', notional: 1_000_000, startTime: 0, endTime: 4, direction: 1 }
    const ead = saccrEad([saccrTrade], 0, SACCR_PARAMETERS_BASEL).ead
    const kva = computeKva(eadCapitalProfile(ratesProfile, 1.0), { hurdleRate: 0.1, discount: (t) => Math.exp(-spec.rate * t) })

    const totalXva = nettedCva + ratesXva.cva + ratesXva.fva + mva + kva
    expect(Number.isFinite(totalXva)).toBe(true)
    expect(mva).toBeGreaterThan(0)
    expect(kva).toBeGreaterThan(0)
    expect(ead).toBeGreaterThan(0)

    let manualCva = 0
    let previous = 0
    for (let k = 0; k < grid.length; k += 1) {
      const survivalPrev = Math.exp(-spec.hazardRate * previous)
      const survival = Math.exp(-spec.hazardRate * grid[k])
      manualCva += (1 - spec.recovery) * ratesProfile.epe[k] * Math.exp(-spec.rate * grid[k]) * (survivalPrev - survival)
      previous = grid[k]
    }
    expect(manualCva).toBeCloseTo(ratesXva.cva, 8)
  })
})
