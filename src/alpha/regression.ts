import type { Matrix } from './types'
import { invert } from './linalg'

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

export function ols(design: Matrix, response: number[]): Regression {
  const n = design.length
  const k = n === 0 ? 0 : design[0].length
  const xtx = Array.from({ length: k }, () => new Array<number>(k).fill(0))
  const xty = new Array<number>(k).fill(0)
  for (let i = 0; i < n; i += 1) {
    for (let a = 0; a < k; a += 1) {
      xty[a] += design[i][a] * response[i]
      for (let b = a; b < k; b += 1) xtx[a][b] += design[i][a] * design[i][b]
    }
  }
  for (let a = 0; a < k; a += 1) for (let b = a + 1; b < k; b += 1) xtx[b][a] = xtx[a][b]
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
