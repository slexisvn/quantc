import { inverseNormalCdf } from '../numerics/rng/inverse-normal-cdf'

export function historicalVar(pnl: Float64Array, confidence: number): number {
  const sorted = Float64Array.from(pnl).sort()
  const index = Math.max(0, Math.floor((1 - confidence) * sorted.length))
  return -sorted[index]
}

export function historicalExpectedShortfall(pnl: Float64Array, confidence: number): number {
  const sorted = Float64Array.from(pnl).sort()
  const cutoff = Math.max(1, Math.floor((1 - confidence) * sorted.length))
  let total = 0
  for (let i = 0; i < cutoff; i += 1) total += sorted[i]
  return -total / cutoff
}

function quadraticForm(sensitivities: number[], covariance: number[][]): number {
  let variance = 0
  for (let i = 0; i < sensitivities.length; i += 1) {
    for (let j = 0; j < sensitivities.length; j += 1) variance += sensitivities[i] * covariance[i][j] * sensitivities[j]
  }
  return variance
}

export function parametricVar(sensitivities: number[], covariance: number[][], confidence: number): number {
  return inverseNormalCdf(confidence) * Math.sqrt(quadraticForm(sensitivities, covariance))
}

export function parametricExpectedShortfall(sensitivities: number[], covariance: number[][], confidence: number): number {
  const variance = quadraticForm(sensitivities, covariance)
  const z = inverseNormalCdf(confidence)
  const density = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI)
  return (density / (1 - confidence)) * Math.sqrt(variance)
}
