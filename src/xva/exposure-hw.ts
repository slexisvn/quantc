import type { DiscountCurve } from '../marketdata/curve'
import type { ExposureProfile } from '../risk/exposure'
import { MersenneTwister } from '../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../numerics/rng/inverse-normal-cdf'
import { hwDecay, hwStepStd, hwAlpha } from '../models/rates/hull-white-affine'
import { exposureStatistics } from './exposure-stats'
import type { RatesTrade } from './rates-trades'

export interface HwExposureConfig {
  readonly curve: DiscountCurve
  readonly a: number
  readonly vol: number
  readonly grid: number[]
  readonly paths: number
  readonly seed: number
  readonly quantile: number
  readonly collateralThreshold: number
}

export function simulateRatesExposure(trades: readonly RatesTrade[], config: HwExposureConfig): ExposureProfile {
  const steps = config.grid.length
  const generator = new MersenneTwister(config.seed)
  const mtmPaths: Float64Array[] = config.grid.map(() => new Float64Array(config.paths))
  const ratePaths: Float64Array[] = config.grid.map(() => new Float64Array(config.paths))

  for (let p = 0; p < config.paths; p += 1) {
    let x = 0
    let previousTime = 0
    for (let k = 0; k < steps; k += 1) {
      const dt = config.grid[k] - previousTime
      x = x * hwDecay(config.a, dt) + hwStepStd(config.a, config.vol, dt) * inverseNormalCdf(generator.nextDouble())
      const rate = x + hwAlpha(config.curve, config.a, config.vol, config.grid[k])
      let value = 0
      for (const trade of trades) value += trade.mtm(rate, config.grid[k])
      ratePaths[k][p] = rate
      mtmPaths[k][p] = value
      previousTime = config.grid[k]
    }
  }

  const stats = exposureStatistics(config.grid, mtmPaths, { quantile: config.quantile, collateralThreshold: config.collateralThreshold })
  return { times: config.grid, epe: stats.epe, ene: stats.ene, pfe: stats.pfe, collateralEpe: stats.collateralEpe, eepe: stats.eepe, spotPaths: ratePaths, mtmPaths }
}
