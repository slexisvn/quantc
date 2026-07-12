import type { Matrix } from './types'
import { ridgeRegression, withIntercept } from './regression'

export const HFT_SCHEMA_VERSION = 3

export const HFT_FEATURE_NAMES = [
  'micro_price_ticks',
  'spread_ticks',
  'bid_size',
  'ask_size',
  'depth_imbalance',
  'ofi',
  'multi_level_ofi',
  'trade_sign',
] as const

export type HftFeatureName = (typeof HFT_FEATURE_NAMES)[number]

export interface HftLinearModel {
  readonly schemaVersion: number
  readonly kind: 'linear'
  readonly inputs: readonly string[]
  readonly outputs: readonly string[]
  readonly lambda: number
  readonly intercept: readonly number[]
  readonly weights: readonly number[]
}

export interface HftLinearModelInput {
  readonly features: readonly string[]
  readonly weights: readonly number[]
  readonly intercept: number
  readonly lambda: number
  readonly output?: string
}

export interface HftLinearFitInput {
  readonly features: readonly string[]
  readonly design: Matrix
  readonly response: readonly number[]
  readonly lambda: number
  readonly output?: string
}

function assertHftFeatures(features: readonly string[]): void {
  if (features.length === 0) throw new Error('hft linear model requires at least one feature')
  const known = HFT_FEATURE_NAMES as readonly string[]
  const seen = new Set<string>()
  for (const f of features) {
    if (known.indexOf(f) < 0) throw new Error(`unknown hft feature "${f}", known: [${known.join(', ')}]`)
    if (seen.has(f)) throw new Error(`duplicate hft feature "${f}"`)
    seen.add(f)
  }
}

export function buildHftLinearModel(input: HftLinearModelInput): HftLinearModel {
  assertHftFeatures(input.features)
  if (input.weights.length !== input.features.length) {
    throw new Error(`weights length ${input.weights.length} does not match feature count ${input.features.length}`)
  }
  if (!(input.lambda >= 0)) throw new Error(`lambda must be non-negative, got ${input.lambda}`)
  if (!Number.isFinite(input.intercept)) throw new Error('intercept must be finite')
  for (const w of input.weights) if (!Number.isFinite(w)) throw new Error('weights must be finite')
  return {
    schemaVersion: HFT_SCHEMA_VERSION,
    kind: 'linear',
    inputs: [...input.features],
    outputs: [input.output ?? 'mid_change_ticks'],
    lambda: input.lambda,
    intercept: [input.intercept],
    weights: [...input.weights],
  }
}

export function fitHftLinearModel(input: HftLinearFitInput): HftLinearModel {
  assertHftFeatures(input.features)
  const cols = input.features.length
  for (const row of input.design) {
    if (row.length !== cols) throw new Error(`design row width ${row.length} does not match feature count ${cols}`)
  }
  if (input.design.length !== input.response.length) {
    throw new Error(`design has ${input.design.length} rows but response has ${input.response.length}`)
  }
  const coefficients = ridgeRegression(withIntercept(input.design), input.response, input.lambda)
  const intercept = coefficients[0]
  const weights = coefficients.slice(1)
  return buildHftLinearModel({
    features: input.features,
    weights,
    intercept,
    lambda: input.lambda,
    output: input.output,
  })
}

export function serializeHftLinearModel(model: HftLinearModel): string {
  return `${JSON.stringify(model, null, 2)}\n`
}
