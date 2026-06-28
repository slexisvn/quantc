import { describe, it, expect } from 'vitest'
import { parseProduct } from '../../src/lang/parser'
import { checkProduct } from '../../src/lang/typecheck'
import { priceProduct, type ProductMarket } from '../../src/lang/compile'
import { margrabeExchange } from '../../src/numerics/analytic/margrabe'
import { basketCallMc } from '../../src/engines/multi-asset-mc'
import { blackScholes } from '../../src/numerics/analytic/black-scholes'

const PATHS = 200000
const SEED = 12345

describe('Quill multi-asset — exchange option vs Margrabe', () => {
  const exchange = parseProduct(`
    product Exchange {
      underlying S1 model gbm
      underlying S2 model gbm
      event T = 1.0 { pay max(S1(T) - S2(T), 0) at T }
    }
  `)
  const market: ProductMarket = {
    rate: 0.03,
    spots: { S1: 100, S2: 95 },
    vols: { S1: 0.2, S2: 0.25 },
    correlation: [
      [1, 0.3],
      [0.3, 1],
    ],
  }

  it('type-checks with two underlyings', () => {
    expect(checkProduct(exchange)).toEqual([])
  })

  it('matches the closed-form Margrabe price', () => {
    const result = priceProduct(exchange, market, PATHS, SEED)
    const reference = margrabeExchange({ spot1: 100, spot2: 95, vol1: 0.2, vol2: 0.25, correlation: 0.3, maturity: 1 })
    expect(Math.abs(result.price - reference)).toBeLessThan(0.3)
  })

  it('reports per-asset deltas with the right signs', () => {
    const result = priceProduct(exchange, market, PATHS, SEED)
    expect(result.greeks.delta_S1).toBeGreaterThan(0)
    expect(result.greeks.delta_S2).toBeLessThan(0)
  })

  it('AAD delta_S1 matches a common-random-number finite difference', () => {
    const h = 0.5
    const base = priceProduct(exchange, market, PATHS, SEED)
    const up = priceProduct(exchange, { ...market, spots: { S1: 100 + h, S2: 95 } }, PATHS, SEED)
    const down = priceProduct(exchange, { ...market, spots: { S1: 100 - h, S2: 95 } }, PATHS, SEED)
    const fd = (up.price - down.price) / (2 * h)
    expect(Math.abs(base.greeks.delta_S1 - fd)).toBeLessThan(1e-2)
  })
})

describe('Quill multi-asset — basket call vs reference MC', () => {
  const basket = parseProduct(`
    product Basket {
      underlying A model gbm
      underlying B model gbm
      param strike = 100
      event T = 1.0 { pay max((A(T) + B(T)) / 2 - strike, 0) at T }
    }
  `)
  const correlation = [
    [1, 0.5],
    [0.5, 1],
  ]
  const market: ProductMarket = { rate: 0.03, spots: { A: 100, B: 100 }, vols: { A: 0.2, B: 0.2 }, correlation }

  it('matches basketCallMc within combined Monte Carlo error', () => {
    const result = priceProduct(basket, market, PATHS, SEED)
    const reference = basketCallMc({ spots: [100, 100], vols: [0.2, 0.2], correlation, rate: 0.03, maturity: 1, paths: PATHS, seed: 999 }, 100)
    expect(Math.abs(result.price - reference.price)).toBeLessThan(0.3)
  })
})

describe('Quill multi-asset — worst-of call bounds', () => {
  const worstOf = parseProduct(`
    product WorstOf {
      underlying X model gbm
      underlying Y model gbm
      param strike = 100
      event T = 1.0 { pay max(min(X(T), Y(T)) - strike, 0) at T }
    }
  `)
  const market: ProductMarket = {
    rate: 0.03,
    spots: { X: 100, Y: 100 },
    vols: { X: 0.2, Y: 0.2 },
    correlation: [
      [1, 0.5],
      [0.5, 1],
    ],
  }

  it('prices below a single-asset call and above zero, with finite per-asset deltas', () => {
    const result = priceProduct(worstOf, market, PATHS, SEED)
    const vanilla = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
    expect(result.price).toBeGreaterThan(0)
    expect(result.price).toBeLessThan(vanilla.price)
    expect(Number.isFinite(result.greeks.delta_X)).toBe(true)
    expect(Number.isFinite(result.greeks.delta_Y)).toBe(true)
  })

  it('is worth more as correlation rises (closer to a single-asset call)', () => {
    const lowCorr = priceProduct(worstOf, { ...market, correlation: [[1, 0.0], [0.0, 1]] }, PATHS, SEED)
    const highCorr = priceProduct(worstOf, { ...market, correlation: [[1, 0.9], [0.9, 1]] }, PATHS, SEED)
    expect(highCorr.price).toBeGreaterThan(lowCorr.price)
  })
})
