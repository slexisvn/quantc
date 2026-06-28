import { MersenneTwister } from './rng/mersenne-twister'
import { inverseNormalCdf } from './rng/inverse-normal-cdf'

export function standardNormals(count: number, seed: number): Float64Array {
  const generator = new MersenneTwister(seed)
  const draws = new Float64Array(count)
  for (let i = 0; i < count; i += 1) draws[i] = inverseNormalCdf(generator.nextDouble())
  return draws
}
