export interface ModelDef {
  readonly params: readonly string[]
  readonly rate?: boolean
  readonly extraNormals?: number
  readonly noVol?: boolean
  readonly fineGrid?: boolean
}

export const MODELS: Readonly<Record<string, ModelDef>> = {
  gbm: { params: [] },
  bachelier: { params: [] },
  displaced: { params: ['shift'] },
  heston: { params: ['kappa', 'theta', 'xi', 'rho', 'v0'], extraNormals: 1, noVol: true, fineGrid: true },
  merton: { params: ['jumpIntensity', 'jumpMean', 'jumpVol'] },
  cev: { params: ['beta'], fineGrid: true },
  hw1f: { params: ['meanReversion', 'vol'], rate: true },
  g2pp: { params: ['meanReversionA', 'meanReversionB', 'volA', 'volB', 'correlation'], rate: true, extraNormals: 1 },
  fx: { params: ['foreignRate'] },
}

export const isModel = (model: string): boolean => model in MODELS
export const modelParams = (model: string): readonly string[] => MODELS[model]?.params ?? []
export const isRateModel = (model: string): boolean => MODELS[model]?.rate === true
export const extraNormalsPerStep = (model: string): number => MODELS[model]?.extraNormals ?? 0
export const modelNeedsVol = (model: string): boolean => isModel(model) && !isRateModel(model) && !MODELS[model].noVol
export const needsFineGrid = (model: string): boolean => isRateModel(model) || MODELS[model]?.fineGrid === true
