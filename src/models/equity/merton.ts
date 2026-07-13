import { MersenneTwister } from '../../numerics/rng/mersenne-twister'
import { poissonSample } from '../../numerics/rng/poisson'
import { inverseNormalCdf } from '../../numerics/rng/inverse-normal-cdf'
import { Welford } from '../../numerics/stats/welford'

export interface MertonMcSpec {
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly vol: number
  readonly maturity: number
  readonly jumpIntensity: number
  readonly jumpMean: number
  readonly jumpVol: number
  readonly paths: number
  readonly seed: number
}

export interface MertonMcResult {
  readonly price: number
  readonly standardError: number
}

export function priceMertonCall(spec: MertonMcSpec): MertonMcResult {
  const jumpCompensator = Math.exp(spec.jumpMean + 0.5 * spec.jumpVol * spec.jumpVol) - 1
  const drift = (spec.rate - 0.5 * spec.vol * spec.vol - spec.jumpIntensity * jumpCompensator) * spec.maturity
  const diffusion = spec.vol * Math.sqrt(spec.maturity)
  const discount = Math.exp(-spec.rate * spec.maturity)
  const generator = new MersenneTwister(spec.seed)

  const estimator = new Welford()
  for (let p = 0; p < spec.paths; p += 1) {
    const z = inverseNormalCdf(generator.nextDouble())
    const jumps = poissonSample(spec.jumpIntensity * spec.maturity, generator)
    let jumpSum = 0
    for (let j = 0; j < jumps; j += 1) jumpSum += spec.jumpMean + spec.jumpVol * inverseNormalCdf(generator.nextDouble())
    const terminal = spec.spot * Math.exp(drift + diffusion * z + jumpSum)
    estimator.push(discount * Math.max(terminal - spec.strike, 0))
  }

  return { price: estimator.mean, standardError: estimator.standardError }
}
