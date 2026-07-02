import { normalCdf } from '../numerics/analytic/black-scholes'
import { inverseNormalCdf } from '../numerics/rng/inverse-normal-cdf'
import { combinations } from './combinatorics'
import { moments } from './stats'
import type { Matrix } from './types'
import { rows, cols } from './util'

const EULER_MASCHERONI = 0.5772156649015329

export function sharpePerPeriod(returns: number[]): number {
  const { mean, variance } = moments(returns)
  const std = Math.sqrt(variance)
  return std < 1e-12 ? 0 : mean / std
}

export function sharpeTStat(returns: number[]): number {
  return sharpePerPeriod(returns) * Math.sqrt(returns.length)
}

export function probabilisticSharpe(returns: number[], benchmark = 0): number {
  const n = returns.length
  if (n < 2) return 0
  const { mean, variance, skew, kurt } = moments(returns)
  const std = Math.sqrt(variance)
  const sharpe = std < 1e-12 ? 0 : mean / std
  const denominator = Math.sqrt(Math.max(1 - skew * sharpe + ((kurt - 1) / 4) * sharpe * sharpe, 1e-12))
  return normalCdf(((sharpe - benchmark) * Math.sqrt(n - 1)) / denominator)
}

function expectedMaxSharpe(trials: number, variance: number): number {
  if (trials < 2) return 0
  const sd = Math.sqrt(Math.max(variance, 0))
  const high = inverseNormalCdf(1 - 1 / trials)
  const low = inverseNormalCdf(1 - 1 / (trials * Math.E))
  return sd * ((1 - EULER_MASCHERONI) * high + EULER_MASCHERONI * low)
}

export function deflatedSharpe(returns: number[], trialSharpes: number[]): number {
  const expectedMax = expectedMaxSharpe(trialSharpes.length, moments(trialSharpes).variance)
  return probabilisticSharpe(returns, expectedMax)
}

export function minTrackRecordLength(returns: number[], targetSharpe = 0, confidence = 0.95): number {
  const { mean, variance, skew, kurt } = moments(returns)
  const std = Math.sqrt(variance)
  const sharpe = std < 1e-12 ? 0 : mean / std
  if (Math.abs(sharpe - targetSharpe) < 1e-12) return Infinity
  const z = inverseNormalCdf(confidence)
  return 1 + (1 - skew * sharpe + ((kurt - 1) / 4) * sharpe * sharpe) * (z / (sharpe - targetSharpe)) ** 2
}

function sharpeOverRows(returns: Matrix, rowIndices: number[], column: number): number {
  const series = rowIndices.map((i) => returns[i][column])
  return sharpePerPeriod(series)
}

export function probabilityOfBacktestOverfitting(trialReturns: Matrix, partitions = 10): number {
  const t = rows(trialReturns)
  const m = cols(trialReturns)
  const blocks = Math.max(2, partitions - (partitions % 2))
  const blockOf: number[][] = Array.from({ length: blocks }, () => [])
  for (let i = 0; i < t; i += 1) blockOf[Math.min(blocks - 1, Math.floor((i * blocks) / t))].push(i)
  const combos = combinations(blocks, blocks / 2)
  let belowMedian = 0
  let counted = 0
  for (const inSample of combos) {
    const isSet = new Set(inSample)
    const isRows: number[] = []
    const oosRows: number[] = []
    for (let b = 0; b < blocks; b += 1) (isSet.has(b) ? isRows : oosRows).push(...blockOf[b])
    if (isRows.length < 2 || oosRows.length < 2) continue
    let best = 0
    let bestPerf = -Infinity
    for (let strategy = 0; strategy < m; strategy += 1) {
      const perf = sharpeOverRows(trialReturns, isRows, strategy)
      if (perf > bestPerf) {
        bestPerf = perf
        best = strategy
      }
    }
    const oosBest = sharpeOverRows(trialReturns, oosRows, best)
    let rank = 1
    for (let strategy = 0; strategy < m; strategy += 1) if (sharpeOverRows(trialReturns, oosRows, strategy) < oosBest) rank += 1
    const relative = rank / (m + 1)
    const logit = Math.log(relative / (1 - relative))
    if (logit <= 0) belowMedian += 1
    counted += 1
  }
  return counted === 0 ? 0 : belowMedian / counted
}

export function bonferroni(pValues: number[], alpha = 0.05): boolean[] {
  const threshold = alpha / Math.max(1, pValues.length)
  return pValues.map((p) => p <= threshold)
}

export function benjaminiHochberg(pValues: number[], alpha = 0.05): boolean[] {
  const m = pValues.length
  const order = pValues.map((p, i) => [p, i] as [number, number]).sort((a, b) => a[0] - b[0])
  let cutoff = -1
  for (let r = 0; r < m; r += 1) if (order[r][0] <= ((r + 1) / m) * alpha) cutoff = r
  const reject = new Array<boolean>(m).fill(false)
  for (let r = 0; r <= cutoff; r += 1) reject[order[r][1]] = true
  return reject
}
