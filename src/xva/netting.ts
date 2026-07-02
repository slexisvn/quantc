import { simulateExposure, type Trade, type MarketState, type ExposureConfig, type ExposureProfile } from '../risk/exposure'
import { computeXva, type XvaSpec, type XvaResult } from '../risk/xva-suite'
import { collateralisedMtm } from './collateral'
import { exposureStatistics } from './exposure-stats'

export interface CsaTerms {
  readonly threshold: number
  readonly minimumTransfer: number
  readonly independentAmount: number
  readonly marginPeriodOfRisk: number
}

export interface NettingSet {
  readonly id: string
  readonly trades: Trade[]
  readonly csa?: CsaTerms
}

export interface CounterpartyPortfolio {
  readonly counterparty: string
  readonly nettingSets: NettingSet[]
}

function mporSteps(times: readonly number[], marginPeriodOfRisk: number): number {
  const firstSpacing = times.length > 0 ? times[0] : marginPeriodOfRisk
  return Math.max(1, Math.round(marginPeriodOfRisk / firstSpacing))
}

export function simulateNettingSetExposure(set: NettingSet, market: MarketState, config: ExposureConfig): ExposureProfile {
  const base = simulateExposure(set.trades, market, config)
  if (set.csa === undefined) return base
  const steps = mporSteps(config.grid, set.csa.marginPeriodOfRisk)
  const residual = collateralisedMtm(base.mtmPaths, config.grid, {
    threshold: set.csa.threshold,
    minimumTransfer: set.csa.minimumTransfer,
    independentAmount: set.csa.independentAmount,
    mporSteps: steps,
  })
  const stats = exposureStatistics(config.grid, residual, { quantile: config.quantile })
  return {
    times: base.times,
    epe: stats.epe,
    ene: stats.ene,
    pfe: stats.pfe,
    collateralEpe: stats.collateralEpe,
    eepe: stats.eepe,
    spotPaths: base.spotPaths,
    mtmPaths: residual,
  }
}

function addXva(a: XvaResult, b: XvaResult): XvaResult {
  return { cva: a.cva + b.cva, dva: a.dva + b.dva, fva: a.fva + b.fva, mva: a.mva + b.mva }
}

export interface PortfolioXvaResult {
  readonly perNettingSet: Map<string, XvaResult>
  readonly total: XvaResult
}

export function portfolioXva(portfolio: CounterpartyPortfolio, market: MarketState, config: ExposureConfig, spec: XvaSpec): PortfolioXvaResult {
  const perNettingSet = new Map<string, XvaResult>()
  let total: XvaResult = { cva: 0, dva: 0, fva: 0, mva: 0 }
  for (const set of portfolio.nettingSets) {
    const profile = simulateNettingSetExposure(set, market, config)
    const xva = computeXva(profile, spec)
    perNettingSet.set(set.id, xva)
    total = addXva(total, xva)
  }
  return { perNettingSet, total }
}
