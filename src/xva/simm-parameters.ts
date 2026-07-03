import { createRegistry } from '../registry'

export interface SimmRiskClassParameters {
  readonly buckets: string[]
  readonly deltaRiskWeights: Map<string, number>
  readonly defaultDeltaRiskWeight: number
  readonly vegaRiskWeight: number
  readonly intraBucketCorrelation: number
  readonly interBucketCorrelation: number
}

export interface SimmParameters {
  readonly riskClasses: Map<string, SimmRiskClassParameters>
  readonly crossRiskClassCorrelation: number
}

export function simmDeltaRiskWeight(params: SimmRiskClassParameters, label: string): number {
  const specific = params.deltaRiskWeights.get(label)
  return specific === undefined ? params.defaultDeltaRiskWeight : specific
}

function irRiskClass(): SimmRiskClassParameters {
  const tenors: [string, number][] = [
    ['2w', 109],
    ['1m', 106],
    ['3m', 88],
    ['6m', 71],
    ['1y', 52],
    ['2y', 52],
    ['3y', 52],
    ['5y', 51],
    ['10y', 51],
    ['15y', 51],
    ['20y', 54],
    ['30y', 62],
  ]
  return {
    buckets: ['1', '2', '3'],
    deltaRiskWeights: new Map(tenors),
    defaultDeltaRiskWeight: 52,
    vegaRiskWeight: 0.16,
    intraBucketCorrelation: 0.98,
    interBucketCorrelation: 0.23,
  }
}

function scalarRiskClass(riskWeight: number, vegaRiskWeight: number, intra: number, inter: number, buckets: string[]): SimmRiskClassParameters {
  return {
    buckets,
    deltaRiskWeights: new Map<string, number>(),
    defaultDeltaRiskWeight: riskWeight,
    vegaRiskWeight,
    intraBucketCorrelation: intra,
    interBucketCorrelation: inter,
  }
}

function buildIllustrativeParameters(): SimmParameters {
  const riskClasses = new Map<string, SimmRiskClassParameters>()
  riskClasses.set('IR', irRiskClass())
  riskClasses.set('FX', scalarRiskClass(7.4, 0.21, 0.5, 0.5, ['1']))
  riskClasses.set('Equity', scalarRiskClass(25, 0.28, 0.28, 0.16, ['1', '2', '3', '4']))
  riskClasses.set('Credit', scalarRiskClass(1, 0.27, 0.42, 0.4, ['1', '2', '3', '4']))
  riskClasses.set('Commodity', scalarRiskClass(19, 0.35, 0.35, 0.2, ['1', '2', '3']))
  return { riskClasses, crossRiskClassCorrelation: 0.27 }
}

export const SIMM_PARAMETERS_ILLUSTRATIVE: SimmParameters = buildIllustrativeParameters()

const registry = createRegistry<SimmParameters>('SIMM parameters', [['illustrative', SIMM_PARAMETERS_ILLUSTRATIVE]])

export function registerSimmParameters(name: string, params: SimmParameters): void {
  registry.register(name, params)
}

export function getSimmParameters(name: string): SimmParameters {
  return registry.get(name)
}
