import { quadraticAggregate } from '../risk/aggregation'
import type { SaccrParameters, SaccrAssetClassParameters } from './sa-ccr-parameters'

export type MarginType = 'unmargined' | 'margined'

export interface SaccrTrade {
  readonly assetClass: string
  readonly notional: number
  readonly startTime: number
  readonly endTime: number
  readonly direction: number
}

export interface SaccrCsa {
  readonly currentCollateral: number
  readonly threshold: number
  readonly minimumTransfer: number
  readonly independentAmount: number
  readonly marginPeriodOfRisk: number
}

export function supervisoryDuration(start: number, end: number, rate: number): number {
  return (Math.exp(-rate * start) - Math.exp(-rate * end)) / rate
}

export function adjustedNotional(trade: SaccrTrade, params: SaccrParameters): number {
  if (trade.assetClass === 'IR') return trade.notional * supervisoryDuration(trade.startTime, trade.endTime, params.supervisoryDurationRate)
  return trade.notional
}

export function maturityFactor(maturity: number, marginType: MarginType, marginPeriodOfRisk: number): number {
  if (marginType === 'margined') return 1.5 * Math.sqrt(marginPeriodOfRisk)
  return Math.sqrt(Math.min(maturity, 1))
}

function maturityBucket(endTime: number): number {
  if (endTime < 1) return 0
  if (endTime <= 5) return 1
  return 2
}

function effectiveNotional(trade: SaccrTrade, params: SaccrParameters, marginType: MarginType, marginPeriodOfRisk: number): number {
  return trade.direction * adjustedNotional(trade, params) * maturityFactor(trade.endTime, marginType, marginPeriodOfRisk)
}

function assetClassAddOn(trades: readonly SaccrTrade[], classParams: SaccrAssetClassParameters, params: SaccrParameters, assetClass: string, marginType: MarginType, marginPeriodOfRisk: number): number {
  if (assetClass === 'IR') {
    const bucketNotionals = [0, 0, 0]
    for (const trade of trades) bucketNotionals[maturityBucket(trade.endTime)] += effectiveNotional(trade, params, marginType, marginPeriodOfRisk)
    const correlation = params.irMaturityBucketCorrelation
    return classParams.supervisoryFactor * quadraticAggregate(bucketNotionals, (i, j) => correlation[i][j])
  }
  let sum = 0
  for (const trade of trades) sum += effectiveNotional(trade, params, marginType, marginPeriodOfRisk)
  return classParams.supervisoryFactor * Math.abs(sum)
}

export function aggregateAddOn(trades: readonly SaccrTrade[], params: SaccrParameters, marginType: MarginType, marginPeriodOfRisk: number): number {
  const byClass = new Map<string, SaccrTrade[]>()
  for (const trade of trades) {
    const existing = byClass.get(trade.assetClass)
    if (existing !== undefined) existing.push(trade)
    else byClass.set(trade.assetClass, [trade])
  }
  let total = 0
  for (const [assetClass, group] of byClass) {
    const classParams = params.assetClasses.get(assetClass)
    if (classParams === undefined) throw new Error(`unknown SA-CCR asset class ${assetClass}`)
    total += assetClassAddOn(group, classParams, params, assetClass, marginType, marginPeriodOfRisk)
  }
  return total
}

export function replacementCost(currentValue: number, csa: SaccrCsa | undefined): number {
  if (csa === undefined) return Math.max(currentValue, 0)
  const uncollateralised = currentValue - csa.currentCollateral
  const floor = csa.threshold + csa.minimumTransfer - csa.independentAmount
  return Math.max(uncollateralised, floor, 0)
}

export function pfeMultiplier(currentValue: number, collateral: number, addOn: number, params: SaccrParameters): number {
  if (addOn <= 0) return 1
  const floor = params.multiplierFloor
  const exponent = (currentValue - collateral) / (2 * (1 - floor) * addOn)
  return Math.min(1, floor + (1 - floor) * Math.exp(exponent))
}

export interface SaccrResult {
  readonly replacementCost: number
  readonly addOn: number
  readonly multiplier: number
  readonly ead: number
}

export function saccrEad(trades: readonly SaccrTrade[], currentValue: number, params: SaccrParameters, csa?: SaccrCsa): SaccrResult {
  const marginType: MarginType = csa === undefined ? 'unmargined' : 'margined'
  const mpor = csa === undefined ? 0 : csa.marginPeriodOfRisk
  const addOn = aggregateAddOn(trades, params, marginType, mpor)
  const collateral = csa === undefined ? 0 : csa.currentCollateral
  const rc = replacementCost(currentValue, csa)
  const multiplier = pfeMultiplier(currentValue, collateral, addOn, params)
  const ead = params.alpha * (rc + multiplier * addOn)
  return { replacementCost: rc, addOn, multiplier, ead }
}
