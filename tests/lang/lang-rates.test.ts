import { describe, it, expect } from 'vitest'
import { parseProduct } from '../../src/lang/parser'
import { checkProduct } from '../../src/lang/typecheck'
import { priceProduct, type ProductMarket } from '../../src/lang/compile'
import { DiscountCurve } from '../../src/marketdata/curve'
import { zeroBondPut, hullWhitePayerSwaption } from '../../src/models/rates/hull-white-1f'
import { g2ppPayerSwaption, g2ppBondToday } from '../../src/models/rates/g2pp'

const curve = new DiscountCurve([0.5, 1, 2, 5, 10], [0.02, 0.025, 0.03, 0.032, 0.035])
const market: ProductMarket = { rate: 0, curve, modelParams: { r: { meanReversion: 0.05, vol: 0.01 } } }
const PATHS = 60000
const SEED = 9090

const hw = (body: string) => parseProduct(`
  product RateProduct {
    underlying r model hw1f(meanReversion = 0.05, vol = 0.01)
    param strike = 0.9
    ${body}
  }
`)

describe('Quill rates — Hull-White stochastic discounting', () => {
  it('a unit cashflow reproduces the curve discount factor (E[exp(-∫r)] = P(0,T))', () => {
    const product = hw('event T = 5.0 { pay 1 at T }')
    const result = priceProduct(product, market, PATHS, SEED, { greeks: 'price-only' })
    expect(Math.abs(result.price - curve.discountFactor(5))).toBeLessThan(8e-3)
  })

  it('the affine bond satisfies the tower property: pay P(t,T) at t prices to P(0,T)', () => {
    const product = hw('event t = 2.0 { pay bond(r, 5.0) at t }')
    const result = priceProduct(product, market, PATHS, SEED, { greeks: 'price-only' })
    expect(Math.abs(result.price - curve.discountFactor(5))).toBeLessThan(8e-3)
  })
})

describe('Quill rates — zero-coupon bond option vs analytic', () => {
  it('matches the Hull-White zero-bond put price', () => {
    const expiry = 1
    const bondMaturity = 5
    const strike = 0.9
    const product = hw(`event T = 1.0 { pay max(strike - bond(r, 5.0), 0) at T }`)
    const result = priceProduct(product, market, 120000, SEED, { greeks: 'price-only' })
    const reference = zeroBondPut({ curve, meanReversion: 0.05, vol: 0.01 }, expiry, bondMaturity, strike)
    expect(Math.abs(result.price - reference)).toBeLessThan(4e-3)
  })
})

describe('Quill rates — payer swaption via bond aggregation', () => {
  it('matches the analytic Hull-White payer swaption', () => {
    // 1y into 4y annual payer swaption (unit notional): payoff = max(1 - couponBond, 0).
    const product = parseProduct(`
      product PayerSwaption {
        underlying r model hw1f(meanReversion = 0.05, vol = 0.01)
        param K = 0.03
        event T = 1.0 {
          pay max(1 - (K * bond(r, 2.0) + K * bond(r, 3.0) + K * bond(r, 4.0) + (1 + K) * bond(r, 5.0)), 0) at T
        }
      }
    `)
    const result = priceProduct(product, market, 150000, SEED, { greeks: 'price-only' })
    const reference = hullWhitePayerSwaption({ curve, meanReversion: 0.05, vol: 0.01 }, { expiry: 1, times: [2, 3, 4, 5], accruals: [1, 1, 1, 1], fixedRate: 0.03 })
    expect(Math.abs(result.price - reference)).toBeLessThan(3e-3)
  })
})

describe('Quill rates — G2++ two-factor', () => {
  const g2spec = { flatRate: 0.025, meanReversionA: 0.7, meanReversionB: 0.1, volA: 0.01, volB: 0.012, correlation: -0.7 }
  const g2market = { rate: 0.025 }
  const g2 = (body: string) => parseProduct(`
    product G2 {
      underlying r model g2pp(meanReversionA = 0.7, meanReversionB = 0.1, volA = 0.01, volB = 0.012, correlation = -0.7)
      param K = 0.03
      ${body}
    }
  `)

  it('the affine bond satisfies the tower property under G2++', () => {
    const product = g2('event t = 2.0 { pay bond(r, 5.0) at t }')
    const result = priceProduct(product, g2market, 80000, SEED, { greeks: 'price-only' })
    expect(Math.abs(result.price - g2ppBondToday(g2spec, 5))).toBeLessThan(8e-3)
  })

  it('matches the analytic G2++ payer swaption', () => {
    const product = g2('event T = 1.0 { pay max(1 - (K * bond(r, 2.0) + K * bond(r, 3.0) + K * bond(r, 4.0) + (1 + K) * bond(r, 5.0)), 0) at T }')
    const result = priceProduct(product, g2market, 150000, SEED, { greeks: 'price-only' })
    const reference = g2ppPayerSwaption(g2spec, { expiry: 1, times: [2, 3, 4, 5], accruals: [1, 1, 1, 1], fixedRate: 0.03 }, 64)
    expect(Math.abs(result.price - reference)).toBeLessThan(4e-3)
  })

  it('treats an omitted G2++ parameter as optional, resolved from the market', () => {
    const omitted = parseProduct('product P { underlying r model g2pp(meanReversionA = 0.7, meanReversionB = 0.1, volA = 0.01, volB = 0.012) event T = 1.0 { pay bond(r, 5.0) at T } }')
    expect(checkProduct(omitted)).toEqual([])
    expect(() => priceProduct(omitted, { rate: 0.025 }, 2000, SEED, { greeks: 'price-only' })).toThrow(/missing model parameter 'correlation'/)
    expect(() => priceProduct(omitted, { rate: 0.025, modelParams: { r: { correlation: -0.7 } } }, 2000, SEED, { greeks: 'price-only' })).not.toThrow()
  })
})

describe('Quill rates — typecheck', () => {
  it('accepts a well-formed hw1f underlying and bond observable', () => {
    expect(checkProduct(hw('event T = 1.0 { pay bond(r, 5.0) at T }'))).toEqual([])
  })

  it('treats an omitted hw1f parameter as optional, resolved from the market', () => {
    const omitted = parseProduct('product P { underlying r model hw1f(meanReversion = 0.05) event T = 1.0 { pay 1 at T } }')
    expect(checkProduct(omitted)).toEqual([])
    expect(() => priceProduct(omitted, { rate: 0.02 }, 2000, SEED, { greeks: 'price-only' })).toThrow(/missing model parameter 'vol'/)
    expect(() => priceProduct(omitted, { rate: 0.02, modelParams: { r: { vol: 0.01 } } }, 2000, SEED, { greeks: 'price-only' })).not.toThrow()
  })

  it('rejects bond on a non-underlying', () => {
    const errors = checkProduct(parseProduct('product P { underlying r model hw1f(meanReversion = 0.05, vol = 0.01) event T = 1.0 { pay bond(strike, 5.0) at T } }'))
    expect(errors.some((e) => /bond expects a rate underlying/.test(e.message))).toBe(true)
  })
})
