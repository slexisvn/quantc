import { describe, it, expect } from 'vitest'
import { parseProduct } from '../../src/lang/parser'
import { priceProduct } from '../../src/lang/compile'

const PATHS = 100000
const SEED = 20240628

const call = parseProduct(`
  product Call {
    underlying S model gbm
    param strike = 100
    event T = 1.0 { pay max(S(T) - strike, 0) at T }
  }
`)
const market = { spot: 100, rate: 0.03, vol: 0.2 }

describe('Quill Greeks — second order via bump-and-revalue', () => {
  it('exposes gamma, vanna, volga and theta for a single-asset call', () => {
    const result = priceProduct(call, market, PATHS, SEED)
    for (const key of ['delta', 'vega', 'rho', 'gamma', 'vanna', 'volga', 'theta']) {
      expect(Number.isFinite(result.greeks[key])).toBe(true)
    }
  })

  it('gamma matches a finite difference of delta (common random numbers)', () => {
    const h = 0.5
    const base = priceProduct(call, market, PATHS, SEED)
    const up = priceProduct(call, { ...market, spot: 100 + h }, PATHS, SEED)
    const down = priceProduct(call, { ...market, spot: 100 - h }, PATHS, SEED)
    const fd = (up.greeks.delta - down.greeks.delta) / (2 * h)
    expect(Math.abs(base.greeks.gamma - fd)).toBeLessThan(5e-3)
    expect(base.greeks.gamma).toBeGreaterThan(0)
  })

  it('volga matches a finite difference of vega (common random numbers)', () => {
    const h = 0.01
    const base = priceProduct(call, market, PATHS, SEED)
    const up = priceProduct(call, { ...market, vol: 0.2 + h }, PATHS, SEED)
    const down = priceProduct(call, { ...market, vol: 0.2 - h }, PATHS, SEED)
    const fd = (up.greeks.vega - down.greeks.vega) / (2 * h)
    expect(Math.abs(base.greeks.volga - fd)).toBeLessThan(0.5)
  })

  it('theta is negative for a long vanilla call', () => {
    const result = priceProduct(call, market, PATHS, SEED)
    expect(result.greeks.theta).toBeLessThan(0)
  })

  it('still reports only first-order per-asset Greeks for multi-asset products', () => {
    const spread = parseProduct(`
      product Spread {
        underlying A model gbm
        underlying B model gbm
        event T = 1.0 { pay max(A(T) - B(T), 0) at T }
      }
    `)
    const result = priceProduct(spread, { rate: 0.03, spots: { A: 100, B: 100 }, vols: { A: 0.2, B: 0.2 }, correlation: [[1, 0.3], [0.3, 1]] }, PATHS, SEED)
    expect(Number.isFinite(result.greeks.delta_A)).toBe(true)
    expect(Number.isFinite(result.greeks.delta_B)).toBe(true)
    expect(Number.isFinite(result.greeks.theta)).toBe(true)
  })
})
