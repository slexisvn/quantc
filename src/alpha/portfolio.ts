import type { Matrix, Portfolio, PortfolioFactory } from './types'
import { solveLinearSystem } from '../numerics/linalg/solve'
import { rows, cols, meanStd } from './util'

export function equalWeight(): Portfolio {
  return (score) =>
    score.map((row) => {
      const active = row.reduce((sum, x) => sum + (x === 0 ? 0 : 1), 0)
      return active === 0 ? row.map(() => 0) : row.map((x) => Math.sign(x) / active)
    })
}

export function crossSectional(): Portfolio {
  return (score) =>
    score.map((row) => {
      const n = row.length
      const mean = n === 0 ? 0 : row.reduce((sum, x) => sum + x, 0) / n
      const centered = row.map((x) => x - mean)
      const gross = centered.reduce((sum, x) => sum + Math.abs(x), 0)
      return gross < 1e-12 ? row.map(() => 0) : centered.map((x) => x / gross)
    })
}

export function longShortRank(fraction = 0.2): Portfolio {
  return (score) =>
    score.map((row) => {
      const n = row.length
      if (n < 2) return row.map(() => 0)
      const k = Math.max(1, Math.min(Math.floor(n * fraction), Math.floor(n / 2)))
      const order = row.map((x, i) => [x, i] as [number, number]).sort((a, b) => a[0] - b[0])
      const weights = new Array<number>(n).fill(0)
      for (let r = 0; r < k; r += 1) {
        weights[order[r][1]] = -1 / k
        weights[order[n - 1 - r][1]] = 1 / k
      }
      return weights
    })
}

export function meanVariance(expectedReturns: number[], covariance: Matrix): number[] {
  const raw = solveLinearSystem(covariance, expectedReturns)
  const gross = raw.reduce((sum, x) => sum + Math.abs(x), 0)
  return gross < 1e-12 ? raw.map(() => 0) : raw.map((x) => x / gross)
}

export function volTarget(weights: Matrix, returns: Matrix, target: number, periodsPerYear = 252): Matrix {
  const t = rows(weights)
  const n = cols(weights)
  const port: number[] = []
  for (let i = 1; i < t; i += 1) {
    let r = 0
    for (let j = 0; j < n; j += 1) r += weights[i - 1][j] * returns[i][j]
    port.push(r)
  }
  const realized = meanStd(port).std * Math.sqrt(periodsPerYear)
  const scale = realized < 1e-12 ? 1 : target / realized
  return weights.map((row) => row.map((w) => w * scale))
}

export const PORTFOLIOS: Record<string, PortfolioFactory> = {
  equalWeight: () => equalWeight(),
  crossSectional: () => crossSectional(),
  longShortRank: (params = {}) => longShortRank(params.fraction),
}
