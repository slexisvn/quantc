import { quadraticAggregate } from './aggregation'
import type { GirrParameters, FrtbParameters } from './frtb-parameters'

export interface GirrSensitivity {
  readonly tenor: number
  readonly amount: number
}

function tenorRiskWeight(girr: GirrParameters, tenor: number): number {
  const index = girr.tenors.indexOf(tenor)
  if (index < 0) throw new Error(`unknown GIRR tenor ${tenor}`)
  return girr.riskWeights[index]
}

export function girrTenorCorrelation(girr: GirrParameters, ti: number, tj: number): number {
  if (ti === tj) return 1
  const raw = Math.exp((-girr.theta * Math.abs(ti - tj)) / Math.min(ti, tj))
  return Math.max(raw, girr.correlationFloor)
}

export function girrDeltaCharge(sensitivities: readonly GirrSensitivity[], params: FrtbParameters): number {
  const girr = params.girr
  const weighted = sensitivities.map((s) => tenorRiskWeight(girr, s.tenor) * s.amount)
  const base = sensitivities.map((s) => s.tenor)
  let charge = 0
  for (const scenario of params.correlationScenarios) {
    const correlation = (i: number, j: number): number => (i === j ? 1 : Math.min(1, scenario * girrTenorCorrelation(girr, base[i], base[j])))
    charge = Math.max(charge, quadraticAggregate(weighted, correlation))
  }
  return charge
}
