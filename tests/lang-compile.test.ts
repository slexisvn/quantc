import { describe, it, expect } from 'vitest'
import { parseProduct } from '../src/lang/parser'
import { priceProduct } from '../src/lang/compile'
import { blackScholes } from '../src/numerics/analytic/black-scholes'

const market = { spot: 100, rate: 0.03, vol: 0.2 }

describe('compiled .qc language — European parity', () => {
  const european = parseProduct(`
    product EuropeanCall {
      underlying S model gbm
      param strike = 100
      event T = 1.0 { pay max(S(T) - strike, 0) at T }
    }
  `)
  const result = priceProduct(european, market, 200000, 12345)
  const reference = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })

  it('matches the Black-Scholes price and delta', () => {
    expect(Math.abs(result.price - reference.price)).toBeLessThan(0.2)
    expect(Math.abs(result.greeks.delta - reference.delta)).toBeLessThan(0.01)
  })

  it('AAD delta through the script matches a finite-difference bump', () => {
    const h = 0.05
    const up = priceProduct(european, { ...market, spot: 100 + h }, 200000, 12345)
    const down = priceProduct(european, { ...market, spot: 100 - h }, 200000, 12345)
    const fd = (up.price - down.price) / (2 * h)
    expect(Math.abs(result.greeks.delta - fd)).toBeLessThan(5e-3)
  })
})

describe('compiled .qc language — path-dependent products', () => {
  it('up-and-out barrier (explicit state) is cheaper than the vanilla call', () => {
    const barrier = parseProduct(`
      product UpAndOut {
        underlying S model gbm
        param strike = 100
        param barrier = 130
        var alive = 1
        event t in schedule(0.05, 1.0, 0.05) {
          if S(t) >= barrier then { alive = 0 }
        }
        event T = 1.0 { pay alive * max(S(T) - strike, 0) at T }
      }
    `)
    const result = priceProduct(barrier, market, 100000, 3)
    const vanilla = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
    expect(result.price).toBeGreaterThan(0)
    expect(result.price).toBeLessThan(vanilla.price)
    expect(Number.isFinite(result.greeks.delta)).toBe(true)
  })

  it('autocallable note prices within bounds with a finite delta', () => {
    const autocall = parseProduct(`
      product Autocall {
        underlying S model gbm
        param coupon = 0.02
        var accrued = 0
        event t in schedule(0.25, 3.0, 0.25) {
          accrued = accrued + coupon
          if S(t) >= S(0) then { pay 1 + accrued at t  stop }
        }
        event T = 3.0 { pay min(S(T) / S(0), 1) at T }
      }
    `)
    const result = priceProduct(autocall, market, 100000, 7)
    expect(result.price).toBeGreaterThan(0.7)
    expect(result.price).toBeLessThan(1.1)
    expect(Number.isFinite(result.greeks.delta)).toBe(true)
  })

  it('arithmetic Asian via average(S) is positive and below the vanilla', () => {
    const asian = parseProduct(`
      product AsianCall {
        underlying S model gbm
        param strike = 100
        event t in schedule(0.1, 1.0, 0.1) { }
        event T = 1.0 { pay max(average(S) - strike, 0) at T }
      }
    `)
    const result = priceProduct(asian, market, 100000, 5)
    const vanilla = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
    expect(result.price).toBeGreaterThan(0)
    expect(result.price).toBeLessThan(vanilla.price)
  })
})
