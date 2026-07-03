import { nestedAggregate, constantCorrelation, type AggregationCell } from '../risk/aggregation'
import { simmDeltaRiskWeight, type SimmParameters, type SimmRiskClassParameters } from './simm-parameters'
import { groupBy } from './group'

export type SimmKind = 'delta' | 'vega'

export interface SimmSensitivity {
  readonly riskClass: string
  readonly bucket: string
  readonly label: string
  readonly amount: number
  readonly kind: SimmKind
}

function weightedSensitivity(sensitivity: SimmSensitivity, classParams: SimmRiskClassParameters): number {
  const riskWeight = sensitivity.kind === 'delta' ? simmDeltaRiskWeight(classParams, sensitivity.label) : classParams.vegaRiskWeight
  return riskWeight * sensitivity.amount
}

function bucketMargin(weighted: readonly number[], intraCorrelation: number): AggregationCell {
  const cells = weighted.map((ws) => ({ margin: Math.abs(ws), residual: ws }))
  return nestedAggregate(cells, constantCorrelation(intraCorrelation))
}

function classMargin(sensitivities: readonly SimmSensitivity[], classParams: SimmRiskClassParameters): AggregationCell {
  const byBucket = groupBy(sensitivities, (sensitivity) => sensitivity.bucket)
  const buckets: AggregationCell[] = []
  for (const group of byBucket.values()) {
    const weighted = group.map((sensitivity) => weightedSensitivity(sensitivity, classParams))
    buckets.push(bucketMargin(weighted, classParams.intraBucketCorrelation))
  }
  return nestedAggregate(buckets, constantCorrelation(classParams.interBucketCorrelation))
}

function kindMargin(sensitivities: readonly SimmSensitivity[], params: SimmParameters, kind: SimmKind): number {
  const byClass = groupBy(sensitivities.filter((sensitivity) => sensitivity.kind === kind), (sensitivity) => sensitivity.riskClass)
  const classes: AggregationCell[] = []
  for (const [riskClass, group] of byClass) {
    const classParams = params.riskClasses.get(riskClass)
    if (classParams === undefined) throw new Error(`unknown SIMM risk class ${riskClass}`)
    classes.push(classMargin(group, classParams))
  }
  return nestedAggregate(classes, constantCorrelation(params.crossRiskClassCorrelation)).margin
}

export function simmMargin(sensitivities: readonly SimmSensitivity[], params: SimmParameters): number {
  return kindMargin(sensitivities, params, 'delta') + kindMargin(sensitivities, params, 'vega')
}
