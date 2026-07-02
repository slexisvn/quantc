import { MersenneTwister } from '../numerics/rng/mersenne-twister'
import type { Matrix } from './types'
import { percentile } from './stats'
import { meanStd } from './util'
import { sharpePerPeriod } from './overfit'

export interface BootstrapOptions {
  readonly samples: number
  readonly expectedBlock: number
  readonly seed: number
}

export function stationaryBootstrapIndices(length: number, options: Partial<BootstrapOptions> = {}): number[][] {
  const { samples = 1000, expectedBlock = 10, seed = 1 } = options
  const rng = new MersenneTwister(seed)
  const restartProbability = 1 / Math.max(expectedBlock, 1)
  return Array.from({ length: samples }, () => {
    const indices = new Array<number>(length).fill(0)
    indices[0] = Math.floor(rng.nextDouble() * length)
    for (let i = 1; i < length; i += 1) {
      indices[i] = rng.nextDouble() < restartProbability ? Math.floor(rng.nextDouble() * length) : (indices[i - 1] + 1) % length
    }
    return indices
  })
}

export function circularBlockBootstrapIndices(length: number, blockLength = 10, samples = 1000, seed = 1): number[][] {
  const rng = new MersenneTwister(seed)
  return Array.from({ length: samples }, () => {
    const indices = new Array<number>(length).fill(0)
    for (let i = 0; i < length; i += blockLength) {
      const start = Math.floor(rng.nextDouble() * length)
      for (let k = 0; k < blockLength && i + k < length; k += 1) indices[i + k] = (start + k) % length
    }
    return indices
  })
}

export interface ConfidenceInterval {
  readonly point: number
  readonly lower: number
  readonly upper: number
}

export function sharpeConfidenceInterval(returns: readonly number[], confidence = 0.95, options: Partial<BootstrapOptions> = {}): ConfidenceInterval {
  const series = [...returns]
  const draws = stationaryBootstrapIndices(series.length, options).map((indices) => sharpePerPeriod(indices.map((i) => series[i])))
  const tail = (1 - confidence) / 2
  return { point: sharpePerPeriod(series), lower: percentile(draws, tail), upper: percentile(draws, 1 - tail) }
}

export interface RealityCheckResult {
  readonly pValue: number
  readonly statistic: number
  readonly bestTrial: number
}

export function whiteRealityCheck(trialReturns: Matrix, options: Partial<BootstrapOptions> & { readonly studentized?: boolean } = {}): RealityCheckResult {
  const { studentized = false } = options
  const t = trialReturns.length
  const m = t === 0 ? 0 : trialReturns[0].length
  const scale = Math.sqrt(t)
  const columns = Array.from({ length: m }, (_, j) => trialReturns.map((row) => row[j]))
  const stats = columns.map((column) => meanStd(column))
  const scaleOf = (j: number): number => (studentized ? Math.max(stats[j].std, 1e-12) : 1)
  let statistic = -Infinity
  let bestTrial = 0
  for (let j = 0; j < m; j += 1) {
    const value = (scale * stats[j].mean) / scaleOf(j)
    if (value > statistic) {
      statistic = value
      bestTrial = j
    }
  }
  const resamples = stationaryBootstrapIndices(t, options)
  let exceed = 0
  for (const indices of resamples) {
    let maxValue = -Infinity
    for (let j = 0; j < m; j += 1) {
      let sum = 0
      for (const i of indices) sum += columns[j][i]
      const value = (scale * (sum / t - stats[j].mean)) / scaleOf(j)
      if (value > maxValue) maxValue = value
    }
    if (maxValue >= statistic) exceed += 1
  }
  return { pValue: resamples.length === 0 ? 1 : exceed / resamples.length, statistic, bestTrial }
}
