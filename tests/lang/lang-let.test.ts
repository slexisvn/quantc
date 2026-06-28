import { describe, it, expect } from 'vitest'
import { parseProduct } from '../../src/lang/parser'
import { checkProduct } from '../../src/lang/typecheck'
import { printProduct } from '../../src/lang/printer'
import { priceProduct } from '../../src/lang/compile'

const market = { spot: 100, rate: 0.03, vol: 0.2 }
const PATHS = 100000
const SEED = 31337

describe('Quill let-bindings', () => {
  it('a let expression prices identically to the inlined form (same seed)', () => {
    const withLet = parseProduct(`
      product LetCall {
        underlying S model gbm
        param strike = 100
        event T = 1.0 { pay (let m = S(T) / strike in max(m - 1, 0) * strike) at T }
      }
    `)
    const inlined = parseProduct(`
      product PlainCall {
        underlying S model gbm
        param strike = 100
        event T = 1.0 { pay max(S(T) - strike, 0) at T }
      }
    `)
    const a = priceProduct(withLet, market, PATHS, SEED, { greeks: 'price-only' })
    const b = priceProduct(inlined, market, PATHS, SEED, { greeks: 'price-only' })
    expect(Math.abs(a.price - b.price)).toBeLessThan(1e-9)
  })

  it('supports nested let bindings', () => {
    const product = parseProduct(`
      product Nested {
        underlying S model gbm
        param strike = 100
        event T = 1.0 { pay (let a = S(T) in let b = a - strike in max(b, 0)) at T }
      }
    `)
    expect(checkProduct(product)).toEqual([])
    const result = priceProduct(product, market, PATHS, SEED, { greeks: 'price-only' })
    expect(result.price).toBeGreaterThan(0)
  })

  it('round-trips through the printer', () => {
    const source = `
      product P {
        underlying S model gbm
        param strike = 100
        event T = 1.0 { pay (let m = S(T) - strike in max(m, 0)) at T }
      }
    `
    const once = printProduct(parseProduct(source))
    expect(once).toContain('let m =')
    expect(printProduct(parseProduct(once))).toBe(once)
  })

  it('does not leak the binding outside the let body', () => {
    const product = parseProduct(`
      product Leak {
        underlying S model gbm
        event T = 1.0 { pay (let m = S(T) in m) + m at T }
      }
    `)
    const errors = checkProduct(product)
    expect(errors.some((e) => /undeclared identifier 'm'/.test(e.message))).toBe(true)
  })
})
