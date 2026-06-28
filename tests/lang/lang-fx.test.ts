import { describe, it, expect } from 'vitest'
import { parseProduct } from '../../src/lang/parser'
import { checkProduct } from '../../src/lang/typecheck'
import { priceProduct } from '../../src/lang/compile'
import { blackScholes, normalCdf } from '../../src/numerics/analytic/black-scholes'

const PATHS = 200000
const SEED = 5150

// Garman-Kohlhagen FX call: domestic discount, forward drift (r_d - r_f).
function garmanKohlhagen(spot: number, strike: number, rd: number, rf: number, vol: number, T: number): number {
  const forward = spot * Math.exp((rd - rf) * T)
  const sd = vol * Math.sqrt(T)
  const d1 = (Math.log(forward / strike) + 0.5 * sd * sd) / sd
  const d2 = d1 - sd
  return Math.exp(-rd * T) * (forward * normalCdf(d1) - strike * normalCdf(d2))
}

const fxCall = (model: string) => parseProduct(`
  product FxCall {
    underlying X model ${model}
    param strike = 1.30
    event T = 1.0 { pay max(X(T) - strike, 0) at T }
  }
`)

describe('Quill FX — Garman-Kohlhagen', () => {
  it('an FX call matches the closed-form GK price', () => {
    const result = priceProduct(fxCall('fx(foreignRate = 0.01)'), { spot: 1.3, rate: 0.03, vol: 0.1 }, PATHS, SEED, { greeks: 'price-only' })
    const reference = garmanKohlhagen(1.3, 1.3, 0.03, 0.01, 0.1, 1)
    expect(Math.abs(result.price - reference)).toBeLessThan(2e-3)
  })

  it('a higher foreign rate lowers the call (lower FX forward)', () => {
    const low = priceProduct(fxCall('fx(foreignRate = 0.0)'), { spot: 1.3, rate: 0.03, vol: 0.1 }, PATHS, SEED, { greeks: 'price-only' })
    const high = priceProduct(fxCall('fx(foreignRate = 0.05)'), { spot: 1.3, rate: 0.03, vol: 0.1 }, PATHS, SEED, { greeks: 'price-only' })
    expect(high.price).toBeLessThan(low.price)
  })

  it('foreignRate = 0 reduces FX to plain GBM (same seed)', () => {
    const fx = priceProduct(fxCall('fx(foreignRate = 0)'), { spot: 1.3, rate: 0.03, vol: 0.1 }, PATHS, SEED, { greeks: 'price-only' })
    const gbm = priceProduct(fxCall('gbm'), { spot: 1.3, rate: 0.03, vol: 0.1 }, PATHS, SEED, { greeks: 'price-only' })
    expect(Math.abs(fx.price - gbm.price)).toBeLessThan(1e-9)
  })

  it('GBM (foreignRate 0) agrees with Black-Scholes', () => {
    const result = priceProduct(fxCall('fx(foreignRate = 0)'), { spot: 1.3, rate: 0.03, vol: 0.1 }, PATHS, SEED, { greeks: 'price-only' })
    const reference = blackScholes({ spot: 1.3, strike: 1.3, rate: 0.03, vol: 0.1, maturity: 1, isCall: true })
    expect(Math.abs(result.price - reference.price)).toBeLessThan(2e-3)
  })

  it('treats foreignRate as optional, resolved from the market', () => {
    expect(checkProduct(fxCall('fx(foreignRate = 0.01)'))).toEqual([])
    const omitted = parseProduct('product P { underlying X model fx event T = 1.0 { pay X(T) at T } }')
    expect(checkProduct(omitted)).toEqual([])
    expect(() => priceProduct(omitted, { spot: 1.3, rate: 0.03, vol: 0.1 }, 2000, SEED, { greeks: 'price-only' })).toThrow(/missing model parameter 'foreignRate'/)
    expect(() => priceProduct(omitted, { spot: 1.3, rate: 0.03, vol: 0.1, modelParams: { X: { foreignRate: 0.01 } } }, 2000, SEED, { greeks: 'price-only' })).not.toThrow()
  })
})

describe('Quill FX — foreign-currency cashflow conversion', () => {
  const foreignCash = parseProduct(`
    product ForeignCash {
      underlying EUR model fx(foreignRate = 0.01)
      param notional = 100
      event T = 2.0 { pay notional in EUR at T }
    }
  `)

  it('pays a foreign cashflow converted at the realized FX rate: PV = N·X0·exp(-rf·T)', () => {
    const result = priceProduct(foreignCash, { spot: 1.3, rate: 0.03, vol: 0.1 }, PATHS, SEED, { greeks: 'price-only' })
    const reference = 100 * 1.3 * Math.exp(-0.01 * 2)
    expect(Math.abs(result.price - reference)).toBeLessThan(0.3)
  })

  it('rejects pay-in-currency when the currency is not an underlying', () => {
    const errors = checkProduct(parseProduct('product P { underlying S model gbm event T = 1.0 { pay 1 in EUR at T } }'))
    expect(errors.some((e) => /must be an FX underlying/.test(e.message))).toBe(true)
  })
})
