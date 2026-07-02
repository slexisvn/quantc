import { MersenneTwister } from '../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../numerics/rng/inverse-normal-cdf'
import { blackScholes } from '../numerics/analytic/black-scholes'
import { exposureStatistics } from '../xva/exposure-stats'

export interface Trade {
  mtm(spot: number, time: number): number
}

export interface MarketState {
  readonly spot: number
  readonly rate: number
  readonly vol: number
}

export function europeanTrade(strike: number, maturity: number, rate: number, vol: number, isCall: boolean, quantity: number): Trade {
  return {
    mtm(spot, time) {
      if (time >= maturity) return quantity * Math.max(isCall ? spot - strike : strike - spot, 0)
      return quantity * blackScholes({ spot, strike, rate, vol, maturity: maturity - time, isCall }).price
    },
  }
}

export function forwardTrade(strike: number, maturity: number, rate: number, quantity: number): Trade {
  return {
    mtm(spot, time) {
      if (time >= maturity) return quantity * (spot - strike)
      return quantity * (spot - strike * Math.exp(-rate * (maturity - time)))
    },
  }
}

export interface ExposureConfig {
  readonly grid: number[]
  readonly paths: number
  readonly seed: number
  readonly quantile: number
  readonly collateralThreshold: number
}

export interface ExposureProfile {
  readonly times: number[]
  readonly epe: number[]
  readonly ene: number[]
  readonly pfe: number[]
  readonly collateralEpe: number[]
  readonly eepe: number
  readonly spotPaths: Float64Array[]
  readonly mtmPaths: Float64Array[]
}

export function simulateExposure(portfolio: readonly Trade[], market: MarketState, config: ExposureConfig): ExposureProfile {
  const steps = config.grid.length
  const generator = new MersenneTwister(config.seed)
  const mtmPaths: Float64Array[] = config.grid.map(() => new Float64Array(config.paths))
  const spotPaths: Float64Array[] = config.grid.map(() => new Float64Array(config.paths))

  for (let p = 0; p < config.paths; p += 1) {
    let logSpot = Math.log(market.spot)
    let previousTime = 0
    for (let k = 0; k < steps; k += 1) {
      const dt = config.grid[k] - previousTime
      logSpot += (market.rate - 0.5 * market.vol * market.vol) * dt + market.vol * Math.sqrt(dt) * inverseNormalCdf(generator.nextDouble())
      const spot = Math.exp(logSpot)
      let value = 0
      for (const trade of portfolio) value += trade.mtm(spot, config.grid[k])
      spotPaths[k][p] = spot
      mtmPaths[k][p] = value
      previousTime = config.grid[k]
    }
  }

  const stats = exposureStatistics(config.grid, mtmPaths, { quantile: config.quantile, collateralThreshold: config.collateralThreshold })

  return { times: config.grid, epe: stats.epe, ene: stats.ene, pfe: stats.pfe, collateralEpe: stats.collateralEpe, eepe: stats.eepe, spotPaths, mtmPaths }
}
