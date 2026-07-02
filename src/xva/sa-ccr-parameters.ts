export interface SaccrAssetClassParameters {
  readonly supervisoryFactor: number
  readonly supervisoryCorrelation: number
  readonly supervisoryOptionVolatility: number
}

export interface SaccrParameters {
  readonly assetClasses: Map<string, SaccrAssetClassParameters>
  readonly supervisoryDurationRate: number
  readonly alpha: number
  readonly multiplierFloor: number
  readonly irMaturityBucketCorrelation: number[][]
}

function buildBaselParameters(): SaccrParameters {
  const assetClasses = new Map<string, SaccrAssetClassParameters>()
  assetClasses.set('IR', { supervisoryFactor: 0.005, supervisoryCorrelation: 0, supervisoryOptionVolatility: 0.5 })
  assetClasses.set('FX', { supervisoryFactor: 0.04, supervisoryCorrelation: 0, supervisoryOptionVolatility: 0.15 })
  assetClasses.set('Credit', { supervisoryFactor: 0.0046, supervisoryCorrelation: 0.5, supervisoryOptionVolatility: 1.0 })
  assetClasses.set('Equity', { supervisoryFactor: 0.32, supervisoryCorrelation: 0.5, supervisoryOptionVolatility: 1.2 })
  assetClasses.set('Commodity', { supervisoryFactor: 0.18, supervisoryCorrelation: 0.4, supervisoryOptionVolatility: 1.5 })
  return {
    assetClasses,
    supervisoryDurationRate: 0.05,
    alpha: 1.4,
    multiplierFloor: 0.05,
    irMaturityBucketCorrelation: [
      [1, 0.7, 0.3],
      [0.7, 1, 0.7],
      [0.3, 0.7, 1],
    ],
  }
}

export const SACCR_PARAMETERS_BASEL: SaccrParameters = buildBaselParameters()

const registry = new Map<string, SaccrParameters>([['basel', SACCR_PARAMETERS_BASEL]])

export function registerSaccrParameters(name: string, params: SaccrParameters): void {
  if (registry.has(name)) throw new Error(`duplicate SA-CCR parameters ${name}`)
  registry.set(name, params)
}

export function getSaccrParameters(name: string): SaccrParameters {
  const params = registry.get(name)
  if (params === undefined) throw new Error(`unknown SA-CCR parameters ${name}`)
  return params
}
