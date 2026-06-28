import { describe, it, expect } from 'vitest'
import { cmsConvexityAdjustment, quantoForward } from '../src/analytics/convexity'
import { parseProduct } from '../src/lang/parser'
import { checkProduct } from '../src/lang/typecheck'
import { priceProduct } from '../src/lang/compile'

describe('convexity and quanto adjustments', () => {
  it('CMS convexity adjustment is positive and grows with volatility and expiry', () => {
    const base = cmsConvexityAdjustment(0.03, 0.2, 5, 10)
    expect(base).toBeGreaterThan(0)
    expect(cmsConvexityAdjustment(0.03, 0.3, 5, 10)).toBeGreaterThan(base)
    expect(cmsConvexityAdjustment(0.03, 0.2, 8, 10)).toBeGreaterThan(base)
  })

  it('quanto adjustment lowers the forward for positive correlation', () => {
    expect(quantoForward(100, 0.2, 0.1, 0.3, 1)).toBeLessThan(100)
    expect(quantoForward(100, 0.2, 0.1, -0.3, 1)).toBeGreaterThan(100)
    expect(quantoForward(100, 0.2, 0.1, 0, 1)).toBeCloseTo(100, 10)
  })
})

describe('structured product in the .qc language (range accrual)', () => {
  const rangeAccrual = parseProduct(`
    product RangeAccrual {
      underlying S model gbm
      param low = 90
      param high = 110
      param coupon = 0.1
      var count = 0
      event t in schedule(0.05, 1.0, 0.05) {
        if S(t) > low and S(t) < high then { count = count + 1 }
      }
      event T = 1.0 { pay coupon * count / 20 at T }
    }
  `)

  it('type-checks and prices within its no-arbitrage bounds', () => {
    expect(checkProduct(rangeAccrual)).toEqual([])
    const result = priceProduct(rangeAccrual, { spot: 100, rate: 0.03, vol: 0.2 }, 80000, 11)
    expect(result.price).toBeGreaterThan(0)
    expect(result.price).toBeLessThan(0.1 * Math.exp(-0.03))
    expect(Number.isFinite(result.greeks.delta)).toBe(true)
  })
})
