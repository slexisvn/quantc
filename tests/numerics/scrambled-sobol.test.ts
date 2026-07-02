import { describe, it, expect } from 'vitest'
import { ScrambledSobol } from '../../src/numerics/rng/scrambled-sobol'
import { rqmcEuropeanCall, type QmcMarket } from '../../src/engines/qmc-engine'
import { blackScholes } from '../../src/numerics/analytic/black-scholes'
import { MersenneTwister } from '../../src/numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../../src/numerics/rng/inverse-normal-cdf'

describe('scrambled Sobol', () => {
  it('is reproducible for a fixed seed', () => {
    const a = new ScrambledSobol(3, 1234)
    const b = new ScrambledSobol(3, 1234)
    for (let i = 0; i < 100; i += 1) expect(Array.from(a.next())).toEqual(Array.from(b.next()))
  })

  it('has a per-dimension mean near one half and a non-zero first point', () => {
    const generator = new ScrambledSobol(3, 99)
    const first = generator.next()
    expect(first.some((x) => x > 0)).toBe(true)
    const sums = [0, 0, 0]
    const points = 8192
    for (let i = 1; i < points; i += 1) {
      const p = generator.next()
      for (let d = 0; d < 3; d += 1) sums[d] += p[d]
    }
    for (let d = 0; d < 3; d += 1) expect(sums[d] / (points - 1)).toBeCloseTo(0.5, 1)
  })
})

describe('randomised QMC', () => {
  const market: QmcMarket = { spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1 }
  const truth = blackScholes({ spot: 100, strike: 100, rate: 0.03, vol: 0.2, maturity: 1, isCall: true }).price

  it('brackets the true price in at least 80% of replications and beats plain MC standard error', () => {
    const points = 512
    const randomizations = 16
    let covered = 0
    const replications = 50
    for (let r = 0; r < replications; r += 1) {
      const result = rqmcEuropeanCall(market, points, randomizations, 1000 + r * 17, 0.95)
      if (truth >= result.lower && truth <= result.upper) covered += 1
    }
    expect(covered / replications).toBeGreaterThanOrEqual(0.8)

    const rqmcSe = rqmcEuropeanCall(market, points, randomizations, 555, 0.95).standardError
    const budget = points * randomizations
    const generator = new MersenneTwister(555)
    const drift = (market.rate - 0.5 * market.vol * market.vol) * market.maturity
    const diffusion = market.vol * Math.sqrt(market.maturity)
    const discount = Math.exp(-market.rate * market.maturity)
    let sum = 0
    let sumSquares = 0
    for (let i = 0; i < budget; i += 1) {
      const z = inverseNormalCdf(generator.nextDouble())
      const payoff = discount * Math.max(market.spot * Math.exp(drift + diffusion * z) - market.strike, 0)
      sum += payoff
      sumSquares += payoff * payoff
    }
    const mean = sum / budget
    const plainSe = Math.sqrt((sumSquares / budget - mean * mean) / budget)
    expect(rqmcSe).toBeLessThan(plainSe)
  })
})
