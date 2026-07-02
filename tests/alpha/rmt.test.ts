import { describe, it, expect } from 'vitest'
import { standardNormals } from '../../src/numerics/sampling'
import { denoiseCovariance, detoneCovariance, marchenkoPasturEdge } from '../../src/alpha/rmt'
import { sampleCovariance, correlationFromCovariance } from '../../src/alpha/covariance'
import type { Matrix } from '../../src/alpha/types'

const N = 20
const T = 500

function noiseReturns(seed: number): Matrix {
  const draws = standardNormals(T * N, seed)
  return Array.from({ length: T }, (_, i) => Array.from({ length: N }, (_, j) => 0.01 * draws[i * N + j]))
}

function oneFactorReturns(seed: number): Matrix {
  const market = standardNormals(T, seed)
  const idio = standardNormals(T * N, seed + 1)
  return Array.from({ length: T }, (_, i) => Array.from({ length: N }, (_, j) => 0.01 * (0.9 * market[i] + 0.4 * idio[i * N + j])))
}

function meanAbsOffDiagonal(correlation: Matrix): number {
  let sum = 0
  let count = 0
  for (let a = 0; a < correlation.length; a += 1) {
    for (let b = 0; b < correlation.length; b += 1) {
      if (a !== b) {
        sum += Math.abs(correlation[a][b])
        count += 1
      }
    }
  }
  return sum / count
}

describe('marchenko-pastur denoising', () => {
  it('pure noise collapses to a near-diagonal correlation', () => {
    const covariance = sampleCovariance(noiseReturns(23))
    const denoised = correlationFromCovariance(denoiseCovariance(covariance, T))
    expect(meanAbsOffDiagonal(denoised)).toBeLessThan(0.01)
    for (let a = 0; a < N; a += 1) expect(denoised[a][a]).toBeCloseTo(1, 8)
  })

  it('a planted market factor survives denoising and the diagonal is preserved', () => {
    const covariance = sampleCovariance(oneFactorReturns(29))
    const denoised = denoiseCovariance(covariance, T)
    const correlation = correlationFromCovariance(denoised)
    expect(meanAbsOffDiagonal(correlation)).toBeGreaterThan(0.5)
    for (let a = 0; a < N; a += 1) expect(denoised[a][a]).toBeCloseTo(covariance[a][a], 10)
  })

  it('the edge grows with the dimension-to-sample ratio', () => {
    expect(marchenkoPasturEdge(1, 0.5)).toBeGreaterThan(marchenkoPasturEdge(1, 0.1))
  })
})

describe('detoning', () => {
  it('removes the market mode from a one-factor structure', () => {
    const covariance = sampleCovariance(oneFactorReturns(31))
    const before = meanAbsOffDiagonal(correlationFromCovariance(covariance))
    const detoned = detoneCovariance(covariance, 1)
    const after = meanAbsOffDiagonal(correlationFromCovariance(detoned))
    expect(before).toBeGreaterThan(0.5)
    expect(after).toBeLessThan(before * 0.4)
    for (let a = 0; a < N; a += 1) expect(detoned[a][a]).toBeCloseTo(covariance[a][a], 10)
  })
})
