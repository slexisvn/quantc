import { describe, it, expect } from 'vitest'
import { margrabeExchange } from '../src/numerics/analytic/margrabe'
import { exchangeOptionMc, basketCallMc, type MultiAssetSpec } from '../src/engines/multi-asset-mc'
import { exchangeOptionAdi } from '../src/engines/pde-2d'
import { projectedSor } from '../src/engines/pde/psor'
import { solveTridiagonal } from '../src/engines/pde/thomas'

describe('multi-asset Monte Carlo', () => {
  const spec: MultiAssetSpec = {
    spots: [100, 95],
    vols: [0.2, 0.25],
    correlation: [
      [1, 0.4],
      [0.4, 1],
    ],
    rate: 0.03,
    maturity: 1,
    paths: 400000,
    seed: 55,
  }

  it('exchange option matches the Margrabe closed form', () => {
    const reference = margrabeExchange({ spot1: 100, spot2: 95, vol1: 0.2, vol2: 0.25, correlation: 0.4, maturity: 1 })
    const mc = exchangeOptionMc(spec)
    expect(Math.abs(mc.price - reference)).toBeLessThan(3 * mc.standardError + 0.01)
  })

  it('basket call is positive and below the larger underlying', () => {
    const basket = basketCallMc(spec, 95)
    expect(basket.price).toBeGreaterThan(0)
    expect(basket.price).toBeLessThan(100)
  })
})

describe('2-D ADI (Craig-Sneyd / Douglas) PDE', () => {
  it('exchange option matches the Margrabe closed form', () => {
    const reference = margrabeExchange({ spot1: 100, spot2: 95, vol1: 0.2, vol2: 0.25, correlation: 0.4, maturity: 1 })
    const adi = exchangeOptionAdi({
      spot1: 100, spot2: 95, vol1: 0.2, vol2: 0.25, correlation: 0.4, rate: 0.03, maturity: 1,
      gridPoints: 121, timeSteps: 80, widthStdDev: 5,
    })
    expect(Math.abs(adi - reference)).toBeLessThan(0.03)
  })
})

describe('projected SOR (American)', () => {
  it('matches the Thomas solver when the constraint is inactive', () => {
    const lower = new Float64Array([0, -1, -1, -1])
    const diag = new Float64Array([2, 2, 2, 2])
    const upper = new Float64Array([-1, -1, -1, 0])
    const rhs = new Float64Array([1, 1, 1, 1])
    const floor = new Float64Array([-1e9, -1e9, -1e9, -1e9])
    const thomas = solveTridiagonal(lower, diag, upper, rhs)
    const psor = projectedSor(lower, diag, upper, rhs, floor)
    for (let i = 0; i < 4; i += 1) expect(psor[i]).toBeCloseTo(thomas[i], 6)
  })

  it('respects an active early-exercise floor', () => {
    const lower = new Float64Array([0, -1, -1, -1])
    const diag = new Float64Array([2, 2, 2, 2])
    const upper = new Float64Array([-1, -1, -1, 0])
    const rhs = new Float64Array([0.1, 0.1, 0.1, 0.1])
    const floor = new Float64Array([0.5, 0.5, 0.5, 0.5])
    const psor = projectedSor(lower, diag, upper, rhs, floor)
    for (let i = 0; i < 4; i += 1) expect(psor[i]).toBeGreaterThanOrEqual(0.5 - 1e-9)
  })
})
