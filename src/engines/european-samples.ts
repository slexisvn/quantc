import { MersenneTwister } from '../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../numerics/rng/inverse-normal-cdf'
import { Sobol } from '../numerics/rng/sobol'

export interface SampleMarket {
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly vol: number
  readonly maturity: number
  readonly paths: number
  readonly seed: number
}

function terminal(market: SampleMarket, z: number): number {
  const drift = (market.rate - 0.5 * market.vol * market.vol) * market.maturity
  const diffusion = market.vol * Math.sqrt(market.maturity) * z
  return market.spot * Math.exp(drift + diffusion)
}

function payoff(market: SampleMarket, spotAtMaturity: number): number {
  return Math.exp(-market.rate * market.maturity) * Math.max(spotAtMaturity - market.strike, 0)
}

export function plainPayoffs(market: SampleMarket): Float64Array {
  const generator = new MersenneTwister(market.seed)
  const out = new Float64Array(market.paths)
  for (let i = 0; i < market.paths; i += 1) out[i] = payoff(market, terminal(market, inverseNormalCdf(generator.nextDouble())))
  return out
}

export function antitheticPayoffs(market: SampleMarket): { base: Float64Array; antithetic: Float64Array } {
  const generator = new MersenneTwister(market.seed)
  const base = new Float64Array(market.paths)
  const antithetic = new Float64Array(market.paths)
  for (let i = 0; i < market.paths; i += 1) {
    const z = inverseNormalCdf(generator.nextDouble())
    base[i] = payoff(market, terminal(market, z))
    antithetic[i] = payoff(market, terminal(market, -z))
  }
  return { base, antithetic }
}

export function controlPayoffs(market: SampleMarket): { payoff: Float64Array; control: Float64Array; controlMean: number } {
  const generator = new MersenneTwister(market.seed)
  const values = new Float64Array(market.paths)
  const control = new Float64Array(market.paths)
  const discount = Math.exp(-market.rate * market.maturity)
  for (let i = 0; i < market.paths; i += 1) {
    const spotAtMaturity = terminal(market, inverseNormalCdf(generator.nextDouble()))
    values[i] = payoff(market, spotAtMaturity)
    control[i] = discount * spotAtMaturity
  }
  return { payoff: values, control, controlMean: market.spot }
}

export function sobolPayoffs(market: SampleMarket): Float64Array {
  const generator = new Sobol(1)
  const out = new Float64Array(market.paths)
  for (let i = 0; i < market.paths; i += 1) out[i] = payoff(market, terminal(market, inverseNormalCdf(generator.next()[0])))
  return out
}
