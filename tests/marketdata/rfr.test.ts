import { describe, it, expect } from 'vitest'
import { DiscountCurve } from '../../src/marketdata/curve'
import { annuity, type FloatingSwap } from '../../src/marketdata/multi-curve'
import { compoundedRate, forwardCompoundedRate, rfrFloatingLegValue, rfrParSwapRate, type RfrFixings, type RfrPeriod } from '../../src/marketdata/rfr'

const curve = new DiscountCurve([0.5, 1, 2, 5], [0.03, 0.032, 0.034, 0.036])

describe('risk-free rate compounding', () => {
  it('matches the flat-fixing product identity', () => {
    const rate = 0.03
    const dayFraction = 1 / 360
    const days = 30
    const times: number[] = []
    const rates: number[] = []
    for (let i = 0; i <= days; i += 1) {
      times.push(i * dayFraction)
      rates.push(rate)
    }
    const fixings: RfrFixings = { times, rates }
    const compounded = compoundedRate(fixings, 0, days * dayFraction)
    const expected = (Math.pow(1 + rate * dayFraction, days) - 1) / (days * dayFraction)
    expect(compounded).toBeCloseTo(expected, 12)
  })

  it('the forward compounded rate is the telescoping discount-factor ratio', () => {
    const forward = forwardCompoundedRate(curve, 1, 2)
    const expected = (curve.discountFactor(1) / curve.discountFactor(2) - 1) / (2 - 1)
    expect(Math.abs(forward - expected)).toBeLessThan(1e-14)
  })

  it('prices a par RFR swap to zero', () => {
    const periods: RfrPeriod[] = Array.from({ length: 4 }, (_, i) => ({ start: i * 0.5, end: (i + 1) * 0.5, accrual: 0.5 }))
    const empty: RfrFixings = { times: [0], rates: [0] }
    const par = rfrParSwapRate(periods, empty, curve, curve, 0)
    const swap: FloatingSwap = { times: periods.map((p) => p.end), accruals: periods.map((p) => p.accrual), fixedRate: par }
    const value = rfrFloatingLegValue(periods, empty, curve, curve, 0) - par * annuity(swap, curve)
    expect(Math.abs(value)).toBeLessThan(1e-12)
  })

  it('joins the realized and forward legs continuously at the valuation date', () => {
    const periods: RfrPeriod[] = [{ start: 0, end: 1, accrual: 1 }]
    const days = 360
    const dayFraction = 1 / 360
    const times: number[] = []
    const rates: number[] = []
    const forwardRate = forwardCompoundedRate(curve, 0, 1)
    for (let i = 0; i <= days; i += 1) {
      times.push(i * dayFraction)
      rates.push(forwardRate)
    }
    const fixings: RfrFixings = { times, rates }
    const realized = rfrFloatingLegValue(periods, fixings, curve, curve, 1)
    const forward = rfrFloatingLegValue(periods, fixings, curve, curve, 0)
    expect(Math.abs(realized - forward)).toBeLessThan(1e-3)
  })
})
