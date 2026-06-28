import { parametricVar } from './var'

export function stressedVar(sensitivities: number[], covariance: number[][], confidence: number, stressMultiplier: number): number {
  const stressed = covariance.map((row) => row.map((value) => value * stressMultiplier * stressMultiplier))
  return parametricVar(sensitivities, stressed, confidence)
}
