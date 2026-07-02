import type { Matrix } from './types'
import { invert } from './linalg'
import { solveLinearSystem } from '../numerics/linalg/solve'

export interface Regression {
  readonly coefficients: number[]
  readonly residuals: number[]
  readonly rSquared: number
  readonly tStats: number[]
  readonly standardErrors: number[]
}

export function withIntercept(design: Matrix): Matrix {
  return design.map((row) => [1, ...row])
}

function crossProducts(design: Matrix, response: readonly number[], weights?: readonly number[]): { xtx: Matrix; xty: number[] } {
  const n = design.length
  const k = n === 0 ? 0 : design[0].length
  const xtx = Array.from({ length: k }, () => new Array<number>(k).fill(0))
  const xty = new Array<number>(k).fill(0)
  for (let i = 0; i < n; i += 1) {
    const weight = weights ? weights[i] : 1
    for (let a = 0; a < k; a += 1) {
      const scaled = weight * design[i][a]
      xty[a] += scaled * response[i]
      for (let b = a; b < k; b += 1) xtx[a][b] += scaled * design[i][b]
    }
  }
  for (let a = 0; a < k; a += 1) for (let b = a + 1; b < k; b += 1) xtx[b][a] = xtx[a][b]
  return { xtx, xty }
}

function addRidge(xtx: Matrix, ridge: number): Matrix {
  return xtx.map((row, a) => row.map((x, b) => (a === b ? x + ridge : x)))
}

export function ols(design: Matrix, response: number[]): Regression {
  const n = design.length
  const k = n === 0 ? 0 : design[0].length
  const { xtx, xty } = crossProducts(design, response)
  const inverse = invert(xtx)
  const coefficients = new Array<number>(k).fill(0)
  for (let a = 0; a < k; a += 1) for (let b = 0; b < k; b += 1) coefficients[a] += inverse[a][b] * xty[b]

  let meanY = 0
  for (const y of response) meanY += y
  meanY /= n || 1
  const residuals = new Array<number>(n).fill(0)
  let sse = 0
  let sst = 0
  for (let i = 0; i < n; i += 1) {
    let fitted = 0
    for (let a = 0; a < k; a += 1) fitted += design[i][a] * coefficients[a]
    const error = response[i] - fitted
    residuals[i] = error
    sse += error * error
    sst += (response[i] - meanY) * (response[i] - meanY)
  }
  const sigmaSquared = sse / Math.max(1, n - k)
  const standardErrors = new Array<number>(k).fill(0)
  const tStats = new Array<number>(k).fill(0)
  for (let a = 0; a < k; a += 1) {
    const se = Math.sqrt(Math.max(sigmaSquared * inverse[a][a], 0))
    standardErrors[a] = se
    tStats[a] = se < 1e-12 ? 0 : coefficients[a] / se
  }
  const rSquared = sst < 1e-24 ? 0 : 1 - sse / sst
  return { coefficients, residuals, rSquared, tStats, standardErrors }
}

export interface LogisticFit {
  readonly coefficients: number[]
  readonly probabilities: number[]
  readonly logLikelihood: number
  readonly iterations: number
}

function sigmoid(x: number): number {
  return x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x))
}

export function logisticRegression(design: Matrix, labels: readonly number[], ridge = 1e-6, maxIterations = 50, tolerance = 1e-8): LogisticFit {
  const n = design.length
  const k = n === 0 ? 0 : design[0].length
  let coefficients = new Array<number>(k).fill(0)
  let iterations = 0
  for (let iter = 0; iter < maxIterations; iter += 1) {
    iterations = iter + 1
    const weights = new Array<number>(n).fill(0)
    const adjusted = new Array<number>(n).fill(0)
    for (let i = 0; i < n; i += 1) {
      let eta = 0
      for (let a = 0; a < k; a += 1) eta += design[i][a] * coefficients[a]
      const p = sigmoid(eta)
      const w = Math.max(p * (1 - p), 1e-12)
      weights[i] = w
      adjusted[i] = eta + (labels[i] - p) / w
    }
    const { xtx, xty } = crossProducts(design, adjusted, weights)
    const next = solveLinearSystem(addRidge(xtx, ridge), xty)
    let maxDiff = 0
    for (let a = 0; a < k; a += 1) maxDiff = Math.max(maxDiff, Math.abs(next[a] - coefficients[a]))
    coefficients = next
    if (maxDiff < tolerance) break
  }
  const probabilities = design.map((row) => {
    let eta = 0
    for (let a = 0; a < k; a += 1) eta += row[a] * coefficients[a]
    return sigmoid(eta)
  })
  let logLikelihood = 0
  for (let i = 0; i < n; i += 1) {
    const p = Math.min(Math.max(probabilities[i], 1e-12), 1 - 1e-12)
    logLikelihood += labels[i] > 0 ? Math.log(p) : Math.log(1 - p)
  }
  return { coefficients, probabilities, logLikelihood, iterations }
}

export function ridgeRegression(design: Matrix, response: readonly number[], lambda: number): number[] {
  const { xtx, xty } = crossProducts(design, response)
  return solveLinearSystem(addRidge(xtx, lambda), xty)
}
