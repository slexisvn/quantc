import { MersenneTwister } from '../numerics/rng/mersenne-twister'
import { inverseNormalCdf } from '../numerics/rng/inverse-normal-cdf'
import { blackScholes } from '../numerics/analytic/black-scholes'

export interface FullTrade {
  mtm(spot: number, time: number): number
  delta(spot: number, time: number): number
}

export interface FullMarket {
  readonly spot: number
  readonly rate: number
  readonly vol: number
}

export function europeanFullTrade(strike: number, maturity: number, rate: number, vol: number, isCall: boolean, quantity: number): FullTrade {
  return {
    mtm(spot, time) {
      if (time >= maturity) return quantity * Math.max(isCall ? spot - strike : strike - spot, 0)
      return quantity * blackScholes({ spot, strike, rate, vol, maturity: maturity - time, isCall }).price
    },
    delta(spot, time) {
      if (time >= maturity) return quantity * (isCall ? (spot > strike ? 1 : 0) : spot < strike ? -1 : 0)
      return quantity * blackScholes({ spot, strike, rate, vol, maturity: maturity - time, isCall }).delta
    },
  }
}

export interface FullExposureConfig {
  readonly grid: number[]
  readonly paths: number
  readonly seed: number
  readonly quantile: number
  readonly threshold: number
  readonly minimumTransfer: number
  readonly mporSteps: number
  readonly imRiskWeight: number
}

export interface FullExposureProfile {
  readonly times: number[]
  readonly epe: number[]
  readonly collateralEpe: number[]
  readonly imProfile: number[]
}

export function simulateFullExposure(portfolio: readonly FullTrade[], market: FullMarket, config: FullExposureConfig): FullExposureProfile {
  const steps = config.grid.length
  const generator = new MersenneTwister(config.seed)
  const mtm: Float64Array[] = config.grid.map(() => new Float64Array(config.paths))
  const im: Float64Array[] = config.grid.map(() => new Float64Array(config.paths))

  for (let p = 0; p < config.paths; p += 1) {
    let logSpot = Math.log(market.spot)
    let previous = 0
    for (let k = 0; k < steps; k += 1) {
      const dt = config.grid[k] - previous
      logSpot += (market.rate - 0.5 * market.vol * market.vol) * dt + market.vol * Math.sqrt(dt) * inverseNormalCdf(generator.nextDouble())
      const spot = Math.exp(logSpot)
      let value = 0
      let delta = 0
      for (const trade of portfolio) {
        value += trade.mtm(spot, config.grid[k])
        delta += trade.delta(spot, config.grid[k])
      }
      mtm[k][p] = value
      im[k][p] = config.imRiskWeight * Math.abs(delta) * spot
      previous = config.grid[k]
    }
  }

  const epe: number[] = []
  const collateralEpe: number[] = []
  const imProfile: number[] = []
  for (let k = 0; k < steps; k += 1) {
    let sumPositive = 0
    let sumCollateral = 0
    let sumIm = 0
    for (let p = 0; p < config.paths; p += 1) {
      sumPositive += Math.max(mtm[k][p], 0)
      const lagIndex = k - config.mporSteps
      const lagged = lagIndex >= 0 ? mtm[lagIndex][p] : 0
      const required = Math.max(lagged - config.threshold, 0)
      const collateral = required >= config.minimumTransfer ? required : 0
      sumCollateral += Math.max(mtm[k][p] - collateral, 0)
      sumIm += im[k][p]
    }
    epe.push(sumPositive / config.paths)
    collateralEpe.push(sumCollateral / config.paths)
    imProfile.push(sumIm / config.paths)
  }

  return { times: config.grid, epe, collateralEpe, imProfile }
}

export interface FullXvaSpec {
  readonly rate: number
  readonly hazardRate: number
  readonly recovery: number
  readonly fundingSpread: number
}

export interface FullXvaResult {
  readonly cva: number
  readonly fva: number
  readonly mva: number
}

export function computeFullXva(profile: FullExposureProfile, spec: FullXvaSpec): FullXvaResult {
  let cva = 0
  let fva = 0
  let mva = 0
  let previous = 0
  for (let k = 0; k < profile.times.length; k += 1) {
    const time = profile.times[k]
    const discount = Math.exp(-spec.rate * time)
    const survival = Math.exp(-spec.hazardRate * time)
    const defaultProbability = Math.exp(-spec.hazardRate * previous) - survival
    const dt = time - previous
    cva += (1 - spec.recovery) * profile.collateralEpe[k] * discount * defaultProbability
    fva += spec.fundingSpread * profile.collateralEpe[k] * discount * survival * dt
    mva += spec.fundingSpread * profile.imProfile[k] * discount * survival * dt
    previous = time
  }
  return { cva, fva, mva }
}
