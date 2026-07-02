import { levenbergMarquardt } from '../engines/calibration'
import { totalVariance, sviImpliedVol, butterflyG, type SviParams } from './svi'

export interface SviSlice {
  readonly maturity: number
  readonly logMoneyness: number[]
  readonly vols: number[]
  readonly params: SviParams
}

export interface RepairOptions {
  readonly kGrid: number[]
  readonly penaltyWeight: number
  readonly margin: number
  readonly maxIterations: number
}

export interface RepairResult {
  readonly slices: SviSlice[]
  readonly maxViolationBefore: number
  readonly maxViolationAfter: number
}

function asParams(vector: number[]): SviParams {
  return { a: vector[0], b: vector[1], rho: vector[2], m: vector[3], sigma: vector[4] }
}

function calendarViolation(previous: SviParams, current: SviParams, kGrid: readonly number[]): number {
  let worst = 0
  for (const k of kGrid) worst = Math.max(worst, totalVariance(previous, k) - totalVariance(current, k))
  return worst
}

function butterflyViolation(params: SviParams, kGrid: readonly number[]): number {
  let worst = 0
  for (const k of kGrid) worst = Math.max(worst, -butterflyG(params, k))
  return worst
}

export function repairCalendarArbitrage(slices: readonly SviSlice[], options: RepairOptions): RepairResult {
  let maxViolationBefore = 0
  for (let i = 1; i < slices.length; i += 1) maxViolationBefore = Math.max(maxViolationBefore, calendarViolation(slices[i - 1].params, slices[i].params, options.kGrid))

  const repaired: SviSlice[] = [slices[0]]
  const penaltyScale = Math.sqrt(options.penaltyWeight)
  for (let i = 1; i < slices.length; i += 1) {
    const slice = slices[i]
    const previous = repaired[i - 1].params
    const residual = (vector: number[]): number[] => {
      const params = asParams(vector)
      const errors = slice.logMoneyness.map((k, j) => sviImpliedVol(params, k, slice.maturity) - slice.vols[j])
      const penalties = options.kGrid.map((k) => penaltyScale * Math.max(0, totalVariance(previous, k) - totalVariance(params, k) + options.margin))
      return [...errors, ...penalties]
    }
    const initial = [slice.params.a, slice.params.b, slice.params.rho, slice.params.m, slice.params.sigma]
    const result = levenbergMarquardt(residual, initial, { maxIterations: options.maxIterations })
    const refitted = asParams(result.parameters)
    const beforeButterfly = butterflyViolation(slice.params, options.kGrid)
    const afterButterfly = butterflyViolation(refitted, options.kGrid)
    const accepted = afterButterfly <= beforeButterfly + 1e-8 ? refitted : slice.params
    repaired.push({ maturity: slice.maturity, logMoneyness: slice.logMoneyness, vols: slice.vols, params: accepted })
  }

  let maxViolationAfter = 0
  for (let i = 1; i < repaired.length; i += 1) maxViolationAfter = Math.max(maxViolationAfter, calendarViolation(repaired[i - 1].params, repaired[i].params, options.kGrid))

  return { slices: repaired, maxViolationBefore, maxViolationAfter }
}
