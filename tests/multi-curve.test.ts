import { describe, it, expect } from 'vitest'
import { bootstrapFromParSwaps } from '../src/marketdata/bootstrap'
import { bootstrapProjectionCurve, multiCurveParRate, multiCurveSwapValue, projectionForward, type FloatingSwap } from '../src/marketdata/multi-curve'
import { parSwapRate } from '../src/instruments/swap'
import { fxForward, csaPresentValue, basisAdjustedCurve } from '../src/marketdata/xccy'
import { depositRate, fraRate, futureRate, futureConvexityAdjustment } from '../src/instruments/rates-instruments'
import { monotoneCubic } from '../src/marketdata/interpolation'
import { equityForward, equityForwardWithYield } from '../src/marketdata/equity-forward'

const oisQuotes = [
  { maturity: 1, rate: 0.028 },
  { maturity: 2, rate: 0.03 },
  { maturity: 3, rate: 0.032 },
  { maturity: 4, rate: 0.033 },
  { maturity: 5, rate: 0.034 },
]
const discount = bootstrapFromParSwaps(oisQuotes, 1)

describe('multi-curve framework', () => {
  it('projection bootstrap reprices the IBOR swaps to par on the discount curve', () => {
    const iborQuotes = [
      { maturity: 1, rate: 0.033 },
      { maturity: 2, rate: 0.035 },
      { maturity: 3, rate: 0.037 },
      { maturity: 4, rate: 0.038 },
      { maturity: 5, rate: 0.039 },
    ]
    const projection = bootstrapProjectionCurve(discount, iborQuotes, 1)
    for (const quote of iborQuotes) {
      const times = Array.from({ length: quote.maturity }, (_, i) => i + 1)
      const swap: FloatingSwap = { times, accruals: times.map(() => 1), fixedRate: quote.rate }
      expect(multiCurveParRate(swap, discount, projection)).toBeCloseTo(quote.rate, 6)
    }
  })

  it('reduces to the single-curve par rate when projection equals discount', () => {
    const times = [1, 2, 3, 4, 5]
    const swap: FloatingSwap = { times, accruals: times.map(() => 1), fixedRate: 0.03 }
    expect(multiCurveParRate(swap, discount, discount)).toBeCloseTo(parSwapRate(times, swap.accruals, discount), 10)
    expect(multiCurveSwapValue({ ...swap, fixedRate: multiCurveParRate(swap, discount, discount) }, discount, discount)).toBeCloseTo(0, 10)
  })
})

describe('cross-currency / CSA discounting', () => {
  it('FX forward follows covered interest parity', () => {
    expect(fxForward(1.2, 0.97, 0.97)).toBeCloseTo(1.2, 12)
    expect(fxForward(1.2, 0.97, 0.95)).toBeLessThan(1.2)
  })

  it('CSA present value discounts on the collateral curve and basis shifts it', () => {
    expect(csaPresentValue(100, 2, discount)).toBeCloseTo(100 * discount.discountFactor(2), 12)
    const shifted = basisAdjustedCurve(discount, 0.001)
    expect(shifted.discountFactor(2)).toBeLessThan(discount.discountFactor(2))
  })
})

describe('rates instruments', () => {
  it('deposit and FRA rates are consistent with the curve', () => {
    expect(depositRate(discount, 1)).toBeGreaterThan(0)
    const fra = fraRate(discount, 1, 2)
    expect(fra).toBeCloseTo(projectionForward(discount, 1, 2), 12)
  })

  it('future rate exceeds the FRA rate by the convexity adjustment', () => {
    const adjustment = futureConvexityAdjustment(0.01, 1, 2)
    expect(adjustment).toBeGreaterThan(0)
    expect(futureRate(discount, 0.01, 1, 2)).toBeCloseTo(fraRate(discount, 1, 2) + adjustment, 12)
  })
})

describe('monotone-convex interpolation', () => {
  it('reproduces the pillars and preserves monotonicity', () => {
    const xs = [0, 1, 2, 3, 4]
    const ys = [0.02, 0.025, 0.027, 0.04, 0.041]
    const interp = monotoneCubic(xs, ys)
    for (let i = 0; i < xs.length; i += 1) expect(interp(xs[i])).toBeCloseTo(ys[i], 12)
    let previous = interp(0)
    for (let x = 0; x <= 4; x += 0.05) {
      const value = interp(x)
      expect(value).toBeGreaterThanOrEqual(previous - 1e-12)
      previous = value
    }
  })
})

describe('equity forward with dividends', () => {
  it('matches the no-dividend forward and is reduced by discrete dividends', () => {
    expect(equityForward(100, 0.03, 1, [])).toBeCloseTo(100 * Math.exp(0.03), 10)
    const withDividend = equityForward(100, 0.03, 1, [{ time: 0.5, amount: 2 }])
    expect(withDividend).toBeLessThan(100 * Math.exp(0.03))
    expect(equityForwardWithYield(100, 0.03, 0.02, 1)).toBeCloseTo(100 * Math.exp(0.01), 10)
  })
})
