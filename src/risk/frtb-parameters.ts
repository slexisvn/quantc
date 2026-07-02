export interface GirrParameters {
  readonly tenors: number[]
  readonly riskWeights: number[]
  readonly theta: number
  readonly correlationFloor: number
  readonly interBucketCorrelation: number
}

export interface PlaThresholds {
  readonly spearmanGreen: number
  readonly spearmanRed: number
  readonly ksGreen: number
  readonly ksRed: number
}

export interface TrafficLightThresholds {
  readonly amberExceptions: number
  readonly redExceptions: number
}

export interface FrtbParameters {
  readonly girr: GirrParameters
  readonly correlationScenarios: number[]
  readonly rraoRates: Map<string, number>
  readonly drcRiskWeights: Map<string, number>
  readonly liquidityHorizons: number[]
  readonly imaMultiplier: number
  readonly esConfidence: number
  readonly plaThresholds: PlaThresholds
  readonly trafficLight: TrafficLightThresholds
}

function buildStandardParameters(): FrtbParameters {
  return {
    girr: {
      tenors: [0.25, 0.5, 1, 2, 3, 5, 10, 15, 20, 30],
      riskWeights: [0.017, 0.017, 0.016, 0.013, 0.012, 0.011, 0.011, 0.011, 0.011, 0.011],
      theta: 0.03,
      correlationFloor: 0.4,
      interBucketCorrelation: 0.5,
    },
    correlationScenarios: [0.75, 1, 1.25],
    rraoRates: new Map<string, number>([
      ['exotic', 0.01],
      ['other', 0.001],
    ]),
    drcRiskWeights: new Map<string, number>([
      ['AAA', 0.005],
      ['AA', 0.02],
      ['A', 0.03],
      ['BBB', 0.06],
      ['BB', 0.15],
      ['B', 0.3],
      ['CCC', 0.5],
    ]),
    liquidityHorizons: [10, 20, 40, 60, 120],
    imaMultiplier: 1.5,
    esConfidence: 0.975,
    plaThresholds: { spearmanGreen: 0.8, spearmanRed: 0.7, ksGreen: 0.09, ksRed: 0.12 },
    trafficLight: { amberExceptions: 5, redExceptions: 10 },
  }
}

export const FRTB_PARAMETERS_STANDARD: FrtbParameters = buildStandardParameters()

const registry = new Map<string, FrtbParameters>([['standard', FRTB_PARAMETERS_STANDARD]])

export function registerFrtbParameters(name: string, params: FrtbParameters): void {
  if (registry.has(name)) throw new Error(`duplicate FRTB parameters ${name}`)
  registry.set(name, params)
}

export function getFrtbParameters(name: string): FrtbParameters {
  const params = registry.get(name)
  if (params === undefined) throw new Error(`unknown FRTB parameters ${name}`)
  return params
}
