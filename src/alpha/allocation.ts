import type { Matrix } from './types'
import { differentialEvolution } from '../numerics/optimization/differential-evolution'
import { solveLinearSystem } from '../numerics/linalg/solve'
import { correlationFromCovariance } from './covariance'
import { matVec, dot, matMul, transpose, invert, scaleMatrix, addMatrices } from './linalg'
import { singleLinkage, orderFromLinkage, clusterVariance, correlationDistance } from './cluster'

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

export function hierarchicalRiskParity(covariance: Matrix): number[] {
  const n = covariance.length
  const distance = correlationDistance(correlationFromCovariance(covariance))
  const order = orderFromLinkage(singleLinkage(distance), n)
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

function negativeQuadraticUtility(expectedReturns: readonly number[], covariance: Matrix, riskAversion: number): (x: number[]) => number {
  const n = expectedReturns.length
  return (x) => {
    let expected = 0
    for (let i = 0; i < n; i += 1) expected += expectedReturns[i] * x[i]
    let risk = 0
    for (let i = 0; i < n; i += 1) for (let j = 0; j < n; j += 1) risk += x[i] * covariance[i][j] * x[j]
    return -(expected - 0.5 * riskAversion * risk)
  }
}

function grossExposure(x: readonly number[]): number {
  return x.reduce((s, v) => s + Math.abs(v), 0)
}

export function constrainedMeanVariance(expectedReturns: number[], covariance: Matrix, constraints: MeanVarianceConstraints = {}): number[] {
  const { longOnly = false, maxWeight = 1, maxLeverage = 1, riskAversion = 1, penaltyWeight = 1e3, seed = 1 } = constraints
  const n = expectedReturns.length
  const lower = new Array<number>(n).fill(longOnly ? 0 : -maxWeight)
  const upper = new Array<number>(n).fill(maxWeight)
  const utility = negativeQuadraticUtility(expectedReturns, covariance, riskAversion)
  const objective = (x: number[]): number => utility(x) + penaltyWeight * (grossExposure(x) - maxLeverage) ** 2
  return differentialEvolution(objective, lower, upper, { seed }).point
}

export function minVariance(covariance: Matrix): number[] {
  const raw = solveLinearSystem(covariance, new Array<number>(covariance.length).fill(1))
  const total = raw.reduce((s, x) => s + x, 0)
  return Math.abs(total) < 1e-12 ? raw : raw.map((x) => x / total)
}

export interface TurnoverAwareOptions {
  readonly riskAversion: number
  readonly costPerTurnover: number
  readonly maxWeight: number
  readonly maxLeverage: number
  readonly penaltyWeight: number
  readonly seed: number
}

export function turnoverAwareOptimize(expectedReturns: readonly number[], covariance: Matrix, previousWeights: readonly number[], options: Partial<TurnoverAwareOptions> = {}): number[] {
  const { riskAversion = 1, costPerTurnover = 0, maxWeight = 1, maxLeverage = 1, penaltyWeight = 1e3, seed = 1 } = options
  const n = expectedReturns.length
  const lower = new Array<number>(n).fill(-maxWeight)
  const upper = new Array<number>(n).fill(maxWeight)
  const utility = negativeQuadraticUtility(expectedReturns, covariance, riskAversion)
  const objective = (x: number[]): number => {
    let turnoverCost = 0
    for (let i = 0; i < n; i += 1) turnoverCost += costPerTurnover * Math.abs(x[i] - previousWeights[i])
    return utility(x) + turnoverCost + penaltyWeight * Math.max(0, grossExposure(x) - maxLeverage) ** 2
  }
  return differentialEvolution(objective, lower, upper, { seed }).point
}

export const ALLOCATORS: Record<string, (covariance: Matrix, params?: Record<string, number>) => number[]> = {
  riskParity: (covariance) => riskParity(covariance),
  hrp: (covariance) => hierarchicalRiskParity(covariance),
  minVariance: (covariance) => minVariance(covariance),
}
