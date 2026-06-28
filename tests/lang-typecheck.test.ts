import { describe, it, expect } from 'vitest'
import { parseProduct } from '../src/lang/parser'
import { checkProduct } from '../src/lang/typecheck'

describe('type checker', () => {
  it('accepts a well-typed product', () => {
    const product = parseProduct(`
      product Autocall {
        underlying S model gbm
        param coupon = 0.02
        var accrued = 0
        event t in schedule(0.25, 3.0, 0.25) {
          accrued = accrued + coupon
          if S(t) >= S(0) then { pay 1 + accrued at t  stop }
        }
      }
    `)
    expect(checkProduct(product)).toEqual([])
  })

  it('rejects an undeclared identifier with a position', () => {
    const product = parseProduct(`
      product P {
        underlying S model gbm
        event T = 1.0 { pay missing at T }
      }
    `)
    const errors = checkProduct(product)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].message).toMatch(/undeclared identifier 'missing'/)
    expect(errors[0].line).toBeGreaterThan(0)
  })

  it('rejects a non-Bool if-condition', () => {
    const product = parseProduct(`
      product P {
        underlying S model gbm
        event T = 1.0 { if S(T) + 1 then { stop } }
      }
    `)
    const errors = checkProduct(product)
    expect(errors.some((e) => /if condition must be Bool/.test(e.message))).toBe(true)
  })

  it('rejects an unknown function and assignment to an undeclared variable', () => {
    const product = parseProduct(`
      product P {
        underlying S model gbm
        event T = 1.0 { y = wibble(S(T)) }
      }
    `)
    const errors = checkProduct(product)
    expect(errors.some((e) => /unknown function 'wibble'/.test(e.message))).toBe(true)
    expect(errors.some((e) => /assignment to undeclared variable 'y'/.test(e.message))).toBe(true)
  })
})
