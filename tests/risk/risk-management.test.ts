import { describe, it, expect } from 'vitest'
import { historicalVar, historicalExpectedShortfall, parametricVar, parametricExpectedShortfall } from '../../src/risk/var'
import { generateScenarios, portfolioPnl } from '../../src/risk/scenarios'
import { jacobiEigen, reconstructCovariance } from '../../src/risk/pca'
import { MersenneTwister } from '../../src/numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../../src/numerics/rng/inverse-normal-cdf'

describe('VaR and Expected Shortfall', () => {
  it('historical VaR/ES on a standard-normal P&L match the analytic values', () => {
    const generator = new MersenneTwister(2024)
    const n = 400000
    const pnl = new Float64Array(n)
    for (let i = 0; i < n; i += 1) pnl[i] = inverseNormalCdf(generator.nextDouble())
    const var99 = historicalVar(pnl, 0.99)
    const es99 = historicalExpectedShortfall(pnl, 0.99)
    expect(var99).toBeCloseTo(2.3263, 1)
    expect(es99).toBeGreaterThan(var99)
    expect(es99).toBeCloseTo(2.665, 1)
  })

  it('parametric (delta-normal) VaR matches a Monte Carlo scenario VaR', () => {
    const covariance = [
      [0.04, 0.006, 0.0],
      [0.006, 0.09, -0.01],
      [0.0, -0.01, 0.0225],
    ]
    const sensitivities = [1.5, -0.8, 2.0]
    const scenarios = generateScenarios(covariance, 400000, 7)
    const pnl = portfolioPnl(scenarios, sensitivities)
    const mcVar = historicalVar(pnl, 0.99)
    const analyticVar = parametricVar(sensitivities, covariance, 0.99)
    expect(Math.abs(mcVar - analyticVar)).toBeLessThan(0.05 * analyticVar)
    expect(parametricExpectedShortfall(sensitivities, covariance, 0.99)).toBeGreaterThan(analyticVar)
  })
})

describe('risk-factor PCA', () => {
  it('eigen-decomposition reconstructs the covariance and orders variance', () => {
    const covariance = [
      [0.04, 0.012, 0.006],
      [0.012, 0.09, 0.018],
      [0.006, 0.018, 0.0225],
    ]
    const system = jacobiEigen(covariance)
    const reconstructed = reconstructCovariance(system)
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) expect(reconstructed[i][j]).toBeCloseTo(covariance[i][j], 10)
    }
    expect(system.values[0]).toBeGreaterThanOrEqual(system.values[1])
    expect(system.values[1]).toBeGreaterThanOrEqual(system.values[2])
    const trace = covariance[0][0] + covariance[1][1] + covariance[2][2]
    expect(system.values[0] + system.values[1] + system.values[2]).toBeCloseTo(trace, 10)
  })
})
