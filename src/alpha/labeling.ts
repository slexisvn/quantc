import type { Matrix } from './types'
import { withIntercept, logisticRegression, type LogisticFit } from './regression'

export interface TripleBarrierConfig {
  readonly profitTake: number
  readonly stopLoss: number
  readonly maxHolding: number
}

export interface BarrierLabel {
  readonly start: number
  readonly end: number
  readonly label: -1 | 0 | 1
  readonly ret: number
}

function returnFrom(prices: readonly number[], start: number, end: number): number {
  return prices[start] === 0 ? 0 : prices[end] / prices[start] - 1
}

export function tripleBarrier(prices: readonly number[], events: readonly number[], config: TripleBarrierConfig, volatility?: readonly number[]): BarrierLabel[] {
  return events.map((start) => {
    const scale = volatility ? volatility[start] : 1
    const upper = config.profitTake * scale
    const lower = -config.stopLoss * scale
    const limit = Math.min(prices.length - 1, start + config.maxHolding)
    for (let i = start + 1; i <= limit; i += 1) {
      const ret = returnFrom(prices, start, i)
      if (ret >= upper) return { start, end: i, label: 1, ret }
      if (ret <= lower) return { start, end: i, label: -1, ret }
    }
    return { start, end: limit, label: 0, ret: returnFrom(prices, start, limit) }
  })
}

export function sampleUniqueness(labels: readonly BarrierLabel[], length: number): number[] {
  const boundary = new Array<number>(length + 1).fill(0)
  for (const { start, end } of labels) {
    boundary[start] += 1
    boundary[Math.min(end + 1, length)] -= 1
  }
  const concurrency = new Array<number>(length).fill(0)
  let running = 0
  for (let i = 0; i < length; i += 1) {
    running += boundary[i]
    concurrency[i] = running
  }
  return labels.map(({ start, end }) => {
    let total = 0
    for (let i = start; i <= Math.min(end, length - 1); i += 1) total += 1 / Math.max(concurrency[i], 1)
    return total / (Math.min(end, length - 1) - start + 1)
  })
}

export interface MetaLabelResult {
  readonly fit: LogisticFit
  readonly probabilities: number[]
}

export function metaLabeling(features: Matrix, sides: readonly number[], labels: readonly BarrierLabel[], ridge = 1e-6): MetaLabelResult {
  const design = withIntercept(features)
  const targets = labels.map((label, i) => (sides[i] * label.ret > 0 ? 1 : 0))
  const fit = logisticRegression(design, targets, ridge)
  return { fit, probabilities: fit.probabilities }
}
