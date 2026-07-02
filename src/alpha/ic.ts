import type { Matrix } from './types'
import { pearson, spearman } from './stats'
import { meanStd } from './util'

export function informationCoefficient(signal: number[], forwardReturns: number[]): number {
  return pearson(signal, forwardReturns)
}

export function rankInformationCoefficient(signal: number[], forwardReturns: number[]): number {
  return spearman(signal, forwardReturns)
}

export function icSeries(signal: Matrix, returns: Matrix, horizon = 1, rank = true): number[] {
  const t = Math.min(signal.length, returns.length)
  const series: number[] = []
  for (let i = 0; i + horizon < t; i += 1) series.push(rank ? spearman(signal[i], returns[i + horizon]) : pearson(signal[i], returns[i + horizon]))
  return series
}

export function informationRatioOfIC(ic: number[]): number {
  const { mean, std } = meanStd(ic)
  return std < 1e-12 ? 0 : mean / std
}

export interface DecayPoint {
  readonly horizon: number
  readonly ic: number
}

export function alphaDecay(signal: Matrix, returns: Matrix, horizons: number[], rank = true): DecayPoint[] {
  return horizons.map((horizon) => ({ horizon, ic: meanStd(icSeries(signal, returns, horizon, rank)).mean }))
}

export function blendZscored(signals: readonly Matrix[], weightAt: (t: number, s: number) => number): Matrix {
  const count = signals.length
  if (count === 0) return []
  const t = signals[0].length
  const n = t === 0 ? 0 : signals[0][0].length
  const out = Array.from({ length: t }, () => new Array<number>(n).fill(0))
  for (let s = 0; s < count; s += 1) {
    for (let i = 0; i < t; i += 1) {
      const row = signals[s][i]
      const { mean, std } = meanStd(row)
      for (let j = 0; j < n; j += 1) out[i][j] += weightAt(i, s) * (std < 1e-12 ? 0 : (row[j] - mean) / std)
    }
  }
  return out
}

export function combineSignals(signals: Matrix[], weights?: number[]): Matrix {
  const count = signals.length
  if (count === 0) return []
  const blend = weights ?? new Array<number>(count).fill(1 / count)
  return blendZscored(signals, (_t, s) => blend[s])
}
