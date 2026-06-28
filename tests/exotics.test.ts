import { describe, it, expect } from 'vitest'
import { priceGeometricAsianCall, priceArithmeticAsianCall, priceUpAndOutCall } from '../src/engines/exotics'
import { geometricAsianCall } from '../src/numerics/analytic/geometric-asian'
import { blackScholes } from '../src/numerics/analytic/black-scholes'
import type { PathMarket } from '../src/engines/path-engine'

const market: PathMarket = {
  spot: 100,
  strike: 100,
  rate: 0.05,
  vol: 0.2,
  maturity: 1,
  paths: 50000,
  seed: 2024,
}
const steps = 50

describe('path-dependent exotics with AAD', () => {
  it('geometric Asian call matches its closed form', () => {
    const reference = geometricAsianCall({ ...market, fixings: steps })
    const result = priceGeometricAsianCall(market, steps)
    expect(Math.abs(result.price - reference)).toBeLessThan(3 * result.standardError + 0.02)
    expect(result.delta).toBeGreaterThan(0)
    expect(result.delta).toBeLessThan(1)
  })

  it('arithmetic Asian sits above geometric Asian', () => {
    const arithmetic = priceArithmeticAsianCall(market, steps)
    const geometric = priceGeometricAsianCall(market, steps)
    expect(arithmetic.price).toBeGreaterThan(geometric.price)
    expect(arithmetic.delta).toBeGreaterThan(0)
  })

  it('up-and-out barrier call is cheaper than the vanilla and has finite AAD delta', () => {
    const vanilla = blackScholes({ spot: 100, strike: 100, rate: 0.05, vol: 0.2, maturity: 1, isCall: true })
    const barrier = priceUpAndOutCall(market, steps, 130, 0.5)
    expect(barrier.price).toBeGreaterThan(0)
    expect(barrier.price).toBeLessThan(vanilla.price)
    expect(Number.isFinite(barrier.delta)).toBe(true)
  })
})
