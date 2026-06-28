import type { Matrix } from './types'
import { differentialEvolution } from '../numerics/optimization/differential-evolution'
import { correlationFromCovariance } from './covariance'
import { matVec, dot, matMul, transpose, invert, scaleMatrix, addMatrices } from './linalg'

export function riskContributions(covariance: Matrix, weights: number[]): number[] {
  const sigmaW = matVec(covariance, weights)
  const portfolioVariance = dot(weights, sigmaW)
  return weights.map((w, i) => (portfolioVariance < 1e-24 ? 0 : (w * sigmaW[i]) / portfolioVariance))
}

export function riskParity(covariance: Matrix, budget?: number[], iterations = 2000, tolerance = 1e-12): number[] {
  const n = covariance.length
  const target = budget ?? new Array<number>(n).fill(1 / n)
  let weights = new Array<number>(n).fill(1 / n)
  for (let iter = 0; iter < iterations; iter += 1) {
    const sigmaW = matVec(covariance, weights)
    const portfolioVariance = dot(weights, sigmaW)
    const next = weights.map((w, i) => {
      const contribution = portfolioVariance < 1e-24 ? target[i] : (w * sigmaW[i]) / portfolioVariance
      return w * Math.sqrt(target[i] / Math.max(contribution, 1e-18))
    })
    const sum = next.reduce((s, x) => s + x, 0)
    let maxDiff = 0
    for (let i = 0; i < n; i += 1) {
      next[i] /= sum
      maxDiff = Math.max(maxDiff, Math.abs(next[i] - weights[i]))
    }
    weights = next
    if (maxDiff < tolerance) break
  }
  return weights
}

type ClusterNode = number | { readonly left: ClusterNode; readonly right: ClusterNode }

function singleLinkageOrder(distance: Matrix): number[] {
  const n = distance.length
  const clusters: { members: number[]; node: ClusterNode }[] = []
  for (let i = 0; i < n; i += 1) clusters.push({ members: [i], node: i })
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
        const d = linkage(clusters[i].members, clusters[j].members)
        if (d < best) {
          best = d
          bestI = i
          bestJ = j
        }
      }
    }
    const merged = {
      members: [...clusters[bestI].members, ...clusters[bestJ].members],
      node: { left: clusters[bestI].node, right: clusters[bestJ].node } as ClusterNode,
    }
    clusters.splice(bestJ, 1)
    clusters.splice(bestI, 1)
    clusters.push(merged)
  }
  const order: number[] = []
  const flatten = (node: ClusterNode): void => {
    if (typeof node === 'number') order.push(node)
    else {
      flatten(node.left)
      flatten(node.right)
    }
  }
  if (clusters.length > 0) flatten(clusters[0].node)
  return order
}

function clusterVariance(covariance: Matrix, items: number[]): number {
  const inverse = items.map((i) => 1 / Math.max(covariance[i][i], 1e-18))
  const sum = inverse.reduce((s, x) => s + x, 0)
  const weights = inverse.map((x) => x / sum)
  let variance = 0
  for (let a = 0; a < items.length; a += 1) {
    for (let b = 0; b < items.length; b += 1) variance += weights[a] * covariance[items[a]][items[b]] * weights[b]
  }
  return variance
}

export function hierarchicalRiskParity(covariance: Matrix): number[] {
  const n = covariance.length
  const correlation = correlationFromCovariance(covariance)
  const distance = correlation.map((row) => row.map((c) => Math.sqrt(Math.max(0.5 * (1 - c), 0))))
  const order = singleLinkageOrder(distance)
  const weights = new Array<number>(n).fill(1)
  let clusters: number[][] = order.length > 0 ? [order] : []
  while (clusters.length > 0) {
    const next: number[][] = []
    for (const cluster of clusters) {
      if (cluster.length <= 1) continue
      const half = Math.floor(cluster.length / 2)
      const left = cluster.slice(0, half)
      const right = cluster.slice(half)
      const leftVariance = clusterVariance(covariance, left)
      const rightVariance = clusterVariance(covariance, right)
      const alpha = leftVariance + rightVariance < 1e-24 ? 0.5 : 1 - leftVariance / (leftVariance + rightVariance)
      for (const i of left) weights[i] *= alpha
      for (const i of right) weights[i] *= 1 - alpha
      next.push(left, right)
    }
    clusters = next
  }
  return weights
}

export interface BlackLittermanViews {
  readonly pick: Matrix
  readonly views: number[]
  readonly omega?: Matrix
}

export interface BlackLittermanResult {
  readonly expectedReturns: number[]
  readonly weights: number[]
}

export function blackLitterman(priorCovariance: Matrix, marketWeights: number[], riskAversion = 2.5, tau = 0.05, views?: BlackLittermanViews): BlackLittermanResult {
  const equilibrium = matVec(priorCovariance, marketWeights).map((x) => riskAversion * x)
  if (!views || views.views.length === 0) return { expectedReturns: equilibrium, weights: marketWeights }
  const tauSigma = scaleMatrix(priorCovariance, tau)
  const pick = views.pick
  const pickTransposed = transpose(pick)
  const scaled = matMul(matMul(pick, tauSigma), pickTransposed)
  const omega = views.omega ?? scaled.map((row, i) => row.map((x, j) => (i === j ? x : 0)))
  const middle = invert(addMatrices(scaled, omega))
  const pickEquilibrium = matVec(pick, equilibrium)
  const surprise = views.views.map((q, i) => q - pickEquilibrium[i])
  const adjustment = matVec(matMul(tauSigma, pickTransposed), matVec(middle, surprise))
  const expectedReturns = equilibrium.map((x, i) => x + adjustment[i])
  const raw = matVec(invert(scaleMatrix(priorCovariance, riskAversion)), expectedReturns)
  const gross = raw.reduce((s, x) => s + Math.abs(x), 0)
  const weights = gross < 1e-12 ? raw : raw.map((x) => x / gross)
  return { expectedReturns, weights }
}

export interface MeanVarianceConstraints {
  readonly longOnly?: boolean
  readonly maxWeight?: number
  readonly maxLeverage?: number
  readonly riskAversion?: number
  readonly penaltyWeight?: number
  readonly seed?: number
}

export function constrainedMeanVariance(expectedReturns: number[], covariance: Matrix, constraints: MeanVarianceConstraints = {}): number[] {
  const { longOnly = false, maxWeight = 1, maxLeverage = 1, riskAversion = 1, penaltyWeight = 1e3, seed = 1 } = constraints
  const n = expectedReturns.length
  const lower = new Array<number>(n).fill(longOnly ? 0 : -maxWeight)
  const upper = new Array<number>(n).fill(maxWeight)
  const objective = (x: number[]): number => {
    let expected = 0
    for (let i = 0; i < n; i += 1) expected += expectedReturns[i] * x[i]
    let risk = 0
    for (let i = 0; i < n; i += 1) for (let j = 0; j < n; j += 1) risk += x[i] * covariance[i][j] * x[j]
    const gross = x.reduce((s, v) => s + Math.abs(v), 0)
    return -(expected - 0.5 * riskAversion * risk) + penaltyWeight * (gross - maxLeverage) ** 2
  }
  return differentialEvolution(objective, lower, upper, { seed }).point
}
