import { ridgeRegression } from '../alpha/regression'
import { evaluateBasis, type Basis } from '../numerics/basis'
import { simmMargin, type SimmSensitivity } from './simm'
import type { SimmParameters } from './simm-parameters'

export type SensitivityProvider = (state: number, time: number) => SimmSensitivity[]

export interface DynamicImConfig {
  readonly times: number[]
  readonly statePaths: Float64Array[]
  readonly basis: Basis
  readonly ridgeLambda: number
  readonly subsample: number
  readonly params: SimmParameters
  readonly sensitivities: SensitivityProvider
}

export function simmImAtNode(state: number, time: number, params: SimmParameters, sensitivities: SensitivityProvider): number {
  return simmMargin(sensitivities(state, time), params)
}

export function expectedImProfile(config: DynamicImConfig): number[] {
  const steps = config.times.length
  const expected: number[] = new Array(steps)
  for (let k = 0; k < steps; k += 1) {
    const states = config.statePaths[k]
    const totalPaths = states.length
    const sampled = Math.min(config.subsample, totalPaths)
    const design: number[][] = new Array(sampled)
    const response: number[] = new Array(sampled)
    for (let i = 0; i < sampled; i += 1) {
      design[i] = config.basis.evaluate(states[i])
      response[i] = simmImAtNode(states[i], config.times[k], config.params, config.sensitivities)
    }
    const coefficients = ridgeRegression(design, response, config.ridgeLambda)
    let sum = 0
    for (let p = 0; p < totalPaths; p += 1) sum += evaluateBasis(config.basis, coefficients, states[p])
    expected[k] = Math.max(sum / totalPaths, 0)
  }
  return expected
}

export function bruteForceImProfile(config: DynamicImConfig): number[] {
  const steps = config.times.length
  const expected: number[] = new Array(steps)
  for (let k = 0; k < steps; k += 1) {
    const states = config.statePaths[k]
    let sum = 0
    for (let p = 0; p < states.length; p += 1) sum += simmImAtNode(states[p], config.times[k], config.params, config.sensitivities)
    expected[k] = sum / states.length
  }
  return expected
}
