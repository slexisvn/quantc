import { describe, it, expect } from 'vitest'
import { pricePde, type PdeSpec } from '../src/engines/pde-engine'
import { priceEuropean } from '../src/engines/mc-engine'
import { blackScholes } from '../src/numerics/analytic/black-scholes'

describe('PDE engine (Crank-Nicolson + Rannacher + Thomas)', () => {
  const base: PdeSpec = {
    spot: 100,
    strike: 100,
    rate: 0.03,
    vol: 0.2,
    maturity: 1,
    isCall: true,
    american: false,
    spaceSteps: 801,
    timeSteps: 400,
    widthStdDev: 6,
    rannacherSteps: 4,
  }

  it('European call price/delta/gamma match Black-Scholes', () => {
    const reference = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true })
    const result = pricePde(base)
    expect(Math.abs(result.price - reference.price)).toBeLessThan(0.01)
    expect(Math.abs(result.delta - reference.delta)).toBeLessThan(0.005)
    expect(Math.abs(result.gamma - reference.gamma)).toBeLessThan(0.005)
  })

  it('European put matches Black-Scholes', () => {
    const reference = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: false })
    const result = pricePde({ ...base, isCall: false })
    expect(Math.abs(result.price - reference.price)).toBeLessThan(0.01)
  })

  it('PDE agrees with Monte Carlo for a European call', () => {
    const pde = pricePde(base)
    const mc = priceEuropean({
      payoff: 'max(spot - strike, 0)',
      spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1,
      paths: 200000, seed: 99, model: 'gbm',
    })
    expect(Math.abs(pde.price - mc.price)).toBeLessThan(3 * mc.standardError + 0.02)
  })

  it('American put carries a non-negative early-exercise premium', () => {
    const european = pricePde({ ...base, isCall: false })
    const american = pricePde({ ...base, isCall: false, american: true })
    expect(american.price).toBeGreaterThanOrEqual(european.price - 1e-6)
    expect(american.price).toBeGreaterThanOrEqual(Math.max(base.strike - base.spot, 0))
  })
})
