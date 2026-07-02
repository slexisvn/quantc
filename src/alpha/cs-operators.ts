import type { Operator } from './types'
import { meanStd } from './util'
import { ranks, percentile } from './stats'

function perRow(transform: (row: number[]) => number[]): Operator {
  return (m) => m.map((row) => transform(row))
}

export function csRank(): Operator {
  return perRow((row) => (row.length < 2 ? row.map(() => 0) : ranks(row).map((r) => r / (row.length - 1))))
}

export function csDemean(): Operator {
  return perRow((row) => {
    const { mean } = meanStd(row)
    return row.map((x) => x - mean)
  })
}

export function csZscore(): Operator {
  return perRow((row) => {
    const { mean, std } = meanStd(row)
    return row.map((x) => (std < 1e-12 ? 0 : (x - mean) / std))
  })
}

export function csWinsorize(lower = 0.01, upper = 0.99): Operator {
  return perRow((row) => {
    const low = percentile(row, lower)
    const high = percentile(row, upper)
    return row.map((x) => Math.min(Math.max(x, low), high))
  })
}

export function csTruncate(maxFraction = 0.1): Operator {
  return perRow((row) => {
    const cap = maxFraction * row.reduce((sum, x) => sum + Math.abs(x), 0)
    return row.map((x) => Math.min(Math.max(x, -cap), cap))
  })
}

export function csScale(gross = 1): Operator {
  return perRow((row) => {
    const current = row.reduce((sum, x) => sum + Math.abs(x), 0)
    return current < 1e-12 ? row.map(() => 0) : row.map((x) => (x * gross) / current)
  })
}

export function csNeutralize(groups: readonly (string | number)[]): Operator {
  return perRow((row) => {
    const totals = new Map<string | number, { sum: number; count: number }>()
    for (let j = 0; j < row.length; j += 1) {
      const entry = totals.get(groups[j])
      if (entry) {
        entry.sum += row[j]
        entry.count += 1
      } else totals.set(groups[j], { sum: row[j], count: 1 })
    }
    return row.map((x, j) => {
      const entry = totals.get(groups[j])
      return entry ? x - entry.sum / entry.count : x
    })
  })
}
