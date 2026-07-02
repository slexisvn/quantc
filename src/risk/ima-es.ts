import { historicalExpectedShortfall } from './var'
import type { FrtbParameters } from './frtb-parameters'

export function liquidityAdjustedEs(bucketPnl: readonly Float64Array[], params: FrtbParameters, confidence?: number): number {
  const horizons = params.liquidityHorizons
  const baseHorizon = horizons[0]
  const level = confidence ?? params.esConfidence
  let total = 0
  let previousHorizon = 0
  for (let j = 0; j < bucketPnl.length; j += 1) {
    const horizon = horizons[Math.min(j, horizons.length - 1)]
    const scaling = (horizon - previousHorizon) / baseHorizon
    const es = historicalExpectedShortfall(bucketPnl[j], level)
    total += es * es * scaling
    previousHorizon = horizon
  }
  return Math.sqrt(Math.max(total, 0))
}

export interface ImaCapitalInputs {
  readonly esReducedStressed: number
  readonly esFullCurrent: number
  readonly esReducedCurrent: number
  readonly previousImcc: number
  readonly averageImcc: number
  readonly nmrf: number
}

export interface ImaCapitalResult {
  readonly imcc: number
  readonly capital: number
}

export function imaCapital(inputs: ImaCapitalInputs, params: FrtbParameters): ImaCapitalResult {
  const stressRatio = Math.max(inputs.esFullCurrent / inputs.esReducedCurrent, 1)
  const imcc = inputs.esReducedStressed * stressRatio
  const capital = Math.max(inputs.previousImcc + inputs.nmrf, params.imaMultiplier * inputs.averageImcc + inputs.nmrf)
  return { imcc, capital }
}

export function nmrfStressCharge(stresses: readonly number[], correlation: number): number {
  let sum = 0
  let sumSquares = 0
  for (const stress of stresses) {
    sum += stress
    sumSquares += stress * stress
  }
  const systematic = correlation * sum
  return Math.sqrt(systematic * systematic + (1 - correlation * correlation) * sumSquares)
}
