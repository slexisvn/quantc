import { MersenneTwister } from '../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../numerics/rng/inverse-normal-cdf'
import { cholesky, correlate } from '../numerics/linalg/cholesky'

export function generateScenarios(covariance: number[][], count: number, seed: number): number[][] {
  const factor = cholesky(covariance)
  const generator = new MersenneTwister(seed)
  const dimension = covariance.length
  const scenarios: number[][] = []
  for (let s = 0; s < count; s += 1) {
    const independent = new Array<number>(dimension)
    for (let i = 0; i < dimension; i += 1) independent[i] = inverseNormalCdf(generator.nextDouble())
    scenarios.push(correlate(factor, independent))
  }
  return scenarios
}

export function portfolioPnl(scenarios: number[][], sensitivities: number[]): Float64Array {
  const pnl = new Float64Array(scenarios.length)
  for (let s = 0; s < scenarios.length; s += 1) {
    let value = 0
    for (let i = 0; i < sensitivities.length; i += 1) value += sensitivities[i] * scenarios[s][i]
    pnl[s] = value
  }
  return pnl
}
