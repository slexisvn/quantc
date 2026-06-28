import { describe, it, expect } from 'vitest'
import { tokenize } from '../src/lang/lexer'
import { parseProduct } from '../src/lang/parser'
import { printProduct } from '../src/lang/printer'

const autocall = `
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
`

describe('lexer', () => {
  it('tracks positions and classifies keywords', () => {
    const tokens = tokenize('event T = 1.0')
    expect(tokens[0]).toMatchObject({ type: 'keyword', value: 'event', line: 1, col: 1 })
    expect(tokens[1]).toMatchObject({ type: 'ident', value: 'T' })
    expect(tokens[2]).toMatchObject({ type: 'op', value: '=' })
    expect(tokens[3]).toMatchObject({ type: 'number', value: '1.0' })
  })

  it('lexes comparison and logical operators and comments', () => {
    const tokens = tokenize('a >= b and not c // trailing')
    expect(tokens.map((t) => t.value)).toEqual(['a', '>=', 'b', 'and', 'not', 'c', ''])
  })
})

describe('parser', () => {
  it('parses a full autocallable product', () => {
    const product = parseProduct(autocall)
    expect(product.name).toBe('Autocall')
    expect(product.underlyings).toHaveLength(1)
    expect(product.params).toHaveLength(1)
    expect(product.vars).toHaveLength(1)
    expect(product.events).toHaveLength(2)
    expect(product.events[0].schedule.kind).toBe('schedule')
    expect(product.events[1].schedule.kind).toBe('single')
  })

  it('pretty-printing round-trips (idempotent)', () => {
    const once = printProduct(parseProduct(autocall))
    const twice = printProduct(parseProduct(once))
    expect(twice).toBe(once)
  })

  it('reports parse errors with positions', () => {
    expect(() => parseProduct('product P { event T = 1.0 { pay 1 } }')).toThrow(/at \d+:\d+/)
  })
})
