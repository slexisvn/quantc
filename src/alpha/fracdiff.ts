import type { Operator } from './types'
import { perColumn } from './util'

export function ffdWeights(d: number, threshold = 1e-5, maxWidth = Infinity): number[] {
  const weights = [1]
  for (let k = 1; k < maxWidth; k += 1) {
    const next = (-weights[weights.length - 1] * (d - k + 1)) / k
    if (Math.abs(next) < threshold) break
    weights.push(next)
  }
  return weights
}

export function fixedWidthFracDiff(series: readonly number[], d: number, threshold = 1e-5): number[] {
  const weights = ffdWeights(d, threshold, series.length)
  const width = weights.length
  const out = new Array<number>(series.length).fill(0)
  for (let i = width - 1; i < series.length; i += 1) {
    let value = 0
    for (let k = 0; k < width; k += 1) value += weights[k] * series[i - k]
    out[i] = value
  }
  return out
}

export function fracDiff(d = 0.5, threshold = 1e-5): Operator {
  return (m) => perColumn(m, (series) => fixedWidthFracDiff(series, d, threshold))
}
