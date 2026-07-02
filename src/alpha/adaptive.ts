import type { Matrix } from './types'
import { icSeries, blendZscored } from './ic'
import { ridgeRegression } from './regression'
import { csZscore } from './cs-operators'

function normalizedWeights(raw: readonly number[], floor: number): number[] {
  const clipped = raw.map((x) => Math.max(x, floor))
  const total = clipped.reduce((s, x) => s + x, 0)
  return total < 1e-12 ? clipped.map(() => 1 / clipped.length) : clipped.map((x) => x / total)
}

function causalWeightSeries(signals: readonly Matrix[], returns: Matrix, horizon: number, floor: number, scoreAt: (signalIndex: number, lastObservedIc: number) => number): Matrix {
  const t = returns.length
  const count = Math.max(signals.length, 1)
  return Array.from({ length: t }, (_, i) => {
    const last = i - horizon
    if (last < 0) return new Array<number>(signals.length).fill(1 / count)
    return normalizedWeights(signals.map((_signal, s) => scoreAt(s, last)), floor)
  })
}

export function rollingIcWeights(signals: readonly Matrix[], returns: Matrix, window = 60, horizon = 1, rank = true, floor = 0): Matrix {
  const prefixes = signals.map((signal) => {
    const series = icSeries(signal, returns, horizon, rank)
    const prefix = new Float64Array(series.length + 1)
    for (let u = 0; u < series.length; u += 1) prefix[u + 1] = prefix[u] + series[u]
    return prefix
  })
  return causalWeightSeries(signals, returns, horizon, floor, (s, last) => {
    const end = Math.min(last + 1, prefixes[s].length - 1)
    const start = Math.max(0, end - window)
    return end > start ? (prefixes[s][end] - prefixes[s][start]) / (end - start) : 0
  })
}

export function ewmaIcWeights(signals: readonly Matrix[], returns: Matrix, lambda = 0.9, horizon = 1, rank = true, floor = 0): Matrix {
  const smoothed = signals.map((signal) => {
    const series = icSeries(signal, returns, horizon, rank)
    const out = new Array<number>(series.length).fill(0)
    let level = 0
    for (let u = 0; u < series.length; u += 1) {
      level = u === 0 ? series[u] : lambda * level + (1 - lambda) * series[u]
      out[u] = level
    }
    return out
  })
  return causalWeightSeries(signals, returns, horizon, floor, (s, last) => {
    const series = smoothed[s]
    return series.length === 0 ? 0 : series[Math.min(last, series.length - 1)]
  })
}

export function adaptiveCombine(signals: readonly Matrix[], weightSeries: Matrix): Matrix {
  return blendZscored(signals, (t, s) => weightSeries[t][s])
}

export function stackSignals(signals: readonly Matrix[], returns: Matrix, window = 60, lambda = 1e-4, horizon = 1): Matrix {
  const t = returns.length
  const n = t === 0 ? 0 : returns[0].length
  const count = signals.length
  const panels = signals.map((signal) => csZscore()(signal))
  const out = Array.from({ length: t }, () => new Array<number>(n).fill(0))
  for (let i = 0; i < t; i += 1) {
    const lastSample = Math.min(i - horizon, t - 1 - horizon)
    if (lastSample < 0) continue
    const firstSample = Math.max(0, lastSample - window + 1)
    const design: number[][] = []
    const target: number[] = []
    for (let u = firstSample; u <= lastSample; u += 1) {
      for (let j = 0; j < n; j += 1) {
        design.push(panels.map((panel) => panel[u][j]))
        target.push(returns[u + horizon][j])
      }
    }
    if (design.length <= count) continue
    const beta = ridgeRegression(design, target, lambda)
    for (let j = 0; j < n; j += 1) {
      let value = 0
      for (let s = 0; s < count; s += 1) value += beta[s] * panels[s][i][j]
      out[i][j] = value
    }
  }
  return out
}
