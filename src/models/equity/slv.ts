import { MersenneTwister } from '../../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../../numerics/rng/inverse-normal-cdf'
import { Welford } from '../../numerics/stats/welford'

export interface SlvSpec {
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly maturity: number
  readonly initialVariance: number
  readonly meanReversion: number
  readonly longVariance: number
  readonly volOfVol: number
  readonly correlation: number
  readonly steps: number
  readonly paths: number
  readonly seed: number
}

export type LeverageFunction = (spot: number, time: number) => number

export interface SlvResult {
  readonly price: number
  readonly standardError: number
}

export function priceStochasticLocalVolCall(spec: SlvSpec, leverage: LeverageFunction): SlvResult {
  const dt = spec.maturity / spec.steps
  const sqrtDt = Math.sqrt(dt)
  const rhoComplement = Math.sqrt(1 - spec.correlation * spec.correlation)
  const generator = new MersenneTwister(spec.seed)
  const estimator = new Welford()

  for (let p = 0; p < spec.paths; p += 1) {
    let logSpot = Math.log(spec.spot)
    let variance = spec.initialVariance
    for (let step = 0; step < spec.steps; step += 1) {
      const time = step * dt
      const z1 = inverseNormalCdf(generator.nextDouble())
      const z2 = spec.correlation * z1 + rhoComplement * inverseNormalCdf(generator.nextDouble())
      const positiveVariance = variance > 0 ? variance : 0
      const local = leverage(Math.exp(logSpot), time)
      const localVol = local * Math.sqrt(positiveVariance)
      logSpot += (spec.rate - 0.5 * localVol * localVol) * dt + localVol * sqrtDt * z1
      variance += spec.meanReversion * (spec.longVariance - positiveVariance) * dt + spec.volOfVol * Math.sqrt(positiveVariance) * sqrtDt * z2
    }
    estimator.push(Math.exp(-spec.rate * spec.maturity) * Math.max(Math.exp(logSpot) - spec.strike, 0))
  }

  return { price: estimator.mean, standardError: estimator.standardError }
}
