import type { Matrix } from './types'
import { rows, cols } from './util'

function columnMeans(returns: Matrix): number[] {
  const t = rows(returns)
  const n = cols(returns)
  const mean = new Array<number>(n).fill(0)
  for (let i = 0; i < t; i += 1) for (let j = 0; j < n; j += 1) mean[j] += returns[i][j]
  for (let j = 0; j < n; j += 1) mean[j] /= t || 1
  return mean
}

export function sampleCovariance(returns: Matrix): Matrix {
  const t = rows(returns)
  const n = cols(returns)
  const mean = columnMeans(returns)
  const cov = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  for (let i = 0; i < t; i += 1) {
    for (let a = 0; a < n; a += 1) {
      const da = returns[i][a] - mean[a]
      for (let b = a; b < n; b += 1) cov[a][b] += da * (returns[i][b] - mean[b])
    }
  }
  const denom = Math.max(1, t - 1)
  for (let a = 0; a < n; a += 1) {
    for (let b = a; b < n; b += 1) {
      cov[a][b] /= denom
      cov[b][a] = cov[a][b]
    }
  }
  return cov
}

export function correlationFromCovariance(cov: Matrix): Matrix {
  const n = cov.length
  const corr = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      const denom = Math.sqrt(cov[i][i] * cov[j][j])
      corr[i][j] = denom < 1e-24 ? 0 : cov[i][j] / denom
    }
  }
  return corr
}

export interface ShrunkCovariance {
  readonly covariance: Matrix
  readonly shrinkage: number
}

export function ledoitWolf(returns: Matrix): ShrunkCovariance {
  const t = rows(returns)
  const n = cols(returns)
  const mean = columnMeans(returns)
  const demeaned = returns.map((row) => row.map((x, j) => x - mean[j]))
  const sample = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  for (let i = 0; i < t; i += 1) {
    for (let a = 0; a < n; a += 1) {
      const da = demeaned[i][a]
      for (let b = a; b < n; b += 1) sample[a][b] += da * demeaned[i][b]
    }
  }
  for (let a = 0; a < n; a += 1) {
    for (let b = a; b < n; b += 1) {
      sample[a][b] /= t || 1
      sample[b][a] = sample[a][b]
    }
  }
  let mu = 0
  for (let i = 0; i < n; i += 1) mu += sample[i][i]
  mu /= n || 1
  let d2 = 0
  for (let a = 0; a < n; a += 1) {
    for (let b = 0; b < n; b += 1) {
      const target = a === b ? mu : 0
      d2 += (sample[a][b] - target) * (sample[a][b] - target)
    }
  }
  d2 /= n || 1
  let b2 = 0
  for (let i = 0; i < t; i += 1) {
    for (let a = 0; a < n; a += 1) {
      const da = demeaned[i][a]
      for (let b = 0; b < n; b += 1) {
        const term = da * demeaned[i][b] - sample[a][b]
        b2 += term * term
      }
    }
  }
  b2 /= (n || 1) * (t || 1) * (t || 1)
  b2 = Math.min(b2, d2)
  const shrinkage = d2 < 1e-24 ? 0 : b2 / d2
  const covariance = Array.from({ length: n }, (_, a) => Array.from({ length: n }, (_, b) => {
    const target = a === b ? mu : 0
    return shrinkage * target + (1 - shrinkage) * sample[a][b]
  }))
  return { covariance, shrinkage }
}
