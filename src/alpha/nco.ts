import type { Matrix } from './types'
import { correlationFromCovariance } from './covariance'
import { singleLinkage, clustersAtCount, correlationDistance } from './cluster'
import { minVariance, ALLOCATORS } from './allocation'
import { meanVariance } from './portfolio'
import { denoiseCovariance } from './rmt'

function subMatrix(matrix: Matrix, items: readonly number[]): Matrix {
  return items.map((a) => items.map((b) => matrix[a][b]))
}

export interface NcoOptions {
  readonly clusters?: number
  readonly expectedReturns?: readonly number[]
  readonly denoise?: boolean
  readonly observations?: number
}

export function nestedClusteredOptimization(covariance: Matrix, options: NcoOptions = {}): number[] {
  const n = covariance.length
  const { clusters = Math.max(1, Math.round(Math.sqrt(n))), expectedReturns, denoise = false, observations = n } = options
  const base = denoise ? denoiseCovariance(covariance, observations) : covariance
  const groups = clustersAtCount(singleLinkage(correlationDistance(correlationFromCovariance(base))), n, Math.min(clusters, n))
  const intra = groups.map((items) => {
    const sub = subMatrix(base, items)
    return expectedReturns ? meanVariance(items.map((i) => expectedReturns[i]), sub) : minVariance(sub)
  })
  const count = groups.length
  const reduced = Array.from({ length: count }, (_, g) =>
    Array.from({ length: count }, (_, h) => {
      let value = 0
      for (let a = 0; a < groups[g].length; a += 1) {
        for (let b = 0; b < groups[h].length; b += 1) value += intra[g][a] * base[groups[g][a]][groups[h][b]] * intra[h][b]
      }
      return value
    }),
  )
  const reducedReturns = expectedReturns ? groups.map((items, g) => items.reduce((s, asset, k) => s + expectedReturns[asset] * intra[g][k], 0)) : undefined
  const inter = reducedReturns ? meanVariance(reducedReturns, reduced) : minVariance(reduced)
  const weights = new Array<number>(n).fill(0)
  groups.forEach((items, g) => items.forEach((asset, k) => (weights[asset] = inter[g] * intra[g][k])))
  return weights
}

ALLOCATORS.nco = (covariance, params = {}) => nestedClusteredOptimization(covariance, { clusters: params.clusters, observations: params.observations, denoise: params.denoise === 1 })
