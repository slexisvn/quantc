import { MersenneTwister } from '../../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../../numerics/rng/inverse-normal-cdf'
import { Welford } from '../../numerics/stats/welford'

export interface HybridSpec {
  readonly spot: number
  readonly strike: number
  readonly equityVol: number
  readonly maturity: number
  readonly shortRate: number
  readonly rateMeanReversion: number
  readonly rateLong: number
  readonly rateVol: number
  readonly correlation: number
  readonly steps: number
  readonly paths: number
  readonly seed: number
}

export interface HybridResult {
  readonly price: number
  readonly standardError: number
}

export function priceHybridCall(spec: HybridSpec): HybridResult {
  const dt = spec.maturity / spec.steps
  const sqrtDt = Math.sqrt(dt)
  const rhoComplement = Math.sqrt(1 - spec.correlation * spec.correlation)
  const generator = new MersenneTwister(spec.seed)
  const estimator = new Welford()

  for (let p = 0; p < spec.paths; p += 1) {
    let logSpot = Math.log(spec.spot)
    let rate = spec.shortRate
    let integral = 0
    for (let step = 0; step < spec.steps; step += 1) {
      integral += rate * dt
      const z1 = inverseNormalCdf(generator.nextDouble())
      const z2 = spec.correlation * z1 + rhoComplement * inverseNormalCdf(generator.nextDouble())
      logSpot += (rate - 0.5 * spec.equityVol * spec.equityVol) * dt + spec.equityVol * sqrtDt * z1
      rate += spec.rateMeanReversion * (spec.rateLong - rate) * dt + spec.rateVol * sqrtDt * z2
    }
    estimator.push(Math.exp(-integral) * Math.max(Math.exp(logSpot) - spec.strike, 0))
  }

  return { price: estimator.mean, standardError: estimator.standardError }
}
