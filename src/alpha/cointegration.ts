import type { Matrix } from './types'
import { ols, withIntercept } from './regression'
import { adfStatistic, surfaceCriticalValues, type CriticalValues, type SurfaceTriple } from './stationarity'
import { cholesky } from '../numerics/linalg/cholesky'
import { solveLinearSystem } from '../numerics/linalg/solve'
import { jacobiEigen } from '../risk/pca'
import { matMul, transpose, symmetrize } from './linalg'
import { cols } from './util'

export const ENGLE_GRANGER_RESPONSE_SURFACE: readonly SurfaceTriple[] = [
  [
    { limit: -3.89644, overT: -10.9519, overT2: -22.527 },
    { limit: -3.33613, overT: -6.1101, overT2: -6.823 },
    { limit: -3.04445, overT: -4.2412, overT2: -2.72 },
  ],
  [
    { limit: -4.29374, overT: -14.4354, overT2: -33.195 },
    { limit: -3.74066, overT: -8.5631, overT2: -10.852 },
    { limit: -3.45218, overT: -6.2143, overT2: -3.718 },
  ],
  [
    { limit: -4.64332, overT: -18.1031, overT2: -37.972 },
    { limit: -4.096, overT: -11.2349, overT2: -11.175 },
    { limit: -3.8102, overT: -8.3931, overT2: -4.137 },
  ],
]

export interface EngleGrangerResult {
  readonly statistic: number
  readonly criticalValues: CriticalValues
  readonly cointegrated: boolean
  readonly hedgeRatio: number[]
  readonly spread: number[]
}

export function engleGranger(dependent: readonly number[], regressors: Matrix, lags = 0, surfaces: readonly SurfaceTriple[] = ENGLE_GRANGER_RESPONSE_SURFACE): EngleGrangerResult {
  const fit = ols(withIntercept(regressors), [...dependent])
  const statistic = adfStatistic(fit.residuals, lags, 'none')
  const variables = Math.min(cols(regressors) + 1, surfaces.length + 1)
  const criticalValues = surfaceCriticalValues(surfaces[variables - 2], fit.residuals.length - lags - 1)
  return { statistic, criticalValues, cointegrated: statistic < criticalValues.five, hedgeRatio: fit.coefficients, spread: fit.residuals }
}

export interface JohansenCriticalValues {
  readonly trace: readonly CriticalValues[]
  readonly maxEigen: readonly CriticalValues[]
}

export const JOHANSEN_CRITICAL_VALUES: JohansenCriticalValues = {
  trace: [
    { ten: 7.52, five: 9.24, one: 12.97 },
    { ten: 17.85, five: 19.96, one: 24.6 },
    { ten: 32.0, five: 34.91, one: 41.07 },
    { ten: 49.65, five: 53.12, one: 60.16 },
    { ten: 71.86, five: 76.07, one: 84.45 },
  ],
  maxEigen: [
    { ten: 7.52, five: 9.24, one: 12.97 },
    { ten: 13.75, five: 15.67, one: 20.2 },
    { ten: 19.77, five: 22.0, one: 26.81 },
    { ten: 25.56, five: 28.14, one: 33.24 },
    { ten: 31.66, five: 34.4, one: 39.79 },
  ],
}

function crossProduct(a: Matrix, b: Matrix): Matrix {
  const n = cols(a)
  const m = cols(b)
  const observations = a.length
  const out = Array.from({ length: n }, () => new Array<number>(m).fill(0))
  for (let i = 0; i < observations; i += 1) {
    for (let p = 0; p < n; p += 1) {
      for (let q = 0; q < m; q += 1) out[p][q] += a[i][p] * b[i][q]
    }
  }
  for (let p = 0; p < n; p += 1) for (let q = 0; q < m; q += 1) out[p][q] /= observations || 1
  return out
}

function columnSolve(matrix: Matrix, rhs: Matrix): Matrix {
  const n = rhs.length
  const m = cols(rhs)
  const solved = Array.from({ length: m }, (_, j) => solveLinearSystem(matrix, rhs.map((row) => row[j])))
  return Array.from({ length: n }, (_, i) => Array.from({ length: m }, (_, j) => solved[j][i]))
}

function residualizeColumns(targets: Matrix, design: Matrix): Matrix {
  const out = targets.map((row) => row.slice())
  for (let j = 0; j < cols(targets); j += 1) {
    const fit = ols(design, targets.map((row) => row[j]))
    for (let i = 0; i < targets.length; i += 1) out[i][j] = fit.residuals[i]
  }
  return out
}

export interface JohansenResult {
  readonly eigenvalues: number[]
  readonly vectors: Matrix
  readonly traceStatistics: number[]
  readonly maxEigenStatistics: number[]
  readonly rank: number
}

export function johansen(levels: Matrix, lags = 1, critical: JohansenCriticalValues = JOHANSEN_CRITICAL_VALUES): JohansenResult {
  const t = levels.length
  const n = cols(levels)
  const deltas: Matrix = []
  for (let i = 1; i < t; i += 1) deltas.push(levels[i].map((x, j) => x - levels[i - 1][j]))
  const design: Matrix = []
  const currentDeltas: Matrix = []
  const laggedLevels: Matrix = []
  for (let i = lags; i < deltas.length; i += 1) {
    const row = [1]
    for (let k = 1; k <= lags; k += 1) row.push(...deltas[i - k])
    design.push(row)
    currentDeltas.push(deltas[i])
    laggedLevels.push(levels[i])
  }
  const r0 = residualizeColumns(currentDeltas, design)
  const r1 = residualizeColumns(laggedLevels, design)
  const observations = r0.length
  const s00 = crossProduct(r0, r0)
  const s11 = crossProduct(r1, r1)
  const s01 = crossProduct(r0, r1)
  const s10 = crossProduct(r1, r0)
  const lower = cholesky(s11)
  const projected = matMul(s10, columnSolve(s00, s01))
  const halfWhitened = columnSolve(lower, projected)
  const whitened = transpose(columnSolve(lower, transpose(halfWhitened)))
  const symmetric = symmetrize(whitened)
  const eigen = jacobiEigen(symmetric)
  const order = eigen.values.map((value, i) => [value, i] as [number, number]).sort((a, b) => b[0] - a[0])
  const eigenvalues = order.map(([value]) => Math.min(Math.max(value, 0), 1 - 1e-12))
  const upper = transpose(lower)
  const vectors = order.map(([, i]) => solveLinearSystem(upper, eigen.vectors[i]))
  const traceStatistics: number[] = []
  const maxEigenStatistics: number[] = []
  for (let r = 0; r < n; r += 1) {
    let trace = 0
    for (let i = r; i < n; i += 1) trace += Math.log(1 - eigenvalues[i])
    traceStatistics.push(-observations * trace)
    maxEigenStatistics.push(-observations * Math.log(1 - eigenvalues[r]))
  }
  let rank = n
  for (let r = 0; r < n; r += 1) {
    if (traceStatistics[r] < critical.trace[n - r - 1].five) {
      rank = r
      break
    }
  }
  return { eigenvalues, vectors, traceStatistics, maxEigenStatistics, rank }
}
