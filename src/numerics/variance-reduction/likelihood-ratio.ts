import { MersenneTwister } from '../rng/mersenne-twister'
import { inverseNormalCdf } from '../rng/inverse-normal-cdf'
import { Welford } from '../stats/welford'

export interface LikelihoodRatioMarket {
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly vol: number
  readonly maturity: number
  readonly paths: number
  readonly seed: number
}

export interface LikelihoodRatioResult {
  readonly delta: number
  readonly standardError: number
}

export function digitalCallLrDelta(market: LikelihoodRatioMarket): LikelihoodRatioResult {
  const generator = new MersenneTwister(market.seed)
  const sqrtT = Math.sqrt(market.maturity)
  const drift = (market.rate - 0.5 * market.vol * market.vol) * market.maturity
  const diffusion = market.vol * sqrtT
  const discount = Math.exp(-market.rate * market.maturity)
  const scoreScale = 1 / (market.spot * market.vol * sqrtT)

  const estimator = new Welford()
  for (let p = 0; p < market.paths; p += 1) {
    const z = inverseNormalCdf(generator.nextDouble())
    const terminal = market.spot * Math.exp(drift + diffusion * z)
    const indicator = terminal > market.strike ? 1 : 0
    estimator.push(discount * indicator * z * scoreScale)
  }

  return { delta: estimator.mean, standardError: estimator.standardError }
}
