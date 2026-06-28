import { MersenneTwister } from '../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../numerics/rng/inverse-normal-cdf'

export interface Obligor {
  readonly defaultProbability: number
  readonly exposure: number
  readonly lossGivenDefault: number
}

export interface IrcSpec {
  readonly obligors: readonly Obligor[]
  readonly correlation: number
  readonly confidence: number
  readonly scenarios: number
  readonly seed: number
}

export function incrementalRiskCharge(spec: IrcSpec): number {
  const generator = new MersenneTwister(spec.seed)
  const factorLoading = Math.sqrt(spec.correlation)
  const idiosyncratic = Math.sqrt(1 - spec.correlation)
  const thresholds = spec.obligors.map((obligor) => inverseNormalCdf(obligor.defaultProbability))

  const losses = new Float64Array(spec.scenarios)
  let expected = 0
  for (let s = 0; s < spec.scenarios; s += 1) {
    const systemic = inverseNormalCdf(generator.nextDouble())
    let loss = 0
    for (let i = 0; i < spec.obligors.length; i += 1) {
      const latent = factorLoading * systemic + idiosyncratic * inverseNormalCdf(generator.nextDouble())
      if (latent < thresholds[i]) loss += spec.obligors[i].exposure * spec.obligors[i].lossGivenDefault
    }
    losses[s] = loss
    expected += loss
  }
  expected /= spec.scenarios

  const sorted = Float64Array.from(losses).sort()
  const index = Math.min(sorted.length - 1, Math.floor(spec.confidence * sorted.length))
  return sorted[index] - expected
}
