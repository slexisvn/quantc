import { describe, it, expect } from 'vitest'
import { bermudanDualBound, type BermudanDualSpec } from '../../src/engines/bermudan-dual'
import { pricePde } from '../../src/engines/pde-engine'
import { breakevenInflation, inflationLinkedZeroCouponBond, realBond, forwardIndex, type InflationSpec } from '../../src/models/rates/jarrow-yildirim'
import { jyInflationCallMc, type JyStochasticSpec } from '../../src/models/rates/jarrow-yildirim-stochastic'

describe('Andersen-Broadie primal-dual American bounds', () => {
  it('brackets the PDE American put between the lower and upper bounds', () => {
    const spec: BermudanDualSpec = {
      spot: 100, strike: 100, rate: 0.05, vol: 0.2, maturity: 1, isCall: false,
      exerciseDates: 20, paths: 40000, seed: 99,
    }
    const bounds = bermudanDualBound(spec)
    const pde = pricePde({ spot: 100, strike: 100, rate: 0.05, vol: 0.2, maturity: 1, isCall: false, american: true, spaceSteps: 801, timeSteps: 400, widthStdDev: 6, rannacherSteps: 4 }).price
    expect(bounds.upper).toBeGreaterThanOrEqual(bounds.lower - 0.02)
    expect(Math.abs(bounds.lower - pde)).toBeLessThan(0.1)
    expect(Math.abs(bounds.upper - pde)).toBeLessThan(0.1)
  })
})

describe('Jarrow-Yildirim inflation', () => {
  const spec: InflationSpec = { nominalRate: 0.04, realRate: 0.015, indexLevel: 100, maturity: 5 }

  it('breakeven inflation equals the nominal-minus-real spread and the linker prices to the real bond', () => {
    expect(breakevenInflation(spec)).toBeCloseTo(Math.exp(0.04 - 0.015) - 1, 6)
    expect(inflationLinkedZeroCouponBond(spec)).toBeCloseTo(realBond(spec), 10)
    expect(forwardIndex(spec)).toBeGreaterThan(spec.indexLevel)
  })
})

describe('full stochastic Jarrow-Yildirim', () => {
  const base: JyStochasticSpec = {
    nominalForward: 0.04, realForward: 0.015, nominalMeanReversion: 0.1, nominalVol: 0.008,
    realMeanReversion: 0.1, realVol: 0.006, cpiVol: 0.01, corrNominalReal: 0.3, corrNominalCpi: 0.1, corrRealCpi: -0.2,
    indexLevel: 100, strike: 1.1, maturity: 5, steps: 60, paths: 80000, seed: 55,
  }

  it('recovers the real bond from the discounted index and prices an inflation option that rises with CPI vol', () => {
    const result = jyInflationCallMc(base)
    expect(Math.abs(result.forwardIndexRatio - result.realBond)).toBeLessThan(3e-3)
    expect(result.price).toBeGreaterThan(0)
    const higherVol = jyInflationCallMc({ ...base, cpiVol: 0.03 })
    expect(higherVol.price).toBeGreaterThan(result.price)
  })
})
