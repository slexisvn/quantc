import type { Matrix } from './types'
import { rows, cols } from './util'

export function fractionalKelly(mean: number, variance: number, fraction = 0.5): number {
  return variance < 1e-18 ? 0 : (fraction * mean) / variance
}

export function ewmaVolatility(returns: readonly number[], lambda = 0.94): number[] {
  const out = new Array<number>(returns.length).fill(0)
  let variance = 0
  for (let i = 0; i < returns.length; i += 1) {
    variance = i === 0 ? returns[i] * returns[i] : lambda * variance + (1 - lambda) * returns[i] * returns[i]
    out[i] = Math.sqrt(variance)
  }
  return out
}

export function portfolioReturns(weights: Matrix, returns: Matrix): number[] {
  const t = rows(weights)
  const n = cols(weights)
  const out = new Array<number>(t).fill(0)
  for (let i = 1; i < t; i += 1) {
    for (let j = 0; j < n; j += 1) out[i] += weights[i - 1][j] * returns[i][j]
  }
  return out
}

export function scaleWeightsToVol(weights: Matrix, vol: readonly number[], target: number, periodsPerYear = 252, maxScale = 3): Matrix {
  return weights.map((row, i) => {
    const annualized = vol[i] * Math.sqrt(periodsPerYear)
    const scale = annualized < 1e-12 ? 1 : Math.min(target / annualized, maxScale)
    return row.map((w) => w * scale)
  })
}

export function ewmaVolTarget(weights: Matrix, returns: Matrix, target: number, lambda = 0.94, periodsPerYear = 252, maxScale = 3): Matrix {
  return scaleWeightsToVol(weights, ewmaVolatility(portfolioReturns(weights, returns), lambda), target, periodsPerYear, maxScale)
}

export function drawdownControl(portReturns: readonly number[], maxDrawdown = 0.2, minScale = 0.25): number[] {
  const scales = new Array<number>(portReturns.length).fill(1)
  let equity = 1
  let peak = 1
  for (let i = 0; i < portReturns.length; i += 1) {
    equity *= 1 + portReturns[i]
    peak = Math.max(peak, equity)
    const underwater = peak > 0 ? 1 - equity / peak : 0
    scales[i] = Math.max(minScale, 1 - underwater / maxDrawdown)
  }
  return scales
}
