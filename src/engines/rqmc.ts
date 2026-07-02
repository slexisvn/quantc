import { ScrambledSobol } from '../numerics/rng/scrambled-sobol'
import { Welford } from '../numerics/stats/welford'
import { inverseNormalCdf } from '../numerics/rng/inverse-normal-cdf'

export interface RqmcResult {
  readonly mean: number
  readonly standardError: number
  readonly lower: number
  readonly upper: number
}

export function rqmcEstimate(
  integrand: (point: Float64Array) => number,
  dimension: number,
  points: number,
  randomizations: number,
  seed: number,
  confidence: number,
): RqmcResult {
  const accumulator = new Welford()
  for (let r = 0; r < randomizations; r += 1) {
    const generator = new ScrambledSobol(dimension, seed + r)
    let total = 0
    for (let i = 0; i < points; i += 1) total += integrand(generator.next())
    accumulator.push(total / points)
  }
  const z = inverseNormalCdf(0.5 * (1 + confidence))
  const halfWidth = z * accumulator.standardError
  return { mean: accumulator.mean, standardError: accumulator.standardError, lower: accumulator.mean - halfWidth, upper: accumulator.mean + halfWidth }
}
