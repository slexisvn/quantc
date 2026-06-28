import { describe, it, expect } from 'vitest'
import { zeroCouponBond, europeanCall, and, give, desugar } from '../../src/lang/contracts'
import { priceProduct } from '../../src/lang/compile'
import { blackScholes } from '../../src/numerics/analytic/black-scholes'

const market = { spot: 100, rate: 0.03, vol: 0.2 }

describe('Composing-Contracts combinator layer', () => {
  it('a zero-coupon bond desugars to its discounted notional', () => {
    const result = priceProduct(desugar(zeroCouponBond(1, 100)), market, 10000, 1)
    expect(result.price).toBeCloseTo(100 * Math.exp(-0.03), 6)
  })

  it('a European call contract desugars and prices to Black-Scholes', () => {
    const result = priceProduct(desugar(europeanCall(1, 100)), market, 200000, 99)
    const reference = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
    expect(Math.abs(result.price - reference.price)).toBeLessThan(0.2)
  })

  it('a portfolio (call minus a bond) equals the sum of its legs', () => {
    const portfolio = and(europeanCall(1, 100), give(zeroCouponBond(1, 50)))
    const result = priceProduct(desugar(portfolio), market, 200000, 99)
    const call = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true }).price
    const bond = 50 * Math.exp(-0.03)
    expect(Math.abs(result.price - (call - bond))).toBeLessThan(0.2)
  })
})
