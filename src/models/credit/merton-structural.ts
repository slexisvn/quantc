import { normalCdf } from '../../numerics/analytic/black-scholes'

export interface MertonStructuralSpec {
  readonly firmValue: number
  readonly debt: number
  readonly rate: number
  readonly assetVol: number
  readonly maturity: number
}

function distanceTerms(spec: MertonStructuralSpec): { d1: number; d2: number } {
  const sqrtT = Math.sqrt(spec.maturity)
  const d1 = (Math.log(spec.firmValue / spec.debt) + (spec.rate + 0.5 * spec.assetVol * spec.assetVol) * spec.maturity) / (spec.assetVol * sqrtT)
  return { d1, d2: d1 - spec.assetVol * sqrtT }
}

export function defaultProbability(spec: MertonStructuralSpec): number {
  return normalCdf(-distanceTerms(spec).d2)
}

export function riskyBondValue(spec: MertonStructuralSpec): number {
  const { d1, d2 } = distanceTerms(spec)
  return spec.firmValue * normalCdf(-d1) + spec.debt * Math.exp(-spec.rate * spec.maturity) * normalCdf(d2)
}

export function creditSpread(spec: MertonStructuralSpec): number {
  const riskFree = spec.debt * Math.exp(-spec.rate * spec.maturity)
  return -(1 / spec.maturity) * Math.log(riskyBondValue(spec) / riskFree)
}
