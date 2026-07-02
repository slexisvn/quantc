import type { Matrix } from './types'

export interface LinkageStep {
  readonly left: number[]
  readonly right: number[]
  readonly distance: number
}

export function correlationDistance(correlation: Matrix): Matrix {
  return correlation.map((row) => row.map((c) => Math.sqrt(Math.max(0.5 * (1 - c), 0))))
}

export function singleLinkage(distance: Matrix): LinkageStep[] {
  const n = distance.length
  const clusters: number[][] = Array.from({ length: n }, (_, i) => [i])
  const steps: LinkageStep[] = []
  const linkage = (a: number[], b: number[]): number => {
    let minimum = Infinity
    for (const x of a) for (const y of b) if (distance[x][y] < minimum) minimum = distance[x][y]
    return minimum
  }
  while (clusters.length > 1) {
    let bestI = 0
    let bestJ = 1
    let best = Infinity
    for (let i = 0; i < clusters.length; i += 1) {
      for (let j = i + 1; j < clusters.length; j += 1) {
        const d = linkage(clusters[i], clusters[j])
        if (d < best) {
          best = d
          bestI = i
          bestJ = j
        }
      }
    }
    const left = clusters[bestI]
    const right = clusters[bestJ]
    steps.push({ left, right, distance: best })
    clusters.splice(bestJ, 1)
    clusters.splice(bestI, 1)
    clusters.push([...left, ...right])
  }
  return steps
}

export function orderFromLinkage(steps: readonly LinkageStep[], n: number): number[] {
  if (steps.length === 0) return Array.from({ length: n }, (_, i) => i)
  const last = steps[steps.length - 1]
  return [...last.left, ...last.right]
}

export function clustersAtCount(steps: readonly LinkageStep[], n: number, count: number): number[][] {
  const active: number[][] = Array.from({ length: n }, (_, i) => [i])
  for (const step of steps) {
    if (active.length <= count) break
    const leftIndex = active.findIndex((cluster) => cluster[0] === step.left[0])
    const rightIndex = active.findIndex((cluster) => cluster[0] === step.right[0])
    const merged = [...active[leftIndex], ...active[rightIndex]]
    const [high, low] = leftIndex > rightIndex ? [leftIndex, rightIndex] : [rightIndex, leftIndex]
    active.splice(high, 1)
    active.splice(low, 1)
    active.push(merged)
  }
  return active
}

export function clusterVariance(covariance: Matrix, items: readonly number[]): number {
  const inverse = items.map((i) => 1 / Math.max(covariance[i][i], 1e-18))
  const sum = inverse.reduce((s, x) => s + x, 0)
  const weights = inverse.map((x) => x / sum)
  let variance = 0
  for (let a = 0; a < items.length; a += 1) {
    for (let b = 0; b < items.length; b += 1) variance += weights[a] * covariance[items[a]][items[b]] * weights[b]
  }
  return variance
}
