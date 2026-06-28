import { describe, it, expect } from 'vitest'
import { parseProduct } from '../../src/lang/parser'
import { priceProduct, type ProductMarket } from '../../src/lang/compile'
import { blackScholes, normalCdf } from '../../src/numerics/analytic/black-scholes'
import { DiscountCurve } from '../../src/marketdata/curve'
import { daysFromCivil } from '../../src/marketdata/date'
import { dayCountFraction } from '../../src/marketdata/daycount'
import { weekendOnly } from '../../src/marketdata/calendar'

const PATHS = 100000
const SEED = 73101

const call = parseProduct(`
  product Call {
    underlying S model gbm
    param strike = 100
    event T = 1.0 { pay max(S(T) - strike, 0) at T }
  }
`)

describe('Quill market — discount curve', () => {
  it('a flat curve reproduces flat-rate pricing exactly', () => {
    const flat = priceProduct(call, { spot: 100, rate: 0.03, vol: 0.2 }, PATHS, SEED)
    const curve = new DiscountCurve([0.5, 1, 2, 5], [0.03, 0.03, 0.03, 0.03])
    const curved = priceProduct(call, { spot: 100, rate: 0.03, vol: 0.2, curve }, PATHS, SEED)
    expect(Math.abs(curved.price - flat.price)).toBeLessThan(1e-9)
  })

  it('a sloped curve prices a 1y European at the zero rate to maturity', () => {
    const curve = new DiscountCurve([0.5, 1, 2, 5], [0.02, 0.04, 0.05, 0.055])
    const result = priceProduct(call, { spot: 100, rate: 0.0, vol: 0.2, curve }, PATHS, SEED)
    const reference = blackScholes({ spot: 100, strike: 100, rate: curve.zeroRate(1), vol: 0.2, maturity: 1, isCall: true })
    expect(Math.abs(result.price - reference.price)).toBeLessThan(0.2)
  })

  it('rho stays finite under a curve', () => {
    const curve = new DiscountCurve([0.5, 1, 2], [0.02, 0.04, 0.05])
    const result = priceProduct(call, { spot: 100, rate: 0.0, vol: 0.2, curve }, PATHS, SEED)
    expect(Number.isFinite(result.greeks.rho)).toBe(true)
  })

  it('exposes bucketed key-rate rho that sums to the parallel rho', () => {
    const curve = new DiscountCurve([0.5, 1, 2], [0.02, 0.04, 0.05])
    const result = priceProduct(call, { spot: 100, rate: 0.0, vol: 0.2, curve }, PATHS, SEED)
    const bucketed = [0, 1, 2].map((i) => result.greeks[`rho_pillar_${i}`])
    for (const kr of bucketed) expect(Number.isFinite(kr)).toBe(true)
    const sum = bucketed.reduce((a, b) => a + b, 0)
    expect(Math.abs(sum - result.greeks.rho)).toBeLessThan(1e-3)
    // A 1y European only feels the pillars around its maturity, not the 2y point.
    expect(Math.abs(bucketed[2])).toBeLessThan(Math.abs(bucketed[1]))
  })
})

describe('Quill market — quanto drift adjustment', () => {
  function quantoCall(spot: number, strike: number, r: number, vol: number, fxVol: number, corr: number, T: number): number {
    const mu = r - corr * vol * fxVol
    const forward = spot * Math.exp(mu * T)
    const sd = vol * Math.sqrt(T)
    const d1 = (Math.log(forward / strike) + 0.5 * sd * sd) / sd
    const d2 = d1 - sd
    return Math.exp(-r * T) * (forward * normalCdf(d1) - strike * normalCdf(d2))
  }

  it('matches the closed-form quanto call price', () => {
    const market: ProductMarket = { spot: 100, rate: 0.03, vol: 0.2, quanto: { S: { fxVol: 0.1, correlation: -0.5 } } }
    const result = priceProduct(call, market, PATHS, SEED)
    const reference = quantoCall(100, 100, 0.03, 0.2, 0.1, -0.5, 1)
    expect(Math.abs(result.price - reference)).toBeLessThan(0.2)
  })

  it('negative spot/FX correlation lifts the call versus no quanto', () => {
    const plain = priceProduct(call, { spot: 100, rate: 0.03, vol: 0.2 }, PATHS, SEED)
    const quanto = priceProduct(call, { spot: 100, rate: 0.03, vol: 0.2, quanto: { S: { fxVol: 0.1, correlation: -0.5 } } }, PATHS, SEED)
    expect(quanto.price).toBeGreaterThan(plain.price)
  })
})

describe('Quill market — curve built from real calendar dates', () => {
  it('bootstraps year fractions with a calendar + day-count and prices off the curve', () => {
    const calendar = weekendOnly()
    const valuation = calendar.adjust(daysFromCivil(2026, 6, 28), 'following')
    const pillars = [
      { date: daysFromCivil(2026, 12, 28), zeroRate: 0.03 },
      { date: daysFromCivil(2027, 6, 28), zeroRate: 0.035 },
      { date: daysFromCivil(2028, 6, 28), zeroRate: 0.04 },
    ]
    const times = pillars.map((p) => dayCountFraction('ACT/365', valuation, calendar.adjust(p.date, 'following')))
    const curve = new DiscountCurve(times, pillars.map((p) => p.zeroRate))
    const result = priceProduct(call, { spot: 100, rate: 0.0, vol: 0.2, curve }, PATHS, SEED)
    const reference = blackScholes({ spot: 100, strike: 100, rate: curve.zeroRate(1), vol: 0.2, maturity: 1, isCall: true })
    expect(Math.abs(result.price - reference.price)).toBeLessThan(0.25)
  })
})
