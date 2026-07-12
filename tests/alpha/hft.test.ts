import { describe, it, expect } from 'vitest'
import {
  HFT_FEATURE_NAMES,
  HFT_SCHEMA_VERSION,
  buildHftLinearModel,
  fitHftLinearModel,
  serializeHftLinearModel,
  type HftLinearModel,
} from '../../src/alpha/hft'
import type { Matrix } from '../../src/alpha/types'

function passesHftLinearModelSpec(raw: unknown): boolean {
  if (typeof raw !== 'object' || raw === null) return false
  const m = raw as Record<string, unknown>
  const isNumArray = (v: unknown, min: number): boolean =>
    Array.isArray(v) && v.length >= min && v.every((x) => typeof x === 'number')
  const isStrArray = (v: unknown, min: number): boolean =>
    Array.isArray(v) && v.length >= min && v.every((x) => typeof x === 'string')
  return (
    typeof m.schemaVersion === 'number' &&
    Number.isInteger(m.schemaVersion) &&
    m.schemaVersion > 0 &&
    m.kind === 'linear' &&
    isStrArray(m.inputs, 1) &&
    isStrArray(m.outputs, 1) &&
    typeof m.lambda === 'number' &&
    m.lambda >= 0 &&
    isNumArray(m.intercept, 1) &&
    isNumArray(m.weights, 1)
  )
}

describe('hft linear model bridge', () => {
  it('builds an artifact that satisfies the hft LINEAR_MODEL_SPEC contract', () => {
    const model = buildHftLinearModel({
      features: ['ofi', 'depth_imbalance', 'trade_sign'],
      weights: [0.5, -0.25, 1.5],
      intercept: 3.14,
      lambda: 1,
    })
    expect(model.schemaVersion).toBe(HFT_SCHEMA_VERSION)
    expect(model.kind).toBe('linear')
    expect(model.inputs).toEqual(['ofi', 'depth_imbalance', 'trade_sign'])
    expect(model.outputs).toEqual(['mid_change_ticks'])
    expect(model.intercept).toEqual([3.14])
    expect(model.weights).toEqual([0.5, -0.25, 1.5])
    expect(passesHftLinearModelSpec(model)).toBe(true)
  })

  it('honours a custom output name', () => {
    const model = buildHftLinearModel({
      features: ['ofi'],
      weights: [1],
      intercept: 0,
      lambda: 0,
      output: 'cost_adjusted_pnl_ticks',
    })
    expect(model.outputs).toEqual(['cost_adjusted_pnl_ticks'])
  })

  it('rejects unknown, duplicate, and mismatched features', () => {
    expect(() => buildHftLinearModel({ features: ['not_real'], weights: [1], intercept: 0, lambda: 0 })).toThrow()
    expect(() => buildHftLinearModel({ features: ['ofi', 'ofi'], weights: [1, 1], intercept: 0, lambda: 0 })).toThrow()
    expect(() => buildHftLinearModel({ features: ['ofi'], weights: [1, 2], intercept: 0, lambda: 0 })).toThrow()
    expect(() => buildHftLinearModel({ features: ['ofi'], weights: [1], intercept: 0, lambda: -1 })).toThrow()
  })

  it('recovers the generating weights with ols (lambda 0) on a linear target', () => {
    const features = ['ofi', 'depth_imbalance']
    const trueIntercept = 2
    const trueWeights = [0.75, -1.25]
    const design: Matrix = [
      [1, 0],
      [0, 1],
      [2, 1],
      [1, 3],
      [-1, 2],
      [3, -2],
    ]
    const response = design.map((row) => trueIntercept + trueWeights[0] * row[0] + trueWeights[1] * row[1])
    const model = fitHftLinearModel({ features, design, response, lambda: 0 })
    expect(model.intercept[0]).toBeCloseTo(trueIntercept, 8)
    expect(model.weights[0]).toBeCloseTo(trueWeights[0], 8)
    expect(model.weights[1]).toBeCloseTo(trueWeights[1], 8)
    expect(passesHftLinearModelSpec(model)).toBe(true)
  })

  it('fits over the full hft feature set and serialises to loadable json', () => {
    const features = [...HFT_FEATURE_NAMES]
    const design: Matrix = Array.from({ length: 40 }, (_, i) =>
      features.map((_, j) => Math.sin(i * 0.3 + j) + (i % (j + 2)) * 0.1),
    )
    const response = design.map((row) => row.reduce((s, x, j) => s + x * (j + 1) * 0.01, 0.2))
    const model = fitHftLinearModel({ features, design, response, lambda: 0.5 })
    expect(model.inputs).toEqual(features)
    expect(model.weights.length).toBe(features.length)

    const json = serializeHftLinearModel(model)
    expect(json.endsWith('\n')).toBe(true)
    const parsed = JSON.parse(json) as HftLinearModel
    expect(passesHftLinearModelSpec(parsed)).toBe(true)
    expect(parsed.inputs).toEqual(features)
  })
})
