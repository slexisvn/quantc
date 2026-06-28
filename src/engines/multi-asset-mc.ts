import { MersenneTwister } from '../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../numerics/rng/inverse-normal-cdf'
import { cholesky, correlate } from '../numerics/linalg/cholesky'
import { Welford } from '../numerics/stats/welford'

export interface MultiAssetSpec {
  readonly spots: number[]
  readonly vols: number[]
  readonly correlation: number[][]
  readonly rate: number
  readonly maturity: number
  readonly paths: number
  readonly seed: number
}

export interface MultiAssetResult {
  readonly price: number
  readonly standardError: number
}

function simulateTerminals(spec: MultiAssetSpec, factor: number[][], generator: MersenneTwister): number[] {
  const independent = spec.spots.map(() => inverseNormalCdf(generator.nextDouble()))
  const correlated = correlate(factor, independent)
  return spec.spots.map((spot, i) => spot * Math.exp((spec.rate - 0.5 * spec.vols[i] * spec.vols[i]) * spec.maturity + spec.vols[i] * Math.sqrt(spec.maturity) * correlated[i]))
}

export function exchangeOptionMc(spec: MultiAssetSpec): MultiAssetResult {
  const factor = cholesky(spec.correlation)
  const generator = new MersenneTwister(spec.seed)
  const discount = Math.exp(-spec.rate * spec.maturity)
  const estimator = new Welford()
  for (let p = 0; p < spec.paths; p += 1) {
    const terminals = simulateTerminals(spec, factor, generator)
    estimator.push(discount * Math.max(terminals[0] - terminals[1], 0))
  }
  return { price: estimator.mean, standardError: estimator.standardError }
}

export function basketCallMc(spec: MultiAssetSpec, strike: number): MultiAssetResult {
  const factor = cholesky(spec.correlation)
  const generator = new MersenneTwister(spec.seed)
  const discount = Math.exp(-spec.rate * spec.maturity)
  const estimator = new Welford()
  for (let p = 0; p < spec.paths; p += 1) {
    const terminals = simulateTerminals(spec, factor, generator)
    let average = 0
    for (const terminal of terminals) average += terminal
    average /= terminals.length
    estimator.push(discount * Math.max(average - strike, 0))
  }
  return { price: estimator.mean, standardError: estimator.standardError }
}
