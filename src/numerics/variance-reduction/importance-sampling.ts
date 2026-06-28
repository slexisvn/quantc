import { MersenneTwister } from '../rng/mersenne-twister'
import { inverseNormalCdf } from '../rng/inverse-normal-cdf'
import { Welford } from '../stats/welford'

export interface ImportanceSamplingMarket {
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly vol: number
  readonly maturity: number
  readonly paths: number
  readonly seed: number
  readonly drift: number
}

export interface ImportanceSamplingResult {
  readonly price: number
  readonly standardError: number
}

export function importanceSampledCall(market: ImportanceSamplingMarket): ImportanceSamplingResult {
  const sqrtT = Math.sqrt(market.maturity)
  const diffusion = market.vol * sqrtT
  const drift = (market.rate - 0.5 * market.vol * market.vol) * market.maturity
  const discount = Math.exp(-market.rate * market.maturity)
  const generator = new MersenneTwister(market.seed)
  const estimator = new Welford()

  for (let p = 0; p < market.paths; p += 1) {
    const shifted = inverseNormalCdf(generator.nextDouble()) + market.drift
    const terminal = market.spot * Math.exp(drift + diffusion * shifted)
    const payoff = Math.max(terminal - market.strike, 0)
    const likelihood = Math.exp(-market.drift * shifted + 0.5 * market.drift * market.drift)
    estimator.push(discount * payoff * likelihood)
  }

  return { price: estimator.mean, standardError: estimator.standardError }
}
