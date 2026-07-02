import type { Matrix } from './types'
import { jacobiEigen } from '../risk/pca'
import { correlationFromCovariance } from './covariance'

export function marchenkoPasturEdge(varianceScale: number, ratio: number): number {
  return varianceScale * (1 + Math.sqrt(ratio)) ** 2
}

interface SortedEigen {
  readonly values: number[]
  readonly vectors: Matrix
}

function sortedEigen(matrix: Matrix): SortedEigen {
  const eigen = jacobiEigen(matrix)
  const order = eigen.values.map((value, i) => [value, i] as [number, number]).sort((a, b) => b[0] - a[0])
  return { values: order.map(([value]) => value), vectors: order.map(([, i]) => eigen.vectors[i]) }
}

function reconstruct(values: readonly number[], vectors: Matrix): Matrix {
  const n = vectors.length === 0 ? 0 : vectors[0].length
  const out = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  for (let k = 0; k < values.length; k += 1) {
    for (let a = 0; a < n; a += 1) {
      const scaled = values[k] * vectors[k][a]
      for (let b = a; b < n; b += 1) {
        out[a][b] += scaled * vectors[k][b]
        out[b][a] = out[a][b]
      }
    }
  }
  return out
}

function rebuildWithVols(covariance: Matrix, transform: (eigen: SortedEigen) => SortedEigen): Matrix {
  const vols = covariance.map((row, i) => Math.sqrt(Math.max(row[i], 0)))
  const { values, vectors } = transform(sortedEigen(correlationFromCovariance(covariance)))
  const rebuilt = correlationFromCovariance(reconstruct(values, vectors))
  return rebuilt.map((row, a) => row.map((c, b) => c * vols[a] * vols[b]))
}

export function denoiseCovariance(covariance: Matrix, observations: number): Matrix {
  const n = covariance.length
  const edge = marchenkoPasturEdge(1, n / Math.max(observations, 1))
  return rebuildWithVols(covariance, ({ values, vectors }) => {
    const signalCount = values.filter((value) => value > edge).length
    const noise = values.slice(signalCount)
    const noiseMean = noise.length === 0 ? 0 : noise.reduce((s, x) => s + x, 0) / noise.length
    return { values: values.map((value, i) => (i < signalCount ? value : noiseMean)), vectors }
  })
}

export function detoneCovariance(covariance: Matrix, marketModes = 1): Matrix {
  return rebuildWithVols(covariance, ({ values, vectors }) => ({ values: values.slice(marketModes), vectors: vectors.slice(marketModes) }))
}
