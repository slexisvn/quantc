import { Welford } from '../numerics/stats/welford'
import type { Matrix } from './types'

export const rows = (m: Matrix): number => m.length
export const cols = (m: Matrix): number => (m.length === 0 ? 0 : m[0].length)

export function zeros(t: number, n: number): Matrix {
  return Array.from({ length: t }, () => new Array<number>(n).fill(0))
}

export function mapMatrix(m: Matrix, fn: (x: number, t: number, j: number) => number): Matrix {
  return m.map((row, t) => row.map((x, j) => fn(x, t, j)))
}

export function column(m: Matrix, j: number): number[] {
  return m.map((row) => row[j])
}

export function perColumn(m: Matrix, transform: (col: number[], j: number) => number[]): Matrix {
  const t = rows(m)
  const n = cols(m)
  const out = zeros(t, n)
  for (let j = 0; j < n; j += 1) {
    const series = transform(column(m, j), j)
    for (let i = 0; i < t; i += 1) out[i][j] = series[i]
  }
  return out
}

export function meanStd(xs: number[]): { mean: number; std: number } {
  const accumulator = new Welford()
  for (const x of xs) accumulator.push(x)
  return { mean: accumulator.mean, std: Math.sqrt(accumulator.variance) }
}

export function standardize(value: number, mean: number, std: number): number {
  return std < 1e-12 ? 0 : (value - mean) / std
}

export function grossExposure(v: readonly number[]): number {
  return v.reduce((sum, x) => sum + Math.abs(x), 0)
}

export function toReturns(prices: Matrix): Matrix {
  const t = rows(prices)
  const n = cols(prices)
  const out = zeros(t, n)
  for (let i = 1; i < t; i += 1) {
    for (let j = 0; j < n; j += 1) out[i][j] = prices[i - 1][j] === 0 ? 0 : prices[i][j] / prices[i - 1][j] - 1
  }
  return out
}

export function capLeverage(weights: Matrix, maxLeverage: number): Matrix {
  if (!Number.isFinite(maxLeverage)) return weights
  return weights.map((row) => {
    const gross = grossExposure(row)
    const scale = gross > maxLeverage ? maxLeverage / gross : 1
    return row.map((w) => w * scale)
  })
}

export function rollingMeanStd(series: number[], window: number): { mean: number[]; std: number[] } {
  const t = series.length
  const prefix = new Float64Array(t + 1)
  const prefixSquared = new Float64Array(t + 1)
  for (let i = 0; i < t; i += 1) {
    prefix[i + 1] = prefix[i] + series[i]
    prefixSquared[i + 1] = prefixSquared[i] + series[i] * series[i]
  }
  const mean = new Array<number>(t).fill(0)
  const std = new Array<number>(t).fill(0)
  for (let i = 0; i < t; i += 1) {
    const start = Math.max(0, i - window + 1)
    const count = i - start + 1
    const sum = prefix[i + 1] - prefix[start]
    const sumSquared = prefixSquared[i + 1] - prefixSquared[start]
    const m = sum / count
    mean[i] = m
    std[i] = Math.sqrt(Math.max(sumSquared / count - m * m, 0))
  }
  return { mean, std }
}
