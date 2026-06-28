import { MersenneTwister } from './rng/mersenne-twister'
import { inverseNormalCdf } from './rng/inverse-normal-cdf'

export interface MlmcMarket {
  readonly spot: number
  readonly strike: number
  readonly rate: number
  readonly vol: number
  readonly maturity: number
}

function eulerAsian(market: MlmcMarket, increments: Float64Array): number {
  const steps = increments.length
  const dt = market.maturity / steps
  let spot = market.spot
  let sum = 0
  for (let i = 0; i < steps; i += 1) {
    spot += market.rate * spot * dt + market.vol * spot * increments[i]
    sum += spot
  }
  return Math.exp(-market.rate * market.maturity) * Math.max(sum / steps - market.strike, 0)
}

export interface LevelEstimate {
  readonly mean: number
  readonly variance: number
}

export function asianLevel(market: MlmcMarket, level: number, paths: number, seed: number): LevelEstimate {
  const fineSteps = 2 ** level
  const dtFine = market.maturity / fineSteps
  const sqrtDtFine = Math.sqrt(dtFine)
  const generator = new MersenneTwister(seed)

  let sum = 0
  let sumSquares = 0
  for (let p = 0; p < paths; p += 1) {
    const fine = new Float64Array(fineSteps)
    for (let i = 0; i < fineSteps; i += 1) fine[i] = inverseNormalCdf(generator.nextDouble()) * sqrtDtFine
    let difference: number
    if (level === 0) {
      difference = eulerAsian(market, fine)
    } else {
      const coarse = new Float64Array(fineSteps / 2)
      for (let i = 0; i < coarse.length; i += 1) coarse[i] = fine[2 * i] + fine[2 * i + 1]
      difference = eulerAsian(market, fine) - eulerAsian(market, coarse)
    }
    sum += difference
    sumSquares += difference * difference
  }
  const mean = sum / paths
  return { mean, variance: sumSquares / paths - mean * mean }
}

export function mlmcAsian(market: MlmcMarket, levels: number, pathsPerLevel: number[], seed: number): number {
  let estimate = 0
  for (let level = 0; level <= levels; level += 1) estimate += asianLevel(market, level, pathsPerLevel[level], seed + level * 7919).mean
  return estimate
}

export function plainEulerAsian(market: MlmcMarket, steps: number, paths: number, seed: number): number {
  const dt = market.maturity / steps
  const sqrtDt = Math.sqrt(dt)
  const generator = new MersenneTwister(seed)
  let total = 0
  for (let p = 0; p < paths; p += 1) {
    const increments = new Float64Array(steps)
    for (let i = 0; i < steps; i += 1) increments[i] = inverseNormalCdf(generator.nextDouble()) * sqrtDt
    total += eulerAsian(market, increments)
  }
  return total / paths
}
