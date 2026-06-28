import { describe, it, expect } from 'vitest'
import { plainPayoffs, antitheticPayoffs, controlPayoffs, sobolPayoffs, type SampleMarket } from '../src/engines/european-samples'
import { plainEstimate, antitheticEstimate, controlVariateEstimate } from '../src/numerics/variance-reduction/estimators'
import { Sobol } from '../src/numerics/rng/sobol'
import { BrownianBridge } from '../src/numerics/rng/brownian-bridge'
import { inverseNormalCdf } from '../src/numerics/rng/inverse-normal-cdf'
import { blackScholes } from '../src/numerics/analytic/black-scholes'

const market: SampleMarket = {
  spot: 100,
  strike: 100,
  rate: 0.04,
  vol: 0.25,
  maturity: 1,
  paths: 100000,
  seed: 314159,
}
const reference = blackScholes({ spot: 100, strike: 100, rate: 0.04, vol: 0.25, maturity: 1, isCall: true })

describe('variance reduction', () => {
  it('antithetic variates reduce the standard error', () => {
    const plain = plainEstimate(plainPayoffs(market))
    const pair = antitheticPayoffs(market)
    const anti = antitheticEstimate(pair.base, pair.antithetic)
    expect(Math.abs(anti.mean - reference.price)).toBeLessThan(0.1)
    expect(anti.standardError).toBeLessThan(plain.standardError)
  })

  it('a control variate reduces the standard error', () => {
    const plain = plainEstimate(plainPayoffs(market))
    const cv = controlPayoffs(market)
    const controlled = controlVariateEstimate(cv.payoff, cv.control, cv.controlMean)
    expect(Math.abs(controlled.mean - reference.price)).toBeLessThan(0.1)
    expect(controlled.standardError).toBeLessThan(plain.standardError)
  })

  it('Sobol low-discrepancy pricing is accurate', () => {
    const sobol = sobolPayoffs({ ...market, paths: 65536 })
    let mean = 0
    for (let i = 0; i < sobol.length; i += 1) mean += sobol[i]
    mean /= sobol.length
    expect(Math.abs(mean - reference.price)).toBeLessThan(0.03)
  })
})

describe('Sobol sequence', () => {
  it('fills the unit interval with low discrepancy', () => {
    const generator = new Sobol(1)
    const n = 1024
    const points: number[] = []
    for (let i = 0; i < n; i += 1) points.push(generator.next()[0])
    points.sort((a, b) => a - b)
    let maxGap = points[0]
    for (let i = 1; i < n; i += 1) maxGap = Math.max(maxGap, points[i] - points[i - 1])
    expect(maxGap).toBeLessThan(2 / n)
  })
})

describe('Brownian bridge', () => {
  it('reproduces the terminal variance of a standard Brownian motion', () => {
    const steps = 8
    const bridge = new BrownianBridge(steps)
    const generator = new Sobol(steps)
    const samples = 20000
    let sum = 0
    let sumSquares = 0
    for (let s = 0; s < samples; s += 1) {
      const normals = new Float64Array(steps)
      const point = generator.next()
      for (let i = 0; i < steps; i += 1) normals[i] = inverseNormalCdf(point[i])
      const path = bridge.buildPath(normals)
      const terminal = path[steps - 1]
      sum += terminal
      sumSquares += terminal * terminal
    }
    const variance = sumSquares / samples - (sum / samples) ** 2
    expect(Math.abs(variance - steps)).toBeLessThan(0.5)
  })
})
