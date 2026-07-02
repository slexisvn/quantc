import { describe, it, expect } from 'vitest'
import { buildChebyshevProxy } from '../../src/proxy/chebyshev'
import { blackScholes } from '../../src/numerics/analytic/black-scholes'

describe('Chebyshev proxy', () => {
  it('reproduces a polynomial of degree below the node count exactly', () => {
    const poly = (x: number): number => 3 * x * x * x - 2 * x * x + x - 5
    const proxy = buildChebyshevProxy((point) => poly(point[0]), [{ min: -2, max: 2, points: 6 }])
    for (const x of [-1.7, -0.3, 0.8, 1.4]) expect(proxy.evaluate([x])).toBeCloseTo(poly(x), 9)
  })

  it('interpolates a two-dimensional Black-Scholes surface: exact on nodes, tiny off-node error', () => {
    const price = (spot: number, vol: number): number => blackScholes({ spot, strike: 100, rate: 0.03, vol, maturity: 1, isCall: true }).price
    const proxy = buildChebyshevProxy((point) => price(point[0], point[1]), [
      { min: 80, max: 120, points: 15 },
      { min: 0.1, max: 0.4, points: 15 },
    ])
    expect(proxy.evaluate([100, 0.25])).toBeCloseTo(price(100, 0.25), 12)
    for (const [spot, vol] of [[95, 0.22], [108, 0.31], [88, 0.17]] as [number, number][]) {
      expect(Math.abs(proxy.evaluate([spot, vol]) - price(spot, vol))).toBeLessThan(1e-4)
    }
  })
})
